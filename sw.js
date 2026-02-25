const CACHE_NAME = 'ubipet-v3'

const STATIC_FILES = [
  '/',
  '/index.html',
  '/perfil.html',
  '/rescate.html',
  '/css/styles.css',
  '/js/supabase.js',
  '/js/pwa.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  if (url.hostname.includes('supabase') ||
      url.hostname.includes('esm.sh') ||
      url.hostname.includes('qrserver') ||
      url.hostname.includes('wa.me') ||
      url.hostname.includes('fonts.googleapis') ||
      url.hostname.includes('cdnjs')) {
    return
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
    }).catch(() => {
      if (event.request.destination === 'document') {
        return caches.match('/index.html')
      }
    })
  )
})
