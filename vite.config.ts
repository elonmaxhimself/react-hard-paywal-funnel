import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@@': path.resolve(__dirname, './public'),
    },
  },
  
  define: {
    'import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN': JSON.stringify(process.env.VITE_PUBLIC_POSTHOG_TOKEN || ''),
    'import.meta.env.VITE_PUBLIC_API_BASE_URL': JSON.stringify(process.env.VITE_PUBLIC_API_BASE_URL || ''),
  },
})