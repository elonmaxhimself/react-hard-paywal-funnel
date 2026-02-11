import { useTranslation } from "react-i18next";

export const useBreastSizes = () => {
  const { t } = useTranslation();
  
  return [
    {
      id: 1,
      image: {
        src: `/images/breast-sizes/flat-breast-size.webp`,
        alt: t('constants.breastSizes.flat.alt'),
        name: t('constants.breastSizes.flat.name'),
      },
      value: "flat",
    },
    {
      id: 2,
      image: {
        src: `/images/breast-sizes/small-breast-size.webp`,
        alt: t('constants.breastSizes.small.alt'),
        name: t('constants.breastSizes.small.name'),
      },
      value: "small",
    },
    {
      id: 3,
      image: {
        src: `/images/breast-sizes/regular-breast-size.webp`,
        alt: t('constants.breastSizes.regular.alt'),
        name: t('constants.breastSizes.regular.name'),
      },
      value: "regular",
    },
    {
      id: 4,
      image: {
        src: `/images/breast-sizes/big-breast-size.webp`,
        alt: t('constants.breastSizes.big.alt'),
        name: t('constants.breastSizes.big.name'),
      },
      value: "big",
    },
    {
      id: 5,
      image: {
        src: `/images/breast-sizes/huge-breast-size.webp`,
        alt: t('constants.breastSizes.huge.alt'),
        name: t('constants.breastSizes.huge.name'),
      },
      value: "huge",
    },
  ];
};