import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const backendUrl =
  process.env.VITE_BACKEND_URL || (process.env.NODE_ENV === "production"
    ? "https://backend-deside.onrender.com"
    : "http://localhost:3000");

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  build: {
    target: "modules", // 🔥 Máxima compatibilidad con navegadores modernos
    minify: isProduction, // 🔥 Minificar solo en producción
    rollupOptions: {
      output: {
        format: "esm", // 🔥 ESM para evitar problemas con import.meta
        manualChunks: {
          solana: ["@solana/web3.js"],
        },
      },
      onwarn(warning, warn) {
        if (warning.code === "DYNAMIC_IMPORT_VARIABLE") return;
        warn(warning);
      },
    },
    chunkSizeWarningLimit: 800, // 🔥 Reducido para avisos más precisos
  },
  base: isProduction ? "/" : "/", // 🔥 Definir `base` dinámicamente según el entorno
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
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/socket.io": {
        target: backendUrl,
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/socket.io/, ""),
      },
    },
  },
});
