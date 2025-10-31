import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";
import SpriteIcon from "@/components/SpriteIcon";

export function ReceiveVideoCallsStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const onSelectValue = (value: boolean) => {
        form.setValue("receiveVideoCalls", value);
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
                                    src={"/images/banners/video-calls-banner.webp"}
                                    fallbackAlt={"Would you like to receive Video Calls?"}
                                    targetW={bannerSize.w}
                                    targetH={bannerSize.h}
                                    fit="cover"
                                    frame
                                    center={false}
                                    className="w-full h-full capitalize"
                                />
                            )}
                        </div>

                        <div className={"absolute top-5 left-5"}>
                            <div>
                                <div className={"text-white text-lg font-medium mb-[7px]"}>
                                    Emily🔥
                                </div>
                                <div
                                    className={
                                        "rounded-full bg-linear-to-b from-white/20 to-white/3 px-3 py-1"
                                    }
                                >
                                    <div className={"flex gap-[5px] items-center"}>
                                        <div className={"size-[6px] bg-coral-red rounded-full"} />
                                        <div className={"text-white text-xs font-medium"}>
                                            01:39:12
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={"absolute bottom-[15px] left-[50%] -translate-x-[50%]"}>
                            <div className={"flex flex-col items-center justify-center gap-6"}>
                                <div className={"flex items-center justify-center gap-4"}>
                                    <div
                                        className={
                                            "size-[63px] flex items-center justify-center bg-white/10 rounded-full backdrop-blur-md overflow-hidden"
                                        }
                                    >
                                        <img
                                            src="/icons/recording-icon.svg"
                                            alt="Recording Icon"
                                            width={25}
                                            height={25}
                                            className="w-[25px] h-[25px] invert brightness-0"
                                        />
                                    </div>
                                    <div
                                        className={
                                            "size-[63px] flex items-center justify-center bg-coral-red rounded-full overflow-hidden"
                                        }
                                    >
                                        <img
                                            src="/icons/cancel-call-icon.svg"
                                            alt="Cancel Call Icon"
                                            width={25}
                                            height={25}
                                            className="w-[25px] h-[25px] invert brightness-0"
                                        />
                                    </div>
                                    <div
                                        className={
                                            "size-[63px] flex items-center justify-center bg-white/10 rounded-full backdrop-blur-md overflow-hidden"
                                        }
                                    >
                                        <img
                                            src="/icons/microphone-icon.svg"
                                            alt="Microphone Icon"
                                            width={25}
                                            height={25}
                                            className="w-[25px] h-[25px] invert brightness-0"
                                        />
                                    </div>
                                </div>

                                <div className={"text-white/80 text-xs"}>Swipe up to show chat</div>
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
                            Would you like to receive <br />
                            Video Calls?
                        </h2>
                        <div className="w-full flex items-center justify-center gap-[12px]">
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
    );
}