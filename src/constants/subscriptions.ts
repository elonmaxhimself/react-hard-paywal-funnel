import { useTranslation } from 'react-i18next';

export interface Subscription {
    id: number;
    productId: number;
    months: number;
    durationText: string;
    saleOff: number;
    regularPriceInDays: string;
    regularPrice: string;
    salePriceInDays: string;
    salePriceFull: string;
    isBestChoice: boolean;
}

export const useSecretOffer = (): Subscription => {
    const { t } = useTranslation();

    return {
        id: 4,
        productId: 39,
        months: 12,
        durationText: t('constants.subscriptions.durationTexts.12months'),
        saleOff: -80,
        regularPriceInDays: '0,30',
        regularPrice: '399,99',
        salePriceInDays: '0,30',
        salePriceFull: '109.99',
        isBestChoice: true,
    };
};

export const useFinalOffer = (): Subscription => {
    const { t } = useTranslation();

    return {
        id: 5,
        productId: 40,
        months: 12,
        durationText: t('constants.subscriptions.durationTexts.12months'),
        saleOff: -95,
        regularPriceInDays: '0,30',
        regularPrice: '399,99',
        salePriceInDays: '0,27',
        salePriceFull: '99.99',
        isBestChoice: true,
    };
};

export const useSubscriptions = (): Subscription[] => {
    const { t } = useTranslation();
    const secretOffer = useSecretOffer();
    const finalOffer = useFinalOffer();

    return [
        {
            id: 7,
            productId: 105,
            months: 0,
            saleOff: -50,
            durationText: t('constants.subscriptions.durationTexts.7daysIntro'),
            regularPriceInDays: '2.85',
            regularPrice: '19.99',
            salePriceInDays: '1.43',
            salePriceFull: '9.99',
            isBestChoice: false,
        },
        {
            id: 11,
            productId: 36,
            months: 1,
            saleOff: -50,
            durationText: t('constants.subscriptions.durationTexts.monthlyDeluxe'),
            regularPriceInDays: '1.33',
            regularPrice: '39.99',
            salePriceInDays: '0.67',
            salePriceFull: '19.99',
            isBestChoice: true,
        },
        {
            id: 12,
            productId: 2,
            months: 12,
            saleOff: -50,
            durationText: t('constants.subscriptions.durationTexts.yearlyDeluxe'),
            regularPriceInDays: '0.38',
            regularPrice: '139.99',
            salePriceInDays: '0.19',
            salePriceFull: '69.99',
            isBestChoice: false,
        },
        {
            id: 13,
            productId: 155,
            months: 3,
            saleOff: -50,
            durationText: t('constants.subscriptions.durationTexts.quarterlyDeluxe'),
            regularPriceInDays: '0.89',
            regularPrice: '79.99',
            salePriceInDays: '0.44',
            salePriceFull: '39.99',
            isBestChoice: false,
        },
        {
            id: 14,
            productId: 156,
            months: 3,
            saleOff: -50,
            durationText: t('constants.subscriptions.durationTexts.quarterlyDeluxe'),
            regularPriceInDays: '1.11',
            regularPrice: '99.99',
            salePriceInDays: '0.56',
            salePriceFull: '49.99',
            isBestChoice: false,
        },
        {
            id: 15,
            productId: 157,
            months: 3,
            saleOff: -50,
            durationText: t('constants.subscriptions.durationTexts.quarterlyDeluxe'),
            regularPriceInDays: '0.67',
            regularPrice: '59.99',
            salePriceInDays: '0.33',
            salePriceFull: '29.99',
            isBestChoice: false,
        },
        {
            id: 16,
            productId: 158,
            months: 3,
            saleOff: -50,
            durationText: t('constants.subscriptions.durationTexts.quarterlyDeluxe'),
            regularPriceInDays: '0.78',
            regularPrice: '69.99',
            salePriceInDays: '0.39',
            salePriceFull: '34.99',
            isBestChoice: false,
        },
        {
            id: 17,
            productId: 159,
            months: 3,
            saleOff: -50,
            durationText: t('constants.subscriptions.durationTexts.quarterlyDeluxe'),
            regularPriceInDays: '1.00',
            regularPrice: '89.99',
            salePriceInDays: '0.50',
            salePriceFull: '44.99',
            isBestChoice: false,
        },
        secretOffer,
        finalOffer,
    ];
};
