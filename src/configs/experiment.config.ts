export const EXPERIMENTS = {
  PRICING: {
    flagKey: 'second-pricing-test',
    variants: {
      'control': [105, 36, 2],
      'variant1': [105, 36, 155],
      'variant2': [105, 36, 156],
    }
  },
} as const;