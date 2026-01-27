import { useTranslation } from "react-i18next";

export const useFeaturesForFree = () => {
  const { t } = useTranslation();
  
  return [
    {
      title: t('constants.featuresForFree.chatWithThousands'),
      originalPrice: "$179",
      discountPrice: "$0.0",
    },
    {
      title: t('constants.featuresForFree.createAsMany'),
      originalPrice: "$179",
      discountPrice: "$0.0",
    },
    {
      title: t('constants.featuresForFree.uncensoredImages'),
      originalPrice: "$179",
      discountPrice: "$0.0",
    },
    {
      title: t('constants.featuresForFree.uncensoredVideos'),
      originalPrice: "$179",
      discountPrice: "$0.0",
    },
  ];
};