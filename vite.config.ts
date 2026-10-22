import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'logo.png',
        'favicon.ico',
        'favicon.svg',
        'favicon_16.png',
        'favicon_32.png',
        'favicon_48.png',
        'apple_touch_icon.png',
        'icons/icon_192.png',
        'icons/icon_512.png',
        'icons/icon_512_maskable.png',
        'brand/main-logo.png',
        'brand/tab.png',
        'fonts/material_symbols_outlined.woff2',
      ],
      manifest: {
        name: 'Islam',
        short_name: 'Islam',
        description: 'Accurate prayer times, Quran, hadith, and Islamic tools',
        theme_color: '#14532D',
        background_color: '#F7F3EA',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon_192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon_512_maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}', 'icons/*.png', 'favicon*.png'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/sitemap/,
          /^\/robots\.txt$/,
          /^\/llms\.txt$/,
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/adhan/') && url.pathname.endsWith('.mp3'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'adhan_audio_local',
              expiration: { maxEntries: 10, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: true,
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/brand/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'brand_assets',
              expiration: { maxEntries: 40, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'aladhan_prayer_times',
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/Kiwifu\/adhan-mp3\/.+\.mp3$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'adhan_audio_fallback',
              expiration: { maxEntries: 10, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google_fonts_stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google_fonts_webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.quran\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran_com_api',
              expiration: { maxEntries: 300, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/download\.quranicaudio\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran_audio',
              expiration: { maxEntries: 120, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/fawazahmed0\/quran-api.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-cdn',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/fawazahmed0\/hadith-api.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hadith-cdn',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.islamic\.app\/v1\/hadith.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sunnah_mirror_api',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/(?:www\.)?mp3quran\.net\/api\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mp3quran_api',
              expiration: { maxEntries: 20, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('\\react\\')) {
            return 'vendor_react'
          }
          if (id.includes('react-router')) return 'vendor_router'
          if (id.includes('@tanstack/react-query')) return 'vendor_query'
          if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor_i18n'
          if (id.includes('framer-motion')) return 'vendor_motion'
          return undefined
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/sunnah': {
        target: 'https://api.sunnah.com/v1',
        changeOrigin: true,
        rewrite: (proxyPath) => proxyPath.replace(/^\/api\/sunnah/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const key = process.env.SUNNAH_API_KEY
            if (key) {
              proxyReq.setHeader('X-API-KEY', key)
            }
          })
        },
      },
      '/api/ummah': {
        target: 'https://ummahapi.com/api',
        changeOrigin: true,
        rewrite: (proxyPath) => proxyPath.replace(/^\/api\/ummah/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const key = process.env.UMMAH_API_KEY
            if (key) {
              proxyReq.setHeader('X-API-Key', key)
            }
          })
        },
      },
      // Aloula CORS only allows www.aloula.sa, inject Origin/Referer for live HLS tokens.
      '/api/aloula': {
        target: 'https://aloula.faulio.com',
        changeOrigin: true,
        rewrite: (proxyPath) => proxyPath.replace(/^\/api\/aloula/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://www.aloula.sa')
            proxyReq.setHeader('Referer', 'https://www.aloula.sa/')
          })
        },
      },
    },
  },
  preview: {
    proxy: {
      '/api/aloula': {
        target: 'https://aloula.faulio.com',
        changeOrigin: true,
        rewrite: (proxyPath) => proxyPath.replace(/^\/api\/aloula/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://www.aloula.sa')
            proxyReq.setHeader('Referer', 'https://www.aloula.sa/')
          })
        },
      },
      '/api/sunnah': {
        target: 'https://api.sunnah.com/v1',
        changeOrigin: true,
        rewrite: (proxyPath) => proxyPath.replace(/^\/api\/sunnah/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const key = process.env.SUNNAH_API_KEY
            if (key) {
              proxyReq.setHeader('X-API-KEY', key)
            }
          })
        },
      },
      '/api/ummah': {
        target: 'https://ummahapi.com/api',
        changeOrigin: true,
        rewrite: (proxyPath) => proxyPath.replace(/^\/api\/ummah/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const key = process.env.UMMAH_API_KEY
            if (key) {
              proxyReq.setHeader('X-API-Key', key)
            }
          })
        },
      },
    },
  },
})
