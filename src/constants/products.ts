export interface Product {
    id: number;
    name: string;
    amount: number;
    currency: string;
    durationMonths: number;
}

export const products: Product[] = [
    {
        id: 40,
        name: 'Annual Deluxe Subscription',
        amount: 9999,
        currency: 'USD',
        durationMonths: 12,
    },
    {
        id: 39,
        name: 'Annual Deluxe Subscription',
        amount: 10999,
        currency: 'USD',
        durationMonths: 12,
    },
    {
        id: 36,
        name: 'Monthly Deluxe Subscription',
        amount: 1999,
        currency: 'USD',
        durationMonths: 1,
    },
    {
        id: 105,
        name: '7 Days Intro Offer',
        amount: 999,
        currency: 'USD',
        durationMonths: 0,
    },
    {
        id: 2,
        name: 'Annual Premium',
        amount: 6999,
        currency: 'USD',
        durationMonths: 12,
    },
    {
        id: 155,
        name: 'Quarterly Premium Subscription',
        amount: 3999,
        currency: 'USD',
        durationMonths: 3,
    },
    {
        id: 156,
        name: 'Quarterly Premium Subscription',
        amount: 4999,
        currency: 'USD',
        durationMonths: 3,
    },
    {
        id: 157,
        name: 'Quarterly Premium Subscription',
        amount: 2999,
        currency: 'USD',
        durationMonths: 3,
    },
    {
        id: 158,
        name: 'Quarterly Premium Subscription',
        amount: 3499,
        currency: 'USD',
        durationMonths: 3,
    },
    {
        id: 159,
        name: 'Quarterly Premium Subscription',
        amount: 4499,
        currency: 'USD',
        durationMonths: 3,
    },
];
