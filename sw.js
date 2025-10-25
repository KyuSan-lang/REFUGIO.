// Nombre de la caché
const CACHE_NAME = 'refugio-v1';

// Archivos que se guardarán en caché para funcionar offline
// ¡Como nuestro JS y CSS están dentro del HTML, solo necesitamos cachear ese archivo!
const urlsToCache = [
    'app_refugio_completa.html'
];

// Evento de Instalación: Se dispara cuando el Service Worker se instala
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Abriendo caché y guardando archivos');
                // Agrega todos los archivos de urlsToCache a la caché
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // Forzar al nuevo Service Worker a activarse
                self.skipWaiting();
            })
    );
});

// Evento de Activación: Se dispara después de la instalación
self.addEventListener('activate', event => {
    console.log('Service Worker: Activando...');
    event.waitUntil(
        // Limpia cachés antiguas si las hay
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    // Borra cualquier caché que no sea la actual
                    return cacheName.startsWith('refugio-') && cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
    // Tomar control inmediato de la página
    return self.clients.claim();
});

// Evento Fetch: Se dispara cada vez que la página pide un recurso (CSS, JS, imagen, etc.)
self.addEventListener('fetch', event => {
    console.log('Service Worker: Buscando recurso ' + event.request.url);
    event.respondWith(
        // Estrategia "Cache First" (Primero caché):
        // 1. Intenta encontrar el recurso en la caché
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // 2. Si está en la caché, lo devuelve desde ahí
                    console.log('Service Worker: Encontrado en caché', event.request.url);
                    return response;
                }
                
                // 3. Si no está en la caché, va a internet a buscarlo
                console.log('Service Worker: No encontrado en caché, buscando en red', event.request.url);
                return fetch(event.request);
            })
            .catch(error => {
                // Manejo de errores (por si falla la red y no está en caché)
                console.error('Service Worker: Error al buscar', error);
                // Aquí podrías mostrar una página de "offline" si quisieras
            })
    );
});