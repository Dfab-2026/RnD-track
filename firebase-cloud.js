(function(){
  // Departments are a fixed application master and are intentionally NOT written
  // to Firestore. Firestore rules keep /departments read-only, so syncing that
  // collection would make normal saves fail.
  const COLLECTIONS=['members','ideas','cycles','projects','progress'];
  let db=null, auth=null, ready=false, baseline={}, unsubscribers=[], remoteTimer=null;
  const cfg=()=>window.RND_FIREBASE_CONFIG||{};
  const configured=()=>cfg().apiKey && !String(cfg().apiKey).startsWith('PASTE_') && cfg().projectId && !String(cfg().projectId).startsWith('PASTE_');

  const clean=(v)=>{
    if(Array.isArray(v)) return v.map(clean);
    if(v && typeof v==='object'){
      const out={};
      Object.entries(v).forEach(([k,val])=>{
        if(val===undefined || val===null || val==='') return;
        if(k.endsWith('_name') || k==='attachment_path') return;
        // Attachments remain in IndexedDB on the current device while Firebase
        // Storage is not enabled. Never send base64/binary data into Firestore.
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

  const stable=(v)=>JSON.stringify(clean(v));

  async function init(){
    if(!configured()) return {enabled:false,reason:'Firebase config not added yet'};
    if(!window.firebase) throw new Error('Firebase SDK did not load. Check internet connection.');
    if(!firebase.apps.length) firebase.initializeApp(cfg());
    db=firebase.firestore();
    auth=firebase.auth();
    try{ await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); }catch{}
    if(!auth.currentUser) await auth.signInAnonymously();
    try{ await db.enablePersistence({synchronizeTabs:true}); }catch(e){
      if(!['failed-precondition','unimplemented'].includes(e.code)) console.warn(e);
    }
    ready=true;
    return {enabled:true,user:auth.currentUser?.uid||null};
  }

  async function loadSnapshot(){
    if(!ready) return null;
    const snap={members:[],departments:[],ideas:[],cycles:[],projects:[],progress:[],schema_version:4,updated_at:new Date().toISOString()};
    for(const name of COLLECTIONS){
      const qs=await db.collection(name).get();
      snap[name]=qs.docs.map(d=>d.data());
      baseline[name]=Object.fromEntries(snap[name].map(x=>[String(x.id),stable(x)]));
    }
    return snap;
  }

  async function syncSnapshot(snapshot){
    if(!ready) return snapshot;
    for(const name of COLLECTIONS){
      const rows=snapshot[name]||[];
      const old=baseline[name]||{};
      const now={};
      let batch=db.batch(), ops=0;
      const flush=async()=>{ if(ops){ await batch.commit(); batch=db.batch(); ops=0; } };
      for(const row of rows){
        const id=String(row.id), doc=clean(row), sig=stable(doc);
        now[id]=sig;
        if(old[id]!==sig){
          batch.set(db.collection(name).doc(id),doc,{merge:false});
          ops++;
          if(ops>=400) await flush();
        }
      }
      for(const id of Object.keys(old)){
        if(!(id in now)){
          batch.delete(db.collection(name).doc(id));
          ops++;
          if(ops>=400) await flush();
        }
      }
      await flush();
      baseline[name]=now;
    }
    return snapshot;
  }

  function watch(onChange){
    if(!ready || typeof onChange!=='function') return ()=>{};
    unsubscribers.forEach(fn=>fn());
    unsubscribers=[];
    const fire=()=>{
      clearTimeout(remoteTimer);
      remoteTimer=setTimeout(async()=>{
        try{ const s=await loadSnapshot(); onChange(s); }
        catch(e){ console.warn('Firebase refresh failed',e); }
      },300);
    };
    COLLECTIONS.forEach(name=>unsubscribers.push(db.collection(name).onSnapshot(fire,err=>console.warn('Firebase watch',name,err))));
    return ()=>{unsubscribers.forEach(fn=>fn());unsubscribers=[]};
  }

  async function test(){
    if(!ready) return {ok:false,message:'Firebase is not configured.'};
    // Read an allowed app collection instead of writing to a special _system
    // document, so this works with the production rules already configured.
    await db.collection('members').limit(1).get();
    return {ok:true,message:'Firebase connection is working.'};
  }

  window.rndCloud={configured,init,loadSnapshot,syncSnapshot,watch,test,get enabled(){return ready}};
})();
