(function(){
  const COLLECTIONS=['members','ideas','cycles','projects','progress'];
  let db=null, auth=null, ready=false, unsubscribers=[], reconnectTimer=null;
  let lastError=null, authUid=null;
  const remoteCache={members:[],ideas:[],cycles:[],projects:[],progress:[]};
  const cfg=()=>window.RND_FIREBASE_CONFIG||{};
  const configured=()=>Boolean(
    cfg().apiKey && !String(cfg().apiKey).startsWith('PASTE_') &&
    cfg().projectId && !String(cfg().projectId).startsWith('PASTE_') &&
    cfg().authDomain && !String(cfg().authDomain).startsWith('PASTE_')
  );

  const clean=(v)=>{
    if(Array.isArray(v)) return v.map(clean);
    if(v && typeof v==='object'){
      const out={};
      Object.entries(v).forEach(([k,val])=>{
        if(val===undefined || val===null || val==='') return;
        if(k.endsWith('_name') || k==='attachment_path') return;
        if(k==='attachment'){
          if(!val || typeof val!=='object') return;
          const meta={};
          ['name','type','size','storage_path','url'].forEach(key=>{
            if(val[key]!==undefined && val[key]!==null && val[key]!=='') meta[key]=val[key];
          });
          if(Object.keys(meta).length) out[k]=meta;
          return;
        }
        if(k==='data') return;
        out[k]=clean(val);
      });
      return out;
    }
    return v;
  };

  const errText=(e)=>{
    if(!e) return 'Unknown Firebase error';
    const code=e.code?String(e.code):'';
    const msg=e.message?String(e.message):String(e);
    return code?`${code}: ${msg}`:msg;
  };

  function makeSnapshot(){
    return {
      members:[...remoteCache.members],
      departments:[],
      ideas:[...remoteCache.ideas],
      cycles:[...remoteCache.cycles],
      projects:[...remoteCache.projects],
      progress:[...remoteCache.progress],
      schema_version:7,
      updated_at:new Date().toISOString()
    };
  }

  function status(){
    return {
      configured:configured(),
      sdk:Boolean(window.firebase),
      authenticated:Boolean(authUid),
      uid:authUid,
      connected:ready,
      projectId:cfg().projectId||'',
      error:lastError?errText(lastError):''
    };
  }

  function waitForAuthUser(timeoutMs=15000){
    return new Promise((resolve,reject)=>{
      let done=false;
      const timer=setTimeout(()=>{
        if(done)return; done=true;
        reject(new Error('Firebase Auth timed out. Check Anonymous sign-in and network access.'));
      },timeoutMs);
      const off=auth.onAuthStateChanged(user=>{
        if(done || !user)return;
        done=true;clearTimeout(timer);off();resolve(user);
      },err=>{
        if(done)return;done=true;clearTimeout(timer);off();reject(err);
      });
    });
  }

  async function init(force=false){
    if(ready && !force) return {enabled:true,user:authUid};
    lastError=null;
    if(!configured()){
      const e=new Error('Firebase config is missing or still contains placeholder values in firebase-config.js.');
      e.code='config/missing';lastError=e;
      return {enabled:false,reason:e.message,error:e};
    }
    if(!window.firebase){
      const e=new Error('Firebase SDK did not load from gstatic.com. Check internet/firewall/content blocker.');
      e.code='sdk/not-loaded';lastError=e;throw e;
    }
    try{
      if(!firebase.apps.length) firebase.initializeApp(cfg());
      auth=firebase.auth();
      db=firebase.firestore();

      // Corporate networks/proxies can block Firestore WebChannel. Auto long-polling
      // allows Firestore to fall back to a transport that works reliably on Vercel
      // deployments and restrictive office networks.
      try{
        db.settings({experimentalAutoDetectLongPolling:true,ignoreUndefinedProperties:true});
      }catch(e){
        // settings may already be frozen on a retry; safe to continue.
        if(!/already been started|settings can no longer/i.test(String(e?.message||''))) console.warn('Firestore settings',e);
      }

      try{ await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); }catch(e){console.warn('Auth persistence',e)}
      let user=auth.currentUser;
      if(!user){
        const credential=await auth.signInAnonymously();
        user=credential?.user||auth.currentUser;
      }
      if(!user) user=await waitForAuthUser();
      authUid=user?.uid||null;
      if(!authUid) throw new Error('Anonymous Firebase authentication did not return a user.');

      // First real Firestore read proves Auth + Rules + Firestore connectivity.
      await db.collection('members').limit(1).get({source:'server'});
      ready=true;
      return {enabled:true,user:authUid};
    }catch(e){
      ready=false;lastError=e;
      console.error('Firebase init failed',e);
      throw e;
    }
  }

  async function loadSnapshot(){
    if(!ready) return null;
    try{
      await Promise.all(COLLECTIONS.map(async name=>{
        const qs=await db.collection(name).get({source:'server'});
        remoteCache[name]=qs.docs.map(d=>{
          const data=d.data()||{};
          return {...data,id:data.id!==undefined?data.id:d.id};
        });
      }));
      lastError=null;
      return makeSnapshot();
    }catch(e){lastError=e;ready=false;throw e}
  }

  async function syncSnapshot(snapshot){
    if(!ready) return snapshot;
    for(const name of COLLECTIONS){
      const rows=Array.isArray(snapshot?.[name])?snapshot[name]:[];
      let batch=db.batch(), ops=0;
      const flush=async()=>{if(!ops)return;await batch.commit();batch=db.batch();ops=0;};
      for(const row of rows){
        if(row?.id===undefined || row?.id===null) continue;
        batch.set(db.collection(name).doc(String(row.id)),clean(row),{merge:true});
        ops++;
        if(ops>=400) await flush();
      }
      await flush();
    }
    return snapshot;
  }

  async function upsert(collection,row){
    if(!ready) await init(true);
    if(!COLLECTIONS.includes(collection)) throw new Error('Unsupported Firebase collection.');
    if(row?.id===undefined || row?.id===null) throw new Error('Record id is required.');
    try{
      await db.collection(collection).doc(String(row.id)).set(clean(row),{merge:true});
      lastError=null;ready=true;
      return row;
    }catch(e){lastError=e;ready=false;throw e}
  }

  function clearWatchers(){unsubscribers.forEach(fn=>{try{fn()}catch{}});unsubscribers=[];}

  function watch(onChange,onStatus){
    if(!ready || typeof onChange!=='function') return ()=>{};
    clearWatchers();
    let seen=0;
    const emit=()=>{
      seen++;
      ready=true;lastError=null;
      if(typeof onStatus==='function') onStatus({connected:true,seen});
      onChange(makeSnapshot());
    };
    COLLECTIONS.forEach(name=>{
      const unsub=db.collection(name).onSnapshot({includeMetadataChanges:true},qs=>{
        remoteCache[name]=qs.docs.map(d=>{
          const data=d.data()||{};
          return {...data,id:data.id!==undefined?data.id:d.id};
        });
        emit();
      },err=>{
        lastError=err;ready=false;
        console.error('Firebase live listener',name,err);
        if(typeof onStatus==='function') onStatus({connected:false,error:err,message:errText(err)});
      });
      unsubscribers.push(unsub);
    });
    return clearWatchers;
  }

  async function reconnect(onChange,onStatus){
    clearTimeout(reconnectTimer);
    try{
      const r=await init(true);
      if(!r.enabled) throw r.error||new Error(r.reason||'Firebase not enabled');
      const snapshot=await loadSnapshot();
      if(typeof onChange==='function'&&snapshot) onChange(snapshot);
      if(typeof onStatus==='function') onStatus({connected:true});
      if(typeof onChange==='function') watch(onChange,onStatus);
      return {ok:true,status:status()};
    }catch(e){
      if(typeof onStatus==='function') onStatus({connected:false,error:e,message:errText(e)});
      reconnectTimer=setTimeout(()=>reconnect(onChange,onStatus),15000);
      return {ok:false,error:errText(e),status:status()};
    }
  }

  async function test(){
    try{
      const r=await init(true);
      if(!r.enabled) return {ok:false,message:r.reason||'Firebase is not configured.',details:status()};
      await db.collection('members').limit(1).get({source:'server'});
      return {ok:true,message:`Firebase connected · Auth OK · Firestore OK · ${cfg().projectId}`,details:status()};
    }catch(e){
      lastError=e;
      return {ok:false,message:errText(e),details:status()};
    }
  }

  window.rndCloud={configured,init,loadSnapshot,syncSnapshot,upsert,watch,reconnect,test,status,get enabled(){return ready}};
})();
