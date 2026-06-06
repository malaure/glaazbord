interface Env {
  DB: D1Database
  AUTH_PASSWORD: string
}

const COOKIE = 'gb_auth'
const SALT = 'glaazboard-v1'

// Dérive un token HMAC-SHA256 à partir du mot de passe
async function makeToken(password: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return crypto.subtle.sign('HMAC', keyMaterial, enc.encode(SALT))
}

// Comparaison en temps constant — empêche les timing attacks
async function timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): Promise<boolean> {
  if (a.byteLength !== b.byteLength) return false
  const va = new Uint8Array(a)
  const vb = new Uint8Array(b)
  let diff = 0
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i]
  return diff === 0
}

function bufferToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function base64ToBuffer(str: string): ArrayBuffer {
  const binary = atob(str)
  const buf = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i)
  return buf.buffer
}

// Délai artificiel pour ralentir le brute-force (200ms)
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",   // unsafe-inline requis pour Vite bundle
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
].join('; ')

function loginPage(error?: string): Response {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>GlaazBoard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Inter,system-ui,sans-serif;background:#F8F8FB;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .card{background:white;border-radius:16px;padding:40px;width:100%;max-width:360px;box-shadow:0 4px 24px rgba(0,0,0,0.07);border:1px solid #EBEBF0}
    .logo{display:flex;align-items:center;gap:10px;margin-bottom:32px}
    .logo-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#8B6FE8,#5B9BF0);display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:14px;flex-shrink:0}
    .logo-name{font-size:15px;font-weight:600;color:#1A1A2E}
    .logo-sub{font-size:11px;color:#8888A0}
    h1{font-size:17px;font-weight:500;color:#1A1A2E;margin-bottom:4px}
    .subtitle{font-size:13px;color:#8888A0;margin-bottom:24px}
    label{display:block;font-size:12px;font-weight:500;color:#8888A0;margin-bottom:5px}
    input[type=password]{width:100%;padding:9px 12px;border:1px solid #EBEBF0;border-radius:8px;font-size:14px;font-family:inherit;outline:none;transition:border-color .15s,box-shadow .15s;color:#1A1A2E}
    input[type=password]:focus{border-color:#8B6FE8;box-shadow:0 0 0 3px rgba(139,111,232,.12)}
    .error{font-size:12px;color:#F07048;margin-top:10px}
    button{width:100%;padding:10px;border:none;border-radius:8px;background:linear-gradient(135deg,#8B6FE8,#5B9BF0);color:white;font-size:14px;font-weight:500;font-family:inherit;cursor:pointer;margin-top:16px;transition:opacity .15s}
    button:hover{opacity:.88}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-icon">G</div>
      <div>
        <div class="logo-name">GlaazBoard</div>
        <div class="logo-sub">GLAAZ</div>
      </div>
    </div>
    <h1>Connexion</h1>
    <p class="subtitle">Accès privé</p>
    <form method="POST" action="/__login">
      <label for="pwd">Mot de passe</label>
      <input type="password" id="pwd" name="password" autofocus autocomplete="current-password">
      ${error ? `<p class="error">${error}</p>` : ''}
      <button type="submit">Entrer</button>
    </form>
  </div>
</body>
</html>`
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Content-Security-Policy': CSP,
      'X-Frame-Options': 'DENY',
      'Cache-Control': 'no-store',
    },
  })
}

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const password = env.AUTH_PASSWORD

  // Dev local sans variable d'env = pas de protection
  if (!password) return next()

  const url = new URL(request.url)

  // Déconnexion — supprime le cookie et redirige vers login
  if (url.pathname === '/__logout') {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
        'Cache-Control': 'no-store',
      },
    })
  }

  // Formulaire de login (POST uniquement)
  if (url.pathname === '/__login') {
    if (request.method !== 'POST') return Response.redirect(new URL('/', url).href, 302)

    const form = await request.formData()
    const submitted = (form.get('password') as string | null) ?? ''

    // Comparaison en temps constant via HMAC des deux chaînes
    const [tokenSubmitted, tokenExpected] = await Promise.all([
      makeToken(submitted),
      makeToken(password),
    ])
    const ok = await timingSafeEqual(tokenSubmitted, tokenExpected)

    if (ok) {
      const sessionToken = bufferToBase64(tokenExpected)
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
          // 90 jours — HttpOnly empêche l'accès JS, Secure = HTTPS uniquement, SameSite=Strict = anti-CSRF
          'Set-Cookie': `${COOKIE}=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=7776000`,
          'Cache-Control': 'no-store',
        },
      })
    }

    // Délai anti-brute-force sur échec (200ms suffit à rendre l'attaque non-scalable)
    await delay(200)
    return loginPage('Mot de passe incorrect.')
  }

  // Vérification du cookie sur toutes les autres routes (y compris /api/*)
  const cookies = request.headers.get('Cookie') ?? ''
  const sessionToken = cookies
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(COOKIE + '='))
    ?.slice(COOKIE.length + 1)

  if (sessionToken) {
    try {
      const tokenExpected = await makeToken(password)
      const tokenFromCookie = base64ToBuffer(sessionToken)
      const valid = await timingSafeEqual(tokenFromCookie, tokenExpected)
      if (valid) return next()
    } catch {
      // Cookie malformé → retour login
    }
  }

  return loginPage()
}
