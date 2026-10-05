import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { createHash } from 'node:crypto'

function offlineAssets() {
  return {
    name: 'kinderwelt-offline-assets',
    closeBundle() {
      const dist = join(process.cwd(), 'dist')
      function files(directory: string): string[] {
        return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
          const path = join(directory, entry.name)
          return entry.isDirectory() ? files(path) : [relative(dist, path).replaceAll('\\', '/')]
        })
      }
      const assets = files(dist).filter(file => file !== 'sw.js')
      const version = createHash('sha256').update(assets.join('|')).digest('hex').slice(0, 12)
      const source = `const CACHE = 'kinderwelt-${version}';
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(path => new URL(path, self.registration.scope).toString()))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('kinderwelt-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    } catch {
      if (event.request.mode === 'navigate') return cache.match(new URL('index.html', self.registration.scope).toString());
      return Response.error();
    }
  }));
});`
      writeFileSync(join(dist, 'sw.js'), source)
    },
  }
}

export default defineConfig({ base: './', plugins: [react(), offlineAssets()] })
