import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  envDir: path.resolve(__dirname, ".."),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,svg,woff2}"],
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "osm-tiles",
              expiration: { maxEntries: 5000, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
        maximumFileSizeToCacheInBytes: 3000000, // 3MB
      },
      manifest: {
        name: "Sync Safaris — Explore Kenya",
        short_name: "Sync Safaris",
        description: "AI-powered, community-centric tourism intelligence platform",
        theme_color: "#2d6a4f",
        background_color: "#faf8f5",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ].filter(Boolean),
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
}));
