// ═════════════════════════════════════════════════════════════════════════════
// UbiPet Push Worker — Firebase FCM V1
// Deploy: ubipet-push.samirignaciosb.workers.dev
// ═════════════════════════════════════════════════════════════════════════════

const FIREBASE_PROJECT = 'ubipet1push'
const FIREBASE_CLIENT_EMAIL = 'firebase-adminsdk-fbsvc@ubipet1push.iam.gserviceaccount.com'

// ── JWT para OAuth2 ────────────────────────────────────────────────────────
async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000)
  const PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----\n${env.FIREBASE_PRIVATE_KEY}\n-----END PRIVATE KEY-----`
  const header  = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  const payload = btoa(JSON.stringify({
    iss:   FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')

  const unsigned = `${header}.${payload}`

  // Importar clave privada RSA
  const pemBody = PRIVATE_KEY_PEM.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '')
  const keyData = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0))
  const key = await crypto.subtle.importKey(
    'pkcs8', keyData.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  )

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', key,
    new TextEncoder().encode(unsigned)
  )
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  const jwt = `${unsigned}.${sigB64}`

  // Intercambiar JWT por access token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('No access token: ' + JSON.stringify(data))
  return data.access_token
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const allowed = ['https://app.ubipet.shop', 'https://www.ubipet.shop', 'http://localhost']
    const corsOrigin = allowed.some(o => origin.startsWith(o)) ? origin : allowed[0]
    const corsHeaders = {
      'Access-Control-Allow-Origin':  corsOrigin,
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })

    const url = new URL(request.url)

    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, service: 'ubipet-push-fcm' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (request.method === 'POST' && url.pathname === '/send') {
      let body
      try { body = await request.json() } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders })
      }

      const { user_id, title, body: msgBody, url: notifUrl } = body
      if (!user_id) {
        return new Response(JSON.stringify({ error: 'user_id requerido' }), { status: 400, headers: corsHeaders })
      }

      // Buscar FCM token en Supabase
      const subRes = await fetch(
        `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${user_id}&select=subscription&limit=1`,
        { headers: { 'apikey': env.SUPABASE_KEY, 'Authorization': 'Bearer ' + env.SUPABASE_KEY } }
      )
      const subs = await subRes.json()

      if (!subs?.length || !subs[0]?.subscription?.fcm_token) {
        return new Response(JSON.stringify({ ok: true, sent: 0, reason: 'no_token' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const fcmToken = subs[0].subscription.fcm_token

      try {
        const accessToken = await getAccessToken(env)

        const fcmRes = await fetch(
          `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT}/messages:send`,
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
                  fcm_options: { link: notifUrl || 'https://app.ubipet.shop/perfil.html' },
                  notification: {
                    icon:  'https://app.ubipet.shop/icon-192.png',
                    badge: 'https://app.ubipet.shop/icon-192.png',
                    requireInteraction: true,
                  }
                }
              }
            })
          }
        )
        const result = await fcmRes.json()
        console.log('FCM response:', JSON.stringify(result))
        return new Response(JSON.stringify({ ok: true, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch(err) {
        console.error('FCM error:', err.message)
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })
  }
}
