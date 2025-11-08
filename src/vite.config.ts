import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'figma:asset/c6abfb3fc957a7880b1ef5dfdd3846e394c171cf.png': path.resolve(__dirname, './assets/c6abfb3fc957a7880b1ef5dfdd3846e394c171cf.png'),
      'figma:asset/c2d8fad20e5b6307c11176c709bc099c0f1a0186.png': path.resolve(__dirname, './assets/c2d8fad20e5b6307c11176c709bc099c0f1a0186.png'),
      'figma:asset/35c8a0c41cd604aca93fe4f1623cefd9cda993aa.png': path.resolve(__dirname, './assets/35c8a0c41cd604aca93fe4f1623cefd9cda993aa.png'),
      'figma:asset/aae595903ed30eb623954fca611db78d5dec09fd.png': path.resolve(__dirname, './assets/aae595903ed30eb623954fca611db78d5dec09fd.png'),
      'figma:asset/273c976932a0844efd947710f1f810af40a6926d.png': path.resolve(__dirname, './assets/273c976932a0844efd947710f1f810af40a6926d.png'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
