import { useTranslation } from "react-i18next";

export const useBooleanOptions = () => {
  const { t } = useTranslation();
  
  return [
    { id: 1, label: t('constants.booleanOptions.yes'), value: true },
    { id: 2, label: t('constants.booleanOptions.no'), value: false },
  ];
};