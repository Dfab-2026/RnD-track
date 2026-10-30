(function(){
  const COLLECTIONS=['members','departments','ideas','cycles','projects','progress'];
  let db=null, auth=null, ready=false, unsubscribers=[], reconnectTimer=null;
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
      case 'projects': {const g=(Array.isArray(r.tracker_rows)?r.tracker_rows:[]).map((x,idx)=>compact({o:Number.isFinite(Number(x.row_index))?Number(x.row_index):idx,q:x.manual_extra===true?1:undefined,d:x.date,s:x.stage,t:x.task,x:x.status,i:x.issue,n:x.next_action,r:x.remarks,h:x.time_slots})).filter(x=>Object.keys(x).length);return compact({...common,c:Number(r.cycle_id),i:Number(r.idea_id),n:r.project_number,t:r.title,o:Number(r.owner_id),s:r.start_date,e:r.end_date,p:Number(r.progress)||0,x:r.status,g:g.length?g:undefined,l:Array.isArray(r.time_entries)?r.time_entries:undefined,z:Number(r.tracker_row_count)||undefined})};
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
    const created=collection==='projects'&&d.k===undefined?undefined:numberToIso(d.c),updated=numberToIso(d.u);
    if(created)common.created_at=created;if(updated)common.updated_at=updated;
    switch(collection){
      case 'members': return {...common,name:d.n||'',role:d.r==='v'?'visitor':'member',active:d.a===0?0:1,sort_order:Number(d.o)||0};
      case 'departments': return {...common,name:d.n||'',active:d.a===0?0:1,sort_order:Number(d.o)||0};
      case 'ideas': return {...common,idea_number:d.n||'',submitted_by:Number(d.s),department_id:Number(d.d),problem:d.p||'',proposed_idea:d.i||'',expected_benefit:d.b||'',priority:d.q||'Medium',submission_date:d.t||'',status:d.x||'submitted',...(d.f?{attachment:{name:d.f.n||'',type:d.f.t||'',size:Number(d.f.s)||0}}:{})};
      case 'cycles': return {...common,label:d.l||'',start_date:d.s||'',end_date:d.e||'',status:d.x||'active'};
      case 'projects': return {...common,cycle_id:Number(d.k??d.c),idea_id:Number(d.i),project_number:d.n||'',title:d.t||'',owner_id:Number(d.o),start_date:d.s||'',end_date:d.e||'',progress:Number(d.p)||0,status:d.x||'assigned',time_entries:Array.isArray(d.l)?d.l:[],tracker_row_count:Number(d.z)||undefined,tracker_rows:Array.isArray(d.g)?d.g.map((x,idx)=>({row_index:Number.isFinite(Number(x.o))?Number(x.o):idx,manual_extra:Number(x.q)===1,date:x.d||'',stage:x.s||'',task:x.t||'',status:x.x||'',issue:x.i||'',next_action:x.n||'',remarks:x.r||'',time_slots:x.h||{}})):[]};
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

  async function init(force=false){
    if(ready&&!force)return{enabled:true,user:authUid};lastError=null;
    if(!configured()){const e=new Error('Firebase config is missing or still contains placeholder values in firebase-config.js.');e.code='config/missing';lastError=e;return{enabled:false,reason:e.message,error:e}}
    if(!window.firebase){const e=new Error('Firebase SDK did not load from gstatic.com. Check internet/firewall/content blocker.');e.code='sdk/not-loaded';lastError=e;throw e}
    try{
      if(!firebase.apps.length)firebase.initializeApp(cfg());
      auth=firebase.auth();db=firebase.firestore();
      try{db.settings({experimentalAutoDetectLongPolling:true,ignoreUndefinedProperties:true})}catch(e){if(!/already been started|settings can no longer/i.test(String(e?.message||'')))console.warn('Firestore settings',e)}
      await enableDurablePersistence();
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
      // Repair the old project field collision: c was both cycle_id and created_at.
      // Use only an unambiguous exact date match; never guess between working weeks.
      for(const project of remoteCache.projects){
        if(remoteCache.cycles.some(c=>Number(c.id)===Number(project.cycle_id)))continue;
        const matches=remoteCache.cycles.filter(c=>c.start_date===project.start_date&&c.end_date===project.end_date);
        if(matches.length===1){project.cycle_id=Number(matches[0].id);legacy.push({collection:'projects',row:project})}
      }
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
        const sig=JSON.stringify(COLLECTIONS.map(k=>snapshot[k]||[]));
        if(sig===lastSig)return;
        lastSig=sig;seen++;ready=true;lastError=null;
        if(typeof onStatus==='function')onStatus({connected:true,seen});
        onChange(snapshot);
      },35);
    };
    COLLECTIONS.forEach(name=>{
      const unsub=db.collection(name).onSnapshot(qs=>{
        if(qs.metadata?.fromCache&&!qs.metadata?.hasPendingWrites)return;
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
    return {id:doc.id||d.id||'',member_id:Number(d.m)||0,name:String(d.n||'Unknown'),role:d.r==='v'?'visitor':'member',text:String(d.t||''),created_at:Number(d.c)||0,auth_uid:String(d.a||''),reply:d.y||null};
  }
  async function sendChatMessage(payload){
    if(!ready)await init(true);
    let user=auth?.currentUser;
    if(!user){const credential=await auth.signInAnonymously();user=credential?.user||auth.currentUser}
    if(!user)user=await waitForAuthUser();
    if(!user)throw new Error('Firebase Anonymous Authentication is not connected.');
    await user.getIdToken(true);authUid=user.uid;
    const text=String(payload?.text||'').trim();
    if(!text)throw new Error('Enter a message.');
    if(text.length>1000)throw new Error('Message is too long.');
    const row={m:Number(payload?.member_id)||0,t:text,c:Date.now(),a:String(user.uid)};if(payload?.reply?.id)row.y={id:String(payload.reply.id).slice(0,150),name:String(payload.reply.name||'').slice(0,80),text:String(payload.reply.text||'').slice(0,250)};
    const ref=db.collection('team_chat').doc();
    await withWriteRetry(()=>ref.set(row),'Team chat send');
    await flushPendingWrites().catch(()=>false);
    return {id:ref.id,member_id:row.m,name:'',role:'member',text:row.t,created_at:row.c,auth_uid:row.a,reply:row.y||null};
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
  function watchChat(onChange,onStatus){
    if(typeof chatUnsubscriber==='function'){try{chatUnsubscriber()}catch{}chatUnsubscriber=null}
    if(!ready||typeof onChange!=='function')return()=>{};
    const ref=db.collection('team_chat');
    chatUnsubscriber=ref.onSnapshot(qs=>{
      const rows=qs.docs.map(decodeChat).filter(x=>x.text).sort((a,b)=>Number(a.created_at||0)-Number(b.created_at||0)).slice(-100);
      ready=true;lastError=null;
      if(typeof onStatus==='function')onStatus({connected:true,error:'',message:'Live'});
      onChange(rows);
    },async e=>{
      lastError=e;
      if(typeof onStatus==='function')onStatus({connected:false,error:e,message:errText(e)});
      try{const user=auth?.currentUser;if(user)await user.getIdToken(true)}catch{}
    });
    return()=>{if(typeof chatUnsubscriber==='function'){try{chatUnsubscriber()}catch{}chatUnsubscriber=null}};
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
  function watchReportData(onChange,onError){
    if(!ready)return()=>{};
    return db.collection('app_meta').onSnapshot(qs=>onChange(qs.docs.map(d=>({id:d.id,...d.data()})).filter(d=>['kpi_entry','chat_reaction'].includes(d.kind))),onError);
  }
  async function saveReportEntry(key,data){
    if(!ready)throw new Error('Cloud is offline. Please reconnect before saving KPI remarks.');
    if(!/^[A-Za-z0-9_-]{1,180}$/.test(String(key)))throw new Error('Invalid KPI record.');
    if(!Number.isInteger(Number(data.value))||Number(data.value)<0||Number(data.value)>9999)throw new Error('Enter a valid completed value.');
    await db.collection('app_meta').doc('kpi_'+key).set({kind:'kpi_entry',key,value:Number(data.value)||0,remarks:String(data.remarks||'').trim().slice(0,1500),member_id:Number(data.member_id)||0,updated_at:Date.now()});
  }
  async function toggleChatReaction(messageId,memberId,emoji){
    if(!ready)throw new Error('Cloud is offline. Please reconnect to react.');
    if(!['👍','❤️','😂','🎉','👏','🙏'].includes(emoji))throw new Error('Choose a supported reaction.');
    const ref=db.collection('app_meta').doc('reaction_'+String(messageId)+'_'+Number(memberId));
    await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(snap.exists&&snap.data().emoji===emoji)tx.delete(ref);else tx.set(ref,{kind:'chat_reaction',message_id:String(messageId),member_id:Number(memberId),emoji,updated_at:Date.now()})});
  }
  async function productionDatabase(){if(!ready)await init(true);if(!ready)throw new Error('Firebase is not connected. Check the site configuration and connection.');return db}
  async function saveProduction(kind,id,row){const store=await productionDatabase();if(!['projects','entries'].includes(kind))throw new Error('Invalid Production record.');await store.collection('production_'+kind).doc(String(id)).set(row);return row}
  async function watchProduction(kind,onRows,onError){const store=await productionDatabase();if(!['projects','entries'].includes(kind))throw new Error('Invalid Production record.');return store.collection('production_'+kind).onSnapshot(q=>onRows(q.docs.map(d=>({...d.data(),id:d.id}))),onError)}
  // Quality data uses a compact Firestore schema while the UI keeps readable field names.
  // Existing verbose documents remain fully readable, so this is a non-destructive migration.
  function compactQualityAttachment(value){
    if(!value||typeof value!=='object')return undefined;
    const out={};
    if(value.name)out.n=String(value.name).slice(0,220);
    if(value.type)out.t=String(value.type).slice(0,120);
    if(Number.isFinite(Number(value.size)))out.s=Number(value.size);
    if(value.path)out.p=String(value.path).slice(0,500);
    if(value.url)out.u=String(value.url).slice(0,2200);
    return Object.keys(out).length?out:undefined;
  }
  function expandQualityAttachment(value){
    if(!value||typeof value!=='object')return value;
    if('name' in value||'url' in value||'path' in value)return value;
    const out={};
    if(value.n)out.name=value.n;if(value.t)out.type=value.t;if(value.s!==undefined)out.size=Number(value.s)||0;if(value.p)out.path=value.p;if(value.u)out.url=value.u;
    return out;
  }
  function encodeQuality(kind,row){
    const r=row||{},out={};
    const put=(k,v)=>{if(v!==undefined&&v!==null&&v!=='')out[k]=v};
    if(kind==='projects'){put('t',String(r.title||'').trim().slice(0,200));put('o',String(r.owner||'').trim().slice(0,80));put('c',tsToNumber(r.created_at)||Date.now());return out}
    if(kind==='entries'){put('p',String(r.project_id||'').slice(0,160));put('o',String(r.owner||'').trim().slice(0,80));put('d',String(r.date||'').slice(0,10));put('f',String(r.from||'').slice(0,5));put('z',String(r.to||'').slice(0,5));put('w',String(r.work||'').slice(0,2000));put('r',String(r.remarks||'').slice(0,1000));put('m',Number(r.minutes)||0);put('s',String(r.status||'completed').slice(0,20));put('c',tsToNumber(r.created_at)||Date.now());return out}
    put('k',String(r.kind||'').slice(0,40));put('p',String(r.person||'').trim().slice(0,80));put('d',String(r.date||'').slice(0,10));
    if(r.department_id!==undefined&&r.department_id!==null&&r.department_id!=='')put('a',Number(r.department_id));
    put('s',String(r.status||'').slice(0,20));put('r',String(r.remarks||'').slice(0,2000));put('t',String(r.title||'').slice(0,300));put('c',String(r.candidate||'').slice(0,200));put('o',String(r.role||'').slice(0,200));put('f',String(r.start_date||'').slice(0,10));put('g',String(r.end_date||'').slice(0,10));put('x',String(r.outcomes||'').slice(0,2000));
    if(r.report_submitted!==undefined)put('b',Boolean(r.report_submitted));put('q',String(r.report_reference||'').slice(0,300));put('i',String(r.idea||'').slice(0,2000));put('u',tsToNumber(r.updated_at)||Date.now());put('m',String(r.problem||'').slice(0,2000));put('n',String(r.inspection_stage||'').slice(0,200));put('w',String(r.week_start||'').slice(0,10));
    if(r.value!==undefined&&r.value!==null&&r.value!=='')put('v',Number(r.value));put('y',String(r.review_key||'').slice(0,220));put('h',String(r.priority||'').slice(0,30));put('L',String(r.actor_role||'').slice(0,48));put('E',String(r.actor_scope||'').slice(0,48));put('J',String(r.actor_name||'').slice(0,80));const attachment=compactQualityAttachment(r.attachment);if(attachment)out.j=attachment;
    return out;
  }
  function decodeQuality(kind,doc){
    const d=doc.data?doc.data():doc||{},id=String(doc.id||d.id||'');
    if(kind==='projects'){if('title' in d)return{...d,id};return{id,title:d.t||'',owner:d.o||'',created_at:numberToIso(d.c)||''}}
    if(kind==='entries'){if('project_id' in d)return{...d,id};return{id,project_id:d.p||'',owner:d.o||'',date:d.d||'',from:d.f||'',to:d.z||'',work:d.w||'',remarks:d.r||'',minutes:Number(d.m)||0,status:d.s||'completed',created_at:numberToIso(d.c)||''}}
    if('kind' in d)return{...d,id};
    const out={id,kind:d.k||'',person:d.p||'',date:d.d||'',status:d.s||'',updated_at:numberToIso(d.u)||''};
    if(d.a!==undefined)out.department_id=Number(d.a);if(d.L!==undefined)out.actor_role=d.L;if(d.E!==undefined)out.actor_scope=d.E;if(d.J!==undefined)out.actor_name=d.J;if(d.r!==undefined)out.remarks=d.r;if(d.t!==undefined)out.title=d.t;if(d.c!==undefined)out.candidate=d.c;if(d.o!==undefined)out.role=d.o;if(d.f!==undefined)out.start_date=d.f;if(d.g!==undefined)out.end_date=d.g;if(d.x!==undefined)out.outcomes=d.x;if(d.b!==undefined)out.report_submitted=Boolean(d.b);if(d.q!==undefined)out.report_reference=d.q;if(d.i!==undefined)out.idea=d.i;if(d.m!==undefined)out.problem=d.m;if(d.n!==undefined)out.inspection_stage=d.n;if(d.w!==undefined)out.week_start=d.w;if(d.v!==undefined)out.value=Number(d.v);if(d.y!==undefined)out.review_key=d.y;if(d.h!==undefined)out.priority=d.h;if(d.j!==undefined)out.attachment=expandQualityAttachment(d.j);
    return out;
  }
  const QUALITY_META_KINDS={projects:'quality_project',entries:'quality_entry',records:'quality_record'};
  const qualityMetaKind=kind=>QUALITY_META_KINDS[kind]||'';
  const qualityMetaId=(kind,id)=>`quality_${kind}_${String(id)}`;
  const QUALITY_DEPARTMENT_IDS=[1,2,3,4,5,6,7,8];
  const qualityDepartmentId=row=>Number.isFinite(Number(row?.department_id))&&Number(row.department_id)>0?Number(row.department_id):0;
  // Legacy reader only: v150/v151 briefly stored department records in app_meta subcollections.
  // New Quality writes use the exact same top-level app_meta collection as R&D.
  const qualityDepartmentCollection=(store,departmentId,kind)=>store.collection('app_meta').doc(`quality_department_${Number(departmentId)}`).collection(`quality_${kind}`);
  function decodeQualityMeta(kind,doc){
    const d=doc.data?doc.data():doc||{};
    const raw=(d&&typeof d.v==='object'&&d.v)?d.v:d;
    const synthetic={id:String(doc.id||d.id||'').replace(new RegExp(`^quality_${kind}_`),''),data:()=>raw};
    return decodeQuality(kind,synthetic);
  }
  async function saveQualityTime(kind,id,row){
    const store=await productionDatabase();
    if(!['projects','entries','records'].includes(kind))throw new Error('Invalid Quality record.');
    if(!id||String(id).includes('/'))throw new Error('Invalid Quality record id.');
    const payload=encodeQuality(kind,row);
    // Quality now writes to the exact same top-level app_meta collection used by R&D.
    // Department separation stays inside the compact payload (field `a`) and the
    // stable Quality document id, so departments remain isolated without a second DB path.
    const ref=store.collection('app_meta').doc(qualityMetaId(kind,id));
    const leaderName=window.adminSession?.active?.()?window.adminSession.name():'';
    const envelope={kind:qualityMetaKind(kind),v:payload,u:Date.now(),audit:{actor:leaderName||String(row?.person||row?.owner||'').trim(),role:leaderName?'all_departments_leader':'quality_member',scope:leaderName?'all_departments':'quality',department:'quality'}};
    await withWriteRetry(()=>ref.set(envelope),'Quality save');
    await flushPendingWrites();
    const confirmed=await withWriteRetry(()=>ref.get({source:'server'}),'Quality verify');
    if(!confirmed.exists)throw new Error('Firebase did not confirm the saved Quality record. Please retry.');
    lastError=null;ready=true;
    return decodeQualityMeta(kind,confirmed);
  }
  async function watchQualityTime(kind,onRows,onError){
    const store=await productionDatabase();
    if(!['projects','entries','records'].includes(kind))throw new Error('Invalid Quality record.');
    let metaRows=new Map(),legacyRows=new Map(),departmentRows=new Map(),metaServer=false,legacyServer=false,departmentServer=false;
    const emit=()=>{
      const merged=new Map(legacyRows);
      for(const [id,row] of metaRows)merged.set(id,row);
      for(const [id,row] of departmentRows)merged.set(id,row); // separated department data wins
      const rows=[...merged.values()].sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true}));
      const serverBacked=metaServer||legacyServer||departmentServer;
      onRows(rows,{connected:serverBacked,fromCache:!serverBacked,hasPendingWrites:false});
    };
    const stops=[];
    const q=store.collection('app_meta').where('kind','==',qualityMetaKind(kind));
    stops.push(q.onSnapshot({includeMetadataChanges:true},snap=>{
      metaServer=!snap.metadata?.fromCache;
      metaRows=new Map(snap.docs.map(d=>{const row=decodeQualityMeta(kind,d);return[String(row.id),row]}));
      if(metaServer){lastError=null;ready=true}emit();
    },err=>{lastError=err;onError?.(err)}));

    // Backward-compatible reader for records saved by v150/v151 in department
    // subcollections. New writes no longer use these paths; they use top-level app_meta.
    if(kind==='records')QUALITY_DEPARTMENT_IDS.forEach(departmentId=>{
      const collection=qualityDepartmentCollection(store,departmentId,kind);
      stops.push(collection.onSnapshot({includeMetadataChanges:true},snap=>{
        if(!snap.metadata?.fromCache)departmentServer=true;
        for(const [key,row] of [...departmentRows])if(Number(row.department_id)===departmentId)departmentRows.delete(key);
        snap.docs.forEach(d=>{const row=decodeQuality(kind,d);if(!row.department_id)row.department_id=departmentId;departmentRows.set(String(row.id),row)});
        if(!snap.metadata?.fromCache){lastError=null;ready=true}emit();
      },err=>{
        const code=String(err?.code||'').toLowerCase();
        if(!code.includes('permission-denied'))console.warn('Quality department stream unavailable',departmentId,err);
        emit();
      }));
    });

    try{
      const legacy=store.collection('quality_'+kind);
      const off=legacy.onSnapshot({includeMetadataChanges:true},snap=>{
        legacyServer=!snap.metadata?.fromCache;
        legacyRows=new Map(snap.docs.map(d=>{const row=decodeQuality(kind,d);return[String(row.id),row]}));
        if(legacyServer){lastError=null;ready=true}emit();
      },err=>{legacyServer=false;legacyRows=new Map();const code=String(err?.code||'').toLowerCase();if(!code.includes('permission-denied'))console.warn('Legacy Quality Firebase stream unavailable',err);emit()});
      stops.push(off);
    }catch(err){legacyServer=false;legacyRows=new Map();emit()}
    return ()=>stops.forEach(stop=>{try{stop?.()}catch{}});
  }
  async function deleteQualityRecord(id){
    const store=await productionDatabase();
    if(!id||String(id).includes('/'))throw new Error('Invalid Quality record.');
    await withWriteRetry(()=>store.collection('app_meta').doc(qualityMetaId('records',id)).delete(),'Quality delete');
    // Best-effort cleanup of older Quality locations. Never let an inaccessible
    // legacy path break the current R&D-backed app_meta path.
    for(const departmentId of QUALITY_DEPARTMENT_IDS){
      try{await qualityDepartmentCollection(store,departmentId,'records').doc(String(id)).delete()}catch(e){const code=String(e?.code||'').toLowerCase();if(!code.includes('permission-denied'))console.warn('Legacy Quality department delete skipped',departmentId,e)}
    }
    try{await store.collection('quality_records').doc(String(id)).delete()}catch(e){const code=String(e?.code||'').toLowerCase();if(!code.includes('permission-denied'))console.warn('Legacy Quality delete skipped',e)}
  }
  function departmentKey(value){return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,40)}
  function encodeDepartmentRecord(row){
    const r=row||{},o={};const put=(k,v)=>{if(v!==undefined&&v!==null&&v!=='')o[k]=v};
    put('t',String(r.type||'').slice(0,24));put('m',String(r.member||'').trim().slice(0,80));put('d',String(r.date||'').slice(0,10));put('k',String(r.task||'').slice(0,240));put('x',String(r.task_type||'').slice(0,40));put('c',String(r.custom_task||'').slice(0,240));put('f',String(r.from||'').slice(0,5));put('z',String(r.to||'').slice(0,5));if(r.minutes!==undefined)put('n',Number(r.minutes)||0);put('s',String(r.status||'').slice(0,20));put('r',String(r.remarks||'').slice(0,1500));put('p',String(r.problem||'').slice(0,1600));put('i',String(r.idea||'').slice(0,2000));put('b',String(r.benefit||'').slice(0,2000));put('h',String(r.priority||'').slice(0,16));if(r.attachment&&typeof r.attachment==='object')put('o',{n:String(r.attachment.name||'').slice(0,180),t:String(r.attachment.type||'').slice(0,120),s:Number(r.attachment.size)||0,p:String(r.attachment.path||'').slice(0,500),u:String(r.attachment.url||'').slice(0,1600)});put('y',String(r.period||'').slice(0,32));if(r.kpi_index!==undefined)put('q',Number(r.kpi_index));put('a',String(r.actual||'').slice(0,240));if(r.progress!==undefined)put('g',Math.max(0,Math.min(100,Number(r.progress)||0)));put('l',String(r.actor_role||'').slice(0,48));put('e',String(r.actor_scope||'').slice(0,48));put('j',String(r.actor_name||'').slice(0,80));put('D',String(r.department_key||'').slice(0,48));put('u',tsToNumber(r.updated_at)||Date.now());return o;
  }
  function decodeDepartmentRecord(doc){const d=doc.data?doc.data():doc||{},v=d&&typeof d.v==='object'?d.v:d;return{id:String(doc.id||d.id||'').replace(/^dept_[a-z0-9]+_/,''),type:v.t||'',member:v.m||'',date:v.d||'',task:v.k||'',task_type:v.x||'',custom_task:v.c||'',from:v.f||'',to:v.z||'',minutes:Number(v.n)||0,status:v.s||'',remarks:v.r||'',problem:v.p||'',idea:v.i||'',benefit:v.b||'',priority:v.h||'Medium',...(v.o?{attachment:{name:v.o.n||'',type:v.o.t||'',size:Number(v.o.s)||0,path:v.o.p||'',url:v.o.u||''}}:{}),period:v.y||'',kpi_index:v.q!==undefined?Number(v.q):undefined,actual:v.a||'',progress:v.g!==undefined?Number(v.g):undefined,actor_role:v.l||'',actor_scope:v.e||'',actor_name:v.j||'',department_key:v.D||'',updated_at:numberToIso(v.u)||''}}
  async function saveDepartmentRecord(key,id,row){const store=await productionDatabase(),k=departmentKey(key);if(!k||!id||String(id).includes('/'))throw new Error('Invalid department record.');const ref=store.collection('app_meta').doc(`dept_${k}_${String(id)}`),envelope={kind:`department_${k}_record`,v:encodeDepartmentRecord(row),u:Date.now(),audit:{actor:String(row?.actor_name||row?.member||'').trim(),role:String(row?.actor_role||'department_member'),scope:String(row?.actor_scope||k),department:k}};await withWriteRetry(()=>ref.set(envelope),'Department save');await flushPendingWrites();const confirmed=await withWriteRetry(()=>ref.get({source:'server'}),'Department verify');if(!confirmed.exists)throw new Error('Firebase did not confirm the saved department record.');lastError=null;ready=true;return decodeDepartmentRecord(confirmed)}
  async function watchDepartmentRecords(key,onRows,onError){const store=await productionDatabase(),k=departmentKey(key);if(!k)throw new Error('Invalid department.');const q=store.collection('app_meta').where('kind','==',`department_${k}_record`);return q.onSnapshot({includeMetadataChanges:true},snap=>{const connected=!snap.metadata?.fromCache;if(connected){lastError=null;ready=true}onRows(snap.docs.map(decodeDepartmentRecord).sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true})),{connected,fromCache:!connected,hasPendingWrites:Boolean(snap.metadata?.hasPendingWrites)})},err=>{lastError=err;onError?.(err)})}
  async function deleteDepartmentRecord(key,id){const store=await productionDatabase(),k=departmentKey(key);if(!k||!id||String(id).includes('/'))throw new Error('Invalid department record.');await withWriteRetry(()=>store.collection('app_meta').doc(`dept_${k}_${String(id)}`).delete(),'Department delete');await flushPendingWrites();return true}


  async function loadDepartmentRecordsOnce(key){const store=await productionDatabase(),k=departmentKey(key);if(!k)throw new Error('Invalid department.');const snap=await store.collection('app_meta').where('kind','==',`department_${k}_record`).get({source:'server'});return snap.docs.map(decodeDepartmentRecord).sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true}))}
  async function loadQualityRecordsOnce(kind){const store=await productionDatabase();if(!['projects','entries','records'].includes(kind))throw new Error('Invalid Quality record.');const snap=await store.collection('app_meta').where('kind','==',qualityMetaKind(kind)).get({source:'server'});return snap.docs.map(d=>decodeQualityMeta(kind,d))}
  async function loadReportDataOnce(){if(!ready)await init(true);const snap=await db.collection('app_meta').where('kind','==','kpi_entry').get({source:'server'});return snap.docs.map(d=>({id:d.id,...d.data()}))}
  const rowInMonth=(row,month)=>String(row?.date||row?.created_at||'').slice(0,7)===month||String(row?.period||row?.week_start||row?.start_date||'').includes(month);
  async function loadMonthBackup(key,month,mode='department'){if(!/^\d{4}-\d{2}$/.test(String(month)))throw new Error('Choose a valid month.');if(mode==='quality'){const [records,entries,projects]=await Promise.all(['records','entries','projects'].map(loadQualityRecordsOnce));return records.filter(r=>rowInMonth(r,month)).map(r=>({source:'quality_records',...r})).concat(entries.filter(r=>rowInMonth(r,month)).map(r=>({source:'quality_entries',...r})),projects.filter(r=>rowInMonth(r,month)).map(r=>({source:'quality_projects',...r})))}return (await loadDepartmentRecordsOnce(key)).filter(r=>rowInMonth(r,month))}
  async function saveBackupHistory(key,month,meta={}){const store=await productionDatabase(),k=departmentKey(key),now=Date.now(),id=`backup_${k}_${String(month).replace('-','')}_${now}`;await store.collection('app_meta').doc(id).set({kind:'backup_history',d:k,m:String(month),f:String(meta.filename||'').slice(0,220),c:Number(meta.count)||0,b:Number(meta.bytes)||0,t:now});await flushPendingWrites();const back=await store.collection('app_meta').doc(id).get({source:'server'});if(!back.exists)throw new Error('Firebase did not confirm backup history.');return{id,...back.data()}}
  async function loadBackupHistory(key){const store=await productionDatabase(),k=departmentKey(key),snap=await store.collection('app_meta').where('kind','==','backup_history').get({source:'server'});return snap.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.d===k).map(x=>({id:x.id,month:x.m,filename:x.f,count:x.c,bytes:x.b,downloaded_at:x.t,deleted_at:x.x||0})).sort((a,b)=>Number(b.downloaded_at)-Number(a.downloaded_at))}
  async function markBackupDeleted(id){const store=await productionDatabase();if(!String(id||'').startsWith('backup_'))throw new Error('Invalid backup history.');await store.collection('app_meta').doc(String(id)).set({x:Date.now()},{merge:true});await flushPendingWrites();return true}
  async function deleteDocsBatched(store,refs){let deleted=0;for(let i=0;i<refs.length;i+=400){const batch=store.batch();refs.slice(i,i+400).forEach(ref=>batch.delete(ref));await batch.commit();deleted+=Math.min(400,refs.length-i)}await flushPendingWrites();return deleted}
  async function deleteMonthData(key,month,mode='department'){if(!/^\d{4}-\d{2}$/.test(String(month)))throw new Error('Choose a valid month.');const store=await productionDatabase(),refs=[];if(mode==='quality'){for(const kind of ['records','entries','projects']){const snap=await store.collection('app_meta').where('kind','==',qualityMetaKind(kind)).get({source:'server'});snap.docs.forEach(doc=>{const row=decodeQualityMeta(kind,doc);if(rowInMonth(row,month))refs.push(doc.ref)})}}else{const k=departmentKey(key),snap=await store.collection('app_meta').where('kind','==',`department_${k}_record`).get({source:'server'});snap.docs.forEach(doc=>{const row=decodeDepartmentRecord(doc);if(rowInMonth(row,month))refs.push(doc.ref)})}const deleted=await deleteDocsBatched(store,refs);return{deleted}}

  window.rndCloud={loadReportDataOnce,deleteMonthData,markBackupDeleted,loadBackupHistory,saveBackupHistory,loadMonthBackup,loadQualityRecordsOnce,loadDepartmentRecordsOnce,deleteDepartmentRecord,watchDepartmentRecords,saveDepartmentRecord,deleteQualityRecord,saveQualityTime,watchQualityTime,saveProduction,watchProduction,watchReportData,saveReportEntry,toggleChatReaction,configured,init,loadSnapshot,syncSnapshot,upsert,writeMany,deleteMany,watch,reconnect,flushPendingWrites,test,status,sendChatMessage,deleteChatMessage,watchChat,stopChat,createExcelSheet,updateExcelSheet,deleteExcelSheet,saveExcelWorkbookMeta,loadExcelGrid,saveExcelGridRow,watchExcelWorkbook,stopExcelWorkbook,get enabled(){return ready}};
})();
