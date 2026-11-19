/* BVN API offline resources, scoped to this documentation site */
const RUNTIME = 'bvn-api-offline-v1';
const SCOPE = self.registration.scope;
const LOCALES = ['en-us', 'vi-vn', 'it-it'];
const SIDEBARS = ['_sidebar.md'].concat(LOCALES.map(locale => locale + '/_sidebar.md'));
const ASSETS = [
  './', 'index.html', 'README.md', '_coverpage.md', '_sidebar.md', '_404.md', 'about.md',
  'favicon.png', 'assets/bvn-icon-base.png',
  'css/theme-simple.css', 'css/theme-simple-dark.css', 'css/home.css', 'css/tools.css',
  'js/theme.js', 'js/search-aliases.js', 'js/search.min.js',
  'js/docsify-copy-code.min.js', 'js/docsify-pagination.min.js',
  'tools/defineAction.html', 'tools/fire.html', 'tools/addAttacker.html',
  'tools/generators.js', 'tools/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/docsify/4.13.1/docsify.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/components/prism-actionscript.min.js'
].concat(LOCALES.flatMap(locale => ['README.md', '_coverpage.md', '_sidebar.md', '_404.md'].map(file => locale + '/' + file)));

function assetUrl(path) {
  return new URL(path, SCOPE).href;
}

function cacheKey(request) {
  const url = new URL(request.url);
  url.searchParams.delete('cache-bust');
  return url.href;
}

function documentPages(sidebar) {
  const paths = Array.from(sidebar.matchAll(/\]\(([^)#?\s]+)(?:[?#][^)]*)?\)/g), match => match[1]);
  return Array.from(new Set(paths.filter(path => !/^(?:[a-z]+:|\/)/i.test(path)).map(path => assetUrl(path.endsWith('.md') ? path : path + '.md'))));
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(RUNTIME);
    await cache.addAll(ASSETS.map(assetUrl));
    const sidebars = await Promise.all(SIDEBARS.map(async path => (await cache.match(assetUrl(path))).text()));
    const pages = Array.from(new Set(sidebars.flatMap(documentPages)));
    // Translation sidebars can list pages that have not been written yet
    await Promise.all(pages.map(async url => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) await cache.put(url, response);
      } catch (error) { /* Visited pages can still be cached on a later request */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || !/^https?:$/.test(url.protocol)) return;
  if (url.origin !== self.location.origin && url.hostname !== 'cdnjs.cloudflare.com') return;

  const cachePromise = caches.open(RUNTIME);
  const cached = cachePromise.then(async cache => {
    const response = await cache.match(cacheKey(request));
    if (response) return response;
    if (request.mode === 'navigate') return cache.match(assetUrl('index.html'));
  });
  const network = fetch(request, { cache: 'no-store' });
  // Keep the cache update alive even if the page closes immediately after navigation
  event.waitUntil(network.then(async response => {
    if (response.ok || response.type === 'opaque') {
      await (await cachePromise).put(cacheKey(request), response.clone());
    }
  }).catch(() => {}));

  // Return stored resources without waiting for a slow or disconnected network
  const fallback = network.catch(() => Response.error());
  event.respondWith(cached.then(response => response || fallback));
});
