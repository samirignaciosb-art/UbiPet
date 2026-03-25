// Firebase Messaging Service Worker — UbiPet
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            'AIzaSyC2RYcFsBbmippii29V2LKTjCE7OY6yuy0',
  authDomain:        'ubipet1push.firebaseapp.com',
  projectId:         'ubipet1push',
  storageBucket:     'ubipet1push.firebasestorage.app',
  messagingSenderId: '149692115097',
  appId:             '1:149692115097:web:d5233bca244d00af2e3008'
})

const messaging = firebase.messaging()

// Manejar notificaciones en background
messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {}
  self.registration.showNotification(title || '🐾 UbiPet', {
    body:    body || 'Tienes una notificación nueva',
    icon:    '/icon-192.png',
    badge:   '/icon-192.png',
    data:    { url: payload.data?.url || '/perfil.html' },
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag:     'ubipet-push',
    renotify: true,
  })
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      const url = e.notification.data?.url || '/perfil.html'
      for (const client of list) {
        if (client.url.includes('app.ubipet.shop') && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
