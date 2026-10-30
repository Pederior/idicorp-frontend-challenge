import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const upstream = "https://ts.idicorp.ir";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: upstream,
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: "",
      },
      "/ws": {
        target: upstream,
        changeOrigin: true,
        secure: true,
        ws: true,
        cookieDomainRewrite: "",
      },
    },
  },
});
