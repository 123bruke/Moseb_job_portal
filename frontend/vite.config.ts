/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Two dev terminals, two faces of the same code base:
//   npm run dev:user  -> mode "user"  -> http://localhost:5173
//   npm run dev:admin -> mode "admin" -> http://localhost:5174/admin/users  (VITE_APP_VIEW=admin)
const PORTS: Record<string, number> = { user: 5173, admin: 5174 };

export default defineConfig(({ mode }) => {
  const port = PORTS[mode] ?? PORTS.user;
  return {
    plugins: [react()],
    resolve: { alias: { "@": "/src" } },
    server: {
      port,
      strictPort: true,
      proxy: { "/api": { target: "http://localhost:8000", rewrite: (p) => p.replace(/^\/api/, "") } },
    },
    test: { environment: "jsdom", globals: true },
  };
});