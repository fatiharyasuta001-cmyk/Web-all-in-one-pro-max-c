/* PROJECT STUDIO F — service worker (offline). Naikkan VERSION saat memperbarui file. */
const VERSION='psf-v3',
CORE=['./','./index.html','./manifest.webmanifest','./config.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
const sameOrigin=u=>u.origin===location.origin;
// Hanya simpan respons sukses, same-origin ("basic"); tidak pernah menyimpan respons opaque/error.
const cacheable=res=>res&&res.ok&&res.type==='basic';
const put=(req,res)=>{if(cacheable(res)){const cp=res.clone();caches.open(VERSION).then(c=>c.put(req,cp)).catch(()=>{})}return res};
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;
 if(r.method!=='GET'||r.headers.has('range'))return;
 const u=new URL(r.url);
 if(!sameOrigin(u))return;
 const fresh=r.mode==='navigate'||u.pathname.endsWith('/config.json');
 if(fresh){
  e.respondWith(fetch(r).then(res=>put(r,res)).catch(async()=>(await caches.match(r))||(await caches.match('./index.html'))||(await caches.match('./'))||Response.error()));
  return;
 }
 e.respondWith(caches.match(r).then(m=>{
  const net=fetch(r).then(res=>put(r,res)).catch(()=>m);
  return m||net;
 }));
});
