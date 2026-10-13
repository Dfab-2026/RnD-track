(function(){
  const COLLECTIONS=['members','ideas','cycles','projects','progress'];
  let db=null, auth=null, ready=false, unsubscribers=[];
  const remoteCache={members:[],ideas:[],cycles:[],projects:[],progress:[]};
  const cfg=()=>window.RND_FIREBASE_CONFIG||{};
  const configured=()=>Boolean(cfg().apiKey && !String(cfg().apiKey).startsWith('PASTE_') && cfg().projectId && !String(cfg().projectId).startsWith('PASTE_'));

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

  function makeSnapshot(){
    return {
      members:[...remoteCache.members],
      departments:[],
      ideas:[...remoteCache.ideas],
      cycles:[...remoteCache.cycles],
      projects:[...remoteCache.projects],
      progress:[...remoteCache.progress],
      schema_version:5,
      updated_at:new Date().toISOString()
    };
  }

  async function init(){
    if(!configured()) return {enabled:false,reason:'Firebase config not added yet'};
    if(!window.firebase) throw new Error('Firebase SDK did not load. Check internet connection.');
    if(!firebase.apps.length) firebase.initializeApp(cfg());
    db=firebase.firestore();
    auth=firebase.auth();
    try{ await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); }catch{}
    if(!auth.currentUser) await auth.signInAnonymously();
    try{ await db.enablePersistence({synchronizeTabs:true}); }catch(e){
      if(!['failed-precondition','unimplemented'].includes(e.code)) console.warn('Firestore persistence',e);
    }
    ready=true;
    return {enabled:true,user:auth.currentUser?.uid||null};
  }

  async function loadSnapshot(){
    if(!ready) return null;
    await Promise.all(COLLECTIONS.map(async name=>{
      const qs=await db.collection(name).get();
      remoteCache[name]=qs.docs.map(d=>({id:d.id,...d.data(),id_value:d.data()?.id})).map(x=>{
        if(x.id_value!==undefined){x.id=x.id_value;delete x.id_value;}
        return x;
      });
    }));
    return makeSnapshot();
  }

  // Upsert-only sync. The tracker has no delete workflow, so a stale browser is
  // never allowed to delete records created by another browser.
  async function syncSnapshot(snapshot){
    if(!ready) return snapshot;
    for(const name of COLLECTIONS){
      const rows=Array.isArray(snapshot?.[name])?snapshot[name]:[];
      let batch=db.batch(), ops=0;
      const flush=async()=>{if(!ops)return;await batch.commit();batch=db.batch();ops=0;};
      for(const row of rows){
        if(row?.id===undefined || row?.id===null) continue;
        const doc=clean(row);
        batch.set(db.collection(name).doc(String(row.id)),doc,{merge:true});
        ops++;
        if(ops>=400) await flush();
      }
      await flush();
    }
    return snapshot;
  }

  // Direct record upsert is used after user actions so the shared dashboard is
  // updated immediately instead of waiting for a full snapshot cycle.
  async function upsert(collection,row){
    if(!ready) throw new Error('Firebase is not connected.');
    if(!COLLECTIONS.includes(collection)) throw new Error('Unsupported Firebase collection.');
    if(row?.id===undefined || row?.id===null) throw new Error('Record id is required.');
    await db.collection(collection).doc(String(row.id)).set(clean(row),{merge:true});
    return row;
  }

  function watch(onChange,onStatus){
    if(!ready || typeof onChange!=='function') return ()=>{};
    unsubscribers.forEach(fn=>fn());
    unsubscribers=[];
    let pending=COLLECTIONS.length;
    const emit=()=>{
      pending=Math.max(0,pending-1);
      if(typeof onStatus==='function') onStatus({connected:true,pending});
      // Emit on every collection update. app.js merges this shared snapshot into
      // IndexedDB and re-renders the dashboard for all signed-in browsers.
      onChange(makeSnapshot());
    };
    COLLECTIONS.forEach(name=>{
      const unsub=db.collection(name).onSnapshot(qs=>{
        remoteCache[name]=qs.docs.map(d=>{
          const data=d.data()||{};
          return {...data,id:data.id!==undefined?data.id:d.id};
        });
        emit();
      },err=>{
        console.error('Firebase live listener',name,err);
        if(typeof onStatus==='function') onStatus({connected:false,error:err});
      });
      unsubscribers.push(unsub);
    });
    return ()=>{unsubscribers.forEach(fn=>fn());unsubscribers=[];};
  }

  async function test(){
    if(!ready) return {ok:false,message:'Firebase is not configured.'};
    await db.collection('members').limit(1).get();
    return {ok:true,message:'Firebase shared database is connected and readable.'};
  }

  window.rndCloud={configured,init,loadSnapshot,syncSnapshot,upsert,watch,test,get enabled(){return ready}};
})();
