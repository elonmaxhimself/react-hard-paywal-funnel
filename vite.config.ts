import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@@': path.resolve(__dirname, './public'),
    },
  },
  define: {
    'import.meta.env.VITE_PUBLIC_API_BASE_URL':
      mode === 'development' ? undefined : JSON.stringify(process.env.VITE_PUBLIC_API_BASE_URL),
    'import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN':
      mode === 'development' ? undefined : JSON.stringify(process.env.VITE_PUBLIC_POSTHOG_TOKEN),
    'import.meta.env.VITE_PUBLIC_POSTHOG_HOST':
      mode === 'development' ? undefined : JSON.stringify(process.env.VITE_PUBLIC_POSTHOG_HOST),
    'import.meta.env.VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY':
      mode === 'development' ? undefined : JSON.stringify(process.env.VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY),
    'import.meta.env.VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT':
      mode === 'development' ? undefined : JSON.stringify(process.env.VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT),
    'import.meta.env.VITE_PUBLIC_ENABLE_DEV_ANALYTICS':
      mode === 'development' ? undefined : JSON.stringify(process.env.VITE_PUBLIC_ENABLE_DEV_ANALYTICS),
  },
}))