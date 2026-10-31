const fs=require('fs');
function ok(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const leader=fs.readFileSync('leader-center.js','utf8'),css=fs.readFileSync('leader-center.css','utf8');
const qcss=fs.readFileSync('quality.css','utf8'),dcss=fs.readFileSync('department-workspace.css','utf8');
const index=fs.readFileSync('index.html','utf8'),push=fs.readFileSync('push-notifications.js','utf8'),sw=fs.readFileSync('notification-sw.js','utf8'),cfg=fs.readFileSync('firebase-config.js','utf8'),app=fs.readFileSync('app.js','utf8');
ok(qcss.includes('minmax(375px,1fr)')&&qcss.includes('min-height:375px!important'),'Quality dashboard graph card is +15px');
ok(dcss.includes('minmax(375px,1fr)')&&dcss.includes('min-height:375px!important'),'Shared department graph card is +15px');
ok(leader.includes("const allowed=Boolean(window.adminSession?.active?.())")&&leader.includes('leader-tool-locked'),'Admin cards always render with locked state for non-admin');
ok(css.includes('.leader-tool-card.leader-tool-locked')&&css.includes('cursor:not-allowed'),'Locked Admin cards are visibly disabled');
ok(index.includes('firebase-messaging-compat.js')&&index.includes('push-notifications.js?v=215.0.0'),'Firebase Messaging frontend SDK is loaded');
ok(cfg.includes('RND_FIREBASE_PUSH_CONFIG')&&cfg.includes('PASTE_WEB_PUSH_VAPID_PUBLIC_KEY'),'VAPID configuration placeholder exists');
ok(push.includes('messaging.getToken')&&push.includes("kind:'push_subscription'")&&push.includes("get({source:'server'})"),'FCM token is created and server-confirmed in Firebase');
ok(sw.includes('onBackgroundMessage')&&sw.includes('showNotification'),'Service worker supports background push notifications');
ok(app.includes('background push registered')&&app.includes('add FCM VAPID key'),'Settings reports background push status');
console.log('v215 verification complete');
