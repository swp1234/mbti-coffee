const CACHE_NAME = 'mbti-coffee-v2';
const ASSETS = [
  '/mbti-coffee/',
  '/mbti-coffee/index.html',
  '/mbti-coffee/css/style.css?v=20260905-1',
  '/mbti-coffee/js/app.js?v=20260905-1',
  '/mbti-coffee/js/i18n.js?v=20260905-1',
  '/mbti-coffee/js/locales/ko.json?v=20260905-1',
  '/mbti-coffee/js/locales/en.json?v=20260905-1',
  '/mbti-coffee/js/locales/ja.json?v=20260905-1',
  '/mbti-coffee/js/locales/zh.json?v=20260905-1',
  '/mbti-coffee/js/locales/hi.json?v=20260905-1',
  '/mbti-coffee/js/locales/ru.json?v=20260905-1',
  '/mbti-coffee/js/locales/es.json?v=20260905-1',
  '/mbti-coffee/js/locales/pt.json?v=20260905-1',
  '/mbti-coffee/js/locales/id.json?v=20260905-1',
  '/mbti-coffee/js/locales/tr.json?v=20260905-1',
  '/mbti-coffee/js/locales/de.json?v=20260905-1',
  '/mbti-coffee/js/locales/fr.json?v=20260905-1',
  '/mbti-coffee/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
