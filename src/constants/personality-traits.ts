import { useTranslation } from "react-i18next";

export const usePersonalityTraits = () => {
  const { t } = useTranslation();
  
  return [
    { id: 1, label: t('constants.personalityTraits.funny'), value: "funny" },
    { id: 2, label: t('constants.personalityTraits.silly'), value: "silly" },
    { id: 3, label: t('constants.personalityTraits.smart'), value: "smart" },
    { id: 4, label: t('constants.personalityTraits.flirty'), value: "flirty" },
    { id: 5, label: t('constants.personalityTraits.shy'), value: "shy" },
    { id: 6, label: t('constants.personalityTraits.relaxed'), value: "relaxed" },
    { id: 7, label: t('constants.personalityTraits.dominant'), value: "dominant" },
    { id: 8, label: t('constants.personalityTraits.confident'), value: "confident" },
    { id: 9, label: t('constants.personalityTraits.crazy'), value: "crazy" },
    { id: 10, label: t('constants.personalityTraits.adventurous'), value: "adventurous" },
    { id: 11, label: t('constants.personalityTraits.supportive'), value: "supportive" },
    { id: 12, label: t('constants.personalityTraits.bitchy'), value: "bitchy" },
    { id: 13, label: t('constants.personalityTraits.playHardToGet'), value: "play-hard-to-get" },
    { id: 14, label: t('constants.personalityTraits.emotionallyCold'), value: "emotionally-cold" },
    { id: 15, label: t('constants.personalityTraits.open'), value: "open" },
    { id: 16, label: t('constants.personalityTraits.optimistic'), value: "optimistic" },
    { id: 17, label: t('constants.personalityTraits.pessimistic'), value: "pessimistic" },
    { id: 18, label: t('constants.personalityTraits.proud'), value: "proud" },
    { id: 19, label: t('constants.personalityTraits.naive'), value: "naive" },
    { id: 20, label: t('constants.personalityTraits.playful'), value: "playful" },
    { id: 21, label: t('constants.personalityTraits.smug'), value: "smug" },
    { id: 22, label: t('constants.personalityTraits.enthusiastic'), value: "enthusiastic" },
    { id: 23, label: t('constants.personalityTraits.messy'), value: "messy" },
    { id: 24, label: t('constants.personalityTraits.lazy'), value: "lazy" },
    { id: 25, label: t('constants.personalityTraits.innocent'), value: "innocent" },
    { id: 26, label: t('constants.personalityTraits.possessive'), value: "possessive" },
    { id: 27, label: t('constants.personalityTraits.elegant'), value: "elegant" },
    { id: 28, label: t('constants.personalityTraits.chill'), value: "chill" },
    { id: 29, label: t('constants.personalityTraits.serious'), value: "serious" },
  ];
};