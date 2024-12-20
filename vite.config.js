import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'], // Mueve las dependencias principales a un archivo separado
          solana: ['@solana/web3.js'], // Crea un chunk separado para Solana si usas esta librería
        },
      },
    }
  },
  base: '/', // Esto asegura que las rutas sean absolutas
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
