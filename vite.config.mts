/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'
import zaloMiniApp from 'zmp-vite-plugin'

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    plugins: [react(), zaloMiniApp()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  })
}