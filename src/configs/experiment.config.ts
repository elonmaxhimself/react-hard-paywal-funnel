type VariantConfig = {
  startStep: number;
  videoUrl?: string;
};

export const EXPERIMENTS = {
  STARTING_STEP: {
    flagKey: 'first-step-test',
    variants: {
      'control': {
        startStep: 0,
        videoUrl: '/video/0.mp4',
      } as VariantConfig,
      'first-step_video1': {
        startStep: 0,
        videoUrl: '/video/1.mp4',
      } as VariantConfig,
      'first-step_video2': {
        startStep: 0,
        videoUrl: '/video/2.mp4',
      } as VariantConfig,
      'first-step_video3': {
        startStep: 0,
        videoUrl: '/video/3.mp4',
      } as VariantConfig,
      'second-step': {
        startStep: 1,
      } as VariantConfig,
      'fourth-step': {
        startStep: 4,
      } as VariantConfig,
    }
  },
} as const;