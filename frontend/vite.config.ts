import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// PWA (HITO G): instalable + shell offline.
// - Precache del app shell (HTML/JS/CSS/assets del build).
// - Runtime: catálogo GET en NetworkFirst; nunca cachear login/checkout/admin writes.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "favicon.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/apple-touch-icon.png",
        "offline.html",
      ],
      manifest: {
        name: "MultiCatálogo",
        short_name: "MultiCat",
        description: "Catálogo y red multinivel de cosmética",
        lang: "es",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#681f38",
        theme_color: "#681f38",
        categories: ["shopping", "business"],
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache todos los assets generados por el build + offline.html
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webp}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // Catálogo de solo lectura (mismo origen del API o proxy)
            urlPattern: ({ url }) =>
              url.pathname === "/api/productos" ||
              /^\/api\/productos\/\d+$/.test(url.pathname),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-productos",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 64,
                maxAgeSeconds: 60 * 30, // 30 min
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Imágenes de producto (picsum u orígenes externos)
            urlPattern: ({ request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          // NO se cachean: /api/login, /api/register, /api/checkout,
          // /api/admin/*, POST/PUT/PATCH/DELETE ni respuestas 401/403.
        ],
      },
      devOptions: {
        // En `vite` puro el SW no se activa de forma fiable; usar build + preview.
        enabled: false,
      },
    }),
  ],
  server: { host: true },
  preview: { host: true },
});
