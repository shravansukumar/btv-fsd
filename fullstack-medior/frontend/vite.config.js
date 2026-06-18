import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on 0.0.0.0 so the container is reachable from the host
    // Proxy API calls to the Django dev server so the frontend can use
    // same-origin relative URLs (e.g. fetch("/api/patients")) with no CORS.
    // In Docker the backend is reached via the service name (BACKEND_URL);
    // locally it defaults to localhost.
    proxy: {
      "/api": process.env.BACKEND_URL || "http://127.0.0.1:8000",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
