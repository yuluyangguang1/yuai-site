/* yuai-r.cn 服务工作者。
   网络优先：本站多个 JS/CSS 产物用固定文件名原地覆盖，缓存优先会把旧代码钉在客户端。
   缓存只用于断网回退。/mom/ 与 /novelweave/ 是独立应用，一律直通不缓存。
   急停：把 DISABLED 改成 true 重新部署（或在浏览器 devtools 里注销）。 */
var DISABLED = false;
var CACHE = 'yuai-static-v1';
var MAX = 160;
var BYPASS = ['/mom/', '/novelweave/'];
var SHELL = ['/', '/fortune/', '/manifest.webmanifest', '/fortune/manifest.webmanifest', '/icons/yuai-512.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(SHELL.map(function (u) { return c.add(u); })); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (DISABLED || !req || req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/sw.js') return;
  for (var i = 0; i < BYPASS.length; i++) if (url.pathname.indexOf(BYPASS[i]) === 0) return;
  e.respondWith(networkFirst(req, url));
});

function networkFirst(req, url) {
  return fetch(req).then(function (res) {
    if (res && res.status === 200 && res.type === 'basic') {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { return c.put(req, copy); }).then(trim).catch(function () {});
    }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (hit) {
      if (hit) return hit;
      if (req.mode === 'navigate') {
        return caches.match(url.pathname.indexOf('/fortune') === 0 ? '/fortune/' : '/')
          .then(function (shell) { return shell || Response.error(); });
      }
      return Response.error();
    });
  });
}

/* 容量控制：Cache 按写入顺序排列，超出上限先删最老的。 */
function trim() {
  return caches.open(CACHE).then(function (c) {
    return c.keys().then(function (keys) {
      if (keys.length <= MAX) return;
      return Promise.all(keys.slice(0, keys.length - MAX).map(function (k) { return c.delete(k); }));
    });
  }).catch(function () {});
}
