/**
 * Linger · 余温 — PWA Service Worker
 *
 * 纯静态站点，缓存所有资源。
 * - 首次打开：下载全部资产
 * - 之后打开：即时加载，无网络也能用（无 API Key 时走 fallback 回复）
 */
const CACHE_NAME = 'linger-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/style.css?v=14',
  './src/app.js?v=15',
  './src/local-store.js?v=1',
  './src/llm-client.js?v=1',
  './src/onboarding.js?v=1',
  './src/data-backup.js?v=1',
  './src/chat-engine.js',
  './src/pages.js',
  './src/liquid-glass.css',
  // 图标
  './src/assets/logo-icon-128.jpg',
  './src/assets/logo-full.png',
  './src/assets/logo-icon.svg',
  './src/assets/logo-symbol-32.png',
  './src/assets/logo-symbol-64.png',
  // PWA 图标
  './src/assets/pwa/icon-192.png',
  './src/assets/pwa/icon-512.png',
  // Tab 图标
  './src/assets/icons/他们.png',
  './src/assets/icons/在一起.png',
  './src/assets/icons/我的.png',
  './src/assets/icons/数字怀念.png',
  './src/assets/icons/陪伴.png',
  // 角色头像（全部缓存）
  './src/assets/avatars/gf_gentle.jpg',
  './src/assets/avatars/gf_gentle_full.jpg',
  './src/assets/avatars/gf_gentle.svg',
  './src/assets/avatars/gf_bubbly.jpg',
  './src/assets/avatars/gf_bubbly_full.jpg',
  './src/assets/avatars/gf_bubbly.svg',
  './src/assets/avatars/gf_tsundere.jpg',
  './src/assets/avatars/gf_tsundere_full.jpg',
  './src/assets/avatars/gf_tsundere.svg',
  './src/assets/avatars/gf_intellectual.jpg',
  './src/assets/avatars/gf_intellectual_full.jpg',
  './src/assets/avatars/gf_intellectual.svg',
  './src/assets/avatars/bf_sunny.jpg',
  './src/assets/avatars/bf_sunny_full.jpg',
  './src/assets/avatars/bf_sunny.svg',
  './src/assets/avatars/bf_cold.jpg',
  './src/assets/avatars/bf_cold_full.jpg',
  './src/assets/avatars/bf_cold.svg',
  './src/assets/avatars/bf_steady.jpg',
  './src/assets/avatars/bf_steady_full.jpg',
  './src/assets/avatars/bf_young.jpg',
  './src/assets/avatars/bf_young_full.jpg',
  './src/assets/avatars/pet_cat.svg',
  './src/assets/avatars/pet_dog.svg',
  './src/assets/avatars/memorial.svg',
];

// ── Install: 预缓存全部资源 ──
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: 清理旧缓存 ──
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// ── Fetch: 缓存优先策略 ──
self.addEventListener('fetch', (e) => {
  // 不缓存 LLM API 请求
  if (e.request.url.includes('/chat/completions') ||
      e.request.url.includes('api.') ||
      e.request.url.includes('unpkg.com')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // 缓存优先
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      });
    })
  );
});
