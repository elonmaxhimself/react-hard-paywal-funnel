"use client";

import { X, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStepperContext } from "@/components/stepper/Stepper.context";
// import { useStore } from "@/store/state";
import { usePaymentForm } from "@/hooks/usePaymentForm";
// import { ModalTriggers } from "@/utils/enums/modal-triggers";
import { useFunnelStore } from "@/store/states/funnel";
import { useEffect } from "react";
import SpriteIcon from "@/components/SpriteIcon";
import { usePostHog } from "posthog-js/react";

const s4InputContainerStyles = "h-[50px] bg-[#000]/30 rounded-[8px] border border-white/6 p-[12px]";

export function PaymentFormStep() {
    const setStep = useFunnelStore((s) => s.setStep);
    const posthog = usePostHog();
    const { product, onSubmit, isPending } = usePaymentForm(posthog);
    // const setOpen = useStore((state) => state.modal.setOpen);
    // const isSpecialOfferOpened = useStore((state) => state.offer.isSpecialOfferOpened);
    const { prevStep } = useStepperContext();

    useEffect(() => {
        setStep(44);
    }, [setStep]);

    const onOpenSpecialOffer = () => {
        // COMMENTED OUT: Exit-intent offer logic - users can now leave paywall freely, special offer logic will be used in the future again
        prevStep();
        // if (isSpecialOfferOpened) prevStep();
        // else setOpen({ trigger: ModalTriggers.SPECIAL_OFFER_MODAL });
    };

    return (
        <div className="w-full flex flex-col min-h-screen px-[15px] pt-[25px] sm:px-10 sm:pt-[40px] pb-[70px] relative">
            <Button
                onClick={onOpenSpecialOffer}
                variant={"unstyled"}
                className={"absolute top-5 right-5 p-0 w-auto h-auto"}
            >
                <X className={"text-white"} size={24} strokeWidth={3} />
            </Button>

            <div className="max-w-[360px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center">
                    <SpriteIcon
                        src={"/images/logo.svg"}
                        fallbackAlt={"My Dream Companion"}
                        targetW={40}
                        targetH={40}
                        fit="contain"
                        className={"mb-2"}
                    />

                    <div className={"text-white text-2xl font-bold text-center"}>Checkout</div>
                    <div className={"text-white/60 text-sm text-center mb-6"}>
                        Today&apos;s Total: ${product.amount / 100}
                    </div>

                    <div
                        id="payment-form"
                        className="relative w-full bg-white/5 border border-white/6 p-[10px] pb-[30px] rounded-[10px] flex flex-col gap-4"
                    >
                        <div className="flex justify-center mb-2">
                            <h3 className="text-white font-bold text-[20px] mt-1">Credit card</h3>

                            <div className="absolute top-5 right-[10px] flex items-center gap-1">
                                <SpriteIcon
                                    src="/images/cards-logos/visa.png"
                                    fallbackAlt="Visa"
                                    targetW={30}
                                    targetH={20}
                                    fit="contain"
                                />
                                <SpriteIcon
                                    src="/images/cards-logos/mastercard.png"
                                    fallbackAlt="Mastercard"
                                    targetW={30}
                                    targetH={20}
                                    fit="contain"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-[#FFFFFF]">Card number</label>
                            <div data-shift4="number" className={s4InputContainerStyles}></div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 flex flex-col gap-2">
                                <label className="text-sm text-[#FFFFFF] ">Expiration date</label>
                                <div data-shift4="expiry" className={s4InputContainerStyles}></div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <label className="text-sm text-[#FFFFFF]">Security code</label>
                                <div data-shift4="cvc" className={s4InputContainerStyles}></div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex justify-center mt-6">
                        <Button
                            type="button"
                            onClick={onSubmit}
                            disabled={isPending}
                            className={"w-full h-[50px] bg-primary-gradient text-lg rounded-lg"}
                        >
                            {isPending && <Loader2Icon className="animate-spin" />}
                            <span className={"text-base font-bold"}>Complete Payment</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentFormStep;
