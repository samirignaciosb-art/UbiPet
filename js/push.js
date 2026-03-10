// ─────────────────────────────────────────────────────────────────────────────
// UbiPet · push.js  —  cliente de Web Push
// Uso: import { suscribir, desuscribir, getPushEstado } from '/js/push.js'
// ─────────────────────────────────────────────────────────────────────────────

const VAPID_PUBLIC = 'j_c1DV6_FAq5cgcjARGnAvw2zdW-GO-YCI3RBtswYPKCgNdW5fo-y7wSLHXu3nZ-wP_FlO7EifCjfaq98hOvEg'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

// ─── SUSCRIBIR ────────────────────────────────────────────────────────────────
export async function suscribir(supabase, userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  const reg    = await navigator.serviceWorker.ready
  const permiso = await Notification.requestPermission()
  if (permiso !== 'granted') return null

  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC)
    })
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: userId, subscription: sub.toJSON() }, { onConflict: 'user_id' })

  if (error) { console.error('Push sub error:', error); return null }
  return sub
}

// ─── DESUSCRIBIR ──────────────────────────────────────────────────────────────
export async function desuscribir(supabase, userId) {
  if (!('serviceWorker' in navigator)) return
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) await sub.unsubscribe()
  await supabase.from('push_subscriptions').delete().eq('user_id', userId)
}

// ─── ESTADO ACTUAL ────────────────────────────────────────────────────────────
export async function getPushEstado() {
  if (!('Notification' in window) || !('PushManager' in window)) return 'no-soportado'
  if (Notification.permission === 'denied') return 'bloqueado'
  if (Notification.permission === 'granted') {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return sub ? 'activo' : 'inactivo'
  }
  return 'inactivo'
}
