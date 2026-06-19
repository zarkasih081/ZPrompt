const CACHE_NAME = 'zprompt-cache-v10';
const APP_SHELL = [
  './',
  './index.html',
  './contoh.html',
  './style.css',
  './script.js',
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
  <title>ZPrompt — Offline</title>
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
      font-size: 3.5rem;
      margin-bottom: 1rem;
      display: block;
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
    <span class="offline-icon">📡</span>
    <h1>Kamu sedang offline</h1>
    <p>ZPrompt membutuhkan koneksi internet untuk memuat pertama kali. Coba lagi saat koneksi sudah tersedia.</p>
    <button onclick="location.reload()">Coba Lagi</button>
  </div>
</body>
</html>`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed and no cache — return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return new Response(OFFLINE_PAGE, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }
        // For non-navigation requests (CSS, JS, images) return empty 503
        return new Response('', { status: 503, statusText: 'Offline' });
      });

      return cachedResponse || fetchPromise;
    })
  );
});
