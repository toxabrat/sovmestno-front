import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.sovmestno-test.ru',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
