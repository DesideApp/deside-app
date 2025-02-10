import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://backend-deside.onrender.com';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          solana: ['@solana/web3.js'], // Crea un chunk separado para Solana
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar el límite de tamaño de los chunks a 1000 KiB
  },
  base: '/', // 🔥 Corrección clave: Se mantiene para rutas absolutas
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.jsx'],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: backendUrl, // URL del backend
        changeOrigin: true,
        secure: false, // Cambiar a true en producción si usas HTTPS
      },
    },
  },
});
