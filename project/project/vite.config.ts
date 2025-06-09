import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    hmr: {
      overlay: false
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress React Router future flag warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        warn(warning)
      }
    }
  },
  define: {
    // Define import.meta.env for build
    'import.meta.env': 'import.meta.env'
  }
})