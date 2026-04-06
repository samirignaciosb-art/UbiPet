// ═════════════════════════════════════════════════════════════════════════════
// UbiPet Push Worker — Cloudflare Worker
// Deploy: ubipet-push.samirignaciosb.workers.dev
//
// Variables de entorno en Cloudflare Dashboard:
//   SUPABASE_URL          → https://hwkyvxzbheegxynoljrw.supabase.co
//   SUPABASE_KEY          → service_role key
//   FIREBASE_PROJECT      → ubipet1push
//   FIREBASE_CLIENT_EMAIL → firebase-adminsdk-fbsvc@ubipet1push.iam.gserviceaccount.com
//   FIREBASE_PRIVATE_KEY  → clave privada RSA del service account (PEM completo o solo el body)
//   GEMINI_API_KEY        → AIzaSyCD5Fl36sz3p_fisKPIVB2wwMndyBuoFdU
// ═════════════════════════════════════════════════════════════════════════════

// Rate limiting en memoria: user_id → timestamp del último envío
// Se resetea al reiniciar el Worker (aprox. cada pocas horas en Cloudflare)
const lastSent = new Map()
const RATE_LIMIT_MS = 60_000 // 1 minuto entre notificaciones por usuario

export default {
  async fetch(request, env) {
    const origin  = request.headers.get('Origin') || ''
    const allowed = ['https://app.ubipet.shop', 'https://www.ubipet.shop', 'http://localhost']
    const corsOrigin = allowed.some(o => origin.startsWith(o)) ? origin : allowed[0]

    const corsHeaders = {
      'Access-Control-Allow-Origin':  corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

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

      // Rate limiting: máximo 1 notificación por usuario por minuto
      const now = Date.now()
      const last = lastSent.get(user_id)
      if (last && now - last < RATE_LIMIT_MS) {
        return new Response(JSON.stringify({ ok: true, sent: 0, reason: 'rate_limited' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      lastSent.set(user_id, now)

      // 1. Buscar fcm_token en Supabase
      const subRes = await fetch(
        `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${user_id}&select=subscription&limit=1`,
        { headers: { 'apikey': env.SUPABASE_KEY, 'Authorization': 'Bearer ' + env.SUPABASE_KEY } }
      )
      const subs = await subRes.json()

      const fcmToken = subs?.[0]?.subscription?.fcm_token
      if (!fcmToken) {
        return new Response(JSON.stringify({ ok: true, sent: 0, reason: 'no_token' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 2. Obtener access token OAuth2 para FCM HTTP v1
      let accessToken
      try {
        accessToken = await getFCMAccessToken(env)
      } catch(e) {
        console.error('OAuth error:', e.message)
        return new Response(JSON.stringify({ error: 'OAuth failed: ' + e.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 3. Enviar notificación via FCM HTTP v1
      const fcmRes = await fetch(
        `https://fcm.googleapis.com/v1/projects/${env.FIREBASE_PROJECT}/messages:send`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            message: {
              token: fcmToken,
              notification: {
                title: title   || '🐾 UbiPet',
                body:  msgBody || 'Tienes una notificación nueva',
              },
              webpush: {
                notification: {
                  icon:  'https://app.ubipet.shop/icon-192.png',
                  badge: 'https://app.ubipet.shop/icon-192.png',
                  requireInteraction: true,
                  vibrate: [200, 100, 200],
                  tag:     'ubipet-push',
                  renotify: true,
                },
                fcm_options: {
                  link: notifUrl || 'https://app.ubipet.shop/perfil.html'
                }
              },
              android: {
                notification: {
                  icon:         'icon_192',
                  click_action: notifUrl || 'https://app.ubipet.shop/perfil.html',
                  channel_id:   'ubipet_alerts',
                }
              },
              apns: {
                payload: { aps: { sound: 'default', badge: 1 } }
              }
            }
          })
        }
      )

      const fcmData = await fcmRes.json()

      // Token inválido o expirado → limpiar de Supabase
      if (!fcmRes.ok) {
        console.error('FCM error:', JSON.stringify(fcmData))
        const errCode = fcmData?.error?.details?.[0]?.errorCode || fcmData?.error?.status
        if (['UNREGISTERED', 'INVALID_ARGUMENT'].includes(errCode)) {
          await fetch(
            `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${user_id}`,
            { method: 'DELETE', headers: { 'apikey': env.SUPABASE_KEY, 'Authorization': 'Bearer ' + env.SUPABASE_KEY } }
          )
          return new Response(JSON.stringify({ ok: true, sent: 0, reason: 'token_expirado' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        return new Response(JSON.stringify({ error: fcmData?.error?.message || 'FCM error' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ ok: true, sent: 1, fcm_name: fcmData.name }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ── POST /ai ─────────────────────────────────────────────────────────────
    if (request.method === 'POST' && url.pathname === '/ai') {
      let body
      try { body = await request.json() } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { tema, categoria } = body
      const hoy   = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Santiago' }))
      const fecha = `${hoy.getDate()}/${hoy.getMonth()+1}/${hoy.getFullYear()}`

      const tipoPost = {
        efemeride:    'post conmemorativo de una fecha especial para mascotas',
        consejo:      'consejo veterinario o de cuidado animal útil y práctico',
        dato_curioso: 'dato curioso sorprendente sobre mascotas con su respaldo cientifico',
      }[categoria] || 'tip de cuidado de mascotas'

      const prompt = `Eres el community manager de UbiPet, marca chilena de perfil digital para mascotas donde las placas QR inteligentes son la llave para esta vitrina virtual.

Fecha: ${fecha} | Tema: "${tema}" | Tipo: ${tipoPost}

Escribe un caption corto para Instagram (máximo 200 palabras).

ESTRUCTURA:
Dato duro o cifra real sobre el tema. Una sola oración, directa. Por qué importa + UbiPet como solución natural. No publicidad, sentido común. Cierre emocional y de comunidad.

ESTILO DE REFERENCIA:
"1 de cada 3 perros que se pierde en Chile nunca vuelve a casa.

La mayoría de los rescatistas quieren ayudar, pero no saben cómo contactar al dueño. UbiPet lo resuelve en segundos: escanea el QR y el dueño recibe tu ubicación al instante. 🐾

Hagamos bajar esa estadística juntos."

REGLAS: sin hashtags | 1 emoji máximo | español de Chile | no menciones IA | entrega SOLO el caption, sin encabezados ni comillas al inicio o final`

      try {
        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 300, temperature: 0.85 }
            })
          }
        )

        if (!aiRes.ok) {
          const errText = await aiRes.text()
          throw new Error(`Gemini ${aiRes.status}: ${errText}`)
        }

        const data = await aiRes.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        if (!text) throw new Error('Gemini devolvió respuesta vacía')

        return new Response(JSON.stringify({ text }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (err) {
        console.error('AI error:', err.message)
        return new Response(JSON.stringify({
          text: `Cada día con tu mascota es un regalo 🐾\n\nPor eso en UbiPet creamos la placa más completa del mercado: perfil médico, notificación en tiempo real y ubicación GPS cuando alguien la encuentre.\n\n¿La tuya ya tiene su placa UbiPet?`,
          fallback: true
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// FCM HTTP v1 — OAuth2 con service account (JWT firmado con RS256)
// ═════════════════════════════════════════════════════════════════════════════

async function getFCMAccessToken(env) {
  const now = Math.floor(Date.now() / 1000)

  const header  = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64url(JSON.stringify({
    iss:   env.FIREBASE_CLIENT_EMAIL,
    sub:   env.FIREBASE_CLIENT_EMAIL,
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  }))

  const unsigned = `${header}.${payload}`

  // Limpiar PEM — acepta con o sin headers, con \n literales o reales
  const pemBody = env.FIREBASE_PRIVATE_KEY
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\n/g, '')
    .trim()

  const keyBytes = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0))

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const sigBuf = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsigned)
  )

  const jwt = `${unsigned}.${uint8ArrayToBase64url(new Uint8Array(sigBuf))}`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    throw new Error('OAuth token error: ' + err)
  }

  const tokenData = await tokenRes.json()
  return tokenData.access_token
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function base64url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
function uint8ArrayToBase64url(arr) {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
