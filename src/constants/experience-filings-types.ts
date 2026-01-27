import { useTranslation } from "react-i18next";

export const useExperienceFilingTypes = () => {
  const { t } = useTranslation();
  
  return [
    { id: 1, label: t('constants.experienceFilingTypes.rarelyOrNever'), value: "rarely_or_never" },
    { id: 2, label: t('constants.experienceFilingTypes.occasionally'), value: "occasionally" },
    { id: 3, label: t('constants.experienceFilingTypes.sometimes'), value: "sometimes" },
    { id: 4, label: t('constants.experienceFilingTypes.frequently'), value: "frequently" },
    { id: 5, label: t('constants.experienceFilingTypes.always'), value: "always" },
  ];
};