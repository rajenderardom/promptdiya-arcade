/* Prompt Diya Arcade service worker.
   - Same-origin HTML: network-first, cache fallback (updates show quickly).
   - Same-origin static files: cache-first (background refresh for next visit).
   - Cross-origin (ads e.g. bauval.org, analytics, anything else): NOT intercepted at all. */
var VERSION = 'pd-arcade-v15';
var GAMES = ['juicy-slice','2048','snake','bubble-shooter','racing','flap','stack','block-puzzle','sudoku','ludo','runner','match3','patang','cricket','golgappa','patakha','diya-jalao','flare-ace','zone-royale'];
var PRECACHE = ['/', '/share.js', '/fullscreen.js', '/ads.js', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png', '/icons/apple-touch-icon.png'
].concat(GAMES.map(function (g) { return '/' + g + '/'; }));

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    // add one by one so a single missing file never breaks install
    return Promise.all(PRECACHE.map(function (u) {
      return fetch(u, { cache: 'reload' }).then(function (r) { if (r.ok) return c.put(u, r); }).catch(function () {});
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('pd-arcade-') === 0 && k !== VERSION; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function isHTML(req) {
  return req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1;
}
function keyFor(url) { // /ludo/index.html -> /ludo/ ; drop query/hash
  var p = url.pathname.replace(/index\.html$/, '');
  return p;
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // ads & all third parties: untouched
  if (url.pathname === '/sw.js') return;

  if (isHTML(req)) {
    var key = keyFor(url);
    e.respondWith(fetch(req).then(function (r) {
      if (r && r.ok && r.type === 'basic') {
        var copy = r.clone();
        caches.open(VERSION).then(function (c) { c.put(key, copy); });
      }
      return r;
    }).catch(function () {
      return caches.match(key).then(function (m) { return m || caches.match('/'); });
    }));
    return;
  }

  // cache-first; refresh the cached copy in the background so the next visit gets updates
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (m) {
    var net = fetch(req).then(function (r) {
      if (r && r.ok && r.type === 'basic') {
        var copy = r.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
      }
      return r;
    });
    if (m) { e.waitUntil(net.catch(function () {})); return m; }
    return net;
  }));
});
