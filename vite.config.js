import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'public/index.html'
      },
      external: ['@solana/web3.js'], // Añadir @solana/web3.js como externo si es necesario
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000, // Cambia según tu entorno
    proxy: {
      '/api': {
        target: 'https://backend-deside.onrender.com', // URL de tu backend en Render
        changeOrigin: true,
        secure: false,
      },
    },
  },
  publicDir: 'public', // Archivos estáticos
});
