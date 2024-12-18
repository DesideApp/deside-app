import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // Asegúrate de que la raíz esté configurada correctamente
  build: {
    outDir: 'dist', // Asegúrate de que el directorio de salida sea 'dist'
    rollupOptions: {
      input: '/public/index.html', // Asegúrate de que el archivo de entrada sea 'public/index.html'
      external: ['tweetnacl']
    }
  },
  server: {
    port: 3000,
  },
});
