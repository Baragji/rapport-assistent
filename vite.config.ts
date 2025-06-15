import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split OpenAI SDK into separate chunk
          'ai-vendor': ['openai'],
          // Split large UI libraries
          'ui-vendor': ['@rjsf/core', '@rjsf/validator-ajv8'],
          // Split document processing
          'doc-vendor': ['docx', 'md-to-docx']
        }
      }
    },
    // Reduce chunk size warning threshold
    chunkSizeWarningLimit: 1000
  }
})
