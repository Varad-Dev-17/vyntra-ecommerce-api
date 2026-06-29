import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxyConfig = {
  target: "http://localhost:8000",
  changeOrigin: true,
  secure: false,
  bypass: (req) => {
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return req.url;
    }
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/auth": proxyConfig,
      "/admin": proxyConfig,
      "/upload": proxyConfig,
      "/products": proxyConfig,
    },
  },
});
