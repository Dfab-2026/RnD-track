/* DFAB Tracker background notification service worker. */
importScripts('./firebase-config.js');
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');

const cfg=self.RND_FIREBASE_CONFIG||{};
const configured=cfg.apiKey&&!/^PASTE_/i.test(String(cfg.apiKey))&&cfg.messagingSenderId&&!/^PASTE_/i.test(String(cfg.messagingSenderId));
if(configured){
  try{
    if(!firebase.apps.length)firebase.initializeApp(cfg);
    const messaging=firebase.messaging();
    messaging.onBackgroundMessage(payload=>{
      const n=payload?.notification||{},data=payload?.data||{};
      return self.registration.showNotification(n.title||data.title||'DFAB Tracker',{body:n.body||data.body||'New tracker notification',icon:'assets/dfab-logo.png',badge:'assets/dfab-logo.png',tag:data.tag||'dfab-tracker-push',data:{url:data.url||'./'}});
    });
  }catch(e){console.warn('FCM service worker init failed',e)}
}
self.addEventListener('push',event=>{
  if(configured)return;
  let data={};try{data=event.data?.json?.()||{}}catch{data={body:event.data?.text?.()||''}}
  const n=data.notification||data;
  event.waitUntil(self.registration.showNotification(n.title||'DFAB Tracker',{body:n.body||'New tracker notification',icon:'assets/dfab-logo.png',badge:'assets/dfab-logo.png',tag:n.tag||'dfab-tracker-push',data:{url:n.url||'./'}}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();const url=event.notification?.data?.url||'./';event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list){if('focus'in c){c.navigate?.(url).catch?.(()=>{});return c.focus()}}return clients.openWindow(url)}))});
