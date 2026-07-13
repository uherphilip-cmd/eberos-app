'use strict';
const CACHE='eberos-pwa-v1.7.4-r5';
const OFFLINE='./eberos-charakter-builder.html';
const ASSETS=['./','./index.html',OFFLINE,'./manifest.webmanifest','./data/eberos-items-anfaenger-v1.2.js','./data/eberos-items-anfaenger-v1.2.json','./icons/eberos-icon.svg','./icons/eberos-icon-180.png','./icons/eberos-icon-192.png','./icons/eberos-icon-512.png','./assets/ornaments/waldkrone.jpg','./assets/ornaments/sternenarchiv.jpg','./assets/ornaments/blutmond.jpg','./assets/ornaments/frostmeer.jpg','./assets/ornaments/feenhof.jpg','./assets/ornaments/tintenchronik.jpg','./assets/ornaments/magus.jpg','./assets/ornaments/glaube.jpg','./assets/ornaments/finsternis.jpg','./assets/ornaments/royal.jpg','./assets/ornaments/drachenglut.jpg','./assets/ornaments/wuestenorakel.jpg','./assets/ornaments/tiefenreich.jpg','./assets/ornaments/runenschmiede.jpg','./assets/ornaments/traumweber.jpg'];

self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(OFFLINE,copy));return response}).catch(()=>caches.match(OFFLINE)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response?.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response})));
});
