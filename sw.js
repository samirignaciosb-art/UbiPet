// UbiPet Service Worker
const CACHE_NAME = 'ubipet-v1'

// Archivos que se guardan en caché para carga rápida
const STATIC_FILES = [
  '/',
  '/index.html',
  '/perfil.html',
  '/rescate.html',
  '/css/styles.css',
  '/js/supabase.js'
]

// ─── Instalación: guardar archivos en caché ───
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_FILES)
    })
  )
  self.skipWaiting()
})

// ─── Activación: limpiar cachés viejos ────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch: cache-first para estáticos ────────
// Para llamadas a Supabase siempre va a la red
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Supabase y APIs externas → siempre red
  if (url.hostname.includes('supabase') ||
      url.hostname.includes('esm.sh') ||
      url.hostname.includes('qrserver') ||
      url.hostname.includes('wa.me')) {
    return
  }

  // Archivos locales → caché primero, red como fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // guardar en caché si es un recurso local
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
    }).catch(() => {
      // offline fallback para páginas HTML
      if (event.request.destination === 'document') {
        return caches.match('/index.html')
      }
    })
  )
})
