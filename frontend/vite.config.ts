import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // FRONTEND
    // Jika ingin semua host
    // host: true,
    // Jika ingin host tertentu
    // host: "0.0.0.0",

    // Jika ingin izinkan semua host
    // allowedHosts: true,
    // Jika ingin izinkan host tertentu
    // allowedHosts: ['example.com', '6d32-180-252-92-169.ngrok-free.app']

    port: 8005,

    // BACKEND
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3000',
    //     changeOrigin: true,
    //     rewrite: (path: string) => path.replace(/^\/api/, ''),
    //   },
    // }
  }
})
