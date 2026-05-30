/**
 * Module: frontend/vite.config.js
 * Purpose: Stores frontend tool or build configuration for the surrounding development workflow.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for frontend development and production builds.
export default defineConfig({
  plugins: [react()],
})
