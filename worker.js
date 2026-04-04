// ═════════════════════════════════════════════════════════════════════════════
// UbiPet Push Worker — Cloudflare Worker
// Deploy: ubipet-push.samirignaciosb.workers.dev
//
// Variables de entorno a configurar en Cloudflare Dashboard:
//   VAPID_PUBLIC   → BDmBum_TYjmFdIwJPWNuQS6X-8QZWwxpGG2lZg8iI7dS09Z5XfXiIzBMs1oben9IU8IKfo1pXx9-z2Owuigin8A
//   VAPID_PRIVATE  → e2dQzCYoYXynvin9HoAWe9LBZrz6aYjC4EcnfIaoSB8
//   VAPID_SUBJECT  → mailto:samirignaciosb@gmail.com
//   SUPABASE_URL   → https://hwkyvxzbheegxynoljrw.supabase.co
//   SUPABASE_KEY      → (service_role key — NO la anon)
//   GEMINI_API_KEY     → AIzaSyCD5Fl36sz3p_fisKPIVB2wwMndyBuoFdU (Google AI Studio) — Secret en Cloudflare
// ═════════════════════════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {
    // CORS para requests desde app.ubipet.shop y www.ubipet.shop
    const origin = request.headers.get('Origin') || ''
    const allowed = ['https://app.ubipet.shop', 'https://www.ubipet.shop', 'http://localhost']
    const corsOrigin = allowed.some(o => origin.startsWith(o)) ? origin : allowed[0]

    const corsHeaders = {
      'Access-Control-Allow-Origin':  corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const url = new URL(request.url)

    // ── GET /health ──────────────────────────────────────────────────────────
    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, service: 'ubipet-push' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ── POST /send ───────────────────────────────────────────────────────────
    if (request.method === 'POST' && url.pathname === '/send') {
      let body
      try { body = await request.json() } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { user_id, title, body: msgBody, url: notifUrl } = body
      if (!user_id) {
        return new Response(JSON.stringify({ error: 'user_id requerido' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 1. Buscar suscripción en Supabase
      const subRes = await fetch(
        `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${user_id}&select=subscription&limit=1`,
        {
          headers: {
            'apikey':        env.SUPABASE_KEY,
            'Authorization': 'Bearer ' + env.SUPABASE_KEY,
          }
        }
      )
      const subs = await subRes.json()

      if (!subs?.length || !subs[0]?.subscription) {
        // No hay suscripción — responder ok igual (no es error del caller)
        return new Response(JSON.stringify({ ok: true, sent: 0, reason: 'no_subscription' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const subscription = subs[0].subscription

      // 2. Armar payload de notificación
      const payload = JSON.stringify({
        title:   title   || '🐾 UbiPet',
        body:    msgBody || 'Tienes una notificación nueva',
        url:     notifUrl || '/perfil.html',
        icon:    'https://app.ubipet.shop/icon-192.png',
        badge:   'https://app.ubipet.shop/icon-192.png',
      })

      // 3. Generar header VAPID y enviar el push
      try {
        await sendWebPush(subscription, payload, env)
        return new Response(JSON.stringify({ ok: true, sent: 1 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (err) {
        // Si la suscripción expiró/fue revocada (410/404), limpiarla
        if (err.statusCode === 410 || err.statusCode === 404) {
          await fetch(
            `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${user_id}`,
            {
              method: 'DELETE',
              headers: {
                'apikey':        env.SUPABASE_KEY,
                'Authorization': 'Bearer ' + env.SUPABASE_KEY,
              }
            }
          )
          return new Response(JSON.stringify({ ok: true, sent: 0, reason: 'subscription_expired' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        console.error('Push error:', err)
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // ── POST /ai ─────────────────────────────────────────────────────────────
    // Genera copy para Instagram con prioridad:
    // 1. Efeméride del calendario UbiPet (pet_calendar en Supabase)
    // 2. Tip veterinario o de cuidado
    // 3. Dato curioso sobre mascotas
    if (request.method === 'POST' && url.pathname === '/ai') {
      let body
      try { body = await request.json() } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { tema, categoria } = body

      // Construir prompt según categoría y tema recibido desde admin.html
      const hoy = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Santiago' }))
      const fecha = `${hoy.getDate()}/${hoy.getMonth()+1}/${hoy.getFullYear()}`

      const tipoPost = {
        efemeride:    'post conmemorativo de una fecha especial para mascotas',
        dato_curioso: 'dato curioso sorprendente sobre mascotas',
        consejo:      'consejo veterinario o de cuidado animal útil y práctico',
      }[categoria] || 'tip de cuidado de mascotas'

      const prompt = `Eres el community manager de UbiPet, marca chilena de placas QR inteligentes para mascotas ($9.990 CLP, pago único).

Fecha: ${fecha} | Tema: "${tema}" | Tipo: ${tipoPost}

Escribe un caption corto para Instagram (máximo 80 palabras, 3 párrafos de 1-2 líneas cada uno).

ESTRUCTURA:
1️⃣ Dato duro o cifra impactante sobre el tema. Una sola oración, directa.
2️⃣ Por qué importa + UbiPet como solución natural. No publicidad, sentido común.
3️⃣ Cierre emocional y de comunidad. Ej: "Hagamos más familias felices." / "Porque cada mascota merece volver a casa."

ESTILO DE REFERENCIA:
"1 de cada 3 perros que se pierde en Chile nunca vuelve a casa.

La mayoría de los rescatistas quieren ayudar, pero no saben cómo contactar al dueño. UbiPet lo resuelve en segundos: escanea el QR y el dueño recibe tu ubicación al instante. 🐾

Hagamos bajar esa estadística juntos."

REGLAS: sin hashtags | 1 emoji máximo | español de Chile | no menciones IA | IMPORTANTE: entrega SOLO el caption, sin encabezados, sin "Aquí tienes...", sin comillas al inicio o final`

      try {
        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                maxOutputTokens: 300,
                temperature:     0.85,
              }
            })
          }
        )

        if (!aiRes.ok) {
          const errText = await aiRes.text()
          console.error('Gemini error status:', aiRes.status, errText)
          return new Response(JSON.stringify({
            error: `Gemini ${aiRes.status}: ${errText}`,
            text: null
          }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const data = await aiRes.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

        if (!text) {
          console.error('Gemini respuesta vacía:', JSON.stringify(data))
          throw new Error('Gemini devolvió respuesta vacía')
        }

        return new Response(JSON.stringify({ text }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      } catch (err) {
        console.error('AI error:', err.message)
        return new Response(JSON.stringify({
          text: `Cada día con tu mascota es un regalo 🐾\n\nPor eso en UbiPet creamos la placa más completa del mercado: perfil médico, notificación en tiempo real y ubicación GPS cuando alguien la encuentre.\n\n¿La tuya ya tiene su placa UbiPet?`,
          fallback: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// WEB PUSH — implementación VAPID nativa para Cloudflare Workers
// (sin librerías externas — usa SubtleCrypto disponible en el runtime)
// ═════════════════════════════════════════════════════════════════════════════

async function sendWebPush(subscription, payload, env) {
  const endpoint  = subscription.endpoint
  const p256dh    = subscription.keys?.p256dh
  const auth      = subscription.keys?.auth

  if (!endpoint || !p256dh || !auth) throw new Error('Subscription incompleta')

  // Generar VAPID JWT
  const vapidHeaders = await buildVapidHeaders(endpoint, env)

  // Cifrar payload con ECDH + AES-GCM (RFC 8291)
  const encrypted = await encryptPayload(payload, p256dh, auth)

  const res = await fetch(endpoint, {
    method:  'POST',
    headers: {
      ...vapidHeaders,
      'Content-Type':     'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL':              '86400',
    },
    body: encrypted,
  })

  if (!res.ok && res.status !== 201) {
    const err = new Error(`Push failed: ${res.status} ${res.statusText}`)
    err.statusCode = res.status
    throw err
  }
}

// ─── VAPID JWT ────────────────────────────────────────────────────────────────
async function buildVapidHeaders(endpoint, env) {
  const audience = new URL(endpoint).origin
  const now      = Math.floor(Date.now() / 1000)

  const header  = base64url(JSON.stringify({ typ: 'JWT', alg: 'ES256' }))
  const claims  = base64url(JSON.stringify({ aud: audience, exp: now + 43200, sub: env.VAPID_SUBJECT }))
  const unsigned = `${header}.${claims}`

  // DEBUG temporal
  console.log('VAPID_PRIVATE length:', env.VAPID_PRIVATE?.length)
  console.log('VAPID_PRIVATE prefix:', env.VAPID_PRIVATE?.slice(0, 20))
  console.log('VAPID_PUBLIC length:', env.VAPID_PUBLIC?.length)

  // Importar clave privada VAPID en formato JWK
  // x e y corresponden a VAPID_PUBLIC BHfHyFK...
  const key = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC', crv: 'P-256',
      x:   'd8fIUoJSuEnIlQIltF8Knm85e73y5VN79kx3lLerIOM',
      y:   'lCgYh4qNafoUuORFuC1OC49DncWisdSiVC7g1uYXjec',
      d:   env.VAPID_PRIVATE,
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  )

  const sigBuf = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(unsigned)
  )
  const jwt = `${unsigned}.${uint8ArrayToBase64url(new Uint8Array(sigBuf))}`

  return {
    'Authorization': `vapid t=${jwt}, k=${env.VAPID_PUBLIC}`,
  }
}

// ─── ENCRYPT PAYLOAD (RFC 8291 / aes128gcm) ──────────────────────────────────
async function encryptPayload(payload, p256dhBase64, authBase64) {
  const encoder       = new TextEncoder()
  const payloadBytes  = encoder.encode(payload)

  // Claves del cliente
  const clientPublic = base64urlToUint8Array(p256dhBase64)
  const authBytes    = base64urlToUint8Array(authBase64)

  // Generar par de claves efímero
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']
  )

  // Importar clave pública del cliente
  const clientKey = await crypto.subtle.importKey(
    'raw', clientPublic, { name: 'ECDH', namedCurve: 'P-256' }, true, []
  )

  // Derivar secreto compartido
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientKey },
    serverKeyPair.privateKey, 256
  )

  // Exportar clave pública efímera
  const serverPublicRaw = await crypto.subtle.exportKey('raw', serverKeyPair.publicKey)
  const serverPublic    = new Uint8Array(serverPublicRaw)

  // Salt aleatorio
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Derivar clave de contenido e IV (HKDF)
  const prk = await hkdf(new Uint8Array(sharedBits), authBytes,
    concat(encoder.encode('WebPush: info\0'), clientPublic, serverPublic), 32)

  const cek = await hkdf(prk, salt,
    concat(encoder.encode('Content-Encoding: aes128gcm\0'), new Uint8Array(1)), 16)

  const nonce = await hkdf(prk, salt,
    concat(encoder.encode('Content-Encoding: nonce\0'), new Uint8Array(1)), 12)

  // Importar CEK
  const cekKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])

  // Cifrar — agregar delimitador 0x02 al final del payload
  const toEncrypt = concat(payloadBytes, new Uint8Array([2]))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce }, cekKey, toEncrypt
  )

  // Armar record según RFC 8291:
  // salt (16) + rs (4) + keyid_len (1) + keyid (65) + ciphertext
  const rs = 4096
  const header = new Uint8Array(21 + serverPublic.length)
  header.set(salt, 0)
  header.set([(rs >> 24)&0xff, (rs >> 16)&0xff, (rs >> 8)&0xff, rs&0xff], 16)
  header[20] = serverPublic.length
  header.set(serverPublic, 21)

  return concat(header, new Uint8Array(ciphertext))
}

// ─── HKDF ─────────────────────────────────────────────────────────────────────
async function hkdf(ikm, salt, info, length) {
  const keyMat = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  const bits   = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info }, keyMat, length * 8
  )
  return new Uint8Array(bits)
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function base64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
function uint8ArrayToBase64url(arr) {
  return btoa(String.fromCharCode(...arr)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
function base64urlToUint8Array(str) {
  const padding = '='.repeat((4 - str.length % 4) % 4)
  const b64     = (str + padding).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}
function concat(...arrays) {
  const total  = arrays.reduce((n, a) => n + a.byteLength, 0)
  const result = new Uint8Array(total)
  let offset   = 0
  for (const arr of arrays) {
    result.set(new Uint8Array(arr.buffer ?? arr), offset)
    offset += arr.byteLength
  }
  return result
}
