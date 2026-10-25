const CACHE_NAME = 'arhiva-uaic-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/materiale.html',
  '/locatii.html',
  '/incarca.html'
];

// Instalarea Service Worker-ului și salvarea fișierelor principale
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Interceptarea cererilor pentru a încărca instantaneu paginile deja vizitate
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});