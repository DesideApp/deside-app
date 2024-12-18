import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // Cambia si usas subdirectorios, por ejemplo, '/mi-app/'
  plugins: [react()],
  build: {
    outDir: 'dist', // Asegúrate de que sea 'dist'
    rollupOptions: {
      input: 'public/index.html', // Punto de entrada
    },
  },
  server: {
    port: 3000, // Cambia según tu entorno
  },
  publicDir: 'public', // Archivos estáticos
});
