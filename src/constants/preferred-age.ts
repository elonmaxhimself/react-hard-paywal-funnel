import { useTranslation } from "react-i18next";

export const usePreferredAge = () => {
  const { t } = useTranslation();
  
  return [
    { id: 1, label: t('constants.preferredAge.myAge'), value: "my-age" },
    { id: 2, label: t('constants.preferredAge.younger'), value: "younger" },
    { id: 3, label: t('constants.preferredAge.older'), value: "older" },
  ];
};