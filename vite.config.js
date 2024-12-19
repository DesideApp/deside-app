import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Directorio de salida para la build
    rollupOptions: {
      input: resolve(__dirname, 'index.html'), // El archivo de entrada es el index.html en la raíz
    },
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
        target: 'https://backend-deside.onrender.com', // Backend de Render
        changeOrigin: true,
        secure: false, // Cambiar a true en producción si usas HTTPS
      },
    },
  },
});
