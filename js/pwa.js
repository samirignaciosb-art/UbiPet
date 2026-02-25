// js/pwa.js — registrar service worker en todos los HTML
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ UbiPet SW registrado:', reg.scope))
      .catch(err => console.log('❌ SW error:', err))
  })
}
