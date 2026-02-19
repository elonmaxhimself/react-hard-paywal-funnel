import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@@': path.resolve(__dirname, './public'),
    },
  },

  // define: {
  //   'import.meta.env.VITE_PUBLIC_API_BASE_URL': JSON.stringify(process.env.VITE_PUBLIC_API_BASE_URL || ''),
  //   'import.meta.env.VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY || ''),
  //   'import.meta.env.VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT': JSON.stringify(process.env.VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT || ''),
  //   'import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN': JSON.stringify(process.env.VITE_PUBLIC_POSTHOG_TOKEN || ''),
  //   'import.meta.env.VITE_PUBLIC_POSTHOG_HOST': JSON.stringify(process.env.VITE_PUBLIC_POSTHOG_HOST || ''),
  //   'import.meta.env.VITE_PUBLIC_ENABLE_DEV_ANALYTICS': JSON.stringify(process.env.VITE_PUBLIC_ENABLE_DEV_ANALYTICS || ''),
  // },
}))