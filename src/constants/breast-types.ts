import { useTranslation } from "react-i18next";

export const useBreastTypes = () => {
  const { t } = useTranslation();
  
  return [
    {
      id: 1,
      image: {
        src: "/images/breast-types/regular-breast-type.webp",
        alt: t('constants.breastTypes.regular.alt'),
        name: t('constants.breastTypes.regular.name'),
      },
      value: "regular",
    },
    {
      id: 2,
      image: {
        src: "/images/breast-types/perky-breast-type.webp",
        alt: t('constants.breastTypes.perky.alt'),
        name: t('constants.breastTypes.perky.name'),
      },
      value: "perky",
    },
    {
      id: 3,
      image: {
        src: "/images/breast-types/saggy-breast-type.webp",
        alt: t('constants.breastTypes.saggy.alt'),
        name: t('constants.breastTypes.saggy.name'),
      },
      value: "saggy",
    },
    {
      id: 4,
      image: {
        src: "/images/breast-types/torpedo-breast-type.webp",
        alt: t('constants.breastTypes.torpedo.alt'),
        name: t('constants.breastTypes.torpedo.name'),
      },
      value: "torpedo",
    },
    {
      id: 5,
      image: {
        src: "/images/breast-types/fake-breast-type.webp",
        alt: t('constants.breastTypes.fake.alt'),
        name: t('constants.breastTypes.fake.name'),
      },
      value: "fake",
    },
  ];
};