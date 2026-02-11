import { useTranslation } from "react-i18next";

export const useButtTypes = () => {
  const { t } = useTranslation();
  
  return [
    {
      id: 1,
      image: {
        src: `/images/butt-types/small-butt-type.webp`,
        alt: t('constants.buttTypes.small.alt'),
        name: t('constants.buttTypes.small.name'),
      },
      value: "small",
    },
    {
      id: 2,
      image: {
        src: `/images/butt-types/medium-butt-type.webp`,
        alt: t('constants.buttTypes.medium.alt'),
        name: t('constants.buttTypes.medium.name'),
      },
      value: "medium",
    },
    {
      id: 3,
      image: {
        src: `/images/butt-types/large-butt-type.webp`,
        alt: t('constants.buttTypes.large.alt'),
        name: t('constants.buttTypes.large.name'),
      },
      value: "large",
    },
    {
      id: 4,
      image: {
        src: `/images/butt-types/huge-butt-type.webp`,
        alt: t('constants.buttTypes.huge.alt'),
        name: t('constants.buttTypes.huge.name'),
      },
      value: "huge",
    },
  ];
};