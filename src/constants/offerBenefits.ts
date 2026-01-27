import { useTranslation } from "react-i18next";

export const useOfferBenefits = () => {
  const { t } = useTranslation();
  
  return [
    { id: 1, text: t('constants.offerBenefits.bestValue') },
    { id: 2, text: t('constants.offerBenefits.advancedImageGenerator') },
    { id: 3, text: t('constants.offerBenefits.smartestAi') },
    { id: 4, text: t('constants.offerBenefits.customVideoRequest') },
  ];
};