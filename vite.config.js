import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Asegúrate de que el directorio de salida sea 'dist'
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      url: 'url',
      buffer: 'buffer',
    },
  },
  define: {
    'process.env': {},
  },
});
