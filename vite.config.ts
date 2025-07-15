import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/", // ✅ Add this to ensure correct base path
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': 'http://localhost:5050',
    },
  },
  build: {
    outDir: "dist", // ✅ Vercel expects this or will guess wrong
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
