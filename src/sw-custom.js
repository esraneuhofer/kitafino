import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// NetworkFirst strategy for API calls
registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new NetworkFirst()
);

// Background Sync for failed API calls
const bgSyncPlugin = new BackgroundSyncPlugin('post-queue', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
});

registerRoute(
  /\/api\/.*\/*.json/,
  new NetworkFirst({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

// Periodic Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-posts') {
    event.waitUntil(getLatestPosts());
  }
});

async function getLatestPosts() {
  console.log('[Service Worker] Fetching latest posts...');
  try {
    const response = await fetch('/api/latest-posts');
    const data = await response.json();
    console.log('Latest posts fetched:', data);
  } catch (error) {
    console.error('Error fetching latest posts:', error);
  }
}

const CACHE_NAME = 'my-app-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  // Add other URLs to cache here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: First check the cache, then the network with Debugging
self.addEventListener('fetch', (event) => {
  // Ignore WebSocket requests
  if (event.request.url.startsWith('ws://')) {
    console.log('[Service Worker] Ignoring WebSocket request:', event.request.url);
    return;
  }

  console.log('Fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('Cache hit:', event.request.url);
        return response;
      }
      console.log('Network request for:', event.request.url);
      return fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.indexOf('http') === 0) {
            console.log('[Service Worker] Caching new resource:', event.request.url);
            cache.put(event.request.url, response.clone());
          }
          return response;
        });
      });
    }).catch((error) => {
      console.error('Fetch error:', error);
      throw error;
    })
  );
});
