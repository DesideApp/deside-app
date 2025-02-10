import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',  // 📌 Usa la raíz del proyecto
  build: {
    outDir: 'dist',
    emptyOutDir: true,  // 📌 Elimina archivos antiguos antes de construir
    rollupOptions: {
      input: resolve(__dirname, 'index.html'), // 📌 Usa `index.html` en la raíz
      output: {
        dir: 'dist',
        entryFileNames: 'assets/index-[hash].js', // 📌 Asegura nombres únicos
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  base: './',  // 📌 Usa rutas relativas
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.REACT_APP_BACKEND_URL || 'https://backend-deside.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
