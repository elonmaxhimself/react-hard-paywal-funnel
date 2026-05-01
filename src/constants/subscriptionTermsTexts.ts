import { useTranslation } from 'react-i18next';

export const useSubscriptionTermsTexts = (): { [key: number]: string } => {
    const { t } = useTranslation();

    return {
        105: t('constants.subscriptionTerms.105'),
        36: t('constants.subscriptionTerms.36'),
        2: t('constants.subscriptionTerms.2'),
        155: t('constants.subscriptionTerms.155'),
        156: t('constants.subscriptionTerms.156'),
        157: t('constants.subscriptionTerms.157'),
        158: t('constants.subscriptionTerms.158'),
        159: t('constants.subscriptionTerms.159'),
    };
};
