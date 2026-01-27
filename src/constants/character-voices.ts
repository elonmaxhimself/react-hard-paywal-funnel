import { useTranslation } from "react-i18next";
export const useCharacterVoices = () => {
  const { t } = useTranslation();
  
  return [
    {
      id: 1,
      label: t('constants.characterVoices.calm'),
      value: "calm",
      voiceUrl: "https://platform.r2.fish.audio/task/8347ed0478be4726adc0bfe4864c0413.mp3",
    },
    {
      id: 2,
      label: t('constants.characterVoices.whispering'),
      value: "whispering",
      voiceUrl: "https://platform.r2.fish.audio/task/05d7d8775ec74ceba54021283af7bb3e.mp3",
    },
    {
      id: 3,
      label: t('constants.characterVoices.commanding'),
      value: "commanding",
      voiceUrl: "https://platform.r2.fish.audio/task/085a6d389a324fbf940ba21a88ed5d2d.mp3",
    },
    {
      id: 4,
      label: t('constants.characterVoices.seducing'),
      value: "seducing",
      voiceUrl: "https://platform.r2.fish.audio/task/77a37ff7c3a448e9adb41d677efbcd58.mp3",
    },
  ];
};
