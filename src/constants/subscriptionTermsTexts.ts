import { useTranslation } from "react-i18next";

export const useSubscriptionTermsTexts = (): { [key: number]: string } => {
    const { t } = useTranslation();
    
    return {
        37: t('constants.subscriptionTerms.37'),
        38: t('constants.subscriptionTerms.38'),
        36: t('constants.subscriptionTerms.36'),
        101: t('constants.subscriptionTerms.101'),
        102: t('constants.subscriptionTerms.102'),
        103: t('constants.subscriptionTerms.103'),
        104: t('constants.subscriptionTerms.104'),
        105: t('constants.subscriptionTerms.105'),
        152: t('constants.subscriptionTerms.152'),
        153: t('constants.subscriptionTerms.153'),
        154: t('constants.subscriptionTerms.154'),
    };
};