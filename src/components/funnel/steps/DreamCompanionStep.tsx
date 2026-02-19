import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useStepperContext } from "@/components/stepper/Stepper.context";

import { getBlurredCharacterImage } from "@/utils/helpers/getBlurredCharacterImage";
import { getRandomFemaleName } from "@/utils/helpers/female_names";

import { FunnelSchema } from "@/hooks/funnel/useFunnelForm";

import SpriteIcon from "@/components/SpriteIcon";
import { usePostHog } from "posthog-js/react";
import { useConnections } from "@/constants/connections";
import { useTurnsOfYou } from "@/constants/turns-of-you";

const badgeClassNames = clsx(
    "w-fit py-2 px-1.5 bg-white/10 border-white/30 capitalize",
    "text-white text-sm font-semibold rounded-[10px]",
);

const RELATIONSHIP_KEYS: Record<string, string> = {
    "wife": "constants.characterRelationship.wife.name",
    "step-mom": "constants.characterRelationship.stepMom.name",
    "step-sister": "constants.characterRelationship.stepSister.name",
    "college-roommate": "constants.characterRelationship.collegeRoommate.name",
    "your-girlfriend": "constants.characterRelationship.yourFriendsGirlfriend.name",
    "first-date": "constants.characterRelationship.firstDate.name",
    "neighbor": "constants.characterRelationship.neighbor.name",
    "your-teacher": "constants.characterRelationship.yourTeacher.name",
    "your-boss": "constants.characterRelationship.yourBoss.name",
    "crush": "constants.characterRelationship.crush.name",
    "ex": "constants.characterRelationship.ex.name",
    "babysitter": "constants.characterRelationship.babysitter.name",
};

export function DreamCompanionStep() {
    const { t } = useTranslation();
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const posthog = usePostHog();

    const CONNECTIONS = useConnections();
    const TURNS_OF_YOU = useTurnsOfYou();

    const [characterName, setCharacterName] = useState(getRandomFemaleName());

    const ethnicity = form.watch("ethnicity");
    const hair_color = form.watch("hair_color");
    const connections = form.watch("connections");
    const turns_of_you = form.watch("turns_of_you");
    const scenario = form.watch("character_relationship");

    const translateLabel = (value: string) => {
        const connection = CONNECTIONS.find(c => c.value === value);
        if (connection) return connection.label;

        const turn = TURNS_OF_YOU.find(c => c.value === value);
        if (turn) return turn.image.name;

        const relKey = RELATIONSHIP_KEYS[value];
        if (relKey) return t(relKey);

        return value.split("-").join(" ");
    };

    const PREFERENCES = [
        { name: "receiveCustomPhotos" as keyof FunnelSchema, id: "spicy-photos", label: t('funnel.dreamCompanionStep.spicyPhotos') },
        { name: "receiveVoiceMessages" as keyof FunnelSchema, id: "voice-messages", label: t('funnel.dreamCompanionStep.voiceMessages') },
        { name: "receiveVideoCalls" as keyof FunnelSchema, id: "video-call", label: t('funnel.dreamCompanionStep.videoCall') },
    ];

    const sections = [
        { title: t('funnel.dreamCompanionStep.youLookingFor'), icon: "/icons/search-square-icon.svg", items: connections ?? [] },
        { title: t('funnel.dreamCompanionStep.specificPreferences'), icon: "/icons/heart-check-icon.svg", items: turns_of_you ?? [] },
        { title: t('funnel.dreamCompanionStep.scenarios'), icon: "/icons/book-edit-icon.svg", items: scenario ? [scenario] : [] },
    ];

    const characterPreviewImage =
        getBlurredCharacterImage(ethnicity, hair_color) ||
        "/images/blurred-characters/white-brunette.webp";

    const handleSwapName = () => {
        let newName = getRandomFemaleName();
        while (newName === characterName) newName = getRandomFemaleName();
        setCharacterName(newName);
    };

    const previewRef = useRef<HTMLDivElement>(null);
    const [previewSize, setPreviewSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

    useEffect(() => {
        const el = previewRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect;
            if (cr) setPreviewSize({ w: Math.round(cr.width), h: Math.round(cr.height) });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div className={"w-full flex flex-col min-h-screen px-[15px] sm:px-10 py-5 md:py-[40px]"}>
            <div
                className={
                    "max-w-[750px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center"
                }
            >
                <div
                    className={
                        "w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center"
                    }
                >
                    <div
                        className={
                            "w-full flex flex-col items-center sm:flex-row sm:items-start gap-[30px]"
                        }
                    >
                        <div
                            className={"w-full sm:max-w-[360px] flex-1 flex flex-col items-center"}
                        >
                            <h2 className={"w-full text-white text-2xl font-bold mb-[25px] text-center break-words pr-12"}>
                                {t('funnel.dreamCompanionStep.title')}
                            </h2>

                            <div className="w-full aspect-[360/485] rounded-[10px] overflow-hidden relative mb-0">
                                <div ref={previewRef} className="absolute inset-0">
                                    {previewSize.w > 0 && previewSize.h > 0 && (
                                        <SpriteIcon
                                            src={characterPreviewImage}
                                            fallbackAlt={t('funnel.dreamCompanionStep.altCharacterPlaceholder')}
                                            targetW={previewSize.w}
                                            targetH={previewSize.h}
                                            fit="cover"
                                            frame
                                            center={false}
                                            className="w-full h-full"
                                            imageClassName="scale-[1.15] origin-[90%_50%] rounded-[10px]"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className={"text-white text-lg font-medium my-[10px]"}>
                                {t('funnel.dreamCompanionStep.characterName')}
                            </div>

                            <div
                                className={clsx(
                                    "w-full p-[10px] flex items-center justify-between gap-3 rounded-[10px]",
                                    "bg-white/10 border border-white/6 mb-[15px]",
                                )}
                            >
                                <input
                                    type={"text"}
                                    value={characterName}
                                    onChange={(e) => setCharacterName(e.target.value)}
                                    placeholder={t('funnel.dreamCompanionStep.characterNamePlaceholder')}
                                    className={
                                        "flex-1 text-white border-none outline-none bg-transparent min-w-0"
                                    }
                                />
                                <Button
                                    onClick={handleSwapName}
                                    style={{ padding: "4px" }}
                                    className={clsx(
                                        "h-[30px] text-white/70 gap-[3px] shrink-0 overflow-hidden",
                                        "bg-white/5 hover:bg-white/10 border border-white/6",
                                    )}
                                >
                                    <span className="shrink-0">{t('funnel.dreamCompanionStep.swap')}</span>
                                    <img
                                        src="/icons/exchange-icon.svg"
                                        alt={t('funnel.dreamCompanionStep.altExchangeIcon')}
                                        width={18}
                                        height={18}
                                        className="w-[18px] h-[18px] shrink-0 invert brightness-0"
                                    />
                                </Button>
                            </div>

                            <Button
                                onClick={() => {
                                    if (typeof window !== "undefined") {
                                        posthog?.capture("start_chat_button_clicked");
                                    }
                                    nextStep();
                                }}
                                className={"w-full h-[45px] bg-primary-gradient"}
                            >
                                <img
                                    src="/icons/bubble-chat-icon.svg"
                                    alt={t('funnel.dreamCompanionStep.altBubbleChatIcon')}
                                    width={22}
                                    height={22}
                                    className="w-[22px] h-[22px] invert brightness-0"
                                />
                                <span className={"text-base font-bold"}>{t('funnel.dreamCompanionStep.startChatting')}</span>
                            </Button>
                        </div>

                        <div
                            className={
                                "w-full sm:max-w-[360px] flex-1 flex flex-col items-center gap-[10px]"
                            }
                        >
                            <div className={"text-white text-lg font-semibold mb-[5px]"}>
                                {t('funnel.dreamCompanionStep.personalityAttributes')}
                            </div>

                            {sections.map(({ title, icon, items }) => (
                                <div
                                    key={title}
                                    className="w-full p-[10px] bg-white/5 rounded-[10px] flex flex-col gap-[10px]"
                                >
                                    <div className="flex gap-[5px] items-center text-white">
                                        <img
                                            src={icon}
                                            alt={t('funnel.dreamCompanionStep.altIcon')}
                                            width={20}
                                            height={20}
                                            className="w-[20px] h-[20px] invert brightness-0"
                                        />
                                        <span>{title}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-[10px]">
                                        {items.map((label) => (
                                            <Badge
                                                key={`${title}-${label}`}
                                                className={badgeClassNames}
                                            >
                                                {translateLabel(label)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="w-full p-[10px] bg-white/5 rounded-[10px] flex flex-col gap-[10px]">
                                {PREFERENCES.map(({ name, id, label }) => (
                                    <Controller
                                        key={name}
                                        name={name}
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between py-1">
                                                <Label
                                                    htmlFor={id}
                                                    className="cursor-pointer text-white font-medium"
                                                >
                                                    {label}
                                                </Label>
                                                <Checkbox
                                                    className="cursor-pointer"
                                                    id={id}
                                                    name={field.name}
                                                    checked={!!field.value}
                                                    onCheckedChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                />
                                            </div>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DreamCompanionStep;