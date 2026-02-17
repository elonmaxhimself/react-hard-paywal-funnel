export const EXPERIMENTS = {
  PRICING: {
    flagKey: 'pricing_ab_test',
    variants: {
      'control': [101, 102, 103],
      'variation_1': [104, 152, 153],
      'variation_2': [104, 152, 154],
      'variation_3': [105, 152, 154],
    }
  },
} as const;