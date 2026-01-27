import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

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

let Shift4Options = {
    style: {
        base: {
            color: "#fff",
        },
    },
};

export function usePaymentForm(posthog?: any) {
    const [shift4Instance, setShift4Instance] = useState<any>(null);
    const [componentsGroup, setComponentsGroup] = useState<any>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const s4ComponentsRef = useRef<any>(null);

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
                        "Something went wrong during payment. Please try again.";
                    setIsPolling(false);
                    onError(errorMessage);
                    return;
                } else if (statusResponse.paid_status === "pending") {
                    if (attempts < maxAttempts) {
                        setTimeout(poll, pollInterval);
                    } else {
                        setIsPolling(false);
                        onError("Payment is taking longer than expected. Please try again.");
                    }
                }
            } catch (error: any) {
                console.error("Error polling payment status:", error);

                if (error.response?.status === 404) {
                    if (attempts < maxAttempts) {
                        setTimeout(poll, pollInterval);
                    } else {
                        setIsPolling(false);
                        onError("Payment is taking longer than expected. Please try again.");
                    }
                } else {
                    setIsPolling(false);
                    onError("Failed to check payment status. Please try again.");
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
                        title: "Payment system configuration error.",
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
                    title: "Failed to initialize payment form. Please refresh the page.",
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
    }, [product, isShift4Ready]);

    useEffect(() => {
        if (shift4Error) {
            triggerToast({
                title: "Payment system is not available. Please refresh the page.",
                type: toastType.error,
            });
        }
    }, [shift4Error]);

    const onSubmit = async () => {
        if (isSubmitting || paymentCompleted) {
            console.warn('Payment already in progress or completed');
            return;
        }
        setIsSubmitting(true);

        try {
            if (!shift4Instance || !componentsGroup || !product) {
                triggerToast({
                    title: "An unexpected error occurred. Please try again later.",
                    type: toastType.error,
                });
                setIsSubmitting(false);
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

            payment(
                { paymentToken: result.id, productId: product.id },
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

                                    const redirectUrl = import.meta.env.VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT || "/";
                                    const redirectUrlWithToken = redirectUrl + "?authToken=" + authToken;
                                    authReset();
                                    funnelReset();
                                    window.location.href = redirectUrlWithToken;
                                },
                                (errorMessage: string) => {
                                    setIsSubmitting(false);
                                    
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
                            
                            analyticsService.trackPaymentEvent(
                                AnalyticsEventTypeEnum.PAYMENT_FAILED,
                                mpPayload,
                            );

                            triggerToast({
                                title: "An unexpected error occurred. Please try again later.",
                                type: toastType.error,
                            });
                        }
                    },
                    onError: (error) => {
                        console.error("Payment processing error:", error);
                        
                        setIsPolling(false);
                        setIsSubmitting(false);

                        analyticsService.trackPaymentEvent(
                            AnalyticsEventTypeEnum.PAYMENT_FAILED,
                            mpPayload,
                        );

                        triggerToast({
                            title:
                                error.message || "An unexpected error occurred. Please try again.",
                            type: toastType.error,
                        });
                    },
                },
            );
        } catch (error: any) {
            console.error("Payment processing error:", error);
            
            setIsPolling(false);
            setIsSubmitting(false);

            const mpPayload = {
                distinct_id: String(userId ?? ""),
                product_name: product?.name || "",
                value: product?.amount ? product.amount / 100 : 0,
                currency: "USD",
                product_id: product?.id || "",
            };

            analyticsService.trackPaymentEvent(AnalyticsEventTypeEnum.PAYMENT_FAILED, mpPayload);

            triggerToast({
                title: error.message || "An unexpected error occurred. Please try again.",
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