const CACHE_NAME = 'zprompt-cache-v1.6.3';
const APP_SHELL = [
  './',
  './index.html',
  './template/',
  './template/index.html',
  './tentang/',
  './tentang/index.html',
  './dukungan/',
  './dukungan/index.html',
  './contoh.html',
  './about.html',
  './support.html',
  './style.css',
  './style.css?v=1.6.3',
  './script.js',
  './script.js?v=1.6.3',
  './page.js',
  './page.js?v=1.6.3',
  './library.js',
  './library.js?v=1.6.3',
  './support.js',
  './support.js?v=1.6.3',
  './robots.txt',
  './sitemap.xml',
  './manifest.webmanifest',
  './assets/logo.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable.png',
  './assets/favicon.png'
];

const OFFLINE_PAGE = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ZPrompt - Offline</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0d1f19;
      color: #e8e4db;
      padding: 2rem;
    }
    .offline-card {
      text-align: center;
      max-width: 420px;
      padding: 3rem 2rem;
      border-radius: 1.25rem;
      background: rgba(21, 61, 51, 0.5);
      border: 1px solid rgba(201, 164, 92, 0.2);
      backdrop-filter: blur(12px);
    }
    .offline-icon {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      margin: 0 auto 1rem;
      border-radius: 16px;
      background: #c9a45c;
      color: #0d1f19;
      font-weight: 900;
      font-size: 1.6rem;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 0.75rem;
      color: #c9a45c;
    }
    p {
      font-size: 1rem;
      line-height: 1.6;
      opacity: 0.85;
      margin-bottom: 1.5rem;
    }
    button {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 0.6rem;
      background: linear-gradient(135deg, #1f6b54, #153d33);
      color: #f4e8c4;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(31, 107, 84, 0.4);
    }
  </style>
</head>
<body>
  <div class="offline-card">
    <span class="offline-icon">Z</span>
    <h1>Kamu sedang offline</h1>
    <p>ZPrompt membutuhkan koneksi internet untuk memuat pertama kali. Coba lagi saat koneksi sudah tersedia.</p>
    <button onclick="location.reload()">Coba Lagi</button>
  </div>
</body>
</html>`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cache => {
        if (cache !== CACHE_NAME) return caches.delete(cache);
        return undefined;
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});

async function putInCache(request, response) {
  if (!response || response.status !== 200) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    await putInCache(request, networkResponse);
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response(OFFLINE_PAGE, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      await putInCache(request, networkResponse);
      return networkResponse;
    })
    .catch(() => cachedResponse || new Response('', { status: 503, statusText: 'Offline' }));

  return cachedResponse || fetchPromise;
}
