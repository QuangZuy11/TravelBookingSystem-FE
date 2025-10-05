import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or vue, or other framework plugin

export default defineConfig({
  plugins: [react()], // or vue(), depending on your framework
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})