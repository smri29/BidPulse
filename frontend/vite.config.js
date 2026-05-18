import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for frontend development and production builds.
export default defineConfig({
  plugins: [react()],
})
