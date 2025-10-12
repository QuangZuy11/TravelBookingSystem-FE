import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@api': path.resolve(__dirname, './src/api'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 5173, // Frontend chạy port 5173
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Backend chạy port 3000
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path // Giữ nguyên path
      }
    }
  }
})