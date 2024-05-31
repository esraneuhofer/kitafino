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
  // Your logic to fetch the latest posts goes here
  console.log('[Service Worker] Fetching latest posts...');
  try {
    const response = await fetch('/api/latest-posts');
    const data = await response.json();
    console.log('Latest posts fetched:', data);
  } catch (error) {
    console.error('Error fetching latest posts:', error);
  }
}

// Define CACHE_NAME and urlsToCache
const CACHE_NAME = 'my-app-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  // Add other URLs to cache here
];

// Service Worker Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting()) // Activate the new Service Worker immediately
  );
});

// Service Worker Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) { // Adjust CACHE_NAME to your cache version
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Become available to all pages
    }).then(() => {
      // Reload all open clients to use the new Service Worker
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.navigate(client.url));
      });
    })
  );
});

// Fetch Event: First check the cache, then the network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
