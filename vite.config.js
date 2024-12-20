import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://backend-deside.onrender.com';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Directorio de salida para la build
    rollupOptions: {
      input: resolve(__dirname, 'public/index.html'), // El archivo de entrada es el index.html en public
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    },
    chunkSizeWarningLimit: 500, // Ajustar el límite de tamaño de los chunks
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // Alias para usar `@` en imports
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: backendUrl, // Backend de Render
        changeOrigin: true,
        secure: false, // Cambiar a true en producción si usas HTTPS
      },
    },
  },
});
