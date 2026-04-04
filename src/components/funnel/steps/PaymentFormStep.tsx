'use client';

import { X, Loader2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import { usePaymentForm, PAYMENT_IN_PROGRESS_KEY, PAYMENT_STALENESS_TTL_MS } from '@/hooks/usePaymentForm';
import { usePremiumRedirect } from '@/hooks/usePremiumRedirect';
import { useFunnelStore } from '@/store/states/funnel';
import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import SpriteIcon from '@/components/SpriteIcon';
import { usePostHog } from 'posthog-js/react';
import { STEPS_COUNT } from '@/features/funnel/funnelSteps';
import type { FunnelSchema } from '@/hooks/funnel/useFunnelForm';

const s4InputContainerStyles = 'h-[50px] bg-[#000]/30 rounded-[8px] border border-white/6 p-[12px]';

const getPeriodDays = (durationMonths: number): number => {
    if (durationMonths === 0) return 7;
    if (durationMonths === 1) return 30;
    if (durationMonths === 3) return 90;
    if (durationMonths === 12) return 365;
    return durationMonths * 30;
};

export function PaymentFormStep() {
    const { t } = useTranslation();
    const setStep = useFunnelStore((s) => s.setStep);
    const setFormState = useFunnelStore((s) => s.setFormState);
    const posthog = usePostHog();
    const funnelForm = useFormContext<FunnelSchema>();
    const { product, onSubmit, isButtonDisabled, isPaymentInProgress, shift4Error, resumePollingFailed } =
        usePaymentForm(posthog);
    const { isRedirecting } = usePremiumRedirect();
    const { prevStep } = useStepperContext();
    const hasRedirected = useRef(false);

    // Sync full form state (including productId) to Zustand on mount.
    // handleAuthSuccess excludes productId when saving, and SubscriptionStep
    // only updates React Hook Form — so Zustand never gets productId.
    // This ensures form survives page refresh on the payment step.
    useEffect(() => {
        const formValues = funnelForm.getValues();
        if (formValues.productId) {
            setFormState(formValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only sync
    }, []);

    useEffect(() => {
        if (!product) {
            // Don't redirect if there's an active payment in localStorage —
            // the resume-polling effect in usePaymentForm will handle it
            try {
                const stored = localStorage.getItem(PAYMENT_IN_PROGRESS_KEY);
                if (stored) {
                    const { timestamp } = JSON.parse(stored);
                    if (Date.now() - timestamp <= PAYMENT_STALENESS_TTL_MS) {
                        // Payment is in progress — stay on this step, let polling resume
                        return;
                    }
                }
            } catch {
                // Corrupted storage — fall through to redirect
            }

            if (!hasRedirected.current) {
                hasRedirected.current = true;
                prevStep();
            }
            return;
        }
        setStep(STEPS_COUNT - 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only guard
    }, []);

    // Navigate back if resume-polling failed (prevents blank screen)
    useEffect(() => {
        if (resumePollingFailed && !hasRedirected.current) {
            hasRedirected.current = true;
            prevStep();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to polling failure
    }, [resumePollingFailed]);

    // If payment resolved (success redirect or failure) but we still have no product — go back
    useEffect(() => {
        if (!product && !isPaymentInProgress && !hasRedirected.current) {
            hasRedirected.current = true;
            prevStep();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- react to payment resolution when no product
    }, [product, isPaymentInProgress]);

    const onOpenSpecialOffer = () => {
        if (isPaymentInProgress) return;
        prevStep();
    };

    // User already has an active subscription — redirect in progress
    if (isRedirecting) {
        return (
            <div className="w-full flex flex-col min-h-screen items-center justify-center">
                <Loader2Icon className="animate-spin text-white mb-4" size={40} />
                <p className="text-white/70 text-center px-4">{t('funnel.paymentFormStep.redirecting')}</p>
            </div>
        );
    }

    // No product but payment in progress — show processing state instead of blank screen
    if (!product && isPaymentInProgress) {
        return (
            <div className="w-full flex flex-col min-h-screen items-center justify-center">
                <Loader2Icon className="animate-spin text-white mb-4" size={40} />
                <p className="text-white/70 text-center px-4">{t('hooks.usePaymentForm.errors.paymentInAnotherTab')}</p>
            </div>
        );
    }

    if (!product) return null;
    return (
        <div className="w-full flex flex-col min-h-screen px-[15px] pt-[25px] sm:px-10 sm:pt-[40px] pb-[70px] relative">
            <Button
                onClick={onOpenSpecialOffer}
                variant={'unstyled'}
                disabled={isPaymentInProgress}
                className="absolute top-5 right-5 p-0 w-auto h-auto"
            >
                <X className={'text-white'} size={24} strokeWidth={3} />
            </Button>

            <div className="max-w-[360px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center">
                    <SpriteIcon
                        src={'/images/logo.svg'}
                        fallbackAlt={t('funnel.paymentFormStep.altLogo')}
                        targetW={40}
                        targetH={40}
                        fit="contain"
                        className={'mb-2'}
                    />

                    <div className={'text-white text-2xl font-bold text-center'}>
                        {t('funnel.paymentFormStep.title')}
                    </div>
                    <div className={'flex items-center justify-center gap-1 text-sm mb-6'}>
                        <span className={'text-white/60'}>
                            {t('funnel.paymentFormStep.todayTotal', { amount: product.amount / 100 })}
                        </span>
                        <span className={'text-white/40'}>
                            {t('funnel.paymentFormStep.perDays', { count: getPeriodDays(product.durationMonths) })}
                        </span>
                    </div>

                    <div
                        id="payment-form"
                        className="relative w-full bg-white/5 border border-white/6 p-[10px] pb-[30px] rounded-[10px] flex flex-col gap-4"
                    >
                        <div className="flex justify-center mb-2">
                            <h3 className="text-white font-bold text-[20px] mt-1">
                                {t('funnel.paymentFormStep.creditCard')}
                            </h3>

                            <div className="absolute top-5 right-[10px] flex items-center gap-1">
                                <SpriteIcon
                                    src="/images/cards-logos/visa.png"
                                    fallbackAlt={t('funnel.paymentFormStep.altVisa')}
                                    targetW={30}
                                    targetH={20}
                                    fit="contain"
                                />
                                <SpriteIcon
                                    src="/images/cards-logos/mastercard.png"
                                    fallbackAlt={t('funnel.paymentFormStep.altMastercard')}
                                    targetW={30}
                                    targetH={20}
                                    fit="contain"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-[#FFFFFF]">{t('funnel.paymentFormStep.cardNumber')}</label>
                            <div data-shift4="number" className={s4InputContainerStyles}></div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 flex flex-col gap-2">
                                <label className="text-sm text-[#FFFFFF] ">
                                    {t('funnel.paymentFormStep.expirationDate')}
                                </label>
                                <div data-shift4="expiry" className={s4InputContainerStyles}></div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <label className="text-sm text-[#FFFFFF]">
                                    {t('funnel.paymentFormStep.securityCode')}
                                </label>
                                <div data-shift4="cvc" className={s4InputContainerStyles}></div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex justify-center mt-6">
                        <Button
                            type="button"
                            onClick={onSubmit}
                            disabled={isButtonDisabled}
                            className={'w-full h-[50px] bg-primary-gradient text-lg rounded-lg'}
                        >
                            {isPaymentInProgress && <Loader2Icon className="animate-spin" />}
                            <span className={'text-base font-bold'}>
                                {shift4Error
                                    ? t('funnel.paymentFormStep.paymentUnavailable')
                                    : t('funnel.paymentFormStep.completePayment')}
                            </span>
                        </Button>
                    </div>

                    <p className="w-full mt-4 text-center text-white/50 text-xs leading-relaxed whitespace-pre-line">
                        {t('funnel.paymentFormStep.disclaimer')}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PaymentFormStep;
