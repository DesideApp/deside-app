import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Asegúrate de que el directorio de salida sea 'dist'
    rollupOptions: {
      external: ['tweetnacl']
    }
  },
  server: {
    port: 3000,
  },
});
