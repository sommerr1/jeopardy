// Service Worker для кэширования API запросов
const CACHE_NAME = 'jeopardy-api-cache-v1';
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// Список URL для кэширования
const CACHE_URLS = [
  '/.netlify/functions/questions?getsheets=1'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Кэшируем только запросы к API листов
  if (url.pathname.includes('/.netlify/functions/questions') && 
      url.searchParams.has('getsheets')) {
    
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            const cacheTime = cachedResponse.headers.get('sw-cache-time');
            const now = Date.now();
            
            // Проверяем, не устарел ли кэш
            if (cacheTime && (now - parseInt(cacheTime)) < API_CACHE_DURATION) {
              console.log('📋 Serving sheets list from cache');
              return cachedResponse;
            }
          }
          
          // Если кэша нет или он устарел, делаем запрос
          return fetch(event.request).then((response) => {
            if (response.ok) {
              // Клонируем ответ и добавляем время кэширования
              const responseToCache = response.clone();
              responseToCache.headers.set('sw-cache-time', Date.now().toString());
              
              cache.put(event.request, responseToCache);
              console.log('📋 Cached sheets list response');
            }
            return response;
          });
        });
      })
    );
  }
});
