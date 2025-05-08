import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Use root for Vercel and static hosts
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'mask-icon.svg',
        'android-launchericon-48-48.png',
        'android-launchericon-72-72.png',
        'android-launchericon-96-96.png',
        'android-launchericon-144-144.png',
        'android-launchericon-192-192.png',
        'android-launchericon-512-512.png',
        'widget.json'
      ],
      manifest: {
        name: 'AH Expenses Tracker',
        short_name: 'AH Expenses',
        description: 'Luxury, glassmorphic, mobile-first expense tracker. Persistent, private, and installable.',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        id: 'ah-expenses-tracker',
        icons: [
          {
            src: 'android-launchericon-48-48.png',
            sizes: '48x48',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android-launchericon-72-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android-launchericon-96-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android-launchericon-144-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide'
          }
        ],
        categories: ['finance', 'productivity', 'utilities'],
        lang: 'en',
        dir: 'ltr',
        prefer_related_applications: false,
        iarc_rating_id: 'e84b072d-71b3-4d3e-86ae-31a8ce4e53b7',
        launch_handler: {
          client_mode: ['auto', 'focus-existing']
        },
        edge_side_panel: {
          preferred_width: 400
        },
        file_handlers: [
          {
            action: '/expense-import',
            accept: {
              'text/csv': ['.csv'],
              'application/json': ['.json'],
              'application/vnd.ms-excel': ['.xls', '.xlsx']
            }
          }
        ],
        handle_links: 'preferred',
        protocol_handlers: [
          {
            protocol: 'ah-expenses',
            url: '/expense?data=%s'
          }
        ],
        widgets: [
          {
            name: 'Quick Entry',
            short_name: 'Quick Entry',
            description: 'Quickly add income, expenses, and transfers',
            icons: [
              {
                src: 'android-launchericon-192-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              }
            ],
            data: 'widget.json',
            auth: false
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        navigationPreload: true
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
