import { useTranslation } from "react-i18next";

export const useBodyTypes = () => {
  const { t } = useTranslation();
  
  return [
    {
      id: 1,
      image: {
        src: `/images/body-types/petite-body-type.webp`,
        alt: t('constants.bodyTypes.petite.alt'),
        name: t('constants.bodyTypes.petite.name'),
      },
      value: "petite",
    },
    {
      id: 2,
      image: {
        src: `/images/body-types/slim-body-type.webp`,
        alt: t('constants.bodyTypes.slim.alt'),
        name: t('constants.bodyTypes.slim.name'),
      },
      value: "slim",
    },
    {
      id: 3,
      image: {
        src: `/images/body-types/chubby-body-type.webp`,
        alt: t('constants.bodyTypes.chubby.alt'),
        name: t('constants.bodyTypes.chubby.name'),
      },
      value: "chubby",
    },
    {
      id: 4,
      image: {
        src: `/images/body-types/thick-body-type.webp`,
        alt: t('constants.bodyTypes.thick.alt'),
        name: t('constants.bodyTypes.thick.name'),
      },
      value: "thick",
    },
    {
      id: 5,
      image: {
        src: `/images/body-types/pregnant-body-type.webp`,
        alt: t('constants.bodyTypes.pregnant.alt'),
        name: t('constants.bodyTypes.pregnant.name'),
      },
      value: "pregnant",
    },
    {
      id: 6,
      image: {
        src: `/images/body-types/muscular-body-type.webp`,
        alt: t('constants.bodyTypes.muscular.alt'),
        name: t('constants.bodyTypes.muscular.name'),
      },
      value: "muscular",
    },
  ];
};