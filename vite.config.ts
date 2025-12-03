import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  console.log('\n=== BUILD TIME DEBUG ===')
  console.log('Mode:', mode)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  
  console.log('\n--- Your variables via process.env ---')
  console.log('VITE_PUBLIC_POSTHOG_TOKEN:', process.env.VITE_PUBLIC_POSTHOG_TOKEN)
  console.log('VITE_PUBLIC_API_BASE_URL:', process.env.VITE_PUBLIC_API_BASE_URL)
  
  console.log('\n--- Default Cloudflare variables ---')
  console.log('CF_PAGES:', process.env.CF_PAGES)
  console.log('CF_PAGES_BRANCH:', process.env.CF_PAGES_BRANCH)
  console.log('========================\n')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@@': path.resolve(__dirname, './public'),
      },
    },
  }
})