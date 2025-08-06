import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    host: '0.0.0.0',  // 让 Vite 监听所有地址
    port: 5173        // 默认端口，可改为其他
  }
})