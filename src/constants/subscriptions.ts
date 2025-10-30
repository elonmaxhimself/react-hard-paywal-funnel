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

export const secretOffer: Subscription = {
    id: 4,
    productId: 39,
    months: 12,
    durationText: "12 months",
    saleOff: -80,
    regularPriceInDays: "0,30",
    regularPrice: "399,99",
    salePriceInDays: "0,30",
    salePriceFull: "109.99",
    isBestChoice: true,
};

export const finalOffer: Subscription = {
    id: 5,
    productId: 40,
    months: 12,
    durationText: "12 months",
    saleOff: -95,
    regularPriceInDays: "0,30",
    regularPrice: "399,99",
    salePriceInDays: "0,27",
    salePriceFull: "99.99",
    isBestChoice: true,
};

// export const subscriptions: Subscription[] = [
//     {
//         id: 1,
//         productId: 37,
//         months: 12,
//         durationText: "12 months",
//         saleOff: -70,
//         regularPriceInDays: "0,30",
//         regularPrice: "399,99",
//         salePriceInDays: "0.33",
//         salePriceFull: "119.99",
//         isBestChoice: true,
//     },
//     {
//         id: 2,
//         productId: 38,
//         months: 3,
//         durationText: "3 months",
//         saleOff: -60,
//         regularPriceInDays: "0,80",
//         regularPrice: "109,99",
//         salePriceInDays: "0.48",
//         salePriceFull: "43.99",
//         isBestChoice: false,
//     },
//     {
//         id: 3,
//         productId: 36,
//         months: 1,
//         durationText: "1 month",
//         saleOff: -50,
//         regularPriceInDays: "1,72",
//         regularPrice: "39,99",
//         salePriceInDays: "0,66",
//         salePriceFull: "19,99",
//         isBestChoice: false,
//     },
//     secretOffer,
//     finalOffer,
// ];

export const subscriptions: Subscription[] = [
    {
        id: 1,
        productId: 101,
        months: 0,
        saleOff: -50,        
        durationText: "7 days",
        regularPriceInDays: "1.99",
        regularPrice: "13,99",
        salePriceInDays: "0.72",
        salePriceFull: "4.99",
        isBestChoice: false,
    },
    {
        id: 2,
        productId: 102,
        months: 1,
        saleOff: -50,
        durationText: "1 month",
        regularPriceInDays: "1.32",
        regularPrice: "39.99",
        salePriceInDays: "0.66",
        salePriceFull: "19.99",
        isBestChoice: true,
    },
    {
        id: 3,
        productId: 103,
        months: 3,
        saleOff: -50,
        durationText: "3 months",
        regularPriceInDays: "0.66",
        regularPrice: "59.99",
        salePriceInDays: "0.33",
        salePriceFull: "29.99",
        isBestChoice: false,
    },
    secretOffer,
    finalOffer,
];