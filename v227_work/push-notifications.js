(()=>{
  'use strict';
  const cfg=()=>globalThis.RND_FIREBASE_CONFIG||{};
  const pushCfg=()=>globalThis.RND_FIREBASE_PUSH_CONFIG||{};
  const placeholder=v=>!v||/^PASTE_|YOUR_|REPLACE_/i.test(String(v));
  const supported=()=>('serviceWorker' in navigator)&&('Notification' in window)&&window.firebase?.messaging?.isSupported?.()!==false;
  async function worker(){if(!('serviceWorker' in navigator))throw new Error('Service workers are not supported in this browser.');return navigator.serviceWorker.register('./notification-sw.js',{scope:'./'});}
  async function persistToken(token){
    if(!token)return false;
    const init=await window.rndCloud?.init?.();if(!init?.enabled)throw new Error('Firebase must be connected before push notifications can be enabled.');
    const uid=window.firebase.auth().currentUser?.uid;if(!uid)throw new Error('Firebase user is not ready.');
    const db=window.firebase.firestore(),ref=db.collection('app_meta').doc(`push_${uid}`);
    const actor=window.adminSession?.name?.()||document.querySelector('#currentUserName')?.textContent||'';
    await ref.set({kind:'push_subscription',u:uid,t:token,n:String(actor||'').trim().slice(0,80),a:true,d:navigator.userAgent.slice(0,180),x:Date.now()},{merge:true});
    await db.waitForPendingWrites?.();const confirmed=await ref.get({source:'server'});if(!confirmed.exists)throw new Error('Firebase did not confirm the push subscription.');
    localStorage.setItem('rnd_fcm_token_saved','1');return true;
  }
  async function enable(){
    if(!supported())throw new Error('Chrome push notifications are not supported on this browser/device.');
    if(placeholder(cfg().messagingSenderId)||placeholder(cfg().appId)||placeholder(pushCfg().vapidKey))throw new Error('Add Firebase Messaging sender/app values and the Web Push VAPID public key first.');
    const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();if(permission!=='granted')throw new Error('Chrome notification permission was not granted.');
    const reg=await worker();
    const messaging=window.firebase.messaging();
    const token=await messaging.getToken({vapidKey:pushCfg().vapidKey,serviceWorkerRegistration:reg});if(!token)throw new Error('Firebase did not return a browser push token.');
    await persistToken(token);
    messaging.onMessage(payload=>{const n=payload?.notification||{},data=payload?.data||{};reg.showNotification(n.title||data.title||'DFAB Tracker',{body:n.body||data.body||'New tracker notification',icon:'assets/dfab-logo.png',badge:'assets/dfab-logo.png',tag:data.tag||'dfab-tracker-push',data:{url:data.url||'./'}}).catch(()=>{});});
    return token;
  }
  async function status(){return{supported:supported(),permission:'Notification' in window?Notification.permission:'unsupported',configured:!placeholder(cfg().messagingSenderId)&&!placeholder(cfg().appId)&&!placeholder(pushCfg().vapidKey),registered:localStorage.getItem('rnd_fcm_token_saved')==='1'}}
  window.rndPush={enable,status,worker};
})();
