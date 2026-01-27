import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation, Trans } from "react-i18next";

import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { type FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import SpriteIcon from "@/components/SpriteIcon";

export function ReceiveVoiceMessagesStep() {
    const { t } = useTranslation();
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const onSelectValue = (value: boolean) => {
        form.setValue("receiveVoiceMessages", value);
        nextStep();
    };

    const bannerRef = useRef<HTMLDivElement>(null);
    const [bannerSize, setBannerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

    useEffect(() => {
        const el = bannerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect;
            if (cr) setBannerSize({ w: Math.round(cr.width), h: Math.round(cr.height) });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div className="w-full flex flex-col min-h-screen px-[15px] pt-[15px] sm:px-10 sm:pt-[40px] pb-[110px] sm:pb-[70px]">
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] md:mb-0">
                    <div className="relative w-full h-auto aspect-[360/600] sm:aspect-[360/500] rounded-[10px] overflow-hidden mb-[30px]">
                        <div ref={bannerRef} className="absolute inset-0">
                            {bannerSize.w > 0 && bannerSize.h > 0 && (
                                <SpriteIcon
                                    src={"/images/banners/voice-message-banner.webp"}
                                    fallbackAlt={t('funnel.receiveVoiceMessagesStep.altBanner')}
                                    targetW={bannerSize.w}
                                    targetH={bannerSize.h}
                                    fit="cover"
                                    frame
                                    center={false}
                                    className="w-full h-full"
                                />
                            )}
                        </div>

                        <div className="absolute bottom-5 left-[50%] -translate-x-[50%] z-1 w-[266px] h-[78px] rounded-[10px] bg-white/10 backdrop-blur-lg border border-white/6">
                            <div className="w-full h-full flex items-center gap-[18px] px-[15px] relative">
                                <div className="size-[56px] flex items-center justify-center bg-coral-red rounded-full border border-white/6 voice-icon-shadow">
                                    <img
                                        src="/icons/voice-lg-icon.svg"
                                        alt={t('funnel.receiveVoiceMessagesStep.altVoiceIcon')}
                                        width={22}
                                        height={22}
                                        className="w-[22px] h-[22px] invert brightness-0"
                                    />
                                </div>

                                <div className={"flex gap-[6px] items-center"}>
                                    <div className={"w-[3px] h-[3px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[13px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[23px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[6px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[26px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[23px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[16px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[16px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[16px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[23px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[16px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[26px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[16px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[6px] rounded-[2px] bg-white/66"} />
                                    <div className={"w-[3px] h-[3px] rounded-[2px] bg-white/66"} />
                                </div>

                                <SpriteIcon
                                    src={"/images/cursor.png"}
                                    fallbackAlt={t('funnel.receiveVoiceMessagesStep.altCursor')}
                                    targetW={50}
                                    targetH={50}
                                    fit="contain"
                                    frame
                                    center={false}
                                    className={"absolute top-[50px] right-0 -translate-y-[40%]"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="fixed bottom-0 left-0 w-full px-[15px] sm:px-0 p-5 
                   bg-black-2 sm:bg-transparent 
                    sm:relative z-100"
                >
                    <div className="max-w-[450px] w-full mx-auto">
                        <h2 className="text-white text-lg font-bold text-center mb-[30px] sm:mb-[20px] capitalize">
                            <Trans 
                                i18nKey="funnel.receiveVoiceMessagesStep.title"
                                components={{ br: <br /> }}
                            />
                        </h2>
                        <div className="w-full flex items-center justify-center gap-[12px]">
                            <Button
                                onClick={() => onSelectValue(false)}
                                className="h-[45px] flex-1 bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <span className="text-base font-bold">{t('funnel.receiveVoiceMessagesStep.no')}</span>
                            </Button>
                            <Button
                                onClick={() => onSelectValue(true)}
                                className="h-[45px] flex-1 bg-primary-gradient"
                            >
                                <span className="text-base font-bold">{t('funnel.receiveVoiceMessagesStep.yes')}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReceiveVoiceMessagesStep;