import { useTranslation } from "react-i18next";

export const useCharacterHaircutStyle = () => {
  const { t } = useTranslation();
  
  return [
    {
      id: 1,
      image: {
        src: `/images/haircut-styles/bun-haircut.webp`,
        alt: t('constants.haircutStyles.bun.alt'),
        name: t('constants.haircutStyles.bun.name'),
      },
      value: "bun",
    },
    {
      id: 2,
      image: {
        src: `/images/haircut-styles/long-haircut.webp`,
        alt: t('constants.haircutStyles.long.alt'),
        name: t('constants.haircutStyles.long.name'),
      },
      value: "long",
    },
    {
      id: 3,
      image: {
        src: `/images/haircut-styles/short-haircut.webp`,
        alt: t('constants.haircutStyles.short.alt'),
        name: t('constants.haircutStyles.short.name'),
      },
      value: "short",
    },
    {
      id: 4,
      image: {
        src: `/images/haircut-styles/curly-long-haircut.webp`,
        alt: t('constants.haircutStyles.curlyLong.alt'),
        name: t('constants.haircutStyles.curlyLong.name'),
      },
      value: "curly-long",
    },
    {
      id: 5,
      image: {
        src: `/images/haircut-styles/hair-bow-haircut.webp`,
        alt: t('constants.haircutStyles.hairBow.alt'),
        name: t('constants.haircutStyles.hairBow.name'),
      },
      value: "hair-bow",
    },
    {
      id: 6,
      image: {
        src: `/images/haircut-styles/braids-haircut.webp`,
        alt: t('constants.haircutStyles.braids.alt'),
        name: t('constants.haircutStyles.braids.name'),
      },
      value: "braids",
    },
  ];
};

export const useCharacterHaircutColor = () => {
  const { t } = useTranslation();
  
  return [
    {
      id: 1,
      image: {
        src: `/images/haircut-colors/blonde-haircut.webp`,
        alt: t('constants.haircutColors.blonde.alt'),
        name: t('constants.haircutColors.blonde.name'),
      },
      value: "blonde",
    },
    {
      id: 2,
      image: {
        src: `/images/haircut-colors/ginger-haircut.webp`,
        alt: t('constants.haircutColors.ginger.alt'),
        name: t('constants.haircutColors.ginger.name'),
      },
      value: "ginger",
    },
    {
      id: 3,
      image: {
        src: `/images/haircut-colors/brunette-haircut.webp`,
        alt: t('constants.haircutColors.brunette.alt'),
        name: t('constants.haircutColors.brunette.name'),
      },
      value: "brunette",
    },
    {
      id: 4,
      image: {
        src: `/images/haircut-colors/black-haircut.webp`,
        alt: t('constants.haircutColors.black.alt'),
        name: t('constants.haircutColors.black.name'),
      },
      value: "black",
    },
  ];
};