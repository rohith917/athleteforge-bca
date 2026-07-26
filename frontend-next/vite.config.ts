import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

/** Copy index.html → 404.html so Render's static site serves the SPA for unknown (client-routed) paths. */
function spa404Plugin() {
  return {
    name: 'spa-404',
    closeBundle() {
      const dist = resolve('dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), spa404Plugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-router-dom') || id.includes('/react/') || id.includes('/react-dom/')) return 'vendor'
          if (id.includes('three') || id.includes('@react-three')) return 'three'
          if (id.includes('gsap') || id.includes('framer-motion') || id.includes('/motion/') || id.includes('@studio-freight/lenis')) return 'motion'
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts'
          return undefined
        },
      },
    },
  },
})
