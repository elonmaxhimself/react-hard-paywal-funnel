import { useTranslation } from "react-i18next";

export const useInterests = () => {
  const { t } = useTranslation();
  
  return [
    { id: 1, label: `📖 ${t('constants.interests.reading')}`, value: "reading" },
    { id: 2, label: `🎮️ ${t('constants.interests.gaming')}`, value: "gaming" },
    { id: 3, label: `🍜 ${t('constants.interests.cookingBaking')}`, value: "cooking-baking" },
    { id: 4, label: `🎹 ${t('constants.interests.music')}`, value: "music" },
    { id: 5, label: `✈️️ ${t('constants.interests.travel')}`, value: "travel" },
    { id: 6, label: `🎞️ ${t('constants.interests.moviesTvShows')}`, value: "movies-tv-shows" },
    { id: 7, label: `📷 ${t('constants.interests.photography')}`, value: "photography" },
    { id: 8, label: `⛩️ ${t('constants.interests.anime')}`, value: "anime" },
    { id: 9, label: `🌻 ${t('constants.interests.gardening')}`, value: "gardening" },
  ];
};