import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Data fetching & forms
          'vendor-data': ['@tanstack/react-query', 'axios', 'react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
})
