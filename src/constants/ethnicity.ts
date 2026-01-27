import { useTranslation } from "react-i18next";

export const useEthnicity = () => {
  const { t } = useTranslation();
  
  return [
    {
      id: 1,
      image: {
        src: `/images/ethnicity/arab.webp`,
        alt: t('constants.ethnicity.arab.alt'),
        name: t('constants.ethnicity.arab.name'),
      },
      value: "arab",
    },
    {
      id: 2,
      image: {
        src: `/images/ethnicity/caucasian.webp`,
        alt: t('constants.ethnicity.caucasian.alt'),
        name: t('constants.ethnicity.caucasian.name'),
      },
      value: "caucasian",
    },
    {
      id: 3,
      image: {
        src: `/images/ethnicity/black.webp`,
        alt: t('constants.ethnicity.black.alt'),
        name: t('constants.ethnicity.black.name'),
      },
      value: "black",
    },
    {
      id: 4,
      image: {
        src: `/images/ethnicity/latina.webp`,
        alt: t('constants.ethnicity.latina.alt'),
        name: t('constants.ethnicity.latina.name'),
      },
      value: "latina",
    },
    {
      id: 5,
      image: {
        src: `/images/ethnicity/asian.webp`,
        alt: t('constants.ethnicity.asian.alt'),
        name: t('constants.ethnicity.asian.name'),
      },
      value: "asian",
    },
  ];
};