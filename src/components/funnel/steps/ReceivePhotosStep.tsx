"use client";
import { useEffect, useRef, useState } from "react";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import SpriteIcon from "@/components/SpriteIcon";

interface LoaderProps {
    initialCountdown: number;
    maxCountdown: number;
    speed: number;
}

interface Props {
    mainLoaderProps: LoaderProps;
    preferencesLoaderProps: LoaderProps;
    uncensoredLoaderProps: LoaderProps;
    finalLoaderProps: LoaderProps;
}

export function ReceivePhotosStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const onSelectValue = (value: boolean) => {
        form.setValue("receiveCustomPhotos", value);
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
                                    src="/images/banners/adult-content-banner.webp"
                                    fallbackAlt="Would you like to receive Spicy Custom Photos?"
                                    targetW={bannerSize.w}
                                    targetH={bannerSize.h}
                                    fit="cover"
                                    frame
                                    center={false}
                                    className="w-full h-full"
                                />
                            )}
                        </div>

                        <SpriteIcon
                            src="/images/cursor.png"
                            fallbackAlt="Cursor"
                            targetW={30}
                            targetH={30}
                            fit="contain"
                            frame
                            center={false}
                            className="absolute top-[140px] right-8 z-4"
                        />

                        <div className="absolute right-4 top-[92px] w-[110px] h-[66px] p-[1px] rounded-[10px]">
                            <div className="relative w-full h-full z-1">
                                <div className="absolute -top-[36px] left-[50%] -translate-x-[50%] size-[72px] flex items-center justify-center rounded-full bg-white/17 backdrop-blur-[20px] translucent-image-shadow z-2">
                                    <SpriteIcon
                                        src="/images/emojis/demon-emoji.webp"
                                        fallbackAlt="Demon Emoji"
                                        targetW={47}
                                        targetH={47}
                                        fit="contain"
                                        frame
                                        center={false}
                                        imageClassName="translucent-emoji-shadow"
                                    />
                                </div>
                                <div className="w-full h-full bg-white/10 rounded-[10px] overflow-hidden backdrop-blur-xl z-1">
                                    <div className="w-full h-full gradient-slider-bg flex items-end justify-center">
                                        <div className="mb-[5px]">
                                            <div className="w-[58px] h-[16px] rounded-[10px] switcher-root flex justify-end">
                                                <div className="w-[34px] h-[15px] translate-x-[5px] rounded-[10px] switcher-control relative" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute left-4 bottom-6 w-[110px] h-[66px] p-[1px] rounded-[10px]">
                            <div className="relative w-full h-full z-1">
                                <div className="absolute -top-[36px] left-[50%] -translate-x-[50%] size-[72px] flex items-center justify-center rounded-full bg-white/17 backdrop-blur-[20px] translucent-image-shadow z-2">
                                    <SpriteIcon
                                        src="/images/emojis/fire-emoji.webp"
                                        fallbackAlt="Fire Emoji"
                                        targetW={47}
                                        targetH={47}
                                        fit="contain"
                                        frame
                                        center={false}
                                        imageClassName="translucent-emoji-shadow"
                                    />
                                </div>
                                <div className="w-full h-full bg-white/10 rounded-[10px] overflow-hidden backdrop-blur-xl z-1">
                                    <div className="w-full h-full gradient-slider-bg flex items-end justify-center">
                                        <div className="mb-[5px]">
                                            <div className="w-[58px] h-[16px] rounded-[10px] switcher-root flex justify-end">
                                                <div className="w-[34px] h-[15px] translate-x-[5px] rounded-[10px] switcher-control" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="fixed bottom-0 left-0 w-full px-[15px] sm:px-0 p-5 pt-0 bg-black-2 sm:bg-transparent  sm:relative z-100">
                        <div className="max-w-[450px] w-full mx-auto">
                            <h2 className="text-white text-lg font-bold text-center mb-[30px] sm:mb-[20px] capitalize ">
                                Would you like to receive <br />
                                🌶️ Spicy Custom Photos
                            </h2>
                            <div className="w-full flex items-center justify-center gap-[12px] ">
                                <Button
                                    onClick={() => onSelectValue(false)}
                                    className="h-[45px] flex-1 bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <span className="text-base font-bold">No</span>
                                </Button>
                                <Button
                                    onClick={() => onSelectValue(true)}
                                    className="h-[45px] flex-1 bg-primary-gradient"
                                >
                                    <span className="text-base font-bold">Yes</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReceivePhotosStep;
