import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  base: '/', // Esto asegura que las rutas sean absolutas
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
