import { useTranslation } from "react-i18next";
export const useConnections = () => {
  const { t } = useTranslation();
  
  return [
    { id: 1, label: `😘 ${t('constants.connections.flirtAndFun')}`, value: "flirt-and-fun" },
    { id: 2, label: `🙋‍♂️ ${t('constants.connections.friendship')}`, value: "friendship" },
    { id: 3, label: `💞 ${t('constants.connections.loveAndEmotionalConnection')}`, value: "love-and-emotional-connection" },
    { id: 4, label: `📷 ${t('constants.connections.exchangeImagesAndVideos')}`, value: "exchange-images-and-videos" },
    { id: 5, label: `😌️ ${t('constants.connections.safeNonJudgementalPlace')}`, value: "safe-non-judgemental-place" },
    { id: 6, label: `🏄 ${t('constants.connections.yetToDiscover')}`, value: "yet-to-discover" },
  ];
};