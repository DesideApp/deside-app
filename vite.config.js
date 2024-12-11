import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
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
