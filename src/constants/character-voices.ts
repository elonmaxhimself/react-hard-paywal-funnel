import { useTranslation } from "react-i18next";

export const useCharacterVoices = () => {
  const { t } = useTranslation();
    
  return [
    {
      id: 1,
      label: t('constants.characterVoices.calm'),
      value: "calm",
      voiceUrl: "/voices/calm.mp3",
    },
    {
      id: 2,
      label: t('constants.characterVoices.whispering'),
      value: "whispering",
      voiceUrl: "/voices/whispering.mp3",
    },
    {
      id: 3,
      label: t('constants.characterVoices.commanding'),
      value: "commanding",
      voiceUrl: "/voices/commanding.mp3",
    },
    {
      id: 4,
      label: t('constants.characterVoices.seducing'),
      value: "seducing",
      voiceUrl: "/voices/seducing.mp3",
    },
  ];
};