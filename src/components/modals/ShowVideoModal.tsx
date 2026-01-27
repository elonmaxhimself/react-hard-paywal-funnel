import { useTranslation } from "react-i18next";

import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/state";
import { ModalTriggers } from "@/utils/enums/modal-triggers";
import { useStepperContext } from "../stepper/Stepper.context";

import girlAvatar9Background from "@@/images/avatars/avatar_9.webp";
import playButtonIcon from "@@/images/play-button.png";

const STEPS_COUNT = 44;

export default function ShowVideoModal() {
    const { t } = useTranslation();
    const { onChange } = useStepperContext();
    const title = useStore((state) => state.modal.title);
    const setOpen = useStore((state) => state.modal.setOpen);
    const setClose = useStore((state) => state.modal.setClose);

    const handleOpen = () => {
        if (title === "goToDiscount") {
            setOpen({
                title: "95%",
                trigger: ModalTriggers.FINAL_OFFER_UNLOCKED_MODAL,
            });
            return;
        }

        if (title === "withLoseBtn") {
            setOpen({
                trigger: ModalTriggers.FINAL_OFFER_MODAL,
            });
        } else {
            setClose();
            onChange(STEPS_COUNT);
        }
    };

    const texts = [
        {
            id: 1,
            text: t('modals.showVideo.message1'),
            noBLRadius: false,
        },
        {
            id: 2,
            text: t('modals.showVideo.message2'),
            noBLRadius: true,
        },
    ];

    return (
        <Modal
            triggers={[ModalTriggers.SHOW_VIDEO_MODAL]}
            className="sm:max-w-[400px] p-0 overflow-hidden rounded-xl"
            showCloseButton={false}
            disableOutsideClick
        >
            <div className="px-[15px] pb-[15px] flex flex-col gap-[30px] mt-[30px]">
                <div className="w-full bg-white/5 rounded-[10px] p-[15px]">
                    <div
                        onClick={setClose}
                        className="relative w-full overflow-hidden rounded-md cursor-pointer"
                        style={{ aspectRatio: "16/10" }}
                    >
                        <img
                            src={girlAvatar9Background}
                            alt={t('common.altGirl')}
                            className="absolute inset-0 w-full h-full object-cover object-[center_45%] filter blur-sm"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src={playButtonIcon}
                                alt={t('common.altPlay')}
                                width={64}
                                height={64}
                                className="z-10"
                            />
                        </div>
                    </div>
                    <Button onClick={setClose} variant="ghost" className="w-full mt-5 capitalize">
                        {t('modals.showVideo.clickToSeeVideo')}
                    </Button>
                </div>

                <div className="w-full bg-white/5 rounded-[10px] px-[15px] pt-[15px] pb-[8px]">
                    <div className="space-y-3">
                        {texts.map(({ id, text, noBLRadius }) => (
                            <div
                                key={id}
                                className={`light-pink-gradient-border font-[600] text-[17px]${noBLRadius ? " no-bl-radius" : ""}`}
                            >
                                {text}
                            </div>
                        ))}
                        <span className="text-white/40 text-[14px]">{t('modals.showVideo.time')}</span>
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <Button
                        onClick={handleOpen}
                        className="w-full h-12 bg-primary-gradient hover:bg-secondary-gradient text-white font-bold text-base rounded-lg"
                    >
                        {t('modals.showVideo.goBack')}
                    </Button>

                    <Button onClick={handleOpen} variant="lose" className="w-full">
                        {t('modals.showVideo.noSpicyChats')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}