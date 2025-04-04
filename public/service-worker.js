// Service Worker for FGWeather App
const CACHE_NAME = 'fgweather-v1.3.0';

// Resources to cache
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// Client-side routes that should serve index.html
const ROUTES = [
  '/settings',
  '/air-quality',
  '/alerts',
  '/about'
];

// API endpoints to cache
const API_CACHE_NAME = 'fgweather-api-v1.0.0';
const API_URLS = [
  'https://api.open-meteo.com/v1/forecast',
  'https://geocoding-api.open-meteo.com/v1/search',
  'https://air-quality-api.open-meteo.com/v1/air-quality'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheAllowlist = [CACHE_NAME, API_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheAllowlist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine if a request is an API call
const isApiRequest = (url) => {
  return API_URLS.some(apiUrl => url.startsWith(apiUrl));
};

// Helper function to check if a URL is a client-side route
const isClientRoute = (url) => {
  const urlObj = new URL(url);
  return ROUTES.some(route => urlObj.pathname === route || urlObj.pathname.startsWith(`${route}/`));
};

// Helper function to determine if we should use network-first strategy
const shouldUseNetworkFirst = (url) => {
  // For API requests and navigation requests, try network first
  return isApiRequest(url) || (url.startsWith(self.location.origin) && url.endsWith('/'));
};

// Helper to create a timed cache for API responses
const cacheApiResponse = (request, response) => {
  const clonedResponse = response.clone();
  
  // Only cache successful responses
  if (clonedResponse.status === 200) {
    caches.open(API_CACHE_NAME).then(cache => {
      cache.put(request, clonedResponse);
    });
  }
  
  return response;
};

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Skip non-GET requests or cross-origin requests except for our APIs
  if (event.request.method !== 'GET' || 
      (!url.startsWith(self.location.origin) && !isApiRequest(url))) {
    return;
  }
  
  // Handle client-side routes - return index.html
  if (isClientRoute(url)) {
    event.respondWith(
      caches.match('/index.html')
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch('/index.html');
        })
    );
    return;
  }
  
  // Network-first for API requests and navigation
  if (shouldUseNetworkFirst(url)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // For API requests, cache the response
          if (isApiRequest(url)) {
            return cacheApiResponse(event.request, response);
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
  } 
  // Cache-first for static assets
  else {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request)
            .then(response => {
              // Cache a copy of the response
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            });
        })
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Weather update available',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: {
        url: data.url || '/'
      },
      vibrate: [100, 50, 100],
      actions: [
        {
          action: 'view',
          title: 'View',
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'FGWeather Update', options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    // Open the app and navigate to the specified URL
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(windowClients => {
          // Check if there is already a window/tab open with the target URL
          for (let client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window/tab is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Listen for background sync to update data when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-weather') {
    event.waitUntil(
      // Sync the weather data when back online
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            message: 'Background sync completed'
          });
        });
      })
    );
  }
});

// Periodic background sync for weather updates (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'weather-update') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'WEATHER_UPDATE',
            message: 'Time to refresh weather data'
          });
        });
      })
    );
  }
}); 