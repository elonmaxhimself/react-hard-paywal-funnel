import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { PostHog } from 'posthog-js';
import { AxiosError } from 'axios';

import { toastType, triggerToast } from '@/components/AlertToast';

import { useShift4Payment } from '@/hooks/queries/useShift4';
import { useShift4Ready } from '@/hooks/useShift4Ready';

import { useAuthStore } from '@/store/states/auth';

import { FunnelSchema } from '@/hooks/funnel/useFunnelForm';

import { Shift4Statuses } from '@/utils/enums/shift4-statuses';

import { products } from '@/constants/products';

import { shift4Service } from '@/services/shift4-service';
import { reportPurchase } from '@/lib/gtag';
import { env } from '@/config/env';

const Shift4Options = {
    style: {
        base: {
            color: '#fff',
        },
    },
};

let paymentChannel: BroadcastChannel | null = null;

const initPaymentChannel = () => {
    if (typeof BroadcastChannel !== 'undefined') {
        if (!paymentChannel) {
            try {
                paymentChannel = new BroadcastChannel('payment_channel');
            } catch {
                return null;
            }
        }
        return paymentChannel;
    }
    return null;
};

export const PAYMENT_IN_PROGRESS_KEY = 'shift4_payment_in_progress';
export const PAYMENT_COMPLETED_KEY = 'shift4_payment_completed';
export const PAYMENT_STALENESS_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function usePaymentForm(posthog?: PostHog) {
    const { t } = useTranslation();
    const [shift4Instance, setShift4Instance] = useState<Shift4Instance | null>(null);
    const [componentsGroup, setComponentsGroup] = useState<Shift4ComponentGroup | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(() => {
        try {
            const stored = localStorage.getItem(PAYMENT_IN_PROGRESS_KEY);
            if (!stored) return false;
            const { timestamp } = JSON.parse(stored);
            return Date.now() - timestamp <= PAYMENT_STALENESS_TTL_MS;
        } catch {
            return false;
        }
    });
    const [paymentCompleted, setPaymentCompleted] = useState(() => {
        try {
            const stored = localStorage.getItem(PAYMENT_COMPLETED_KEY);
            if (!stored) return false;
            const { timestamp } = JSON.parse(stored);
            return Date.now() - timestamp <= PAYMENT_STALENESS_TTL_MS;
        } catch {
            return false;
        }
    });
    const [resumePollingFailed, setResumePollingFailed] = useState(false);

    const markPaymentCompleted = () => {
        setPaymentCompleted(true);
        try {
            localStorage.setItem(PAYMENT_COMPLETED_KEY, JSON.stringify({ timestamp: Date.now() }));
        } catch {
            // localStorage not available
        }
    };

    const s4ComponentsRef = useRef<Shift4ComponentGroup | null>(null);
    const tabId = useRef(`tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    const { mutate: payment, isPending } = useShift4Payment();
    const { isReady: isShift4Ready, error: shift4Error } = useShift4Ready();
    const form = useFormContext<FunnelSchema>();
    const authToken = useAuthStore((state) => state.authToken);
    const userId = useAuthStore((state) => state.userId);

    const productId = form.watch('productId');
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
                    markPaymentCompleted();
                    setIsSubmitting(true);
                    // Redirect this tab to main platform — payment succeeded in another tab
                    setTimeout(() => {
                        localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
                        localStorage.removeItem(PAYMENT_COMPLETED_KEY);
                        const redirectUrl = env.shift4.paymentRedirect;
                        window.location.href = redirectUrl + '?authToken=' + authToken;
                    }, 300);
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

            // Cross-tab payment sync fallback (works even when BroadcastChannel is unavailable, e.g. Safari private mode)
            // Only use storage events for payment sync when BroadcastChannel channel is NOT active —
            // otherwise both handlers fire and user sees duplicate toasts
            if (e.key === PAYMENT_IN_PROGRESS_KEY && !channel) {
                if (e.newValue) {
                    // Another tab started a payment
                    try {
                        const { timestamp } = JSON.parse(e.newValue);
                        if (Date.now() - timestamp <= PAYMENT_STALENESS_TTL_MS) {
                            setIsSubmitting(true);
                            triggerToast({
                                title: t('hooks.usePaymentForm.errors.paymentInAnotherTab'),
                                type: toastType.warning,
                            });
                        }
                    } catch {
                        // Corrupted — ignore
                    }
                } else {
                    // Another tab cleared the payment flag (failed or completed)
                    // Without BroadcastChannel, this is the only signal we get — reset the blocked state
                    setIsSubmitting(false);
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
    }, [t, authToken]);

    useEffect(() => {
        return () => {
            if (paymentChannel) {
                paymentChannel.close();
                paymentChannel = null;
            }
        };
    }, []);

    // Resume polling if payment was in progress (e.g. after page refresh)
    useEffect(() => {
        let cancelPolling: (() => void) | undefined;

        try {
            const stored = localStorage.getItem(PAYMENT_IN_PROGRESS_KEY);
            if (!stored) {
                setIsSubmitting(false);
                return;
            }

            const { subscriptionId, timestamp } = JSON.parse(stored);

            // Guard: if entry has no subscriptionId (stale from before fix), clear it
            if (!subscriptionId) {
                localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
                setIsSubmitting(false);
                return;
            }

            if (Date.now() - timestamp > PAYMENT_STALENESS_TTL_MS) {
                localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
                setIsSubmitting(false);
                return;
            }

            setIsSubmitting(true);
            cancelPolling = pollPaymentStatus(
                subscriptionId,
                () => {
                    const channel = initPaymentChannel();
                    if (channel) {
                        channel.postMessage({
                            type: 'PAYMENT_SUCCESS',
                            senderId: tabId.current,
                            subscriptionId,
                            timestamp: Date.now(),
                        });
                    }
                    setTimeout(() => {
                        localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
                        localStorage.removeItem(PAYMENT_COMPLETED_KEY);
                        const redirectUrl = env.shift4.paymentRedirect;
                        window.location.href = redirectUrl + '?authToken=' + authToken;
                    }, 300);
                },
                (errorMessage) => {
                    localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
                    setIsSubmitting(false);
                    setResumePollingFailed(true);
                    triggerToast({ title: errorMessage, type: toastType.error });
                },
            );
        } catch {
            localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
            setIsSubmitting(false);
            setResumePollingFailed(true);
        }

        return () => {
            cancelPolling?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only polling resume
    }, []);

    // Polling function for payment status
    // Returns a cancel function to stop the polling chain
    const pollPaymentStatus = (
        subscriptionId: string,
        onSuccess: () => void,
        onError: (errorMessage: string) => void,
    ): (() => void) => {
        const pollInterval = 5000;
        const maxAttempts = 48;
        let attempts = 0;
        let cancelled = false;

        setIsPolling(true);

        const poll = async () => {
            if (cancelled) return;

            try {
                attempts++;

                const statusResponse = await shift4Service.getPaymentStatus(subscriptionId);

                if (cancelled) return;

                if (statusResponse.paid_status === 'paid') {
                    setIsPolling(false);
                    markPaymentCompleted();
                    onSuccess();
                    return;
                } else if (statusResponse.paid_status === 'failed') {
                    const errorMessage =
                        statusResponse.failureMessage || t('hooks.usePaymentForm.errors.paymentWentWrong');
                    setIsPolling(false);
                    onError(errorMessage);
                    return;
                } else if (statusResponse.paid_status === 'pending') {
                    if (attempts < maxAttempts) {
                        setTimeout(poll, pollInterval);
                    } else {
                        setIsPolling(false);
                        onError(t('hooks.usePaymentForm.errors.paymentTakingLong'));
                    }
                }
            } catch (error: unknown) {
                if (cancelled) return;

                // Error polling payment status
                const axiosErr = error as AxiosError;
                if (axiosErr.response?.status === 404) {
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

        return () => {
            cancelled = true;
        };
    };

    useEffect(() => {
        if (!product || !isShift4Ready || s4ComponentsRef.current) return;

        const initializeShift4 = () => {
            try {
                const publicKey = env.shift4.publishableKey;
                if (!publicKey) {
                    triggerToast({
                        title: t('hooks.usePaymentForm.errors.paymentConfigError'),
                        type: toastType.error,
                    });
                    return;
                }

                const Shift4 = window.Shift4;
                if (!Shift4) {
                    triggerToast({
                        title: t('hooks.usePaymentForm.errors.paymentConfigError'),
                        type: toastType.error,
                    });
                    return;
                }
                const s4 = Shift4(publicKey);
                const components = s4.createComponentGroup(Shift4Options);

                components.automount(`#payment-form`);
                s4ComponentsRef.current = components;

                setShift4Instance(s4);
                setComponentsGroup(components);

                if (!addToCartTrackedRef.current) {
                    const fbq = window.fbq;
                    fbq?.('track', 'AddToCart', {
                        content_ids: [product.id],
                        content_name: product.name,
                        value: product.amount / 100,
                        currency: 'USD',
                    });

                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: 'cd_add_to_cart',
                        product_id: product.id,
                        product_name: product.name,
                        value: product.amount / 100,
                        currency: 'USD',
                    });

                    addToCartTrackedRef.current = true;

                    // PostHog paywall opened tracking
                    try {
                        if (typeof window !== 'undefined' && posthog && product) {
                            posthog.capture('paywall_opened', {
                                value: product.amount / 100,
                                currency: 'USD',
                                product_id: product.id,
                                product_name: product.name,
                                user_id: userId,
                                payment_type: 'subscription_initial_payment',
                                monthly_billing_cycle: product.durationMonths,
                                payment_provider: 'shift4',
                            });
                        }
                    } catch (e) {
                        console.warn('PostHog paywall tracking failed', e);
                    }
                }
            } catch {
                // Shift4 initialization failed
                triggerToast({
                    title: t('hooks.usePaymentForm.errors.initializationFailed'),
                    type: toastType.error,
                });
            }
        };

        initializeShift4();

        return () => {
            if (s4ComponentsRef.current && typeof s4ComponentsRef.current.unmount === 'function') {
                s4ComponentsRef.current.unmount();
                s4ComponentsRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- re-init only when product or Shift4 readiness changes
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

        // Pre-flight check: another tab may have started payment (catches race even without BroadcastChannel)
        try {
            const existingPayment = localStorage.getItem(PAYMENT_IN_PROGRESS_KEY);
            if (existingPayment) {
                const { timestamp } = JSON.parse(existingPayment);
                if (Date.now() - timestamp <= PAYMENT_STALENESS_TTL_MS) {
                    setIsSubmitting(true);
                    triggerToast({
                        title: t('hooks.usePaymentForm.errors.paymentInAnotherTab'),
                        type: toastType.warning,
                    });
                    return;
                }
                // Stale entry — remove it and proceed
                localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
            }
        } catch {
            // Corrupted localStorage — proceed with payment
        }

        setIsSubmitting(true);

        const channel = initPaymentChannel();
        if (channel) {
            channel.postMessage({
                type: 'PAYMENT_STARTED',
                senderId: tabId.current,
                userId,
                timestamp: Date.now(),
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
                        senderId: tabId.current,
                    });
                }
                return;
            }

            const result = await shift4Instance.createToken(componentsGroup);
            if (result.error) throw new Error(result.error.message);

            const token = await shift4Instance.verifyThreeDSecure({
                amount: product.amount,
                currency: 'USD',
                card: result?.id,
            });
            if (token?.error) throw new Error(token?.error?.message);

            payment(
                { paymentToken: token?.id ?? '', productId: product.id },
                {
                    onSuccess: (response) => {
                        if (response.status === Shift4Statuses.SUBSCRIPTION_INITIATED) {
                            localStorage.setItem(
                                PAYMENT_IN_PROGRESS_KEY,
                                JSON.stringify({
                                    subscriptionId: response.subscriptionId,
                                    timestamp: Date.now(),
                                }),
                            );
                            pollPaymentStatus(
                                response.subscriptionId,
                                () => {
                                    // FACEBOOK PIXEL TRACKING — Purchase
                                    const fbq = window.fbq;
                                    fbq?.('track', 'Purchase', {
                                        product_name: product.name,
                                        value: product.amount / 100,
                                        currency: 'USD',
                                    });

                                    // GOOGLE ADS — Purchase
                                    reportPurchase(response.subscriptionId, {
                                        value: product.amount / 100,
                                        currency: 'USD',
                                    });

                                    // GTM / dataLayer — Purchase
                                    window.dataLayer = window.dataLayer || [];
                                    window.dataLayer.push({
                                        event: 'cd_purchase',
                                        transaction_id: response.subscriptionId,
                                        value: product.amount / 100,
                                        currency: 'USD',
                                        product_id: product.id,
                                        product_name: product.name,
                                    });

                                    if (channel) {
                                        channel.postMessage({
                                            type: 'PAYMENT_SUCCESS',
                                            senderId: tabId.current,
                                            subscriptionId: response.subscriptionId,
                                            timestamp: Date.now(),
                                        });
                                    }

                                    setTimeout(() => {
                                        localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
                                        localStorage.removeItem(PAYMENT_COMPLETED_KEY);
                                        const redirectUrl = env.shift4.paymentRedirect;
                                        const redirectUrlWithToken = redirectUrl + '?authToken=' + authToken;
                                        window.location.href = redirectUrlWithToken;
                                    }, 300);
                                },
                                (errorMessage: string) => {
                                    localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
                                    setIsSubmitting(false);

                                    if (channel) {
                                        channel.postMessage({
                                            type: 'PAYMENT_FAILED',
                                            senderId: tabId.current,
                                        });
                                    }

                                    triggerToast({
                                        title: errorMessage,
                                        type: toastType.error,
                                    });
                                },
                            );
                        } else {
                            localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
                            setIsSubmitting(false);

                            if (channel) {
                                channel.postMessage({
                                    type: 'PAYMENT_FAILED',
                                    senderId: tabId.current,
                                });
                            }

                            triggerToast({
                                title: t('hooks.usePaymentForm.errors.unexpectedError'),
                                type: toastType.error,
                            });
                        }
                    },
                    onError: (error: Error) => {
                        // Payment processing error

                        localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
                        setIsPolling(false);
                        setIsSubmitting(false);

                        if (channel) {
                            channel.postMessage({
                                type: 'PAYMENT_FAILED',
                                senderId: tabId.current,
                            });
                        }

                        const axiosErr = error as AxiosError<{ message?: string }>;
                        triggerToast({
                            title:
                                axiosErr.response?.data?.message ||
                                error.message ||
                                t('hooks.usePaymentForm.errors.unexpectedError'),
                            type: toastType.error,
                        });
                    },
                },
            );
        } catch (error: unknown) {
            // Payment processing error

            localStorage.removeItem(PAYMENT_IN_PROGRESS_KEY);
            setIsPolling(false);
            setIsSubmitting(false);

            if (channel) {
                channel.postMessage({
                    type: 'PAYMENT_FAILED',
                    senderId: tabId.current,
                });
            }

            const catchErr = error as AxiosError<{ message?: string }>;
            triggerToast({
                title:
                    catchErr.response?.data?.message ||
                    catchErr.message ||
                    t('hooks.usePaymentForm.errors.unexpectedError'),
                type: toastType.error,
            });
        }
    };

    return {
        product: product!,
        onSubmit,
        isButtonDisabled:
            isPending || isPolling || isSubmitting || paymentCompleted || !componentsGroup || !isShift4Ready,
        isPaymentInProgress: isPending || isPolling || isSubmitting || paymentCompleted,
        isShift4Ready,
        shift4Error,
        resumePollingFailed,
    };
}
