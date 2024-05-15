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
