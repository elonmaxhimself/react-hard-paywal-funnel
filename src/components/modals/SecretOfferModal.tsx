import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useStore } from "@/store/state";
import { useTimer } from "@/hooks/useTimerCount";

import { ModalTriggers } from "@/utils/enums/modal-triggers";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

import { secretOffer } from "@/constants/subscriptions";
import { avatars } from "@/constants/avatars";

import girlTokioIcon from "@@/images/backgrounds/tokio-girl.avif";

const TIMER = 30;

const SecretOfferModal = () => {
    const trigger = useStore((state) => state.modal.trigger);
    const setClose = useStore((state) => state.modal.setClose);
    const setOpen = useStore((state) => state.modal.setOpen);
    const posthog = usePostHog();

    const isSecretOfferModalOpen = trigger === ModalTriggers.SECRET_OFFER;

    const { progress, formattedTime, shouldShowTimer } = useTimer(TIMER, isSecretOfferModalOpen);

    const form = useFormContext<FunnelSchema>();

    useEffect(() => {
        if (isSecretOfferModalOpen) {
            form.setValue("productId", secretOffer.productId);
        }
    }, [isSecretOfferModalOpen, form]);

    const onClaimNow = () => {
        if (typeof window !== 'undefined') {
            posthog?.capture('exit_offer_2_accepted');
        }
        setClose();
    };

    const onLoseChance = () => {
        if (typeof window !== 'undefined') {
            posthog?.capture('exit_offer_2_declined');
        }
        setOpen({
            title: "goToDiscount",
            trigger: ModalTriggers.SHOW_VIDEO_MODAL,
        });
    };

    return (
        <Modal
            triggers={[ModalTriggers.SECRET_OFFER]}
            className="p-0 overflow-hidden"
            showCloseButton={false}
            disableOutsideClick
        >
            {/* Изображение - заменяем Next.js Image на обычный img */}
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                <img
                    src={girlTokioIcon}
                    alt="girl tokio"
                    className="absolute inset-0 w-full h-full object-cover object-[center_13%]"
                />
            </div>

            <h2 className="capitalize text-2xl font-bold text-white text-center my-5 px-3">
                Claim the secret offer before it`s gone!
            </h2>
            <p className="text-[16px] font-medium text-white/70 text-center my-5 px-3">
                Get an additional discount, if you unlock your chat in the next 60 seconds!
            </p>

            <div className="px-[15px] pb-[15px] flex flex-col gap-[30px]">
                <div className="w-full flex flex-col gap-[15px] mb-[30px]">
                    <div
                        key={secretOffer.id}
                        className={clsx(
                            "relative w-full bg-white/5 rounded-[10px]",
                            secretOffer.isBestChoice
                                ? "border-[2px] border-transparent bg-primary-gradient primary-shadow"
                                : "border-[2px] border-white/6",
                        )}
                    >
                        <div className="bg-[#2a2a2f] p-4 rounded-[10px] flex items-center justify-between flex-wrap sm:flex-nowrap gap-y-3 relative">
                            {secretOffer.isBestChoice && (
                                <div className="absolute top-[-12px] left-3 sm:left-4 bg-primary-gradient rounded-full flex items-center justify-center">
                                    <span className="text-white text-[10px] sm:text-xs font-semibold uppercase px-[10px] py-1">
                                        BEST CHOICE
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-col">
                                <div className="text-white text-base sm:text-lg font-semibold leading-none">
                                    {secretOffer.months} months
                                </div>
                                <div className="text-coral-red text-sm font-extrabold leading-none">
                                    {secretOffer.saleOff}% OFF
                                </div>
                            </div>

                            <div className="flex items-end gap-[6px] ml-auto">
                                <div className="text-white/50 text-xl sm:text-2xl font-semibold line-through">
                                    ${secretOffer.regularPrice}
                                </div>
                                <div className="text-white text-[24px] sm:text-[32px] font-semibold leading-none">
                                    ${secretOffer.salePriceInDays}
                                    <span className="text-[10px] sm:text-[11px]"> / Day</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-5">
                        <div className="flex -space-x-2">
                            {avatars.map(({ src, alt, fallback }) => (
                                <Avatar size="xs" key={src}>
                                    <AvatarImage
                                        className="w-10 h-10 rounded-full object-cover"
                                        src={src}
                                        alt={alt}
                                    />
                                    <AvatarFallback>{fallback}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>

                        <div className="text-white/70 text-[11px] font-[600] capitalize whitespace-nowrap">
                            220 users signed up today
                        </div>
                    </div>

                    <div className="relative">
                        <Button
                            onClick={onClaimNow}
                            variant="default"
                            size="bold"
                            className={clsx(
                                "w-full relative overflow-hidden transition-all duration-300",
                                shouldShowTimer && "pulse-button",
                            )}
                        >
                            {shouldShowTimer && (
                                <div
                                    className="absolute inset-0 bg-black/20 transition-all duration-1000 ease-linear"
                                    style={{ width: `${progress}%`, transformOrigin: "left" }}
                                />
                            )}
                            <span className="flex items-center justify-center gap-2 relative z-10">
                                Claim now
                                <span className="bg-black/30 px-2 py-1 rounded text-sm font-medium text-white">
                                    {formattedTime}
                                </span>
                            </span>
                        </Button>
                    </div>

                    <Button
                        variant="lose"
                        onClick={onLoseChance}
                    >
                        Lose the chance
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SecretOfferModal;