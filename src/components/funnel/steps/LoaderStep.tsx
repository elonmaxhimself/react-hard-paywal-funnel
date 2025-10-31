"use client";
import { useEffect, useRef, useState } from "react";

import { Progress } from "@/components/ui/progress";
import { useLoader } from "@/hooks/useLoader";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import StepWrapper from "@/components/StepWrapper";
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

const LOADERS = [
    {
        label: "Understanding your preferences",
        key: "preferencesLoader",
    },
    {
        label: "Creating an uncensored version of AI girl",
        key: "uncensoredLoader",
    },
    {
        label: "Crafting AI girl to your preferences",
        key: "finalLoader",
    },
] as const;

type LoaderKey = (typeof LOADERS)[number]["key"];

const OVERLAYS = ["bg-[#000]/20", "bg-[#000]/20", "bg-[#000]/20", "backdrop-blur-sm"] as const;

export function LoaderStep({
    mainLoaderProps,
    preferencesLoaderProps,
    uncensoredLoaderProps,
    finalLoaderProps,
}: Props) {
    const { nextStep } = useStepperContext();

    const mainLoader = useLoader(
        mainLoaderProps.initialCountdown,
        mainLoaderProps.maxCountdown,
        mainLoaderProps.speed,
    );
    const preferencesLoader = useLoader(
        preferencesLoaderProps.initialCountdown,
        preferencesLoaderProps.maxCountdown,
        preferencesLoaderProps.speed,
    );
    const uncensoredLoader = useLoader(
        uncensoredLoaderProps.initialCountdown,
        uncensoredLoaderProps.maxCountdown,
        uncensoredLoaderProps.speed,
    );
    const finalLoader = useLoader(
        finalLoaderProps.initialCountdown,
        finalLoaderProps.maxCountdown,
        finalLoaderProps.speed,
    );

    const loaders: Record<LoaderKey, ReturnType<typeof useLoader>> = {
        preferencesLoader,
        uncensoredLoader,
        finalLoader,
    };

    useEffect(() => {
        Promise.all([
            mainLoader.start(),
            preferencesLoader.start(),
            uncensoredLoader.start(),
            finalLoader.start(),
        ]).then(() => {
            nextStep();
        });
    }, []);

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
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className={"w-full mb-[25px]"}>
                        <h1 className={"text-white text-2xl font-bold text-center capitalize"}>
                            Your Dream Companion
                        </h1>
                    </div>

                    <div
                        className={
                            "relative w-full h-auto aspect-[360/485] rounded-[10px] overflow-hidden mb-5"
                        }
                    >
                        <div ref={bannerRef} className="absolute inset-0">
                            {bannerSize.w > 0 && bannerSize.h > 0 && (
                                <SpriteIcon
                                    src={"/images/banners/first-loader-placeholder.webp"}
                                    fallbackAlt={"First Loader Placeholder"}
                                    targetW={bannerSize.w}
                                    targetH={bannerSize.h}
                                    fit="cover"
                                    frame
                                    center={false}
                                    className="w-full h-full"
                                />
                            )}
                        </div>

                        <div
                            className={
                                "w-full h-full px-[20px] py-[25px] flex flex-col items-center justify-center relative z-3"
                            }
                        >
                            <div
                                className={"w-full absolute top-[50%] left-[50%] -translate-[50%]"}
                            >
                                <p
                                    className={
                                        "text-white text-[50px] font-semibold leading-none text-center mb-[10px]"
                                    }
                                >
                                    {Math.trunc(mainLoader.progress)}%
                                </p>
                                <p
                                    className={
                                        "text-white text-[27px] font-semibold leading-none text-center mb-[28px]"
                                    }
                                >
                                    Please Wait!
                                </p>
                                <Progress
                                    value={mainLoader.progress}
                                    className={"h-[5px] bg-black-2 mb-[15px] mx-auto w-65"}
                                    indicatorProps={{ className: "bg-[#FD525A]" }}
                                />
                                <p className={"text-white text-base font-medium text-center"}>
                                    Your companion is being created. <br /> This might take a few
                                    seconds
                                </p>
                            </div>
                        </div>

                        {OVERLAYS.map((cls, i) => (
                            <div key={i} className={`absolute inset-0 ${cls}`} />
                        ))}
                    </div>

                    <div className={"w-full flex flex-col gap-[10px]"}>
                        {LOADERS.map(({ label, key }) => (
                            <div className={"w-full"} key={key}>
                                <div
                                    className={
                                        "text-white text-sm flex items-center justify-between mb-[5px]"
                                    }
                                >
                                    <span>{label}</span>
                                    <span>{Math.trunc(loaders[key].progress)}%</span>
                                </div>
                                <Progress value={loaders[key].progress} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}

export default LoaderStep;
