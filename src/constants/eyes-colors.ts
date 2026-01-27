import { useTranslation } from "react-i18next";

export const useEyesColors = () => {
  const { t } = useTranslation();
  
  return [
    {
      id: 1,
      image: {
        src: "/images/eyes-colors/blue-eyes-color.webp",
        alt: t('constants.eyesColors.blue.alt'),
        name: t('constants.eyesColors.blue.name'),
      },
      value: "blue",
    },
    {
      id: 2,
      image: {
        src: "/images/eyes-colors/brown-eyes-color.webp",
        alt: t('constants.eyesColors.brown.alt'),
        name: t('constants.eyesColors.brown.name'),
      },
      value: "brown",
    },
    {
      id: 3,
      image: {
        src: "/images/eyes-colors/green-eyes-color.webp",
        alt: t('constants.eyesColors.green.alt'),
        name: t('constants.eyesColors.green.name'),
      },
      value: "green",
    },
    {
      id: 4,
      image: {
        src: "/images/eyes-colors/grey-eyes-color.webp",
        alt: t('constants.eyesColors.grey.alt'),
        name: t('constants.eyesColors.grey.name'),
      },
      value: "grey",
    },
  ];
};