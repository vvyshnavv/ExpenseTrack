import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  server: {
    port: 5173,
    proxy: {
      // Use IPv4 so Windows does not proxy to ::1 while nothing listens on IPv6
      '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true }
    }
  }
})
