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
    name: "Annual Deluxe Subscription",
    amount: 9999,
    currency: "USD",
    durationMonths: 12,
  },
  {
    id: 39,
    name: "Annual Deluxe Subscription",
    amount: 10999,
    currency: "USD",
    durationMonths: 12,
  },
  {
    id: 38,
    name: "Quarterly Deluxe Subscription",
    amount: 4399,
    currency: "USD",
    durationMonths: 3,
  },
  {
    id: 37,
    name: "Annual Deluxe Subscription",
    amount: 11999,
    currency: "USD",
    durationMonths: 12,
  },
  {
    id: 36,
    name: "Monthly Deluxe Subscription",
    amount: 1999,
    currency: "USD",
    durationMonths: 1,
  },
  {
    id: 101,
    name: "1-Week Intro Offer",
    amount: 499,
    currency: "USD",
    durationMonths: 0,
  },
  {
    id: 102,
    name: "1-Month Intro Offer",
    amount: 1999,
    currency: "USD",
    durationMonths: 1,
  },
  {
    id: 103,
    name: "3-Months Intro Offer",
    amount: 2999,
    currency: "USD",
    durationMonths: 3,
  },
];
