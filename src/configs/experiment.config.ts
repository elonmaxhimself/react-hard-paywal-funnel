export const EXPERIMENTS = {
    PRICING: {
        flagKey: 'second-pricing-test',
        variants: {
            control: [105, 36, 2],
            variant1: [105, 36, 155],
            variant2: [105, 36, 156],
        },
    },
    PRICING_V3: {
        flagKey: 'third-pricing-test',
        variants: {
            control: { productIds: [105, 36, 155], preselectedProductId: 36 },
            variant1: { productIds: [105, 36, 158], preselectedProductId: 36 },
            variant2: { productIds: [105, 36, 159], preselectedProductId: 36 },
            variant3: { productIds: [105, 36, 155], preselectedProductId: 155 },
            variant4: { productIds: [105, 36, 157], preselectedProductId: 157 },
            variant5: { productIds: [105, 36, 158], preselectedProductId: 158 },
            variant6: { productIds: [105, 36, 159], preselectedProductId: 159 },
        },
    },
} as const;
