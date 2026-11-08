const V='cashflow-v194';const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!=='cf-logos').map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const U=new URL(e.request.url);if(e.request.method==='GET'&&U.hostname==='www.google.com'&&U.pathname.startsWith('/s2/favicons')){e.respondWith(caches.open('cf-logos').then(c=>c.match(e.request).then(h=>h||fetch(e.request,{mode:'no-cors'}).then(r=>{if(r.ok||r.type==='opaque')c.put(e.request,r.clone());return r}))));return}
  if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
  const nav=e.request.mode==='navigate'||/\/(index\.html)?(\?.*)?$/.test(new URL(e.request.url).pathname);
  e.respondWith(fetch(nav?new Request(e.request.url,{cache:'no-store'}):e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:'CashFlow',body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'CashFlow',{body:d.body||'',tag:d.tag||undefined,icon:'./icon-192.png',badge:'./icon-192.png',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{const N=e.notification;N.close();const msg={tag:N.tag||'',title:N.title||'',body:N.body||''};const u=((N.data&&N.data.url)||'./').split('?')[0]+'?n='+encodeURIComponent(JSON.stringify(msg));
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{for(const c of L){if('focus' in c){try{c.postMessage({cfNotif:msg})}catch(_){}return c.focus()}}return self.clients.openWindow(u)}))});
