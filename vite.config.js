import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://backend-deside.onrender.com";
const isProduction = import.meta.env.PROD;

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          solana: ["@solana/web3.js"],
        },
      },
      onwarn(warning, warn) {
        if (warning.code !== "DYNAMIC_IMPORT_VARIABLE") {
          warn(warning);
        }
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  base: "/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
    extensions: [".js", ".jsx"],
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
        secure: isProduction, // 🔹 Solo forzar HTTPS en producción
      },
      "/socket.io": {
        target: backendUrl,
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
