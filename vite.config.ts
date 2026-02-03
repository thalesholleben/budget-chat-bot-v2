import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from 'vite-plugin-compression';
import { asyncCssPlugin } from './vite-plugin-async-css';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: Number(process.env.VITE_PORT) || 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Async CSS loading
    asyncCssPlugin(),
    // Gzip compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 1024,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 1024,
      algorithm: 'brotliCompress',
      ext: '.br',
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['@radix-ui/react-alert-dialog', '@radix-ui/react-tooltip']
        }
      }
    },
    chunkSizeWarningLimit: 500,
    // Habilitar modulePreload para reduzir cadeia de dependências
    modulePreload: {
      polyfill: true
    },
    // Configurar CSS code splitting
    cssCodeSplit: true,
    // Reportar tamanhos comprimidos
    reportCompressedSize: true
  }
}));
