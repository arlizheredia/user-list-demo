/// <reference types="vitest/config" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Configuración de Vite (y de Vitest, que reutiliza este mismo fichero).
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Alias "@/..." -> "src/..." para evitar rutas relativas largas.
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  test: {
    // jsdom simula el DOM del navegador para Testing Library.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
