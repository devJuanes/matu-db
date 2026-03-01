import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: 3005
  },
  server: {
    hmr: { overlay: false },
    port: 3005,
    allowedHosts: ["matudb.huakar.cloud"],
  },
})
