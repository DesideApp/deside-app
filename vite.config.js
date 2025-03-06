import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// 🔥 Asegurar que `VITE_BACKEND_URL` está definido en `.env`
if (!process.env.VITE_BACKEND_URL) {
  throw new Error("❌ VITE_BACKEND_URL no está definido en el entorno.");
}

const backendUrl = process.env.VITE_BACKEND_URL;
const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  build: {
    target: "modules",
    rollupOptions: {
      output: {
        format: "esm",
        manualChunks: {
          solana: ["@solana/web3.js"],
        },
      },
    },
    chunkSizeWarningLimit: 800,
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
        secure: isProduction,
        ws: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/socket.io": {
        target: backendUrl,
        ws: true,
        changeOrigin: true,
        secure: isProduction,
      },
    },
  },
});
