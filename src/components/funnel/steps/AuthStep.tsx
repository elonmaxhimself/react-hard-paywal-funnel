import { Controller } from "react-hook-form";
import { Loader2Icon } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import CustomInput from "@/components/CustomInput";
import SpriteIcon from "@/components/SpriteIcon";

import { useSignUpForm } from "@/hooks/auth/useSignUpForm";
import { useOAuth } from "@/hooks/auth/useOAuth";
import { usePostHog } from "posthog-js/react";

import { useCheckboxes } from "@/constants/auth-checkboxes";

export function AuthStep() {
    const { t } = useTranslation();
    const CHECKBOXES = useCheckboxes();
    const posthog = usePostHog();
    const { form, onSubmit, onValueReset, isPending, apiError } = useSignUpForm(posthog);
    
    const { 
        signIn: oauthSignIn,
        isLoading: isOAuthLoading,
        isGoogleLoading,
        isTwitterLoading,
        isDiscordLoading,
    } = useOAuth(posthog);

    const errors = form.formState.errors;

    return (
        <div className="w-full flex flex-col min-h-screen px-[15px] pt-[25px] sm:px-10 sm:pt-[40px] pb-[70px]">
            <div className="max-w-[360px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <form
                    onSubmit={onSubmit}
                    className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]"
                >
                    <SpriteIcon
                        src={"/images/logo.svg"}
                        fallbackAlt={t('funnel.authStep.altLogo')}
                        targetW={35}
                        targetH={35}
                        fit="contain"
                        className="mb-5"
                    />

                    <div className="text-white text-2xl font-bold text-center mb-[30px]">
                        <Trans 
                            i18nKey="funnel.authStep.title"
                            components={{ 
                                br: <br />,
                                highlight: <span className="text-transparent bg-clip-text bg-primary-gradient" />
                            }}
                        />
                    </div>

                    <div className="w-full">
                        <p className="text-white/50 text-sm mb-3">
                            {t('funnel.authStep.createFreeAccount')}
                        </p>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-[45px] bg-transparent border-white/10 hover:bg-white/5 mb-3 rounded-none"
                            onClick={() => oauthSignIn("google")}
                            disabled={isOAuthLoading || isPending}
                        >
                            {isGoogleLoading ? (
                                <Loader2Icon className="animate-spin" size={20} />
                            ) : (
                                <img src="/icons/google.png" alt="Google" className="w-5 h-5 mr-2" />
                            )}
                            <span className="text-white text-sm font-medium">
                                {t('funnel.authStep.continueWithGoogle')}
                            </span>
                        </Button>

                        <div className="flex gap-3 mb-[30px]">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-[45px] bg-transparent border-white/10 hover:bg-white/5 rounded-none"
                                onClick={() => oauthSignIn("twitter")}
                                disabled={isOAuthLoading || isPending}
                            >
                                {isTwitterLoading ? (
                                    <Loader2Icon className="animate-spin" size={20} />
                                ) : (
                                    <img src="/icons/X.png" alt="Twitter" className="w-5 h-5" />
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-[45px] bg-transparent border-white/10 hover:bg-white/5 rounded-none"
                                onClick={() => oauthSignIn("discord")}
                                disabled={isOAuthLoading || isPending}
                            >
                                {isDiscordLoading ? (
                                    <Loader2Icon className="animate-spin" size={20} />
                                ) : (
                                    <img src="/icons/discord.png" alt="Discord" className="w-5 h-5" />
                                )}
                            </Button>
                        </div>

                        <div className="relative mb-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#1a1a1a] px-2 text-white/50">
                                    {t('funnel.authStep.orContinueWithEmail')}
                                </span>
                            </div>
                        </div>

                        <div className="w-full flex flex-col gap-[10px] mb-10">
                            <div>
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field }) => (
                                        <CustomInput
                                            id="email"
                                            aria-label={t('funnel.authStep.emailLabel')}
                                            icon={
                                                <img
                                                    src="/icons/mail-icon.svg"
                                                    alt={t('funnel.authStep.altMailIcon')}
                                                    width={22}
                                                    height={22}
                                                    className="w-[22px] h-[22px] invert brightness-0"
                                                />
                                            }
                                            type="email"
                                            placeholder={t('funnel.authStep.emailPlaceholder')}
                                            value={field.value}
                                            onChange={field.onChange}
                                            isError={apiError?.message}
                                            resetInput={() => onValueReset("email")}
                                        />
                                    )}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Controller
                                    name="password"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <CustomInput
                                            id="password"
                                            icon={
                                                <img
                                                    src="/icons/lock-icon.svg"
                                                    alt={t('funnel.authStep.altLockIcon')}
                                                    width={22}
                                                    height={22}
                                                    className="w-[22px] h-[22px] invert brightness-0"
                                                />
                                            }
                                            type="password"
                                            placeholder={t('funnel.authStep.passwordPlaceholder')}
                                            value={field.value}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                form.trigger("password");
                                            }}
                                            isError={errors.password?.message}
                                            resetInput={() => onValueReset("password")}
                                            isSuccess={
                                                fieldState.isDirty && !errors?.password?.message
                                            }
                                        />
                                    )}
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {CHECKBOXES.map(({ name, id, label }) => (
                                <div key={name}>
                                    <div className="flex gap-[10px]">
                                        <Controller
                                            name={name}
                                            control={form.control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    id={id}
                                                    name={field.name}
                                                    checked={!!field.value}
                                                    onCheckedChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    className="cursor-pointer"
                                                />
                                            )}
                                        />
                                        <Label
                                            htmlFor={id}
                                            className="text-white/50 text-xs cursor-pointer"
                                        >
                                            {label}
                                        </Label>
                                    </div>
                                    {errors[name] && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors[name]?.message as string}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending || isOAuthLoading}
                            className="w-full h-[45px] bg-primary-gradient mb-[30px]"
                        >
                            {isPending && <Loader2Icon className="animate-spin" />}
                            <span className="text-base font-bold">
                                {t('funnel.authStep.joinFree')}
                            </span>
                        </Button>

                        <div className="w-full p-2.5 bg-[#222327]/90 border border-white/6 rounded-[10px]">
                            <div className="flex gap-2 items-center justify-between">
                                <div className="flex-1 flex items-center relative">
                                    <SpriteIcon
                                        src={"/images/avatars/avatar_2.webp"}
                                        fallbackAlt={t('funnel.authStep.altAvatar') + " 1"}
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
                                        fallbackAlt={t('funnel.authStep.altAvatar') + " 2"}
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
                                        fallbackAlt={t('funnel.authStep.altAvatar') + " 3"}
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
                                            <span className="text-white text-[11px] font-bold">3M+</span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={"flex-1 text-white text-[10px] font-bold uppercase"}
                                >
                                    {t('funnel.authStep.happyUsers')}
                                </div>
                                <div className={"relative flex-1"}>
                                    <SpriteIcon
                                        src={"/images/award-ranking.svg"}
                                        fallbackAlt={t('funnel.authStep.altAwardRanking')}
                                        targetW={126}
                                        targetH={38}
                                        fit="contain"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AuthStep;