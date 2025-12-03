import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const defineConfig = mode === 'production' 
    ? Object.keys(env)
        .filter(key => key.startsWith('VITE_PUBLIC_'))
        .reduce((acc, key) => {
          acc[`import.meta.env.${key}`] = JSON.stringify(env[key])
          return acc
        }, {} as Record<string, string>)
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