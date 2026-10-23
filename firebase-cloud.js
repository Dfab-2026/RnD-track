(function(){
  const COLLECTIONS=['members','departments','ideas','cycles','projects','progress'];
  let db=null, auth=null, ready=false, initPromise=null, unsubscribers=[], reconnectTimer=null;
  let lastError=null, authUid=null, persistenceReady=false;
  const WRITE_RETRY_DELAYS=[350,900,1800,3500];
  const remoteCache={members:[],departments:[],ideas:[],cycles:[],projects:[],progress:[]};
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
      case 'departments': return compact({n:r.name,a:Number(r.active)!==0?1:0,o:Number(r.sort_order)||0,...common});
      case 'ideas': return compact({n:r.idea_number,s:Number(r.submitted_by),d:Number(r.department_id),p:r.problem,i:r.proposed_idea,b:r.expected_benefit,q:r.priority,t:r.submission_date,x:r.status,f:attachmentMeta(r.attachment),...common});
      case 'cycles': return compact({l:r.label,s:r.start_date,e:r.end_date,x:r.status,...common});
      case 'projects': {const g=(Array.isArray(r.tracker_rows)?r.tracker_rows:[]).map((x,idx)=>compact({o:Number.isFinite(Number(x.row_index))?Number(x.row_index):idx,q:x.manual_extra===true?1:undefined,d:x.date,s:x.stage,t:x.task,x:x.status,i:x.issue,n:x.next_action,r:x.remarks})).filter(x=>Object.keys(x).length);return compact({c:Number(r.cycle_id),i:Number(r.idea_id),n:r.project_number,t:r.title,o:Number(r.owner_id),s:r.start_date,e:r.end_date,p:Number(r.progress)||0,x:r.status,g:g.length?g:undefined,z:Number(r.tracker_row_count)||undefined,...common})};
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
      case 'departments': return {...common,name:d.n||'',active:d.a===0?0:1,sort_order:Number(d.o)||0};
      case 'ideas': return {...common,idea_number:d.n||'',submitted_by:Number(d.s),department_id:Number(d.d),problem:d.p||'',proposed_idea:d.i||'',expected_benefit:d.b||'',priority:d.q||'Medium',submission_date:d.t||'',status:d.x||'submitted',...(d.f?{attachment:{name:d.f.n||'',type:d.f.t||'',size:Number(d.f.s)||0}}:{})};
      case 'cycles': return {...common,label:d.l||'',start_date:d.s||'',end_date:d.e||'',status:d.x||'active'};
      case 'projects': return {...common,cycle_id:Number(d.c),idea_id:Number(d.i),project_number:d.n||'',title:d.t||'',owner_id:Number(d.o),start_date:d.s||'',end_date:d.e||'',progress:Number(d.p)||0,status:d.x||'assigned',tracker_row_count:Number(d.z)||undefined,tracker_rows:Array.isArray(d.g)?d.g.map((x,idx)=>({row_index:Number.isFinite(Number(x.o))?Number(x.o):idx,manual_extra:Number(x.q)===1,date:x.d||'',stage:x.s||'',task:x.t||'',status:x.x||'',issue:x.i||'',next_action:x.n||'',remarks:x.r||''})):[]};
      case 'progress': return {...common,project_id:Number(d.p),user_id:Number(d.m),update_date:d.d||'',work_done:d.w||'',remarks:d.r||'',blocker:d.b||'',next_action:d.n||'',progress_percent:Number(d.v)||0,...(d.f?{attachment:{name:d.f.n||'',type:d.f.t||'',size:Number(d.f.s)||0}}:{})};
      default:return {...common,...d};
    }
  }
  const errText=e=>{if(!e)return'Unknown Firebase error';const code=e.code?String(e.code):'';const msg=e.message?String(e.message):String(e);return code?`${code}: ${msg}`:msg};
  function sortedRows(rows){return [...rows].sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true}))}
  function makeSnapshot(){return {members:sortedRows(remoteCache.members),departments:sortedRows(remoteCache.departments),ideas:sortedRows(remoteCache.ideas),cycles:sortedRows(remoteCache.cycles),projects:sortedRows(remoteCache.projects),progress:sortedRows(remoteCache.progress),schema_version:15,updated_at:new Date().toISOString()}}
  function status(){return {configured:configured(),sdk:Boolean(window.firebase),authenticated:Boolean(authUid),uid:authUid,connected:ready,persistent_cache:persistenceReady,projectId:cfg().projectId||'',error:lastError?errText(lastError):'',schema:'compact-v4-durable-sync'}}
  function waitForAuthUser(timeoutMs=15000){return new Promise((resolve,reject)=>{let done=false;const timer=setTimeout(()=>{if(done)return;done=true;reject(new Error('Firebase Auth timed out. Check Anonymous sign-in and network access.'))},timeoutMs);const off=auth.onAuthStateChanged(user=>{if(done||!user)return;done=true;clearTimeout(timer);off();resolve(user)},err=>{if(done)return;done=true;clearTimeout(timer);off();reject(err)})})}

  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const retryableCode=e=>String(e?.code||'').replace(/^firestore\//,'').toLowerCase();
  const isRetryable=e=>['aborted','cancelled','deadline-exceeded','internal','resource-exhausted','unavailable','unknown'].includes(retryableCode(e));
  async function withWriteRetry(operation,label='Firebase write'){
    let last;
    for(let attempt=0;attempt<=WRITE_RETRY_DELAYS.length;attempt++){
      try{const result=await operation();lastError=null;ready=true;return result}catch(e){last=e;lastError=e;if(!isRetryable(e)||attempt>=WRITE_RETRY_DELAYS.length)throw e;await sleep(WRITE_RETRY_DELAYS[attempt])}
    }
    throw last||new Error(`${label} failed.`);
  }
  async function enableDurablePersistence(){
    if(!db||persistenceReady)return persistenceReady;
    try{await db.enablePersistence({synchronizeTabs:true});persistenceReady=true;try{localStorage.setItem('rnd_firestore_persistence','enabled')}catch{}}
    catch(e){const code=retryableCode(e);if(!['failed-precondition','unimplemented'].includes(code))console.warn('Firestore persistence',e);try{localStorage.setItem('rnd_firestore_persistence',`fallback:${code||'unknown'}`)}catch{}}
    return persistenceReady;
  }
  async function flushPendingWrites(){if(!db||!ready||typeof db.waitForPendingWrites!=='function')return false;try{await db.waitForPendingWrites();return true}catch(e){lastError=e;return false}}
  async function archiveBeforeDelete(collection,id){
    if(!db||!authUid||!collection||!id)return;
    try{const ref=db.collection(collection).doc(String(id)),snap=await ref.get();if(!snap.exists)return;await db.collection('activity_logs').add({a:'delete_backup',c:String(collection).slice(0,40),d:String(id).slice(0,120),t:Date.now(),u:String(authUid).slice(0,128),v:snap.data()||{}})}catch(e){console.warn('Delete backup skipped',collection,id,e)}
  }

  async function initCore(force=false){
    if(ready&&!force)return{enabled:true,user:authUid};lastError=null;
    if(!configured()){const e=new Error('Firebase config is missing or still contains placeholder values in firebase-config.js.');e.code='config/missing';lastError=e;return{enabled:false,reason:e.message,error:e}}
    if(!window.firebase){const e=new Error('Firebase SDK did not load from gstatic.com. Check internet/firewall/content blocker.');e.code='sdk/not-loaded';lastError=e;throw e}
    try{
      if(!firebase.apps.length)firebase.initializeApp(cfg());
      auth=firebase.auth();db=firebase.firestore();
      try{db.settings({experimentalAutoDetectLongPolling:true,ignoreUndefinedProperties:true})}catch(e){if(!/already been started|settings can no longer/i.test(String(e?.message||'')))console.warn('Firestore settings',e)}
      await enableDurablePersistence();
      try{await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)}catch(e){console.warn('Auth persistence',e)}
      if(!auth||typeof auth.signInAnonymously!=='function'){const e=new Error('Firebase Authentication is still loading. Please retry in a moment.');e.code='auth/not-ready';throw e}
      let user=auth.currentUser;if(!user){const credential=await auth.signInAnonymously();user=credential?.user||auth.currentUser}if(!user)user=await waitForAuthUser();authUid=user?.uid||null;if(!authUid)throw new Error('Anonymous Firebase authentication did not return a user.');
      await db.collection('members').limit(1).get({source:'server'});ready=true;return{enabled:true,user:authUid};
    }catch(e){ready=false;lastError=e;console.error('Firebase init failed',e);throw e}
  }
  async function init(force=false){
    if(ready&&!force)return{enabled:true,user:authUid};
    if(initPromise)return initPromise;
    initPromise=initCore(force);
    try{return await initPromise}finally{initPromise=null}
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
    try{let batch=db.batch(),count=0;const flush=async()=>{if(!count)return;const committing=batch;batch=db.batch();count=0;await withWriteRetry(()=>committing.commit(),'Firestore batch write')};for(const op of rows){const ref=db.collection(op.collection).doc(String(op.row.id));const encoded=encode(op.collection,{...op.row,updated_at:op.row.updated_at||new Date().toISOString()});batch.set(ref,encoded);count++;if(count>=400)await flush()}await flush();lastError=null;ready=true;return true}catch(e){lastError=e;if(!isRetryable(e))ready=false;throw e}
  }
  async function syncSnapshot(snapshot){
    const ops=[];for(const name of COLLECTIONS){for(const row of Array.isArray(snapshot?.[name])?snapshot[name]:[])ops.push({collection:name,row})}await writeMany(ops);return snapshot;
  }
  async function upsert(collection,row){await writeMany([{collection,row}]);return row}
  async function deleteMany(collection,ids){
    if(!COLLECTIONS.includes(collection))return true;if(!ready)await init(true);const clean=[...new Set((ids||[]).map(String).filter(Boolean))];if(!clean.length)return true;
    try{for(const id of clean)await archiveBeforeDelete(collection,id);let batch=db.batch(),count=0;const flush=async()=>{if(!count)return;const committing=batch;batch=db.batch();count=0;await withWriteRetry(()=>committing.commit(),'Firestore delete')};for(const id of clean){batch.delete(db.collection(collection).doc(id));count++;if(count>=400)await flush()}await flush();lastError=null;ready=true;return true}catch(e){lastError=e;if(!isRetryable(e))ready=false;throw e}
  }
  function clearWatchers(){unsubscribers.forEach(fn=>{try{fn()}catch{}});unsubscribers=[]}
  function watch(onChange,onStatus){
    if(!ready||typeof onChange!=='function')return()=>{};
    clearWatchers();let seen=0,emitTimer=null,lastSig='';
    const emit=()=>{
      clearTimeout(emitTimer);
      emitTimer=setTimeout(()=>{
        const snapshot=makeSnapshot();
        const sig=JSON.stringify(COLLECTIONS.map(k=>(snapshot[k]||[]).map(r=>[r.id,r.updated_at||r.created_at||'',r.status||'',r.progress??'',r.active??'',r.name||'',r.problem||'',r.work_done||''])));
        if(sig===lastSig)return;
        lastSig=sig;seen++;ready=true;lastError=null;
        if(typeof onStatus==='function')onStatus({connected:true,seen});
        onChange(snapshot);
      },90);
    };
    COLLECTIONS.forEach(name=>{
      const unsub=db.collection(name).onSnapshot(qs=>{
        remoteCache[name]=qs.docs.map(d=>decode(name,d.data()||{},d.id));
        emit();
      },err=>{
        lastError=err;ready=false;console.error('Firebase live listener',name,err);
        if(typeof onStatus==='function')onStatus({connected:false,error:err,message:errText(err)});
      });
      unsubscribers.push(unsub);
    });
    unsubscribers.push(()=>clearTimeout(emitTimer));
    return clearWatchers;
  }
  async function reconnect(onChange,onStatus){clearTimeout(reconnectTimer);try{const r=await init(true);if(!r.enabled)throw r.error||new Error(r.reason||'Firebase not enabled');const snapshot=await loadSnapshot();if(typeof onChange==='function'&&snapshot)onChange(snapshot);if(typeof onStatus==='function')onStatus({connected:true});if(typeof onChange==='function')watch(onChange,onStatus);return{ok:true,status:status()}}catch(e){if(typeof onStatus==='function')onStatus({connected:false,error:e,message:errText(e)});reconnectTimer=setTimeout(()=>reconnect(onChange,onStatus),15000);return{ok:false,error:errText(e),status:status()}}}

  function decodeChat(doc){
    const d=doc.data?doc.data():doc||{};
    return {id:doc.id||d.id||'',member_id:Number(d.m)||0,name:String(d.n||'Unknown'),role:d.r==='v'?'visitor':'member',text:String(d.t||''),created_at:Number(d.c)||0,auth_uid:String(d.a||''),reply_id:String(d.ri||''),reply_member_id:Number(d.rm)||0,reply_text:String(d.rt||'')};
  }
  async function sendChatMessage(payload){
    if(!ready)await init(false);
    let user=auth?.currentUser;
    if(!user){await init(true);user=auth?.currentUser}
    if(!user)user=await waitForAuthUser();
    if(!user)throw new Error('Firebase chat authentication is not ready. Please retry.');
    await user.getIdToken(true);authUid=user.uid;
    const text=String(payload?.text||'').trim();
    if(!text)throw new Error('Enter a message.');
    if(text.length>1000)throw new Error('Message is too long.');
    const row={m:Number(payload?.member_id)||0,t:text,c:Date.now(),a:String(user.uid)};
    if(payload?.reply_id){row.ri=String(payload.reply_id).slice(0,120);row.rm=Number(payload.reply_member_id)||0;row.rt=String(payload.reply_text||'').slice(0,180)};
    const ref=db.collection('team_chat').doc();
    await withWriteRetry(()=>ref.set(row),'Team chat send');
    await flushPendingWrites().catch(()=>false);
    return {id:ref.id,member_id:row.m,name:'',role:'member',text:row.t,created_at:row.c,auth_uid:row.a,reply_id:row.ri||'',reply_member_id:row.rm||0,reply_text:row.rt||''};
  }
  async function deleteChatMessage(id){
    if(!ready)await init(true);
    id=String(id||'').trim();
    if(!id)throw new Error('Message id is missing.');
    const ref=db.collection('team_chat').doc(id);
    const snap=await ref.get();
    if(!snap.exists)return true;
    const data=snap.data()||{};
    if(!data.a||String(data.a)!==String(authUid||''))throw new Error('You can delete only your own newer messages.');
    await withWriteRetry(()=>ref.delete(),'Chat delete');
    try{await flushPendingWrites()}catch{}
    return true;
  }
  async function purgeOldChatMessages(cutoffMs){
    if(!ready)await init(true);
    let user=auth?.currentUser;if(!user)user=await waitForAuthUser();if(!user)throw new Error('Firebase chat authentication is not ready.');
    const cutoff=Number(cutoffMs)||0;if(!cutoff)return 0;
    const snap=await db.collection('team_chat').where('c','<',cutoff).get();if(snap.empty)return 0;
    let refs=[],deleted=0;
    for(const doc of snap.docs){refs.push(doc.ref);if(refs.length===400){const b=db.batch();refs.forEach(r=>b.delete(r));await b.commit();deleted+=refs.length;refs=[]}}
    if(refs.length){const b=db.batch();refs.forEach(r=>b.delete(r));await b.commit();deleted+=refs.length}
    return deleted;
  }
  function watchChat(onChange,onStatus){
    if(typeof chatUnsubscriber==='function'){try{chatUnsubscriber()}catch{}chatUnsubscriber=null}
    let stopped=false,retryTimer=null;
    const fail=e=>{lastError=e;if(typeof onStatus==='function')onStatus({connected:false,error:e,message:errText(e)});if(!stopped){clearTimeout(retryTimer);retryTimer=setTimeout(connect,1400)}};
    const connect=async()=>{
      if(stopped||typeof onChange!=='function')return;
      try{
        if(!ready)await init(false);
        if(!auth?.currentUser)await init(true);
        if(!auth?.currentUser)throw new Error('Firebase chat authentication is not ready.');
        if(typeof chatUnsubscriber==='function'){try{chatUnsubscriber()}catch{}chatUnsubscriber=null}
        chatUnsubscriber=db.collection('team_chat').onSnapshot(qs=>{
          const rows=qs.docs.map(decodeChat).filter(x=>x.text).sort((a,b)=>Number(a.created_at||0)-Number(b.created_at||0)).slice(-100);
          ready=true;lastError=null;if(typeof onStatus==='function')onStatus({connected:true,error:'',message:'Live'});onChange(rows);
        },fail);
      }catch(e){fail(e)}
    };
    connect();
    return()=>{stopped=true;clearTimeout(retryTimer);if(typeof chatUnsubscriber==='function'){try{chatUnsubscriber()}catch{}chatUnsubscriber=null}};
  }
  function stopChat(){if(typeof chatUnsubscriber==='function'){try{chatUnsubscriber()}catch{}chatUnsubscriber=null}}




  function decodeExcelGridRow(doc){const d=doc.data?doc.data():doc||{},id=String(doc.id||''),row=Number(d.r)||0,cells={},formats={};Object.entries(d.v||{}).forEach(([k,v])=>{if(/^[A-Z]$/.test(k)&&String(v||'')!=='')cells[k]=String(v).slice(0,4000)});Object.entries(d.f||{}).forEach(([k,v])=>{if(/^[A-Z]$/.test(k)&&v&&typeof v==='object'){const x={};if(/^#[0-9a-f]{6}$/i.test(v.b||''))x.b=v.b;if(/^#[0-9a-f]{6}$/i.test(v.t||''))x.t=v.t;if(Object.keys(x).length)formats[k]=x}});return{row,cells,formats,updated_at:Number(d.u)||0,id}}
  function decodeExcelSheet(doc){const d=doc.data?doc.data():doc||{};return{id:doc.id||'',name:String(d.n||'Sheet').slice(0,31),order:Number(d.o)||1,color:/^#[0-9a-f]{6}$/i.test(d.c||'')?d.c:'#217346',tab_width:Math.max(80,Math.min(240,Number(d.w)||120)),column_widths:d.cw&&typeof d.cw==='object'?d.cw:{},row_heights:d.rh&&typeof d.rh==='object'?d.rh:{},created_at:Number(d.ca)||Number(d.created_at)||0,updated_at:Number(d.u)||0}}
  async function ensureExcelWorkbook(){if(!ready)await init(true);const sheetsSnap=await db.collection('excel_sheets').orderBy('o','asc').limit(100).get();if(!sheetsSnap.empty)return sheetsSnap.docs.map(decodeExcelSheet);const ref=db.collection('excel_sheets').doc('sheet1'),now=Date.now(),payload={n:'Sheet1',o:1,c:'#217346',w:120,ca:now,u:now};await ref.set(payload);await db.collection('app_meta').doc('excel_workbook').set({a:'sheet1',u:now},{merge:true});return[decodeExcelSheet({id:'sheet1',data:()=>payload})]}
  async function createExcelSheet({name,order,color,tab_width}={}){if(!ready)await init(true);const now=Date.now(),ref=db.collection('excel_sheets').doc(),payload={n:String(name||'Sheet').slice(0,31),o:Number(order)||1,c:/^#[0-9a-f]{6}$/i.test(color||'')?color:'#217346',w:Math.max(80,Math.min(240,Number(tab_width)||120)),ca:now,u:now};await ref.set(payload);return decodeExcelSheet({id:ref.id,data:()=>payload})}
  async function updateExcelSheet(id,patch={}){if(!ready)await init(true);const ref=db.collection('excel_sheets').doc(String(id)),payload={u:Date.now()};if(patch.name!==undefined)payload.n=String(patch.name||'Sheet').slice(0,31);if(patch.order!==undefined)payload.o=Number(patch.order)||1;if(patch.color!==undefined&&/^#[0-9a-f]{6}$/i.test(patch.color))payload.c=patch.color;if(patch.tab_width!==undefined)payload.w=Math.max(80,Math.min(240,Number(patch.tab_width)||120));if(patch.column_widths!==undefined)payload.cw=patch.column_widths||{};if(patch.row_heights!==undefined)payload.rh=patch.row_heights||{};await ref.set(payload,{merge:true});const snap=await ref.get();return decodeExcelSheet(snap)}
  async function deleteExcelSheet(id){if(!ready)await init(true);id=String(id||'');if(!id)return true;const qs=await db.collection('master_sheet').where('s','==',id).limit(500).get(),batch=db.batch();qs.docs.forEach(d=>batch.delete(d.ref));batch.delete(db.collection('excel_sheets').doc(id));await batch.commit();return true}
  async function saveExcelWorkbookMeta(meta={}){if(!ready)await init(true);const payload={u:Date.now()};if(meta.active_sheet_id!==undefined)payload.a=String(meta.active_sheet_id||'');await db.collection('app_meta').doc('excel_workbook').set(payload,{merge:true});return true}
  async function loadExcelGrid(sheetId){if(!ready)await init(true);const qs=await db.collection('master_sheet').where('s','==',String(sheetId)).limit(500).get();return qs.docs.map(decodeExcelGridRow).filter(x=>x.row>=1&&x.row<=120).sort((a,b)=>a.row-b.row)}
  async function saveExcelGridRow(sheetId,row,cells,formats={}){if(!ready)await init(true);sheetId=String(sheetId||'');if(!sheetId)throw new Error('No active sheet.');row=Math.max(1,Math.min(120,Number(row)||1));const clean={},fmt={};Object.entries(cells||{}).forEach(([k,v])=>{const value=String(v??'').slice(0,4000);if(/^[A-Z]$/.test(k)&&value!=='')clean[k]=value});Object.entries(formats||{}).forEach(([k,v])=>{if(!/^[A-Z]$/.test(k)||!v||typeof v!=='object')return;const x={};if(/^#[0-9a-f]{6}$/i.test(v.b||''))x.b=v.b;if(/^#[0-9a-f]{6}$/i.test(v.t||''))x.t=v.t;if(Object.keys(x).length)fmt[k]=x});const id=`g_${sheetId}_${String(row).padStart(3,'0')}`,ref=db.collection('master_sheet').doc(id);if(!Object.keys(clean).length&&!Object.keys(fmt).length){await ref.delete().catch(()=>{});return{row,cells:{},formats:{}}}const payload={k:'g',s:sheetId,r:row,u:Date.now()};if(Object.keys(clean).length)payload.v=clean;if(Object.keys(fmt).length)payload.f=fmt;await ref.set(payload,{merge:false});return decodeExcelGridRow({id:ref.id,data:()=>payload})}
  function watchExcelWorkbook(onChange,onStatus){if(typeof masterSheetUnsubscriber==='function'){try{masterSheetUnsubscriber()}catch{}masterSheetUnsubscriber=null}if(!ready||typeof onChange!=='function')return()=>{};let sheets=[],meta={},unsubSheets=null,unsubMeta=null;const emit=()=>onChange({sheets,meta});unsubSheets=db.collection('excel_sheets').orderBy('o','asc').limit(100).onSnapshot(async qs=>{sheets=qs.docs.map(decodeExcelSheet);if(!sheets.length)sheets=await ensureExcelWorkbook();if(typeof onStatus==='function')onStatus({connected:true,count:sheets.length});emit()},err=>{if(typeof onStatus==='function')onStatus({connected:false,error:err,message:errText(err)})});unsubMeta=db.collection('app_meta').doc('excel_workbook').onSnapshot(snap=>{const d=snap.exists?snap.data():{};meta={active_sheet_id:String(d.a||'')};emit()},err=>console.error('Excel workbook meta listener',err));masterSheetUnsubscriber=()=>{try{unsubSheets?.()}catch{}try{unsubMeta?.()}catch{}};return masterSheetUnsubscriber}
  function stopExcelWorkbook(){if(typeof masterSheetUnsubscriber==='function'){try{masterSheetUnsubscriber()}catch{}masterSheetUnsubscriber=null}}

  if(typeof window!=='undefined'){window.addEventListener('online',()=>{flushPendingWrites().catch(()=>{})});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushPendingWrites().catch(()=>{})})}

  async function test(){try{const r=await init(true);if(!r.enabled)return{ok:false,message:r.reason||'Firebase is not configured.',details:status()};await db.collection('members').limit(1).get({source:'server'});return{ok:true,message:`Firebase connected · Auth OK · Firestore OK · compact schema · ${cfg().projectId}`,details:status()}}catch(e){lastError=e;return{ok:false,message:errText(e),details:status()}}}
  window.rndCloud={configured,init,loadSnapshot,syncSnapshot,upsert,writeMany,deleteMany,watch,reconnect,flushPendingWrites,test,status,sendChatMessage,deleteChatMessage,purgeOldChatMessages,watchChat,stopChat,createExcelSheet,updateExcelSheet,deleteExcelSheet,saveExcelWorkbookMeta,loadExcelGrid,saveExcelGridRow,watchExcelWorkbook,stopExcelWorkbook,get enabled(){return ready}};
})();
