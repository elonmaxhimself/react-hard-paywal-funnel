import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { toastType, triggerToast } from "@/components/AlertToast";

import { useShift4Payment } from "@/hooks/queries/useShift4";
import { useShift4Ready } from "@/hooks/useShift4Ready";

import { useAuthStore } from "@/store/states/auth";
import { useFunnelStore } from "@/store/states/funnel";

import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

import { Shift4Statuses } from "@/utils/enums/shift4-statuses";

import { products } from "@/constants/products";

import { analyticsService } from "@/services/analytics-service";
import { shift4Service } from "@/services/shift4-service";
import { AnalyticsEventTypeEnum } from "@/utils/enums/analytics-event-types";
import { reportPurchase } from "@/lib/gtag";

const Shift4Options = {
    style: {
        base: {
            color: "#fff",
        },
    },
};

let paymentChannel: BroadcastChannel | null = null;

const initPaymentChannel = () => {
    if (typeof BroadcastChannel !== 'undefined') {
        if (!paymentChannel) {
            paymentChannel = new BroadcastChannel('payment_channel');
        }
        return paymentChannel;
    }
    return null;
};

export function usePaymentForm(posthog?: any) {
    const { t } = useTranslation();
    const [shift4Instance, setShift4Instance] = useState<any>(null);
    const [componentsGroup, setComponentsGroup] = useState<any>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const s4ComponentsRef = useRef<any>(null);
    const tabId = useRef(`tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    const { mutate: payment, isPending } = useShift4Payment();
    const { isReady: isShift4Ready, error: shift4Error } = useShift4Ready();
    const form = useFormContext<FunnelSchema>();
    const authToken = useAuthStore((state) => state.authToken);
    const userId = useAuthStore((state) => state.userId);
    const authReset = useAuthStore((state) => state.reset);
    const funnelReset = useFunnelStore((state) => state.reset);

    const productId = form.watch("productId");
    const product = useMemo(() => products.find((p) => p.id === productId), [productId]);

    const addToCartTrackedRef = useRef(false);

    useEffect(() => {
        const channel = initPaymentChannel();
        
        if (channel) {
            const handleMessage = (event: MessageEvent) => {
                if (event.data.senderId === tabId.current) {
                    return;
                }
                
                if (event.data.type === 'PAYMENT_STARTED') {
                    setIsSubmitting(true);
                    triggerToast({
                        title: t('hooks.usePaymentForm.errors.paymentInAnotherTab'),
                        type: toastType.warning,
                    });
                }
                
                if (event.data.type === 'PAYMENT_SUCCESS') {
                    setPaymentCompleted(true);
                    setIsSubmitting(true);
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }
                
                if (event.data.type === 'PAYMENT_FAILED') {
                    setIsSubmitting(false);
                }
            };
            
            channel.onmessage = handleMessage;
        }
        
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'auth-storage') {
                try {
                    const parsed = e.newValue ? JSON.parse(e.newValue) : null;
                    const authCleared = !parsed || parsed.state?.authToken === null;

                    if (authCleared) {
                        window.location.reload();
                    }
                } catch {
                    // Corrupted storage value — treat as auth cleared
                    window.location.reload();
                }
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            if (channel) {
                channel.onmessage = null;
            }
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [t]);

    useEffect(() => {
        return () => {
            if (paymentChannel) {
                paymentChannel.close();
                paymentChannel = null;
            }
        };
    }, []);

    // Polling function for payment status
    const pollPaymentStatus = async (
        subscriptionId: string,
        mpPayload: any,
        onSuccess: () => void,
        onError: (errorMessage: string) => void,
    ) => {
        const pollInterval = 5000;
        const maxAttempts = 48;
        let attempts = 0;

        setIsPolling(true);

        const poll = async () => {
            try {
                attempts++;
                
                const statusResponse = await shift4Service.getPaymentStatus(subscriptionId);

                if (statusResponse.paid_status === "paid") {
                    setIsPolling(false);
                    setPaymentCompleted(true);
                    onSuccess();
                    return;
                } else if (statusResponse.paid_status === "failed") {
                    const errorMessage =
                        statusResponse.failureMessage ||
                        t('hooks.usePaymentForm.errors.paymentWentWrong');
                    setIsPolling(false);
                    onError(errorMessage);
                    return;
                } else if (statusResponse.paid_status === "pending") {
                    if (attempts < maxAttempts) {
                        setTimeout(poll, pollInterval);
                    } else {
                        setIsPolling(false);
                        onError(t('hooks.usePaymentForm.errors.paymentTakingLong'));
                    }
                }
            } catch (error: any) {
                console.error("Error polling payment status:", error);

                if (error.response?.status === 404) {
                    if (attempts < maxAttempts) {
                        setTimeout(poll, pollInterval);
                    } else {
                        setIsPolling(false);
                        onError(t('hooks.usePaymentForm.errors.paymentTakingLong'));
                    }
                } else {
                    setIsPolling(false);
                    onError(t('hooks.usePaymentForm.errors.failedCheckStatus'));
                }
            }
        };

        poll();
    };

    useEffect(() => {
        if (!product || !isShift4Ready || s4ComponentsRef.current) return;

        const initializeShift4 = () => {
            try {
                const publicKey = import.meta.env.VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY;
                if (!publicKey) {
                    triggerToast({
                        title: t('hooks.usePaymentForm.errors.paymentConfigError'),
                        type: toastType.error,
                    });
                    return;
                }

                const Shift4 = (window as any).Shift4;
                const s4 = Shift4(publicKey);
                const components = s4.createComponentGroup(Shift4Options);

                components.automount(`#payment-form`);
                s4ComponentsRef.current = components;

                setShift4Instance(s4);
                setComponentsGroup(components);

                if (!addToCartTrackedRef.current) {
                    const fbq = (window as any).fbq;
                    fbq?.("track", "AddToCart", {
                        content_ids: [product.id],
                        content_name: product.name,
                        value: product.amount / 100,
                        currency: "USD",
                    });

                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: "cd_add_to_cart",
                        product_id: product.id,
                        product_name: product.name,
                        value: product.amount / 100,
                        currency: "USD",
                    });

                    addToCartTrackedRef.current = true;

                    // PostHog paywall opened tracking
                    try {
                        if (typeof window !== 'undefined' && posthog && product) {
                            posthog.capture('paywall_opened', {
                                value: product.amount / 100,
                                currency: "USD",
                                product_id: product.id,
                                product_name: product.name,
                                user_id: userId,
                                payment_type: "subscription_initial_payment",
                                monthly_billing_cycle: product.durationMonths,
                                payment_provider: "shift4"
                            });
                        }
                    } catch (e) {
                        console.warn("PostHog paywall tracking failed", e);
                    }
                }
            } catch (e) {
                console.error("Error during Shift4 initialization:", e);
                triggerToast({
                    title: t('hooks.usePaymentForm.errors.initializationFailed'),
                    type: toastType.error,
                });
            }
        };

        initializeShift4();

        return () => {
            if (s4ComponentsRef.current && typeof s4ComponentsRef.current.unmount === "function") {
                s4ComponentsRef.current.unmount();
                s4ComponentsRef.current = null;
            }
        };
    }, [product, isShift4Ready, t]);

    useEffect(() => {
        if (shift4Error) {
            triggerToast({
                title: t('hooks.usePaymentForm.errors.paymentSystemUnavailable'),
                type: toastType.error,
            });
        }
    }, [shift4Error, t]);

    const onSubmit = async () => {
        if (isSubmitting || paymentCompleted) {
            console.warn('Payment already in progress or completed');
            return;
        }
        
        setIsSubmitting(true);
        
        const channel = initPaymentChannel();
        if (channel) {
            channel.postMessage({ 
                type: 'PAYMENT_STARTED',
                senderId: tabId.current,
                userId,
                timestamp: Date.now()
            });
        }

        try {
            if (!shift4Instance || !componentsGroup || !product) {
                triggerToast({
                    title: t('hooks.usePaymentForm.errors.unexpectedError'),
                    type: toastType.error,
                });
                setIsSubmitting(false);
                
                if (channel) {
                    channel.postMessage({ 
                        type: 'PAYMENT_FAILED',
                        senderId: tabId.current
                    });
                }
                return;
            }

            let utm: Record<string, any> | undefined;
            try {
                const stored = localStorage.getItem("utm_params");
                if (stored) utm = JSON.parse(stored);
            } catch {}

            const mpPayload = {
                distinct_id: String(userId ?? ""),
                product_name: product.name,
                value: product.amount / 100,
                currency: "USD",
                product_id: product.id,
                tid: utm?.deal,
            };

            analyticsService.trackPaymentEvent(AnalyticsEventTypeEnum.PAYMENT_INITIATED, mpPayload);

            // if (typeof window !== 'undefined' && posthog) {
            //     posthog.capture('payment_initiated', {
            //         value: product.amount / 100,
            //         currency: "USD",
            //         product_id: product.id,
            //         product_name: product.name,
            //         user_id: userId,
            //         payment_type: "subscription_initial_payment",
            //         monthly_billing_cycle: product.durationMonths,
            //         payment_provider: "shift4"                    
            //     });
            // }

            const result = await shift4Instance.createToken(componentsGroup);
            if (result.error) throw new Error(result.error.message);

            const token = await shift4Instance.verifyThreeDSecure({
                amount: product.amount,
                currency: mpPayload.currency,
                card: result?.id,
            });
            if (token?.error) throw new Error(token?.error?.message);

            payment(
                { paymentToken: token?.id, productId: product.id },
                {
                    onSuccess: (response) => {
                        if (response.status === Shift4Statuses.SUBSCRIPTION_INITIATED) {
                            pollPaymentStatus(
                                response.subscriptionId,
                                mpPayload,
                                () => {
                                    // FACEBOOK PIXEL TRACKING — Purchase
                                    const fbq = (window as any).fbq;
                                    fbq?.("track", "Purchase", {
                                        product_name: product.name,
                                        value: product.amount / 100,
                                        currency: "USD",
                                    });

                                    // GOOGLE ADS — Purchase
                                    reportPurchase(response.subscriptionId, {
                                        value: product.amount / 100,
                                        currency: "USD",
                                    });

                                    // GTM / dataLayer — Purchase
                                    window.dataLayer = window.dataLayer || [];
                                    window.dataLayer.push({
                                        event: "cd_purchase",
                                        transaction_id: response.subscriptionId,
                                        value: product.amount / 100,
                                        currency: "USD",
                                        product_id: product.id,
                                        product_name: product.name,
                                    });

                                    // PostHog — Payment Success
                                    // if (typeof window !== 'undefined' && posthog) {
                                    //     posthog.capture('payment_success', {
                                    //         value: product.amount / 100,
                                    //         currency: "USD",
                                    //         product_id: product.id,
                                    //         product_name: product.name,
                                    //         user_id: userId,
                                    //         payment_type: "subscription_initial_payment",
                                    //         monthly_billing_cycle: product.durationMonths,
                                    //         payment_provider: "shift4"
                                    //     },  {send_instantly: true});
                                    // }

                                    // Mixpanel
                                    analyticsService.trackPaymentEvent(
                                        AnalyticsEventTypeEnum.PAYMENT_SUCCESS,
                                        mpPayload,
                                    );

                                    if (channel) {
                                        channel.postMessage({ 
                                            type: 'PAYMENT_SUCCESS',
                                            senderId: tabId.current,
                                            subscriptionId: response.subscriptionId,
                                            timestamp: Date.now()
                                        });
                                    }

                                    setTimeout(() => {
                                        const redirectUrl = import.meta.env.VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT || "/";
                                        const redirectUrlWithToken = redirectUrl + "?authToken=" + authToken;
                                        authReset();
                                        funnelReset();
                                        window.location.href = redirectUrlWithToken;
                                    }, 300);
                                },
                                (errorMessage: string) => {
                                    setIsSubmitting(false);
                                    
                                    if (channel) {
                                        channel.postMessage({ 
                                            type: 'PAYMENT_FAILED',
                                            senderId: tabId.current
                                        });
                                    }
                                    
                                    analyticsService.trackPaymentEvent(
                                        AnalyticsEventTypeEnum.PAYMENT_FAILED,
                                        mpPayload,
                                    );

                                    triggerToast({
                                        title: errorMessage,
                                        type: toastType.error,
                                    });
                                },
                            );
                        } else {
                            setIsSubmitting(false);
                            
                            if (channel) {
                                channel.postMessage({ 
                                    type: 'PAYMENT_FAILED',
                                    senderId: tabId.current
                                });
                            }
                            
                            analyticsService.trackPaymentEvent(
                                AnalyticsEventTypeEnum.PAYMENT_FAILED,
                                mpPayload,
                            );

                            triggerToast({
                                title: t('hooks.usePaymentForm.errors.unexpectedError'),
                                type: toastType.error,
                            });
                        }
                    },
                    onError: (error) => {
                        console.error("Payment processing error:", error);
                        
                        setIsPolling(false);
                        setIsSubmitting(false);

                        if (channel) {
                            channel.postMessage({ 
                                type: 'PAYMENT_FAILED',
                                senderId: tabId.current
                            });
                        }

                        analyticsService.trackPaymentEvent(
                            AnalyticsEventTypeEnum.PAYMENT_FAILED,
                            mpPayload,
                        );

                        triggerToast({
                            title:
                                error.message || t('hooks.usePaymentForm.errors.unexpectedError'),
                            type: toastType.error,
                        });
                    },
                },
            );
        } catch (error: any) {
            console.error("Payment processing error:", error);
            
            setIsPolling(false);
            setIsSubmitting(false);

            if (channel) {
                channel.postMessage({ 
                    type: 'PAYMENT_FAILED',
                    senderId: tabId.current
                });
            }

            const mpPayload = {
                distinct_id: String(userId ?? ""),
                product_name: product?.name || "",
                value: product?.amount ? product.amount / 100 : 0,
                currency: "USD",
                product_id: product?.id || "",
            };

            analyticsService.trackPaymentEvent(AnalyticsEventTypeEnum.PAYMENT_FAILED, mpPayload);

            triggerToast({
                title: error.message || t('hooks.usePaymentForm.errors.unexpectedError'),
                type: toastType.error,
            });
        }
    };

    return {
        product: product!,
        onSubmit,
        isPending: isPending || isPolling || isSubmitting || paymentCompleted || !componentsGroup || !isShift4Ready,
        isShift4Ready,
        shift4Error,
    };
}