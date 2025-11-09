import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow serving static files from public directory
    fs: {
      allow: ['..']
    }
  },
  // Explicitly serve public directory
  publicDir: 'public',
  build: {
    outDir: 'dist',
    // Don't optimize so we can see raw files
    minify: false
  }
})