import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  const defineConfig = mode === 'production' 
    ? {
        'import.meta.env.VITE_PUBLIC_API_BASE_URL': JSON.stringify(
          env.VITE_PUBLIC_API_BASE_URL || process.env.VITE_PUBLIC_API_BASE_URL
        ),
        'import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN': JSON.stringify(
          env.VITE_PUBLIC_POSTHOG_TOKEN || process.env.VITE_PUBLIC_POSTHOG_TOKEN
        ),
        'import.meta.env.VITE_PUBLIC_POSTHOG_HOST': JSON.stringify(
          env.VITE_PUBLIC_POSTHOG_HOST || process.env.VITE_PUBLIC_POSTHOG_HOST
        ),
        'import.meta.env.VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY': JSON.stringify(
          env.VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY || process.env.VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY
        ),
        'import.meta.env.VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT': JSON.stringify(
          env.VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT || process.env.VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT
        ),
        'import.meta.env.VITE_PUBLIC_ENABLE_DEV_ANALYTICS': JSON.stringify(
          env.VITE_PUBLIC_ENABLE_DEV_ANALYTICS || process.env.VITE_PUBLIC_ENABLE_DEV_ANALYTICS
        ),
      }
    : {}

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@@': path.resolve(__dirname, './public'),
      },
    },
    define: defineConfig,
  }
})