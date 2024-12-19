import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'public/index.html'), // Asegúrate de que apunte al archivo correcto
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://backend-deside.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
