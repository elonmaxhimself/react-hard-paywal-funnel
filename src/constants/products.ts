import { useTranslation } from "react-i18next";

export interface Product {
  id: number;
  name: string;
  amount: number;
  currency: string;
  durationMonths: number;
}

export const useProducts = (): Product[] => {
  const { t } = useTranslation();
  
  return [
    {
      id: 40,
      name: t('constants.products.annualDeluxe'),
      amount: 9999,
      currency: "USD",
      durationMonths: 12,
    },
    {
      id: 39,
      name: t('constants.products.annualDeluxe'),
      amount: 10999,
      currency: "USD",
      durationMonths: 12,
    },
    {
      id: 38,
      name: t('constants.products.quarterlyDeluxe'),
      amount: 4399,
      currency: "USD",
      durationMonths: 3,
    },
    {
      id: 37,
      name: t('constants.products.annualDeluxe'),
      amount: 11999,
      currency: "USD",
      durationMonths: 12,
    },
    {
      id: 36,
      name: t('constants.products.monthlyDeluxe'),
      amount: 1999,
      currency: "USD",
      durationMonths: 1,
    },
    {
      id: 101,
      name: t('constants.products.oneWeekIntro'),
      amount: 499,
      currency: "USD",
      durationMonths: 0,
    },
    {
      id: 102,
      name: t('constants.products.oneMonthIntro'),
      amount: 1999,
      currency: "USD",
      durationMonths: 1,
    },
    {
      id: 103,
      name: t('constants.products.threeMonthsIntro'),
      amount: 2999,
      currency: "USD",
      durationMonths: 3,
    },
    {
      id: 104,
      name: t('constants.products.sevenDaysIntro'),
      amount: 799,
      currency: "USD",
      durationMonths: 0,
    },
    {
      id: 105,
      name: t('constants.products.sevenDaysIntro'),
      amount: 999,
      currency: "USD",
      durationMonths: 0,
    },
    {
      id: 152,
      name: t('constants.products.monthlyDeluxe'),
      amount: 1999,
      currency: "USD",
      durationMonths: 1,
    },
    {
      id: 153,
      name: t('constants.products.quarterlyDeluxe'),
      amount: 2999,
      currency: "USD",
      durationMonths: 3,
    },
    {
      id: 154,
      name: t('constants.products.yearlyDeluxe'),
      amount: 6999,
      currency: "USD",
      durationMonths: 12,
    },
  ];
};