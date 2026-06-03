import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@/components/chat", replacement: path.resolve(__dirname, "./src/domains/chat/components") },
      { find: "@/components", replacement: path.resolve(__dirname, "./src/shared/components") },
      { find: "@/contexts", replacement: path.resolve(__dirname, "./src/app/providers") },
      { find: "@/hooks", replacement: path.resolve(__dirname, "./src/shared/hooks") },
      { find: "@/integrations", replacement: path.resolve(__dirname, "./src/shared/services") },
      { find: "@/lib", replacement: path.resolve(__dirname, "./src/shared/utils") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
  },
});
