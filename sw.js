// Service worker LIFE RPG — cache-first dla powloki apki, zeby dzialala offline.
// Uwaga: SW rejestruje sie TYLKO w bezpiecznym kontekscie (https albo localhost).
// Po LAN-owym http:// przegladarka go zignoruje — apka dalej dziala, tylko bez offline.
const CACHE = 'liferpg-v12';
const SHELL = ['./', './index.html', './fonts.css', './manifest.webmanifest', './apple-touch-icon-180.png', './icon-192.png', './icon-512.png', './life-rpg-icon.svg',
  './fonts/Inter-400-00.woff2', './fonts/Inter-400-01.woff2', './fonts/Inter-500-02.woff2', './fonts/Inter-500-03.woff2', './fonts/Inter-600-04.woff2', './fonts/Inter-600-05.woff2', './fonts/Inter-700-06.woff2', './fonts/Inter-700-07.woff2', './fonts/NotoEmoji-400-08.woff2', './fonts/NotoEmoji-400-09.woff2', './fonts/NotoEmoji-400-10.woff2', './fonts/NotoEmoji-400-11.woff2', './fonts/NotoEmoji-400-12.woff2', './fonts/NotoEmoji-400-13.woff2', './fonts/NotoEmoji-400-14.woff2', './fonts/NotoEmoji-400-15.woff2', './fonts/NotoEmoji-400-16.woff2', './fonts/NotoEmoji-400-17.woff2', './fonts/NotoEmoji-700-18.woff2', './fonts/NotoEmoji-700-19.woff2', './fonts/NotoEmoji-700-20.woff2', './fonts/NotoEmoji-700-21.woff2', './fonts/NotoEmoji-700-22.woff2', './fonts/NotoEmoji-700-23.woff2', './fonts/NotoEmoji-700-24.woff2', './fonts/NotoEmoji-700-25.woff2', './fonts/NotoEmoji-700-26.woff2', './fonts/NotoEmoji-700-27.woff2', './fonts/SpaceGrotesk-500-28.woff2', './fonts/SpaceGrotesk-500-29.woff2', './fonts/SpaceGrotesk-600-30.woff2', './fonts/SpaceGrotesk-600-31.woff2', './fonts/SpaceGrotesk-700-32.woff2', './fonts/SpaceGrotesk-700-33.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Siec najpierw, cache jako zapas — zeby swieza wersja pliku wchodzila od razu,
// ale brak sieci nie blokowal uzycia.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./')))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(ws => ws.length ? ws[0].focus() : clients.openWindow('./')));
});
