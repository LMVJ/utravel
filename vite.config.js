import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 监听所有地址
    port: 5173,      // 端口
    proxy: {
      // 把 /api 请求代理到你的后端服务器
      '/api': {
        target: 'http://8.211.147.14:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
