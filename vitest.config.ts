import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@@': path.resolve(__dirname, './public'),
        },
    },
    test: {
        environment: 'jsdom',
        include: ['src/**/*.test.{ts,tsx}'],
        exclude: ['node_modules', 'dist'],
        setupFiles: ['./test/setup.ts'],
        globals: true,
        css: false,
        coverage: {
            provider: 'v8',
            include: [
                'src/utils/**',
                'src/services/**',
                'src/store/**',
                'src/hooks/**',
                'src/lib/**',
                'src/config/**',
                'src/features/**',
            ],
            exclude: [
                'src/**/*.test.{ts,tsx}',
                'src/**/*.d.ts',
                'src/utils/types/**',
                'src/utils/enums/**',
                'src/features/funnel/funnelSteps.tsx',
                'src/features/funnel/index.tsx',
                'src/hooks/queries/**',
                'src/**/useShift4 copy.ts',
            ],
            thresholds: {
                statements: 45,
                branches: 35,
                functions: 50,
                lines: 45,
            },
        },
    },
});
