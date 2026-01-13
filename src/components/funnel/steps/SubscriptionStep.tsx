import { clsx } from "clsx";
import { useEffect, useRef, useState, useMemo  } from "react";
import { useFormContext } from "react-hook-form";

import SaleBanner from "@/components/SaleBanner";
import { Button } from "@/components/ui/button";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselDots,
    type CarouselApi,
} from "@/components/ui/carousel";
import { usePostHog } from "posthog-js/react";

import { useStore } from "@/store/state";

import { getBlurredCharacterImage } from "@/utils/helpers/getBlurredCharacterImage";

import { type FunnelSchema } from "@/hooks/funnel/useFunnelForm";

import { subscriptions } from "@/constants/subscriptions";
import { reviews } from "@/constants/reviews";
import { brands } from "@/constants/brands";
import { subscriptionTermsTexts } from "@/constants/subscriptionTermsTexts";

import SpriteIcon from "@/components/SpriteIcon";
import { EXPERIMENTS } from "@/configs/experiment.config";
import { useFunnelStore } from "@/store/states/funnel";

const PERKS = [
    { text: "🌶️ Spicy images" },
    { text: "🥵 Spicy videos" },
    { text: "🧠 Smartest Chat AI on the market" },
    { text: "⏳ Long chat memory" },
    { text: "👩🏼 Create multiple AI girls" },
    { text: "📚 2000+ AI girls in 20+ categories" },
    { text: "🔒 100% Content Privacy" },
] as const;

const FAQS = [
    {
        value: "item-1",
        question: "What should I do if my payment card isn't working?",
        answer: (
            <>
                We take extra precautions to prevent any unauthorized use of cards. Should your card
                be declined, try the following steps: Turn off any VPNs or proxies; Double-check
                your card details and that they match your bank's records; Ensure the country of
                your card issuer matches your billing address; Use 3D Secure or a similar
                verification service from your bank. If you're still having trouble, please contact
                us at&nbsp;
                <a
                    target="_blank"
                    href="mailto:support@mydreamcompanion.com"
                    className="underline"
                    rel="noopener noreferrer"
                >
                    support@mydreamcompanion.com
                </a>
                .
            </>
        ),
    },
    {
        value: "item-2",
        question: "How can I stop my subscription?",
        answer: (
            <>
                You can cancel your subscription at any time from your account settings. Simply go
                to the Billing section and click Cancel Subscription. Your access will remain active
                until the end of the current billing cycle. If you experience any issues or need
                help, feel free to reach out to us at&nbsp;
                <a
                    target="_blank"
                    href="mailto:support@mydreamcompanion.com"
                    className="underline"
                    rel="noopener noreferrer"
                >
                    support@mydreamcompanion.com
                </a>
                .
            </>
        ),
    },
    {
        value: "item-3",
        question: "How can I be sure your service is the best out there?",
        answer: (
            <>
                We focus on delivering a premium experience tailored to your needs. Our service
                combines advanced technology, a user-friendly interface, and responsive support to
                ensure you get real value. Don't just take our word for it — explore real reviews,
                compare features, and see why thousands trust us daily. Still unsure? <br />
                Contact us directly at&nbsp;
                <a
                    target="_blank"
                    href="mailto:support@mydreamcompanion.com"
                    className="underline"
                    rel="noopener noreferrer"
                >
                    support@mydreamcompanion.com
                </a>
                &nbsp;for a personalized walkthrough.
            </>
        ),
    },
    {
        value: "item-4",
        question: "How is my personal information kept secure??",
        answer: (
            <>
                We take the confidentiality of your data seriously. Our payment processor handles
                all our payment processes, and we can't keep or look at your credit card details. We
                implement strong security protocols to make sure your financial information is
                always safe. All your information is encrypted and stored securely and you can
                always delete your account and data at any time.
            </>
        ),
    },
] as const;

const stats = [
    {
        icon: "/images/gold-icons/icons.svg",
        value: "20 000 000 +",
        label: "AI companions created",
    },
    {
        icon: "/images/gold-icons/icons.svg",
        value: "50 000 000",
        label: "photos and videos",
    },
    {
        icon: "/images/gold-icons/star-award.svg",
        value: "4.9/5",
        label: "average satisfaction score",
    },
    {
        icon: "/images/gold-icons/star.svg",
        value: "5+",
        label: "New Features every month",
    },
];

const steps = [
    {
        step: "Step 1",
        title: "Get your plan",
        desc: "We've already set your profile! You will get access immediately after your purchase",
        img: "/images/how-it-work/circle.png",
        bgFrom: "#361728",
        bgTo: "#2B2136",
        borderFrom: "#361728",
        borderTo: "#2B2136",
    },
    {
        step: "Step 2",
        title: "Connect & chat",
        desc: "Start Chatting with your AI girl, create new one or chat with one of 4000+ ready AI companions",
        img: "/images/how-it-work/photo.png",
        pClass: "mb-[-35px]",
        bgFrom: "#361728",
        bgTo: "#2B2136",
        borderFrom: "#361728",
        borderTo: "#2B2136",
    },
    {
        step: "Step 3",
        title: "Dive in pleasure",
        desc: "Flirt, develop relationships, generate images and videos, have fun and enjoy your experience",
        img: "/images/how-it-work/chat.png",
        bgFrom: "#361728",
        bgTo: "#313137",
        borderFrom: "#36172880",
        borderTo: "#31313780",
    },
];

const BENEFITS = [
    "Data protection in bank statements",
    <>
        No hidden fees. <br /> Cancel anytime
    </>,
    "Antivirus Secured",
    "Discreet",
] as const;



function useMeasure() {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect;
            if (cr) setSize({ w: Math.round(cr.width), h: Math.round(cr.height) });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return { ref, ...size };
}

export function SubscriptionStep() {
    const { nextStep } = useStepperContext();
    const setIsSpecialOfferOpened = useStore((state) => state.offer.setIsSpecialOfferOpened);
    const isSpecialOfferOpened = useStore((state) => state.offer.isSpecialOfferOpened);
    const savedPricingVariant = useFunnelStore((s) => s.pricingVariant);
    const setPricingVariant = useFunnelStore((s) => s.setPricingVariant);
    const posthog = usePostHog();

  
    useEffect(() => {
        if (savedPricingVariant || !posthog) return;
        
        const variant = String(posthog.getFeatureFlag('pricing_ab_test') || 'control');
        setPricingVariant(variant);
    }, [savedPricingVariant, posthog, setPricingVariant]);

    const pricingVariant = savedPricingVariant || 'control';

    const productIds: readonly number[] = EXPERIMENTS.PRICING.variants[pricingVariant as keyof typeof EXPERIMENTS.PRICING.variants] || EXPERIMENTS.PRICING.variants.control;
    const DEFAULT_PRODUCT_ID = productIds[1];
    
    const activeSubscriptions = useMemo(() => {
        return subscriptions.filter(sub => productIds.includes(sub.productId));
    }, [productIds]);

    const [carouselApi, setCarouselApi] = useState<CarouselApi>();

    useEffect(() => {
        if (typeof window === "undefined") return;
        const fbq = (window as any).fbq;
        fbq?.("track", "ViewContent", {});
    }, []);

    const form = useFormContext<FunnelSchema>();

    useEffect(() => {
        if (isSpecialOfferOpened) {
            form.setValue("productId", DEFAULT_PRODUCT_ID);
            setIsSpecialOfferOpened(false);
        }
    }, [isSpecialOfferOpened, form, setIsSpecialOfferOpened]);

    useEffect(() => {
        if (!carouselApi) return;

        const interval = setInterval(() => {
            carouselApi.scrollNext();
        }, 3500);

        return () => clearInterval(interval);
    }, [carouselApi]);

    const productId = form.watch("productId");

    const ethnicity = form.watch("ethnicity");
    const hair_color = form.watch("hair_color");
    const characterPreviewImage =
        getBlurredCharacterImage(ethnicity, hair_color) ||
        "/images/blurred-characters/white-brunette.webp";

    const hero = useMeasure();
    const featured = useMeasure();

    const renderTermsText = (text: string) => {
        const parts = text.split("|TERMS_LINK|");
        if (parts.length === 1) return text;
        return (
            <>
                {parts[0]}
                <a
                    href="https://valuable-wishbone-63d.notion.site/Terms-of-Service-2615e53c779980cb9a05ce9981c1f0fa"
                    target="_blank"
                    className="text-blue-400  hover:text-blue-300 transition-colors "
                    rel="noopener noreferrer"
                >
                    Terms & Conditions
                </a>
                {parts[1]}
            </>
        );
    };

    return (
        <div className={"w-full flex flex-col min-h-screen h-full sm:px-10 pb-10 md:pb-[70px]"}>
            <SaleBanner />

            <div className={"max-w-[450px] flex-1 w-full mx-auto flex flex-col items-center"}>
                <div className={"relative w-full h-auto aspect-square"}>
                    <div ref={hero.ref} className="absolute inset-0">
                        {hero.w > 0 && hero.h > 0 && (
                            <SpriteIcon
                                src={characterPreviewImage}
                                fallbackAlt={"Character Placeholder"}
                                targetW={hero.w}
                                targetH={hero.h}
                                fit="cover"
                                className="w-full h-full character-image-mask"
                                imageClassName="origin-[50%_20%]"
                            />
                        )}
                    </div>
                </div>

                <div className={"mt-[-20px] mb-[25px]"}>
                    <div className={"text-white text-[28px] font-bold text-center"}>
                        Your Ai Girlfriend is Ready
                    </div>
                    <div className={"text-white/70 text-base font-medium text-center"}>
                        Get access to everything she can do <br />
                        for you right now
                    </div>
                </div>

                <div className={"w-full px-[15px] sm:px-0"}>
                    <div className={"w-full flex flex-col gap-[15px] mb-[30px]"}>
                        {activeSubscriptions.map((subscription) => (
                            <Button
                                key={subscription.id}
                                variant={"unstyled"}
                                onClick={() => form.setValue("productId", subscription.productId)}
                                className={clsx(
                                    "relative w-full h-auto p-0 bg-white/5 rounded-[10px] text-left",
                                    productId === subscription.productId
                                        ? "border-[2px] border-transparent bg-primary-gradient primary-shadow"
                                        : "border-[2px] border-white/6",
                                )}
                            >
                                <div className="w-full bg-[#2a2a2f] px-4 py-2 rounded-[10px] flex items-center justify-between flex-wrap sm:flex-nowrap gap-y-3 relative">
                                    {subscription.isBestChoice && (
                                        <div className="absolute top-[-12px] left-3 sm:left-4 bg-primary-gradient rounded-full flex items-center justify-center">
                                            <span className="text-white text-[10px] sm:text-xs font-semibold uppercase px-[10px] py-1">
                                                BEST CHOICE
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex flex-col">
                                        <div className="text-white text-base sm:text-lg font-semibold leading-none mb-1">
                                            {subscription.durationText}
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="text-white/50 text-xs font-semibold line-through">
                                                ${subscription.regularPrice}
                                            </div>
                                            <div className="text-white/80 text-xs font-semibold">
                                                ${subscription.salePriceFull}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-[2px] ml-auto">
                                        <div className="text-white/50 text-xs font-semibold line-through">
                                            ${subscription.regularPriceInDays}
                                        </div>
                                        <div className="text-white text-[18px] sm:text-[20px] font-semibold leading-none">
                                            ${subscription.salePriceInDays}
                                        </div>
                                        <span className="text-[10px] sm:text-[11px] text-white/50">
                                            per day
                                        </span>
                                    </div>
                                </div>
                            </Button>
                        ))}
                        <div className="bg-white/3 flex gap-3 items-center justify-center h-[42px] rounded-[10px]">
                            <img
                                alt="basket-cancel"
                                src={"/icons/basket-cancel.svg"}
                                width={20}
                                height={20}
                            />
                            <p className="text-white font-medium text-[11px]">
                                No commitment. Cancel anytime!
                            </p>
                        </div>
                        <Button
                            onClick={nextStep}
                            className={"w-full h-[45px] bg-primary-gradient"}
                        >
                            <span className={"text-base font-bold"}>Get Exclusive Discount</span>
                        </Button>
                        {productId && subscriptionTermsTexts[productId] && (
                            <div
                                className={"text-white/40 text-[11px] leading-relaxed text-center"}
                                style={{ whiteSpace: "pre-line" }}
                            >
                                {renderTermsText(subscriptionTermsTexts[productId])}
                            </div>
                        )}
                        <div className="w-full grid grid-cols-2 gap-1">
                            {BENEFITS.map((text, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <img
                                        src="/icons/security-check-icon.svg"
                                        alt="Sale Icon"
                                        width={20}
                                        height={20}
                                        className="w-[20px] h-[19px] invert brightness-0"
                                    />
                                    <span className="text-white/50 text-xs font-medium">
                                        {text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full p-2.5 bg-[#222327]/90 border border-white/6 rounded-[10px] mb-[35px]">
                        <div className="flex gap-2 items-center justify-between">
                            <div className="flex-1 flex items-center relative">
                                <SpriteIcon
                                    src={"/images/avatars/avatar_2.webp"}
                                    fallbackAlt={"Avatar 1"}
                                    targetW={31}
                                    targetH={31}
                                    fit="cover"
                                    frame
                                    center={false}
                                    className="size-[31px]"
                                    imageClassName="rounded-full border-[3px] border-[#2B2A2B] origin-[50%_20%]"
                                />
                                <SpriteIcon
                                    src={"/images/avatars/avatar_7.webp"}
                                    fallbackAlt={"Avatar 2"}
                                    targetW={31}
                                    targetH={31}
                                    fit="cover"
                                    frame
                                    center={false}
                                    className="size-[31px] relative -left-[12px]"
                                    imageClassName="rounded-full border-[3px] border-[#2B2A2B] origin-[50%_20%]"
                                />
                                <SpriteIcon
                                    src={"/images/avatars/avatar_8.webp"}
                                    fallbackAlt={"Avatar 3"}
                                    targetW={31}
                                    targetH={31}
                                    fit="cover"
                                    frame
                                    center={false}
                                    className="size-[31px] relative -left-[24px]"
                                    imageClassName="rounded-full border-[3px] border-[#2B2A2B] origin-[50%_20%]"
                                />

                                <div className="size-[31px] relative -left-[36px] rounded-full border-[3px] border-[#2B2A2B] bg-primary-gradient">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-white text-[11px] font-bold">
                                            3M+
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={"flex-1 text-white text-[10px] font-bold uppercase"}>
                                3M+ happy users
                            </div>

                            <div className={"relative flex-1"}>
                                <SpriteIcon
                                    src={"/images/award-ranking.svg"}
                                    fallbackAlt={"#1 RANKED NSFW AI APP"}
                                    targetW={126}
                                    targetH={38}
                                    fit="contain"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full bg-transparent py-[15px] mb-[35px]">
                        <div className="flex items-center justify-center gap-1 text-[20px] font-bold text-white mb-2">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M9.99983 0.833984C9.39967 0.833984 9.03133 1.27265 8.79192 1.65055C8.54617 2.03832 8.29264 2.5969 7.99174 3.25984C7.8749 3.51723 7.76153 3.77756 7.64797 4.0383C7.38372 4.64506 7.11848 5.25408 6.80629 5.83368C6.56809 6.27592 6.14736 6.52814 5.63446 6.34611C5.44106 6.27747 5.19768 6.16978 4.83013 6.00642C4.7417 5.96711 4.64938 5.92324 4.55411 5.87796C4.04873 5.6378 3.46013 5.35808 2.9272 5.51056C2.40322 5.66048 2.03029 6.09587 1.90786 6.60508C1.83346 6.91454 1.89833 7.23202 1.97436 7.50526C2.05295 7.78773 2.18086 8.14173 2.33512 8.56865L3.74538 12.4717C4.03292 13.2674 4.26502 13.9098 4.50546 14.4084C4.99713 15.428 5.77238 16.0505 6.90808 16.188C7.42557 16.2507 8.06035 16.2507 8.832 16.2507H11.1677C11.9393 16.2507 12.5742 16.2507 13.0916 16.188C14.2273 16.0505 15.0026 15.428 15.4942 14.4084C15.7347 13.9098 15.9667 13.2675 16.2543 12.4716L17.6646 8.56865C17.8188 8.14178 17.9467 7.78773 18.0253 7.50526C18.1013 7.23202 18.1662 6.91454 18.0918 6.60508C17.9694 6.09587 17.5965 5.66048 17.0725 5.51056C16.5449 5.35961 15.9583 5.63678 15.4579 5.87327C15.3676 5.91594 15.2801 5.95729 15.1962 5.99456C15.145 6.01732 15.0938 6.04033 15.0427 6.06335C14.8195 6.16369 14.5956 6.26435 14.3652 6.34611C13.8523 6.52814 13.4316 6.27592 13.1934 5.83368C12.8812 5.25407 12.616 4.64504 12.3517 4.03828C12.2382 3.77753 12.1248 3.51721 12.0079 3.25982C11.7071 2.59689 11.4535 2.03831 11.2078 1.65055C10.9683 1.27265 10.6 0.833984 9.99983 0.833984ZM9.99917 10.834C9.31192 10.834 8.75475 11.3937 8.75475 12.084C8.75475 12.7743 9.31192 13.334 9.99917 13.334H10.0103C10.6977 13.334 11.2548 12.7743 11.2548 12.084C11.2548 11.3937 10.6977 10.834 10.0103 10.834H9.99917Z"
                                    fill="url(#paint0_linear_4279_4654)"
                                />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M5 18.0833C5 17.6231 5.37309 17.25 5.83333 17.25H14.1667C14.6269 17.25 15 17.6231 15 18.0833C15 18.5435 14.6269 18.9167 14.1667 18.9167H5.83333C5.37309 18.9167 5 18.5435 5 18.0833Z"
                                    fill="url(#paint1_linear_4279_4654)"
                                />
                                <defs>
                                    <linearGradient
                                        id="paint0_linear_4279_4654"
                                        x1="0.991864"
                                        y1="10.7906"
                                        x2="15.1989"
                                        y2="3.33172"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#FFB498" />
                                        <stop offset="1" stopColor="#FFB498" />
                                    </linearGradient>
                                    <linearGradient
                                        id="paint1_linear_4279_4654"
                                        x1="4.45652"
                                        y1="18.3264"
                                        x2="5.57948"
                                        y2="14.9703"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#FFB498" />
                                        <stop offset="1" stopColor="#FFB498" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="bg-gradient-to-r from-[#ffc5b3] to-[#ff417d] text-transparent bg-clip-text">
                                Premium
                            </span>
                            Benefits
                        </div>

                        <div className="flex flex-col gap-[10px]">
                            {PERKS.map(({ text }, i) => (
                                <div
                                    key={i}
                                    className="flex gap-[10px] items-center border-b border-white/5 py-3 last:border-b-0"
                                >
                                    <p className="text-white text-[14px] font-medium">{text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="absolute top-3 right-0 w-[60px] h-[420px] bg-gray-2 rounded-[10px] text-white px-[9px] py-[8px]">
                            <p className="bg-gradient-primary font-bold text-[12px] p-[3px] text-center rounded-[4px]">
                                PRO
                            </p>
                            <div className="flex flex-col gap-7 mt-5 text-center items-center">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <img
                                        key={i}
                                        src="/icons/tick.svg"
                                        alt="ratingStar"
                                        width={26}
                                        height={26}
                                        className="block"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div
                        className={
                            "w-full bg-white/5 border border-white/6 rounded-[10px] px-[10px] pt-[15px] pb-[35px] mb-[35px]"
                        }
                    >
                        <div className={"text-white text-[20px] font-bold text-center mb-2"}>
                            As Featured In
                        </div>
                        <div className={"grid grid-cols-3 gap-6 items-center justify-center"}>
                            {brands.map((brand) => (
                                <SpriteIcon
                                    key={brand.id}
                                    src={brand.logo.src}
                                    fallbackAlt={brand.logo.alt}
                                    targetW={brand.logo.width}
                                    targetH={brand.logo.height}
                                    fit="contain"
                                    className="mx-auto"
                                />
                            ))}
                        </div>
                    </div>

                    <div className={"w-full flex flex-col items-center gap-5 mb-[35px]"}>
                        <div className={"text-white text-[20px] font-bold text-center"}>
                            Over{" "}
                            <span
                                className={
                                    "bg-gradient-to-r from-[#ffc5b3] to-[#ff417d] text-transparent bg-clip-text"
                                }
                            >
                                8000+ 5-star
                            </span>{" "}
                            reviews
                        </div>
                        <div className={"w-full"}>
                            <Carousel
                                setApi={setCarouselApi}
                                opts={{
                                    align: "start",
                                    loop: true,
                                }}
                            >
                                <CarouselContent>
                                    {reviews.map((review) => (
                                        <CarouselItem className={"relative"} key={review.id}>
                                            <div
                                                className={clsx(
                                                    "relative w-full rounded-[10px] pt-5 px-5 pb-9 overflow-hidden",
                                                    "bg-linear-to-b from-white/15 to-white/0 border border-[#2a323b]",
                                                )}
                                            >
                                                <div className={"flex flex-col gap-[16px]"}>
                                                    <div
                                                        className={
                                                            "w-full flex items-center gap-[14px]"
                                                        }
                                                    >
                                                        <SpriteIcon
                                                            src={review.avatar}
                                                            targetW={50}
                                                            targetH={50}
                                                            fit="cover"
                                                            frame
                                                            imageClassName="rounded-full"
                                                        />
                                                        <div>
                                                            <div className={"text-white"}>
                                                                {review.name}
                                                            </div>
                                                            <div className={"flex"}>
                                                                {Array.from({
                                                                    length: review.rating,
                                                                }).map((_, i) => (
                                                                    <img
                                                                        key={i}
                                                                        src="/icons/rating-star.svg"
                                                                        alt="ratingStar"
                                                                        width={16}
                                                                        height={16}
                                                                        className="inline-block"
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            "w-full text-sm text-white font-medium"
                                                        }
                                                    >
                                                        {review.message}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute rounded-[10px] inset-0 pointer-events-none slider-overlay-gradient" />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselDots />
                            </Carousel>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-[15px] mb-[35px]">
                        <div className="text-white text-[20px] font-bold text-center">
                            How it{" "}
                            <span className="bg-gradient-to-r from-[#ff6b96] to-[#ff417d] text-transparent bg-clip-text">
                                works
                            </span>
                        </div>

                        <div className="grid gap-[20px]">
                            {steps.map(
                                (
                                    {
                                        step,
                                        title,
                                        desc,
                                        img,
                                        pClass,
                                        bgFrom,
                                        bgTo,
                                        borderFrom,
                                        borderTo,
                                    },
                                    i,
                                ) => (
                                    <div
                                        key={i}
                                        className="gradient-border-universal"
                                        style={
                                            {
                                                "--bg-direction": "to bottom",
                                                "--border-direction": "to bottom",
                                                "--bg-from": bgFrom,
                                                "--bg-to": bgTo,
                                                "--border-from": borderFrom,
                                                "--border-to": borderTo,
                                                "--radius": "15px",
                                            } as React.CSSProperties
                                        }
                                    >
                                        <div className="pt-[15px] px-[10px] ">
                                            <span className="inline-block text-white font-semibold text-[14px] px-4 py-[2px] bg-coral-red rounded-[43px] mb-7">
                                                {step}
                                            </span>

                                            <h4 className="text-white font-bold text-[18px] mb-2">
                                                {title}
                                            </h4>

                                            <p
                                                className={`text-white/70 font-medium text-[14px] ${pClass || "mb-3"}`}
                                            >
                                                {desc}
                                            </p>
                                        </div>
                                        <div className="flex justify-center">
                                            <img alt={title} src={img} height={400} width={450} />
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                    <div className="relative top-[-50px]">
                        <div className="flex justify-center">
                            <img
                                src="/images/3m-users.svg"
                                alt="3m-users"
                                width={400}
                                height={400}
                                className="block"
                            />
                        </div>

                        <div className="mt-[-40px] bg-white/3 flex flex-col border border-white/5  items-center justify-center rounded-[10px] ">
                            <div className="flex flex-col gap-3 p-[20px]">
                                {stats.map(({ icon, value, label }, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex justify-center">
                                            <img
                                                src={icon}
                                                alt={label}
                                                width={15}
                                                height={15}
                                                className="block"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h5 className="text-white font-bold text-[14px]">
                                                {value}
                                            </h5>
                                            <p className="text-white/50 font-medium text-[10px]">
                                                {label}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-[15px] mb-[35px]">
                        <div className="text-white text-[20px] font-bold text-center">
                            Frequently Asked Questions
                        </div>
                        <Accordion type="multiple" className="w-full" defaultValue={["item-1"]}>
                            {FAQS.map(({ value, question, answer }) => (
                                <AccordionItem
                                    key={value}
                                    value={value}
                                    className="px-4 py-2 mb-4 bg-white/5 border border-white/6 rounded-[10px] pt-[15px]"
                                >
                                    <AccordionTrigger className="text-white text-base font-medium py-0 items-center cursor-pointer">
                                        {question}
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 flex flex-col gap-4 text-balance">
                                        <p className="text-white/50 text-sm">{answer}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubscriptionStep;