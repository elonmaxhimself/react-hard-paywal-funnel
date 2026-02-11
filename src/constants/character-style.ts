import { useTranslation } from "react-i18next";

export const useCharacterStyle = () => {
  const { t } = useTranslation();
  
  return [
    {
      id: 1,
      image: {
        src: `/images/character-styles/realistic-character-style.webp`,
        alt: t('constants.characterStyles.realistic.alt'),
        name: t('constants.characterStyles.realistic.name'),
      },
      value: "realistic",
    },
    {
      id: 2,
      image: {
        src: `/images/character-styles/anime-character-style.webp`,
        alt: t('constants.characterStyles.anime.alt'),
        name: t('constants.characterStyles.anime.name'),
      },
      value: "anime",
    },
  ];
};
