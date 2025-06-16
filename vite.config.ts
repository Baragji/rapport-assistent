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
          'doc-vendor': ['docx', 'md-to-docx'],
          // Split chart libraries
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          // Split React core
          'react-vendor': ['react', 'react-dom'],
          // Split utility libraries
          'utils-vendor': ['remark-parse', 'unified']
        },
        // Optimize chunk size
        chunkFileNames: (chunkInfo) => {
          const id = chunkInfo.facadeModuleId || '';
          // Create more descriptive chunk names for better debugging
          if (id.includes('node_modules')) {
            const pkg = id.match(/node_modules\/\.pnpm\/([^/]+)/)?.[1] || 
                       id.match(/node_modules\/([^/]+)/)?.[1] || 'vendor';
            return `assets/vendor-${pkg}-[hash].js`;
          }
          return 'assets/[name]-[hash].js';
        },
        // Optimize asset size
        assetFileNames: (assetInfo) => {
          const { name = '' } = assetInfo;
          const extType = name.split('.').pop();
          if (/\.(png|jpe?g|gif|svg|webp)$/.test(name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (extType === 'css') {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // Reduce chunk size warning threshold
    chunkSizeWarningLimit: 1000,
    // Enable minification optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Enable source maps for production debugging if needed
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Preload critical chunks
    modulePreload: {
      polyfill: true
    }
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: true
    },
    // Optimize for network performance
    headers: {
      'Cache-Control': 'max-age=31536000'
    }
  },
  // Optimize preview server
  preview: {
    headers: {
      'Cache-Control': 'max-age=31536000'
    }
  }
})
