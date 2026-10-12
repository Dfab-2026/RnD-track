(function(){
  const COLLECTIONS=['members','departments','ideas','cycles','projects','progress'];
  let db=null, storage=null, auth=null, ready=false, baseline={}, unsubscribers=[], remoteTimer=null;
  const cfg=()=>window.RND_FIREBASE_CONFIG||{};
  const configured=()=>cfg().apiKey && !String(cfg().apiKey).startsWith('PASTE_') && cfg().projectId && !String(cfg().projectId).startsWith('PASTE_');
  const clean=(v)=>{
    if(Array.isArray(v)) return v.map(clean);
    if(v && typeof v==='object'){
      const out={};
      Object.entries(v).forEach(([k,val])=>{
        if(val===undefined || val===null || val==='') return;
        if(k.endsWith('_name') || k==='attachment_path') return;
        out[k]=clean(val);
      });
      return out;
    }
    return v;
  };
  const stable=(v)=>JSON.stringify(clean(v));
  const dataUrlToBlob=(dataUrl)=>{
    const [head,body]=String(dataUrl).split(',');
    const mime=(head.match(/data:([^;]+)/)||[])[1]||'application/octet-stream';
    const bytes=atob(body||'');
    const arr=new Uint8Array(bytes.length);
    for(let i=0;i<bytes.length;i++) arr[i]=bytes.charCodeAt(i);
    return new Blob([arr],{type:mime});
  };
  const safeName=(s)=>String(s||'file').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(-100);
  async function uploadAttachment(att,kind,recordId){
    if(!att || att.storage_path || !att.data) return att||null;
    if(!storage) return att;
    const blob=dataUrlToBlob(att.data);
    const ext=(safeName(att.name).split('.').pop()||'bin').toLowerCase();
    const path=`rnd-track/${kind}/${recordId}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    const ref=storage.ref().child(path);
    await ref.put(blob,{contentType:blob.type||att.type||'application/octet-stream',cacheControl:'public,max-age=31536000,immutable'});
    const url=await ref.getDownloadURL();
    return {name:att.name||'attachment',type:blob.type||att.type||'',size:blob.size,storage_path:path,url};
  }
  async function prepareAttachments(snapshot){
    const copy=structuredClone(snapshot);
    for(const idea of copy.ideas||[]){ if(idea.attachment?.data) idea.attachment=await uploadAttachment(idea.attachment,'ideas',idea.id); }
    for(const row of copy.progress||[]){ if(row.attachment?.data) row.attachment=await uploadAttachment(row.attachment,'progress',row.id); }
    return copy;
  }
  async function init(){
    if(!configured()) return {enabled:false,reason:'Firebase config not added yet'};
    if(!window.firebase) throw new Error('Firebase SDK did not load. Check internet connection.');
    if(!firebase.apps.length) firebase.initializeApp(cfg());
    db=firebase.firestore(); storage=firebase.storage(); auth=firebase.auth();
    try{ await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); }catch{}
    if(!auth.currentUser) await auth.signInAnonymously();
    try{ await db.enablePersistence({synchronizeTabs:true}); }catch(e){ if(!['failed-precondition','unimplemented'].includes(e.code)) console.warn(e); }
    ready=true;
    return {enabled:true,user:auth.currentUser?.uid||null};
  }
  async function loadSnapshot(){
    if(!ready) return null;
    const snap={members:[],departments:[],ideas:[],cycles:[],projects:[],progress:[],schema_version:3,updated_at:new Date().toISOString()};
    for(const name of COLLECTIONS){
      const qs=await db.collection(name).get();
      snap[name]=qs.docs.map(d=>d.data());
      baseline[name]=Object.fromEntries(snap[name].map(x=>[String(x.id),stable(x)]));
    }
    return snap;
  }
  async function syncSnapshot(snapshot){
    if(!ready) return snapshot;
    const prepared=await prepareAttachments(snapshot);
    for(const name of COLLECTIONS){
      const rows=prepared[name]||[];
      const old=baseline[name]||{};
      const now={};
      let batch=db.batch(), ops=0;
      const flush=async()=>{ if(ops){ await batch.commit(); batch=db.batch(); ops=0; } };
      for(const row of rows){
        const id=String(row.id), doc=clean(row), sig=stable(doc); now[id]=sig;
        if(old[id]!==sig){ batch.set(db.collection(name).doc(id),doc,{merge:false}); ops++; if(ops>=400) await flush(); }
      }
      for(const id of Object.keys(old)){ if(!(id in now)){ batch.delete(db.collection(name).doc(id)); ops++; if(ops>=400) await flush(); } }
      await flush(); baseline[name]=now;
    }
    return prepared;
  }
  function watch(onChange){
    if(!ready || typeof onChange!=='function') return ()=>{};
    unsubscribers.forEach(fn=>fn()); unsubscribers=[];
    const fire=()=>{ clearTimeout(remoteTimer); remoteTimer=setTimeout(async()=>{ try{ const s=await loadSnapshot(); onChange(s); }catch(e){ console.warn('Firebase refresh failed',e); } },300); };
    COLLECTIONS.forEach(name=>unsubscribers.push(db.collection(name).onSnapshot(fire,err=>console.warn('Firebase watch',name,err))));
    return ()=>{unsubscribers.forEach(fn=>fn());unsubscribers=[]};
  }
  async function test(){
    if(!ready) return {ok:false,message:'Firebase is not configured.'};
    const ref=db.collection('_system').doc('health');
    await ref.set({ok:true,ts:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    await ref.get();
    return {ok:true,message:'Firebase connection is working.'};
  }
  window.rndCloud={configured,init,loadSnapshot,syncSnapshot,watch,test,get enabled(){return ready}};
})();
