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

  const tsToNumber=v=>{
    if(v===undefined||v===null||v==='') return undefined;
    if(typeof v==='number'&&Number.isFinite(v)) return v;
    const n=Date.parse(v); return Number.isFinite(n)?n:undefined;
  };
  const numberToIso=v=>{
    if(v===undefined||v===null||v==='') return undefined;
    if(typeof v==='string'&&/T/.test(v)) return v;
    const n=Number(v); return Number.isFinite(n)?new Date(n).toISOString():undefined;
  };
  const pick=(obj,key,legacy)=>obj[key]!==undefined?obj[key]:obj[legacy];

  // Compact Firestore schema. The app continues using readable field names in memory.
  // This reduces repeated field-name storage and avoids storing derived display names,
  // attachment base64, or duplicate document IDs inside each document.
  function encode(collection,row){
    const r=row||{};
    const common={};
    const created=tsToNumber(r.created_at), updated=tsToNumber(r.updated_at);
    if(created!==undefined) common.c=created;
    if(updated!==undefined) common.u=updated;
    switch(collection){
      case 'members': return compact({n:r.name,r:r.role==='visitor'?'v':'m',a:Number(r.active)!==0?1:0,o:Number(r.sort_order)||0,...common});
      case 'ideas': return compact({n:r.idea_number,s:Number(r.submitted_by),d:Number(r.department_id),p:r.problem,i:r.proposed_idea,b:r.expected_benefit,q:r.priority,t:r.submission_date,x:r.status,f:attachmentMeta(r.attachment),...common});
      case 'cycles': return compact({l:r.label,s:r.start_date,e:r.end_date,x:r.status,...common});
      case 'projects': return compact({c:Number(r.cycle_id),i:Number(r.idea_id),n:r.project_number,t:r.title,o:Number(r.owner_id),s:r.start_date,e:r.end_date,p:Number(r.progress)||0,x:r.status,...common});
      case 'progress': return compact({p:Number(r.project_id),m:Number(r.user_id),d:r.update_date,w:r.work_done,r:r.remarks,b:r.blocker,n:r.next_action,v:Number(r.progress_percent)||0,f:attachmentMeta(r.attachment),...common});
      default: return {};
    }
  }
  function attachmentMeta(a){if(!a||typeof a!=='object')return undefined;return compact({n:a.name,t:a.type,s:Number(a.size)||0})}
  function compact(obj){
    const out={};
    Object.entries(obj).forEach(([k,v])=>{
      if(v===undefined||v===null||v==='') return;
      out[k]=v;
    });
    return out;
  }
  function decode(collection,data,id){
    const d=data||{};
    // Backward compatibility: if readable fields exist, accept old v7/v8 docs.
    if(d.name!==undefined||d.idea_number!==undefined||d.project_number!==undefined||d.work_done!==undefined||d.label!==undefined){
      const copy={...d,id:d.id!==undefined?d.id:id};
      delete copy.submitted_by_name; delete copy.department_name; delete copy.owner_name; delete copy.cycle_label; delete copy.user_name; delete copy.attachment_path;
      if(copy.attachment?.data) copy.attachment={name:copy.attachment.name,type:copy.attachment.type,size:copy.attachment.size};
      return copy;
    }
    const common={id:Number.isFinite(Number(id))?Number(id):id};
    const created=numberToIso(d.c),updated=numberToIso(d.u);
    if(created)common.created_at=created;if(updated)common.updated_at=updated;
    switch(collection){
      case 'members': return {...common,name:d.n||'',role:d.r==='v'?'visitor':'member',active:d.a===0?0:1,sort_order:Number(d.o)||0};
      case 'ideas': return {...common,idea_number:d.n||'',submitted_by:Number(d.s),department_id:Number(d.d),problem:d.p||'',proposed_idea:d.i||'',expected_benefit:d.b||'',priority:d.q||'Medium',submission_date:d.t||'',status:d.x||'submitted',...(d.f?{attachment:{name:d.f.n||'',type:d.f.t||'',size:Number(d.f.s)||0}}:{})};
      case 'cycles': return {...common,label:d.l||'',start_date:d.s||'',end_date:d.e||'',status:d.x||'active'};
      case 'projects': return {...common,cycle_id:Number(d.c),idea_id:Number(d.i),project_number:d.n||'',title:d.t||'',owner_id:Number(d.o),start_date:d.s||'',end_date:d.e||'',progress:Number(d.p)||0,status:d.x||'assigned'};
      case 'progress': return {...common,project_id:Number(d.p),user_id:Number(d.m),update_date:d.d||'',work_done:d.w||'',remarks:d.r||'',blocker:d.b||'',next_action:d.n||'',progress_percent:Number(d.v)||0,...(d.f?{attachment:{name:d.f.n||'',type:d.f.t||'',size:Number(d.f.s)||0}}:{})};
      default:return {...common,...d};
    }
  }
  const errText=e=>{if(!e)return'Unknown Firebase error';const code=e.code?String(e.code):'';const msg=e.message?String(e.message):String(e);return code?`${code}: ${msg}`:msg};
  function makeSnapshot(){return {members:[...remoteCache.members],departments:[],ideas:[...remoteCache.ideas],cycles:[...remoteCache.cycles],projects:[...remoteCache.projects],progress:[...remoteCache.progress],schema_version:11,updated_at:new Date().toISOString()}}
  function status(){return {configured:configured(),sdk:Boolean(window.firebase),authenticated:Boolean(authUid),uid:authUid,connected:ready,projectId:cfg().projectId||'',error:lastError?errText(lastError):'',schema:'compact-v2-roster'}}
  function waitForAuthUser(timeoutMs=15000){return new Promise((resolve,reject)=>{let done=false;const timer=setTimeout(()=>{if(done)return;done=true;reject(new Error('Firebase Auth timed out. Check Anonymous sign-in and network access.'))},timeoutMs);const off=auth.onAuthStateChanged(user=>{if(done||!user)return;done=true;clearTimeout(timer);off();resolve(user)},err=>{if(done)return;done=true;clearTimeout(timer);off();reject(err)})})}

  async function init(force=false){
    if(ready&&!force)return{enabled:true,user:authUid};lastError=null;
    if(!configured()){const e=new Error('Firebase config is missing or still contains placeholder values in firebase-config.js.');e.code='config/missing';lastError=e;return{enabled:false,reason:e.message,error:e}}
    if(!window.firebase){const e=new Error('Firebase SDK did not load from gstatic.com. Check internet/firewall/content blocker.');e.code='sdk/not-loaded';lastError=e;throw e}
    try{
      if(!firebase.apps.length)firebase.initializeApp(cfg());
      auth=firebase.auth();db=firebase.firestore();
      try{db.settings({experimentalAutoDetectLongPolling:true,ignoreUndefinedProperties:true})}catch(e){if(!/already been started|settings can no longer/i.test(String(e?.message||'')))console.warn('Firestore settings',e)}
      try{await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)}catch(e){console.warn('Auth persistence',e)}
      let user=auth.currentUser;if(!user){const credential=await auth.signInAnonymously();user=credential?.user||auth.currentUser}if(!user)user=await waitForAuthUser();authUid=user?.uid||null;if(!authUid)throw new Error('Anonymous Firebase authentication did not return a user.');
      await db.collection('members').limit(1).get({source:'server'});ready=true;return{enabled:true,user:authUid};
    }catch(e){ready=false;lastError=e;console.error('Firebase init failed',e);throw e}
  }
  async function loadSnapshot(){
    if(!ready)return null;
    try{
      const legacy=[];
      await Promise.all(COLLECTIONS.map(async name=>{
        const qs=await db.collection(name).get({source:'server'});
        remoteCache[name]=qs.docs.map(doc=>{
          const raw=doc.data()||{},row=decode(name,raw,doc.id);
          if(raw.name!==undefined||raw.idea_number!==undefined||raw.project_number!==undefined||raw.work_done!==undefined||raw.label!==undefined)legacy.push({collection:name,row});
          return row;
        });
      }));
      // One-time in-place migration of older verbose documents to the compact schema.
      if(legacy.length)await writeMany(legacy);
      lastError=null;return makeSnapshot();
    }catch(e){lastError=e;ready=false;throw e}
  }
  async function writeMany(ops){
    if(!ready)await init(true);const rows=(ops||[]).filter(x=>COLLECTIONS.includes(x?.collection)&&x?.row?.id!==undefined&&x?.row?.id!==null);if(!rows.length)return true;
    try{
      let batch=db.batch(),count=0;
      const flush=async()=>{if(!count)return;await batch.commit();batch=db.batch();count=0};
      for(const op of rows){const ref=db.collection(op.collection).doc(String(op.row.id));batch.set(ref,encode(op.collection,op.row));count++;if(count>=400)await flush()}
      await flush();lastError=null;ready=true;return true;
    }catch(e){lastError=e;ready=false;throw e}
  }
  async function syncSnapshot(snapshot){
    const ops=[];for(const name of COLLECTIONS){for(const row of Array.isArray(snapshot?.[name])?snapshot[name]:[])ops.push({collection:name,row})}await writeMany(ops);return snapshot;
  }
  async function upsert(collection,row){await writeMany([{collection,row}]);return row}
  async function deleteMany(collection,ids){
    if(!COLLECTIONS.includes(collection))return true;if(!ready)await init(true);
    const clean=[...new Set((ids||[]).map(String).filter(Boolean))];if(!clean.length)return true;
    try{let batch=db.batch(),count=0;const flush=async()=>{if(!count)return;await batch.commit();batch=db.batch();count=0};for(const id of clean){batch.delete(db.collection(collection).doc(id));count++;if(count>=400)await flush()}await flush();lastError=null;ready=true;return true}catch(e){lastError=e;ready=false;throw e}
  }
  function clearWatchers(){unsubscribers.forEach(fn=>{try{fn()}catch{}});unsubscribers=[]}
  function watch(onChange,onStatus){
    if(!ready||typeof onChange!=='function')return()=>{};clearWatchers();let seen=0;
    const emit=()=>{seen++;ready=true;lastError=null;if(typeof onStatus==='function')onStatus({connected:true,seen});onChange(makeSnapshot())};
    COLLECTIONS.forEach(name=>{const unsub=db.collection(name).onSnapshot({includeMetadataChanges:true},qs=>{remoteCache[name]=qs.docs.map(d=>decode(name,d.data()||{},d.id));emit()},err=>{lastError=err;ready=false;console.error('Firebase live listener',name,err);if(typeof onStatus==='function')onStatus({connected:false,error:err,message:errText(err)})});unsubscribers.push(unsub)});return clearWatchers;
  }
  async function reconnect(onChange,onStatus){clearTimeout(reconnectTimer);try{const r=await init(true);if(!r.enabled)throw r.error||new Error(r.reason||'Firebase not enabled');const snapshot=await loadSnapshot();if(typeof onChange==='function'&&snapshot)onChange(snapshot);if(typeof onStatus==='function')onStatus({connected:true});if(typeof onChange==='function')watch(onChange,onStatus);return{ok:true,status:status()}}catch(e){if(typeof onStatus==='function')onStatus({connected:false,error:e,message:errText(e)});reconnectTimer=setTimeout(()=>reconnect(onChange,onStatus),15000);return{ok:false,error:errText(e),status:status()}}}
  async function test(){try{const r=await init(true);if(!r.enabled)return{ok:false,message:r.reason||'Firebase is not configured.',details:status()};await db.collection('members').limit(1).get({source:'server'});return{ok:true,message:`Firebase connected · Auth OK · Firestore OK · compact schema · ${cfg().projectId}`,details:status()}}catch(e){lastError=e;return{ok:false,message:errText(e),details:status()}}}
  window.rndCloud={configured,init,loadSnapshot,syncSnapshot,upsert,writeMany,deleteMany,watch,reconnect,test,status,get enabled(){return ready}};
})();
