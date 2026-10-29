const state={members:[],departments:[],ideas:[],cycles:[],projects:[],progress:[],masterSheet:[],page:'dashboard',selectedProject:null,reportType:'daily',analyticsRange:'30',workMonthKey:'',workWeek:1};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const today=()=>{const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const fmtDate=s=>s?new Date(s+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';
const fmtDateFilter=s=>{if(!s)return '';const [y,m,d]=String(s).split('-');return y&&m&&d?`${d}-${m}-${y}`:s};
function syncIdeaDateDisplay(){const input=$('#ideaDateFilter'),display=$('#ideaDateFilterDisplay');if(display)display.value=fmtDateFilter(input?.value||'')}
const toast=(m,err=false)=>{const t=$('#toast');t.textContent=m;t.className='toast show'+(err?' error':'');setTimeout(()=>t.className='toast',2600)};
const DB_NAME='rndTrackerStatic';
const DB_VERSION=2;
const STORE='app';
const SNAPSHOT_KEY='snapshot';
const defaultMembers=['Kabil','Abinaya','Gautham','Akash'];
const DEFAULT_ADMIN_NAME='Pramod';
const DEFAULT_VISITOR_NAME='Admin';
const defaultDepartments=['Production','NPD','R&D','Marketing','Purchase','Accounts','Quality','RFQ'];
function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function readSnapshot(){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(SNAPSHOT_KEY);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}
async function writeSnapshot(data){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(data,SNAPSHOT_KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
function seedSnapshot(){
  const now=new Date().toISOString();
  const members=defaultMembers.map((name,i)=>({id:i+1,name,role:'member',active:1,sort_order:i+1,created_at:now,updated_at:now}));
  members.push({id:5,name:DEFAULT_ADMIN_NAME,role:'visitor',active:1,sort_order:5,created_at:now,updated_at:now});
  return {members,departments:defaultDepartments.map((name,i)=>({id:i+1,name,active:1,sort_order:i+1,created_at:now,updated_at:now})),ideas:[],cycles:[],projects:[],progress:[]}
}
function canonicalizeMembers(snap){
  const now=new Date().toISOString();
  const original=(Array.isArray(snap.members)?snap.members:[]).map((m,index)=>({
    ...m,
    id:Number(m.id),
    name:normalizeName(m.name)==='gowtham'?'Gautham':String(m.name||'').trim().replace(/\s+/g,' '),
    role:m.role==='visitor'?'visitor':'member',
    active:Number(m.active)===0?0:1,
    sort_order:Number(m.sort_order)||index+1,
    created_at:m.created_at||now,
    updated_at:m.updated_at||m.created_at||now
  })).filter(m=>Number.isFinite(m.id)&&m.name);
  if(!original.length){snap.members=seedSnapshot().members;return snap;}
  const byName=new Map(),idMap=new Map(),clean=[];
  const sorted=[...original].sort((a,b)=>a.sort_order-b.sort_order||a.id-b.id);
  for(const m of sorted){
    const key=normalizeName(m.name);if(!key)continue;
    const existing=byName.get(key);
    if(!existing){byName.set(key,m);clean.push(m);idMap.set(m.id,m.id);continue;}
    // Reuse the earliest canonical ID. If a duplicate was active, keep the login active.
    if(m.active&&!existing.active){existing.active=1;existing.role=m.role;existing.updated_at=m.updated_at||now;}
    idMap.set(m.id,existing.id);
  }
  const remap=value=>idMap.get(Number(value))??Number(value);
  (snap.ideas||[]).forEach(r=>{r.submitted_by=remap(r.submitted_by)});
  (snap.projects||[]).forEach(r=>{r.owner_id=remap(r.owner_id)});
  (snap.progress||[]).forEach(r=>{r.user_id=remap(r.user_id)});
  clean.sort((a,b)=>a.sort_order-b.sort_order||a.id-b.id).forEach((m,i)=>m.sort_order=i+1);
  snap.members=clean;
  snap._removed_member_ids=original.map(m=>m.id).filter(id=>!clean.some(r=>r.id===id));
  return snap;
}
function migrateSnapshot(data){
  const snap=data||seedSnapshot(),now=new Date().toISOString();
  snap.members=Array.isArray(snap.members)?snap.members:[];
  snap.departments=Array.isArray(snap.departments)?snap.departments:[];
  snap.ideas=Array.isArray(snap.ideas)?snap.ideas:[];
  snap.cycles=Array.isArray(snap.cycles)?snap.cycles:[];
  snap.projects=Array.isArray(snap.projects)?snap.projects:[];
  snap.progress=Array.isArray(snap.progress)?snap.progress:[];
  canonicalizeMembers(snap);
  if(!snap.members.some(m=>normalizeName(m.name)===normalizeName(DEFAULT_ADMIN_NAME))){
    snap.members.push({id:nextId(),name:DEFAULT_ADMIN_NAME,role:'visitor',active:1,sort_order:Math.max(0,...snap.members.map(m=>Number(m.sort_order)||0))+1,created_at:now,updated_at:now});
  }
  const seen=new Set();
  snap.departments=(snap.departments.length?snap.departments:defaultDepartments.map((name,i)=>({id:i+1,name,active:1,sort_order:i+1,created_at:now,updated_at:now})))
    .map((d,i)=>({id:Number(d.id)||i+1,name:String(d.name||'').trim().replace(/\s+/g,' '),active:Number(d.active)===0?0:1,sort_order:Number(d.sort_order)||i+1,created_at:d.created_at||now,updated_at:d.updated_at||d.created_at||now}))
    .filter(d=>d.name&&(!seen.has(normalizeName(d.name))&&seen.add(normalizeName(d.name))))
    .sort((a,b)=>a.sort_order-b.sort_order||a.id-b.id);
  // Keep legacy assignments visible while the cloud repair is being persisted.
  snap.projects=snap.projects.map(project=>{
    if(snap.cycles.some(c=>Number(c.id)===Number(project.cycle_id)))return project;
    const matches=snap.cycles.filter(c=>c.start_date===project.start_date&&c.end_date===project.end_date);
    return matches.length===1?{...project,cycle_id:Number(matches[0].id)}:project;
  });
  snap.schema_version=22;
  snap.updated_at=now;
  return snap;
}
function rowStamp(row){const v=row?.updated_at||row?.created_at||'';const n=Date.parse(v);return Number.isFinite(n)?n:0}
function mergeById(localRows=[],remoteRows=[]){
  const map=new Map();
  localRows.forEach(row=>map.set(String(row.id),row));
  remoteRows.forEach(row=>{const key=String(row.id),local=map.get(key);if(!local||rowStamp(row)>=rowStamp(local)){const merged={...local,...row};if(local?.attachment?.data&&!row?.attachment?.data)merged.attachment=local.attachment;map.set(key,merged)}});
  return [...map.values()];
}
function mergeSnapshots(local,remote){
  const l=migrateSnapshot(local||seedSnapshot()),r=migrateSnapshot(remote||{});
  return migrateSnapshot({
    members:mergeById(l.members,r.members),
    departments:mergeById(l.departments,r.departments),
    ideas:mergeById(l.ideas,r.ideas),
    cycles:mergeById(l.cycles,r.cycles),
    projects:mergeById(l.projects,r.projects),
    progress:mergeById(l.progress,r.progress)
  });
}
function disableWritingAssist(root=document){
  root.querySelectorAll?.('input,textarea').forEach(el=>{
    el.setAttribute('spellcheck','false');
    el.setAttribute('data-gramm','false');
    el.setAttribute('data-gramm_editor','false');
    el.setAttribute('data-enable-grammarly','false');
    el.setAttribute('data-lt-active','false');
    el.setAttribute('data-ms-editor','false');
    el.setAttribute('autocorrect','off');
    el.setAttribute('autocapitalize','off');
  });
}
async function requestDurableStorage(){try{if(navigator.storage?.persist){const granted=await navigator.storage.persist();localStorage.setItem('rnd_storage_persisted',granted?'1':'0');return granted}}catch{}return false}
function storageStatus(){return localStorage.getItem('rnd_storage_persisted')==='1'?'Persistent storage enabled':'Standard browser storage'}

const THEME_COLOR_KEY='rnd_theme_mode';
const THEME_COLORS=['light','dark'];
function applyThemeColor(name){
  const theme=THEME_COLORS.includes(name)?name:'light';
  document.documentElement.dataset.themeColor=theme;
  try{localStorage.setItem(THEME_COLOR_KEY,theme)}catch{}
  $$('.theme-swatch').forEach(b=>b.classList.toggle('active',b.dataset.themeColor===theme));
  return theme;
}
function initThemeColor(){
  let saved='light';
  try{
    saved=localStorage.getItem(THEME_COLOR_KEY)||'light';
    if(!THEME_COLORS.includes(saved)){
      const legacy=localStorage.getItem('rnd_theme_color');
      saved=legacy==='slate'?'dark':'light';
    }
  }catch{}
  applyThemeColor(saved);
}

function notificationsEnabled(){return ('Notification' in window)&&Notification.permission==='granted'}
async function registerNotificationWorker(){if(!('serviceWorker' in navigator))return false;try{await navigator.serviceWorker.register('./notification-sw.js',{scope:'./'});return true}catch(e){console.warn('Notification worker',e);return false}}
async function enableNotifications(){if(!('Notification' in window))return false;if(Notification.permission==='granted')return true;if(Notification.permission==='denied')return false;const permission=await Notification.requestPermission();return permission==='granted'}
function requestNotificationsFromGesture(){if(!('Notification' in window)||Notification.permission!=='default')return;enableNotifications().then(ok=>{if(ok){notifyUser('R&D Track notifications','Chrome notifications are enabled for this tracker.');maybeDailyReminder()}}).catch(()=>{})}
function notifyUser(title,body){if(!notificationsEnabled())return;try{new Notification(title,{body,tag:'rnd-track-'+title.replace(/\s+/g,'-').toLowerCase()})}catch{}}
function maybeDailyReminder(){const m=currentMember();if(!m||m.role==='visitor'||!notificationsEnabled())return;const key=`rnd_reminder_${m.id}_${today()}`;if(localStorage.getItem(key))return;const submitted=state.ideas.some(i=>Number(i.submitted_by)===Number(m.id)&&i.submission_date===today());if(!submitted){notifyUser('R&D Track · Daily Idea','Your daily idea is still pending for today.');localStorage.setItem(key,'1')}}
function localIsoDate(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function trackerDateToIso(v){const m=String(v||'').match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);if(!m)return String(v||'');const months={Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};return `${m[3]}-${months[m[2]]||'01'}-${m[1]}`}
function projectPendingForDate(p,date){
  if(!p||p.status==='completed'||date<p.start_date||date>p.end_date)return null;
  const rows=trackerRowsForProject(p),row=rows.find(r=>trackerDateToIso(r.date)===date);
  if(row?.status==='completed')return null;
  return {project:p,row,date,task:String(row?.task||row?.stage||p.title||'Weekly task').trim(),status:row?.status||'pending'};
}
function pendingTaskSummary(){
  const m=currentMember(),d0=new Date(),d1=new Date();d1.setDate(d1.getDate()-1);
  const todayKey=localIsoDate(d0),yesterdayKey=localIsoDate(d1);
  const all=state.projects.filter(p=>p.status!=='completed');
  const teammateIds=new Set(workingMembers().map(x=>Number(x.id)));
  const own=all.filter(p=>Number(p.owner_id)===Number(m?.id));
  const other=all.filter(p=>Number(p.owner_id)!==Number(m?.id)&&teammateIds.has(Number(p.owner_id)));
  const pack=source=>({
    today:source.map(p=>projectPendingForDate(p,todayKey)).filter(Boolean),
    yesterday:source.map(p=>projectPendingForDate(p,yesterdayKey)).filter(Boolean)
  });
  return {own:pack(own),other:pack(other),todayKey,yesterdayKey};
}
function pendingOwnerName(item){return state.members.find(m=>Number(m.id)===Number(item?.project?.owner_id))?.name||item?.project?.owner_name||'Unknown'}
function notificationItemHtml(x,label){return `<button type="button" class="notification-item ${label==='Mine'?'mine':''}" data-pending-go="progress" data-pending-project="${Number(x.project?.id)||0}"><div class="notification-item-main"><div class="notification-item-top"><span class="notification-owner">${esc(label==='Mine'?'MY TASK':pendingOwnerName(x))}</span><span class="notification-date">${esc(fmtDate(x.date))}</span></div><strong>${esc(x.task)}</strong><small>${esc(x.project.title||x.project.project_number||'Weekly project')}</small></div><span class="pending-status">${x.status==='issue'?'ISSUE':x.status==='in_progress'?'IN PROGRESS':'PENDING'}</span></button>`}
function dailyIdeaPendingMembers(){
  const submitted=new Set(state.ideas.filter(i=>i.submission_date===today()).map(i=>Number(i.submitted_by)));
  return workingMembers().filter(m=>!submitted.has(Number(m.id)));
}
function teamDailyIdeaPendingMembers(){return dailyIdeaPendingMembers().filter(m=>Number(m.id)!==Number(currentMember()?.id))}
function teamDailyIdeaNotificationHtml(m){return `<button type="button" class="notification-item" data-pending-go="ideas"><div class="notification-item-main"><div class="notification-item-top"><span class="notification-owner">${esc(m.name)}</span><span class="notification-date">${esc(fmtDate(today()))}</span></div><strong>Daily Idea</strong><small>Today's idea is not submitted yet.</small></div><span class="pending-status">PENDING</span></button>`}
function currentTaskAlertCount(){
  if(!currentMember())return 0;
  const data=pendingTaskSummary();
  return data.own.yesterday.length+data.own.today.length+data.other.yesterday.length+data.other.today.length;
}
function updateUnifiedNotificationBadge(){
  const badge=$('#notificationBellBadge');if(!badge)return;
  const m=currentMember(),dailyIdeaPending=m&&m.role!=='visitor'&&!state.ideas.some(i=>Number(i.submitted_by)===Number(m.id)&&i.submission_date===today());
  const total=currentTaskAlertCount()+(dailyIdeaPending?1:0)+teamDailyIdeaPendingMembers().length+Number(teamChatUnread||0);
  badge.textContent=String(Math.min(total,99));
  badge.classList.toggle('hidden',total<=0);
  badge.title=`${currentTaskAlertCount()} task alert${currentTaskAlertCount()===1?'':'s'} · ${teamChatUnread} unread chat`;
}
function renderNotificationCenter(){
  const panel=$('#notificationPanelContent');if(!panel||!currentMember())return;
  const data=pendingTaskSummary();
  const mine=[...data.own.yesterday,...data.own.today];
  const team=[...data.other.yesterday,...data.other.today];
  const m=currentMember(),dailyIdeaPending=m&&m.role!=='visitor'&&!state.ideas.some(i=>Number(i.submitted_by)===Number(m.id)&&i.submission_date===today());
  const teamDaily=teamDailyIdeaPendingMembers();
  const teamHtml=teamDaily.map(teamDailyIdeaNotificationHtml).join('')+team.map(x=>notificationItemHtml(x,'Team')).join('');
  const mineHtml=(dailyIdeaPending?`<button type="button" class="notification-item mine" data-pending-go="ideas"><div class="notification-item-main"><div class="notification-item-top"><span class="notification-owner">MY TASK</span><span class="notification-date">${esc(fmtDate(today()))}</span></div><strong>Daily Idea</strong><small>Today's idea is not submitted yet.</small></div><span class="pending-status">PENDING</span></button>`:'')+mine.map(x=>notificationItemHtml(x,'Mine')).join('');
  panel.innerHTML=`<section class="notification-group"><div class="notification-group-title"><span>MY PENDING</span><b>${mine.length+(dailyIdeaPending?1:0)}</b></div>${mineHtml||'<div class="notification-empty">No pending tasks for you.</div>'}</section><section class="notification-group"><div class="notification-group-title"><span>TEAM PENDING</span><b>${team.length+teamDaily.length}</b></div>${teamHtml||'<div class="notification-empty">No pending tasks from other members.</div>'}</section><section class="notification-group notification-chat-group"><div class="notification-group-title"><span>TEAM CHAT</span><b>${teamChatUnread}</b></div><button type="button" class="notification-chat-link" id="notificationChatLink"><span>${teamChatUnread?`${teamChatUnread} unread message${teamChatUnread===1?'':'s'}`:(teamChatMessages.length?`Latest: ${esc(String(teamChatMessages[teamChatMessages.length-1]?.text||'New team message').slice(0,48))}`:'No chat messages yet')}</span><b>OPEN CHAT →</b></button></section>`;
  bindPendingNavigation(panel);
  $('#notificationChatLink')?.addEventListener('click',()=>{showPage('chat');$('#notificationPanel')?.classList.add('hidden');$('#notificationBellBtn')?.setAttribute('aria-expanded','false')});
  updateUnifiedNotificationBadge();
}
let pendingPopupShownThisOpen=false;
function renderPendingTaskPopup(){
  const dialog=$('#pendingTaskDialog'),host=$('#pendingTaskContent'),m=currentMember();
  if(!dialog||!host||!m)return;
  const items=dashboardPendingItems();
  if(!items.length)return;
  host.innerHTML=`<section class="pending-day single"><div class="pending-day-head"><div><span>MY PENDING WORK</span><strong>${esc(m.name)}</strong></div><b>${items.length}</b></div>${items.map(x=>`<button type="button" class="pending-task-item pending-popup-link" data-pending-go="${esc(x.page)}" data-pending-project="${Number(x.projectId)||0}"><div><strong>${esc(x.page==='ideas'?'DAILY IDEA':'WORK TRACKING')}</strong><h4>${esc(x.label)}</h4><p>${esc(x.detail||'Pending item')}</p></div><span class="pending-status">PENDING</span></button>`).join('')}</section>`;
  $('#pendingTaskTotal').textContent=String(items.length);
  $('#pendingNotificationBtn').classList.toggle('hidden',!('Notification' in window)||Notification.permission==='granted');
  host.querySelectorAll('[data-pending-go]').forEach(el=>el.onclick=()=>{dialog.close();goToPendingItem(el.dataset.pendingGo,Number(el.dataset.pendingProject)||0)});
  if(!dialog.open)dialog.showModal();
  if(notificationsEnabled())notifyUser('R&D Track · My Pending',`${items.length} pending item${items.length===1?'':'s'} need your attention.`);
}
function maybeShowPendingTaskPopup(){
  if(pendingPopupShownThisOpen)return;
  if(!currentMember())return;
  if(!dashboardPendingItems().length)return;
  pendingPopupShownThisOpen=true;
  setTimeout(()=>renderPendingTaskPopup(),450);
}
function rawSnapshot(){return {schema_version:22,exported_at:new Date().toISOString(),members:state.members.map(({id,name,role='member',active=1,sort_order=0,created_at,updated_at})=>({id,name,role,active,sort_order,created_at,updated_at})),departments:state.departments.map(({id,name,active=1,sort_order=0})=>({id,name,active,sort_order})),ideas:state.ideas.map(({submitted_by_name,department_name,attachment_path,...i})=>i),cycles:state.cycles,projects:state.projects.map(({owner_name,cycle_label,department_name,...p})=>p),progress:state.progress.map(({user_name,attachment_path,...u})=>u)} }
function exportDatabase(){const payload=JSON.stringify(rawSnapshot(),null,2);const blob=new Blob([payload],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`RND-TRACK-backup-${today()}.json`;a.click();URL.revokeObjectURL(a.href)}
async function importDatabaseFile(file){if(!file)throw new Error('Choose a backup file.');let parsed;try{parsed=JSON.parse(await file.text())}catch{throw new Error('Invalid backup file.')}if(!parsed||!Array.isArray(parsed.members)||!Array.isArray(parsed.ideas)||!Array.isArray(parsed.projects))throw new Error('This file is not a valid R&D Track backup.');const migrated=migrateSnapshot(parsed);await writeSnapshot(migrated);if(window.rndCloud?.enabled){try{await window.rndCloud.syncSnapshot(migrated);clearPendingCloudOps()}catch(e){queueCloudOps(['members','departments','ideas','cycles','projects','progress'].flatMap(collection=>(migrated[collection]||[]).map(row=>({collection,row}))))}}return true}
const nextId=()=>Math.floor(Date.now()*1000+(crypto.getRandomValues(new Uint32Array(1))[0]%1000));
function enrich(data){const members=(data.members||[]).map(m=>({...m,role:m.role==='visitor'?'visitor':'member'})),departments=data.departments||[],ideas=(data.ideas||[]).map(i=>({...i,submitted_by_name:members.find(m=>m.id===i.submitted_by)?.name||'Unknown',department_name:departments.find(d=>d.id===i.department_id)?.name||'Unknown',attachment_path:i.attachment?.data||''}));const projects=(data.projects||[]).map(p=>{const idea=ideas.find(i=>i.id===p.idea_id);return {...p,owner_name:members.find(m=>m.id===p.owner_id)?.name||'—',cycle_label:(data.cycles||[]).find(c=>c.id===p.cycle_id)?.label||'—',department_name:idea?.department_name||'—'}});const progress=(data.progress||[]).map(u=>({...u,user_name:members.find(m=>m.id===u.user_id)?.name||'Unknown',attachment_path:u.attachment?.data||''}));return {members,departments,ideas:ideas.sort((a,b)=>b.id-a.id),cycles:[...(data.cycles||[])].sort((a,b)=>b.start_date.localeCompare(a.start_date)||b.id-a.id),projects:projects.sort((a,b)=>b.id-a.id),progress}}
function normalizeName(s){return String(s||'').toLowerCase().trim().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ')}
function levenshtein(a,b){const m=a.length,n=b.length,d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
function findLogin(name){const q=normalizeName(name);if(!q)return {matched:false,error:'Enter your name.'};const logins=state.members.filter(m=>Number(m.active)!==0);const exact=logins.find(m=>normalizeName(m.name)===q);if(exact)return {matched:true,member:exact};let best=null,bestScore=-1;for(const m of logins){const n=normalizeName(m.name),qt=q.split(' '),nt=n.split(' ');let score=0;if(n.includes(q)||q.includes(n))score+=8;score+=qt.filter(t=>nt.some(x=>x===t||x.startsWith(t)||t.startsWith(x))).length*5;const dist=levenshtein(q,n),max=Math.max(q.length,n.length)||1;score+=(1-dist/max)*4;if(score>bestScore){bestScore=score;best=m}}return best&&bestScore>=3?{matched:false,error:'Name not matched exactly.',suggestion:best}:{matched:false,error:'Name not found in saved members.'}}
const PENDING_KEY='rnd_pending_cloud_ops';
const PENDING_DELETE_KEY='rnd_pending_cloud_deletes';
const SIDEBAR_CLOSED_KEY='rnd_sidebar_closed';
let selectedManualTrackerRow=null;
function pendingCloudOps(){try{return JSON.parse(localStorage.getItem(PENDING_KEY)||'[]')}catch{return[]}}
function queueCloudOps(ops){const deletes=new Set(pendingCloudDeletes().map(x=>`${x.collection}:${x.id}`)),existing=pendingCloudOps(),map=new Map(existing.map(x=>[`${x.collection}:${x.row?.id}`,x]));(ops||[]).forEach(x=>{const key=`${x?.collection}:${x?.row?.id}`;if(x?.collection&&x?.row?.id!==undefined&&!deletes.has(key))map.set(key,x)});localStorage.setItem(PENDING_KEY,JSON.stringify([...map.values()].slice(-500)))}
function removePendingCloudOps(ops){const sent=new Map((ops||[]).map(x=>[`${x.collection}:${x.row?.id}`,JSON.stringify(x.row)]));const left=pendingCloudOps().filter(x=>sent.get(`${x.collection}:${x.row?.id}`)!==JSON.stringify(x.row));if(left.length)localStorage.setItem(PENDING_KEY,JSON.stringify(left));else localStorage.removeItem(PENDING_KEY)}
function clearPendingCloudOps(){localStorage.removeItem(PENDING_KEY)}
function pendingCloudDeletes(){try{return JSON.parse(localStorage.getItem(PENDING_DELETE_KEY)||'[]')}catch{return[]}}
function queueCloudDelete(collection,ids){const cur=pendingCloudDeletes(),map=new Map(cur.map(x=>[`${x.collection}:${x.id}`,x])),deleteKeys=new Set();(ids||[]).forEach(id=>{const key=`${collection}:${id}`;map.set(key,{collection,id});deleteKeys.add(key)});localStorage.setItem(PENDING_DELETE_KEY,JSON.stringify([...map.values()].slice(-500)));const ops=pendingCloudOps().filter(x=>!deleteKeys.has(`${x.collection}:${x.row?.id}`));if(ops.length)localStorage.setItem(PENDING_KEY,JSON.stringify(ops));else localStorage.removeItem(PENDING_KEY)}
function removePendingCloudDeletes(collection,ids){const keys=new Set((ids||[]).map(id=>`${collection}:${id}`));const left=pendingCloudDeletes().filter(x=>!keys.has(`${x.collection}:${x.id}`));if(left.length)localStorage.setItem(PENDING_DELETE_KEY,JSON.stringify(left));else localStorage.removeItem(PENDING_DELETE_KEY)}
function clearPendingCloudDeletes(){localStorage.removeItem(PENDING_DELETE_KEY)}
let localPersistChain=Promise.resolve();
function persistState(){const snap=JSON.parse(JSON.stringify(rawSnapshot()));const task=localPersistChain.then(()=>writeSnapshot(snap));localPersistChain=task.catch(()=>{});return task.then(()=>snap)}
let cloudFlushPromise=null;
async function cloudWrite(ops,{silent=false}={}){
  queueCloudOps(JSON.parse(JSON.stringify(ops||[])));
  return flushPendingCloudOps();
}
async function cloudDelete(collection,ids){queueCloudDelete(collection,ids);return flushPendingCloudOps()}
function flushPendingCloudOps(){
  if(cloudFlushPromise)return cloudFlushPromise;
  if(!window.rndCloud?.enabled){setCloudRuntimeStatus('offline','Saved locally · waiting for Firebase reconnect');return Promise.resolve(false)}
  cloudFlushPromise=(async()=>{
    try{
      while(pendingCloudDeletes().length||pendingCloudOps().length){
        const by={};pendingCloudDeletes().forEach(x=>(by[x.collection]??=[]).push(x.id));
        for(const [collection,ids] of Object.entries(by)){await window.rndCloud.deleteMany(collection,ids);removePendingCloudDeletes(collection,ids)}
        const ops=pendingCloudOps();
        if(ops.length){await window.rndCloud.writeMany(ops);removePendingCloudOps(ops)}
      }
      setCloudRuntimeStatus('live');return true;
    }catch(e){setCloudRuntimeStatus('offline',e?.message||String(e));return false}
  })().finally(()=>{cloudFlushPromise=null});
  return cloudFlushPromise;
}

let renderQueued=false;
function renderPage(name=state.page){
  populateSelects();applyRoleAccess();
  if(name==='dashboard')renderDashboard();
  else if(name==='ideas')renderIdeas();
  else if(name==='weekly')renderWeekly();
  else if(name==='progress')renderProjects();
  else if(name==='timeconsume')window.renderTimeConsume?.();
  else if(name==='chat'){updateTeamChatIdentity();renderTeamChat();startTeamChat();}
  else if(name==='kpi')renderKpiReport();
  else if(name==='settings')renderSettings();
  bindRecordActions();
}
let deferredLiveRender=false;
function scheduleRender(full=false){
  if(renderQueued)return;renderQueued=true;
  requestAnimationFrame(()=>{
    renderQueued=false;
    const active=document.activeElement,page=$(`#${state.page}Page`);
    if(active&&page?.contains(active)&&/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)&&state.page!=='chat'){
      if(!deferredLiveRender){deferredLiveRender=true;active.addEventListener('blur',()=>{deferredLiveRender=false;scheduleRender(full)},{once:true})}
      updateUnifiedNotificationBadge();return;
    }
    const positions=$$('[id]').filter(el=>el.scrollTop||el.scrollLeft).map(el=>({id:el.id,top:el.scrollTop,left:el.scrollLeft}));
    full?renderAll():renderPage();
    for(const pos of positions){const el=document.getElementById(pos.id);if(el){el.scrollTop=pos.top;el.scrollLeft=pos.left}}
    updateCompactProfile();updateUnifiedNotificationBadge();
    if(!$('#notificationPanel')?.classList.contains('hidden'))renderNotificationCenter();
  });
}
function pendingDeleteSet(){return new Set(pendingCloudDeletes().map(x=>`${x.collection}:${x.id}`))}
function reconcileRemoteSnapshot(remote,local){
  const base=migrateSnapshot(remote||{}),cached=migrateSnapshot(local||seedSnapshot()),deleted=pendingDeleteSet(),pending=pendingCloudOps();
  const out={members:[],departments:[],ideas:[],cycles:[],projects:[],progress:[]};
  for(const collection of ['members','departments','ideas','cycles','projects','progress']){
    const map=new Map();
    for(const row of (base[collection]||[])){
      if(deleted.has(`${collection}:${row.id}`))continue;
      const localRow=(cached[collection]||[]).find(x=>String(x.id)===String(row.id));
      const merged={...row};
      if(localRow?.attachment?.data&&!row?.attachment?.data)merged.attachment=localRow.attachment;
      map.set(String(row.id),merged);
    }
    for(const op of pending.filter(x=>x.collection===collection)){
      if(!deleted.has(`${collection}:${op.row.id}`))map.set(String(op.row.id),op.row);
    }
    out[collection]=[...map.values()];
  }
  return migrateSnapshot(out);
}
async function persistThenSync(writes=[],deletes=[]){
  for(const d of deletes)queueCloudDelete(d.collection,d.ids||[]);
  if(writes.length)queueCloudOps(writes);
  scheduleRender();
  await persistState();
  void flushPendingCloudOps();
}
async function refreshFromStorage(){let snap=await readSnapshot();if(!snap)snap=seedSnapshot();snap=migrateSnapshot(snap);await writeSnapshot(snap);const ui={page:state.page,selectedProject:state.selectedProject,reportType:state.reportType};Object.assign(state,enrich(snap),ui)}
async function updateMemberLocal(id,{name,role}){if(isLead(state.members.find(m=>Number(m.id)===Number(id)))&&!isLead())throw new Error('Only Kabil can change the R&D Lead profile.');
  const m=state.members.find(x=>Number(x.id)===Number(id));if(!m||Number(m.active)===0)throw new Error('Login not found.');
  name=String(name||'').trim().replace(/\s+/g,' ');role=role==='visitor'?'visitor':'member';
  if(name.length<2||name.length>80)throw new Error('Enter a valid name between 2 and 80 characters.');
  const normalized=normalizeName(name);
  if(state.members.some(x=>Number(x.id)!==Number(m.id)&&normalizeName(x.name)===normalized))throw new Error('That name already belongs to another saved login.');
  m.name=name;m.role=role;m.updated_at=new Date().toISOString();
  const saved=storedLogin();if(saved&&Number(saved.id)===Number(m.id))persistLogin(m);
  await persistThenSync([{collection:'members',row:m}]);return m;
}
async function addMemberLocal({name,role}){
  name=String(name||'').trim().replace(/\s+/g,' ');role=role==='visitor'?'visitor':'member';
  if(name.length<2||name.length>80)throw new Error('Enter a valid name between 2 and 80 characters.');
  const normalized=normalizeName(name);const existing=state.members.find(x=>normalizeName(x.name)===normalized);
  if(existing&&Number(existing.active)!==0)throw new Error('That login already exists. Edit the existing row instead.');
  const now=new Date().toISOString();let row;
  if(existing){existing.active=1;existing.role=role;existing.updated_at=now;existing.sort_order=Math.max(0,...state.members.map(x=>Number(x.sort_order)||0))+1;row=existing}
  else row={id:nextId(),name,role,active:1,sort_order:Math.max(0,...state.members.map(x=>Number(x.sort_order)||0))+1,created_at:now,updated_at:now};
  if(!existing)state.members.push(row);
  await persistThenSync([{collection:'members',row}]);return row;
}
async function deleteMemberLocal(id){if(isLead(state.members.find(m=>Number(m.id)===Number(id)))&&!isLead())throw new Error('Only Kabil can manage the R&D Lead profile.');
  const m=state.members.find(x=>Number(x.id)===Number(id));if(!m||Number(m.active)===0)throw new Error('Login not found.');
  if(Number(m.id)===activeUser())throw new Error('You cannot delete the login you are currently using. Log in with another member first.');
  m.active=0;m.updated_at=new Date().toISOString();
  await persistThenSync([{collection:'members',row:m}]);return true;
}
async function updateDepartmentLocal(id,name){
  const d=state.departments.find(x=>Number(x.id)===Number(id));if(!d||Number(d.active)===0)throw new Error('Department not found.');
  name=String(name||'').trim().replace(/\s+/g,' ');
  if(name.length<2||name.length>60)throw new Error('Department name must be 2–60 characters.');
  if(state.departments.some(x=>Number(x.id)!==Number(d.id)&&Number(x.active)!==0&&normalizeName(x.name)===normalizeName(name)))throw new Error('That department already exists.');
  d.name=name;d.updated_at=new Date().toISOString();
  state.ideas.forEach(i=>{if(Number(i.department_id)===Number(d.id))i.department_name=name});
  state.projects.forEach(p=>{const idea=state.ideas.find(i=>Number(i.id)===Number(p.idea_id));if(Number(idea?.department_id)===Number(d.id))p.department_name=name});
  await persistThenSync([{collection:'departments',row:d}]);return d;
}
async function addDepartmentLocal(name){
  name=String(name||'').trim().replace(/\s+/g,' ');
  if(name.length<2||name.length>60)throw new Error('Department name must be 2–60 characters.');
  const existing=state.departments.find(x=>normalizeName(x.name)===normalizeName(name));
  if(existing&&Number(existing.active)!==0)throw new Error('That department already exists.');
  const now=new Date().toISOString();let row;
  if(existing){existing.active=1;existing.updated_at=now;existing.sort_order=Math.max(0,...state.departments.map(x=>Number(x.sort_order)||0))+1;row=existing}
  else{row={id:nextId(),name,active:1,sort_order:Math.max(0,...state.departments.map(x=>Number(x.sort_order)||0))+1,created_at:now,updated_at:now};state.departments.push(row)}
  await persistThenSync([{collection:'departments',row}]);return row;
}
async function deleteDepartmentLocal(id){
  const d=state.departments.find(x=>Number(x.id)===Number(id));if(!d||Number(d.active)===0)throw new Error('Department not found.');
  const inUse=state.ideas.some(i=>Number(i.department_id)===Number(d.id));
  if(inUse)throw new Error('This department is already used in idea history. Rename it instead of deleting it.');
  d.active=0;d.updated_at=new Date().toISOString();await persistThenSync([{collection:'departments',row:d}]);return true;
}
async function createIdeaLocal(b){if(isVisitor())throw new Error('Admin visitors do not submit ideas.');const member=state.members.find(m=>Number(m.id)===Number(b.submitted_by)),dep=state.departments.find(d=>Number(d.id)===Number(b.department_id));const problem=String(b.problem||'').trim(),proposal=String(b.proposed_idea||'').trim();if(!member||!dep||!problem||!proposal)throw new Error('Submitted by, department, problem and idea are required.');if(problem.length>1200||proposal.length>1600)throw new Error('Problem or proposed solution is too long.');const date=b.submission_date||today(),seq=state.ideas.filter(i=>i.submission_date===date).length+1,now=new Date().toISOString();const row={id:nextId(state.ideas),idea_number:`IDEA-${date.replaceAll('-','')}-${String(seq).padStart(2,'0')}`,submitted_by:Number(member.id),department_id:Number(dep.id),problem,proposed_idea:proposal,expected_benefit:String(b.expected_benefit||'').trim(),priority:isLead()&&['Low','Medium','High','Critical'].includes(b.priority)?b.priority:'Medium',submission_date:date,status:'submitted',attachment:b.attachment||null,created_at:now,updated_at:now};state.ideas.unshift({...row,submitted_by_name:member.name,department_name:dep.name,attachment_path:row.attachment?.data||''});await persistThenSync([{collection:'ideas',row}]);notifyUser('Idea submitted',`${member.name} submitted ${row.idea_number} for ${dep.name}.`);return {...row,cloud_saved:Boolean(window.rndCloud?.enabled)}}
async function createCycleLocal(b){requireLead();if(isVisitor())throw new Error('Admin visitors have view-only access.');const start=b.start_date,end=b.end_date,label=String(b.label||'').trim();if(!start||!end||start>end)throw new Error('Valid start and end dates are required.');if(!label)throw new Error('Week label is required.');if(label.length>80)throw new Error('Week label must be 80 characters or less.');if(state.cycles.some(c=>!(c.end_date<start||c.start_date>end)))throw new Error('A weekly cycle already overlaps these dates.');const now=new Date().toISOString(),row={id:nextId(state.cycles),label,start_date:start,end_date:end,status:'active',created_at:now,updated_at:now};state.cycles.unshift(row);await persistThenSync([{collection:'cycles',row}]);return row}
async function assignWeekLocal(cycleId,ideaIds,ownerIds,priorities=[]){if(isVisitor())throw new Error('Admin visitors have view-only access.');const cycle=state.cycles.find(c=>c.id===Number(cycleId)),ids=[...new Set((ideaIds||[]).map(Number))];if(!cycle)throw new Error('Weekly cycle not found.');if(ids.length<1||ids.length>2)throw new Error('Select one or two ideas for a weekly assignment.');const requestedOwners=ids.map((_,idx)=>Number(ownerIds?.[idx]));if(!isLead()&&requestedOwners.some(id=>id!==activeUser()))throw new Error('You can assign weekly tasks only to yourself.');for(const ownerId of new Set(requestedOwners)){if(!workingMembers().some(m=>Number(m.id)===ownerId))throw new Error('Choose an active R&D member.');const count=state.projects.filter(p=>Number(p.cycle_id)===Number(cycle.id)&&Number(p.owner_id)===ownerId).length+requestedOwners.filter(id=>id===ownerId).length;if(count>2)throw new Error('Each member can have only two tasks in a week.');}const ideas=ids.map(id=>state.ideas.find(i=>Number(i.id)===Number(id)&&String(i.status||'submitted').toLowerCase()==='submitted'&&!state.projects.some(p=>Number(p.idea_id)===Number(i.id))));if(ideas.some(x=>!x))throw new Error('Only submitted ideas that are not already assigned can be selected.');const now=new Date().toISOString(),ops=[];ids.forEach((id,idx)=>{const idea=ideas[idx],owner=workingMembers().find(m=>m.id===Number(ownerIds?.[idx]))||workingMembers()[0];if(!owner)throw new Error('Add at least one R&D Member before assigning projects.');const raw={id:nextId(state.projects),cycle_id:cycle.id,idea_id:id,project_number:`RND-${cycle.start_date.slice(0,4)}-W${String(cycle.id).slice(-4)}-${state.projects.filter(p=>Number(p.cycle_id)===Number(cycle.id)).length+1}`,title:idea.proposed_idea.slice(0,140),owner_id:owner.id,start_date:cycle.start_date,end_date:cycle.end_date,progress:0,status:'assigned',created_at:now,updated_at:now};state.projects.unshift({...raw,owner_name:owner.name,cycle_label:cycle.label,department_name:idea.department_name});if(isLead()&&['Low','Medium','High','Critical'].includes(priorities[idx]))idea.priority=priorities[idx];idea.status='assigned';idea.updated_at=now;ops.push({collection:'projects',row:raw},{collection:'ideas',row:idea})});cycle.updated_at=now;await persistThenSync(ops);notifyUser('Weekly tasks assigned',`${cycle.label}: ${ids.length} R&D task(s) assigned.`);return true}
async function addProgressLocal(projectId,b){requireTaskOwner(state.projects.find(p=>Number(p.id)===Number(projectId)));if(Number(b.user_id)!==activeUser())throw new Error("Progress must be recorded as yourself.");if(isVisitor())throw new Error('Admin visitors have view-only access.');const p=state.projects.find(x=>x.id===Number(projectId)),member=state.members.find(m=>m.id===Number(b.user_id)),pct=Number(b.progress_percent),work=String(b.work_done||'').trim();if(!p)throw new Error('Project not found.');if(!member||!Number.isFinite(pct)||pct<0||pct>100||!work)throw new Error('Member, work done and progress 0-100 are required.');if(work.length>1600)throw new Error("Today's work must be 1600 characters or less.");if(pct<p.progress)throw new Error(`Progress cannot go backwards. Current project progress is ${p.progress}%.`);const now=new Date().toISOString(),u={id:nextId(state.progress),project_id:p.id,user_id:member.id,update_date:b.update_date||today(),work_done:work,progress_percent:pct,remarks:String(b.remarks||'').trim().slice(0,1200),blocker:String(b.blocker||'').trim().slice(0,800),next_action:String(b.next_action||'').trim().slice(0,800),attachment:b.attachment||null,created_at:now,updated_at:now,user_name:member.name,attachment_path:b.attachment?.data||''};state.progress.push(u);p.progress=pct;p.status=pct>=100?'completed':pct>0?'in_progress':'assigned';p.updated_at=now;const ops=[{collection:'progress',row:u},{collection:'projects',row:p}];if(pct>=100){const peers=state.projects.filter(x=>x.cycle_id===p.cycle_id);if(peers.length>=2&&peers.every(x=>x.progress===100)){const c=state.cycles.find(x=>x.id===p.cycle_id);if(c){c.status='completed';c.updated_at=now;ops.push({collection:'cycles',row:c})}}}await persistThenSync(ops);notifyUser('Progress updated',`${p.project_number} is now ${pct}% complete.`);return u}
async function updateIdeaLocal(id,b){
  if(!isLead())b={...b,priority:state.ideas.find(i=>Number(i.id)===Number(id))?.priority||'Medium'};if(isVisitor())throw new Error('Admin visitors have view-only access.');
  const i=state.ideas.find(x=>Number(x.id)===Number(id));if(!i)throw new Error('Idea not found.');
  const member=state.members.find(m=>Number(m.id)===Number(b.submitted_by)),dep=state.departments.find(d=>Number(d.id)===Number(b.department_id));
  const problem=String(b.problem||'').trim(),proposal=String(b.proposed_idea||'').trim();if(!member||!dep||!problem||!proposal)throw new Error('Submitted by, department, problem and idea are required.');
  Object.assign(i,{submitted_by:Number(member.id),department_id:Number(dep.id),problem,proposed_idea:proposal,expected_benefit:String(b.expected_benefit||'').trim(),priority:isLead()&&['Low','Medium','High','Critical'].includes(b.priority)?b.priority:(i.priority||'Medium'),submission_date:b.submission_date||i.submission_date,updated_at:new Date().toISOString(),submitted_by_name:member.name,department_name:dep.name});
  if(b.attachment)i.attachment=b.attachment;
  const linked=state.projects.find(p=>Number(p.idea_id)===Number(i.id));if(linked){linked.title=proposal.slice(0,140);linked.department_name=dep.name;linked.updated_at=i.updated_at}
  const ops=[{collection:'ideas',row:i}];if(linked)ops.push({collection:'projects',row:linked});await persistThenSync(ops);return i;
}
async function deleteIdeaLocal(id){
  if(isVisitor())throw new Error('Admin visitors have view-only access.');const idea=state.ideas.find(x=>Number(x.id)===Number(id));if(!idea)throw new Error('Idea not found.');
  const projects=state.projects.filter(p=>Number(p.idea_id)===Number(id));const pids=projects.map(p=>p.id),progress=state.progress.filter(u=>pids.includes(u.project_id));const cycleIds=[...new Set(projects.map(p=>p.cycle_id))];
  state.progress=state.progress.filter(u=>!pids.includes(u.project_id));state.projects=state.projects.filter(p=>Number(p.idea_id)!==Number(id));state.ideas=state.ideas.filter(x=>Number(x.id)!==Number(id));
  const cycleOps=[];cycleIds.forEach(cid=>{const c=state.cycles.find(x=>x.id===cid);if(c){c.status='active';c.updated_at=new Date().toISOString();cycleOps.push({collection:'cycles',row:c})}});
  const deletes=[{collection:'progress',ids:progress.map(x=>x.id)},{collection:'projects',ids:pids},{collection:'ideas',ids:[id]}];await persistThenSync(cycleOps,deletes);return true;
}
async function updateCycleLocal(id,b){requireLead();
  if(isVisitor())throw new Error('Admin visitors have view-only access.');const c=state.cycles.find(x=>Number(x.id)===Number(id));if(!c)throw new Error('Week not found.');const label=String(b.label||'').trim(),start=b.start_date,end=b.end_date;if(!label||!start||!end||start>end)throw new Error('Valid week label and dates are required.');
  if(state.cycles.some(x=>x.id!==c.id&&!(x.end_date<start||x.start_date>end)))throw new Error('Another weekly cycle overlaps these dates.');Object.assign(c,{label,start_date:start,end_date:end,updated_at:new Date().toISOString()});const ps=state.projects.filter(p=>p.cycle_id===c.id);ps.forEach(p=>{p.start_date=start;p.end_date=end;p.cycle_label=label;p.updated_at=c.updated_at});await persistThenSync([{collection:'cycles',row:c},...ps.map(row=>({collection:'projects',row}))]);return c;
}
async function deleteCycleLocal(id){requireLead();
  if(isVisitor())throw new Error('Admin visitors have view-only access.');const c=state.cycles.find(x=>Number(x.id)===Number(id));if(!c)throw new Error('Week not found.');const ps=state.projects.filter(p=>p.cycle_id===c.id),pids=ps.map(p=>p.id),ups=state.progress.filter(u=>pids.includes(u.project_id));const ideaOps=[];ps.forEach(p=>{const i=state.ideas.find(x=>x.id===p.idea_id);if(i){i.status='submitted';i.updated_at=new Date().toISOString();ideaOps.push({collection:'ideas',row:i})}});state.progress=state.progress.filter(u=>!pids.includes(u.project_id));state.projects=state.projects.filter(p=>p.cycle_id!==c.id);state.cycles=state.cycles.filter(x=>x.id!==c.id);const deletes=[{collection:'progress',ids:ups.map(x=>x.id)},{collection:'projects',ids:pids},{collection:'cycles',ids:[c.id]}];await persistThenSync(ideaOps,deletes);return true;
}
function recalcProjectFromProgress(projectId){const p=state.projects.find(x=>x.id===Number(projectId));if(!p)return null;const ups=state.progress.filter(u=>u.project_id===p.id).sort((a,b)=>b.update_date.localeCompare(a.update_date)||b.id-a.id);const pct=ups.length?Math.max(...ups.map(u=>Number(u.progress_percent)||0)):0;p.progress=pct;p.status=pct>=100?'completed':pct>0?'in_progress':'assigned';p.updated_at=new Date().toISOString();const c=state.cycles.find(x=>x.id===p.cycle_id);if(c){const peers=state.projects.filter(x=>x.cycle_id===c.id);c.status=peers.length>=2&&peers.every(x=>x.progress===100)?'completed':'active';c.updated_at=p.updated_at}return {p,c}}
async function updateProgressLocal(id,b){const existing=state.progress.find(u=>Number(u.id)===Number(id));requireTaskOwner(state.projects.find(p=>Number(p.id)===Number(existing?.project_id)));if(Number(b.user_id)!==activeUser())throw new Error("Progress must be recorded as yourself.");if(isVisitor())throw new Error('Admin visitors have view-only access.');const u=state.progress.find(x=>Number(x.id)===Number(id));if(!u)throw new Error('Progress entry not found.');const member=state.members.find(m=>m.id===Number(b.user_id)),pct=Number(b.progress_percent),work=String(b.work_done||'').trim();if(!member||!Number.isFinite(pct)||pct<0||pct>100||!work)throw new Error('Member, work done and progress 0-100 are required.');Object.assign(u,{user_id:member.id,user_name:member.name,update_date:b.update_date||u.update_date,progress_percent:pct,work_done:work,remarks:String(b.remarks||'').trim().slice(0,1200),blocker:String(b.blocker||'').trim().slice(0,800),next_action:String(b.next_action||'').trim().slice(0,800),updated_at:new Date().toISOString()});if(b.attachment)u.attachment=b.attachment;const rc=recalcProjectFromProgress(u.project_id);const ops=[{collection:'progress',row:u}];if(rc?.p)ops.push({collection:'projects',row:rc.p});if(rc?.c)ops.push({collection:'cycles',row:rc.c});await persistThenSync(ops);return u;}
async function deleteProgressLocal(id){const existing=state.progress.find(u=>Number(u.id)===Number(id));requireTaskOwner(state.projects.find(p=>Number(p.id)===Number(existing?.project_id)));if(isVisitor())throw new Error('Admin visitors have view-only access.');const u=state.progress.find(x=>Number(x.id)===Number(id));if(!u)throw new Error('Progress entry not found.');state.progress=state.progress.filter(x=>x.id!==u.id);const rc=recalcProjectFromProgress(u.project_id);const ops=[];if(rc?.p)ops.push({collection:'projects',row:rc.p});if(rc?.c)ops.push({collection:'cycles',row:rc.c});const deletes=[{collection:'progress',ids:[u.id]}];await persistThenSync(ops,deletes);return true;}
async function updateProjectLocal(id,b){requireLead();if(isVisitor())throw new Error('Admin visitors have view-only access.');const p=state.projects.find(x=>Number(x.id)===Number(id));if(!p)throw new Error('Project not found.');const owner=workingMembers().find(m=>m.id===Number(b.owner_id));if(!owner)throw new Error('Choose an active R&D member.');const title=String(b.title||'').trim();if(!title)throw new Error('Project title is required.');if(!b.start_date||!b.end_date||b.start_date>b.end_date)throw new Error('Valid project start and end dates are required.');Object.assign(p,{title:title.slice(0,140),owner_id:owner.id,owner_name:owner.name,start_date:b.start_date,end_date:b.end_date,updated_at:new Date().toISOString()});const idea=state.ideas.find(i=>Number(i.id)===Number(p.idea_id)),ops=[{collection:'projects',row:p}];if(idea&&['Low','Medium','High','Critical'].includes(b.priority)){idea.priority=b.priority;idea.updated_at=p.updated_at;ops.push({collection:'ideas',row:idea})}await persistThenSync(ops);return p;}
async function deleteProjectLocal(id){requireLead();if(isVisitor())throw new Error('Admin visitors have view-only access.');const p=state.projects.find(x=>Number(x.id)===Number(id));if(!p)throw new Error('Project not found.');const ups=state.progress.filter(u=>u.project_id===p.id),idea=state.ideas.find(i=>i.id===p.idea_id),cycle=state.cycles.find(c=>c.id===p.cycle_id);state.progress=state.progress.filter(u=>u.project_id!==p.id);state.projects=state.projects.filter(x=>x.id!==p.id);if(idea){idea.status='submitted';idea.updated_at=new Date().toISOString()}if(cycle){cycle.status='active';cycle.updated_at=new Date().toISOString()}const ops=[];if(idea)ops.push({collection:'ideas',row:idea});if(cycle)ops.push({collection:'cycles',row:cycle});const deletes=[{collection:'progress',ids:ups.map(x=>x.id)},{collection:'projects',ids:[p.id]}];await persistThenSync(ops,deletes);return true;}
function dailyReportLocal(date){const ideas=state.ideas.filter(i=>i.submission_date===date);const updates=state.progress.filter(u=>u.update_date===date).map(u=>({...u,project_number:state.projects.find(p=>p.id===u.project_id)?.project_number||'—',title:state.projects.find(p=>p.id===u.project_id)?.title||'—'}));return {date,ideas,updates}}
function weeklyReportLocal(cycleId){const cycle=state.cycles.find(c=>c.id===Number(cycleId));if(!cycle)throw new Error('Week not found.');const ideas=state.ideas.filter(i=>i.submission_date>=cycle.start_date&&i.submission_date<=cycle.end_date);const projects=state.projects.filter(p=>p.cycle_id===cycle.id);const updates=state.progress.filter(u=>projects.some(p=>p.id===u.project_id));const contribution=state.members.filter(m=>m.role!=='visitor').map(m=>({name:m.name,idea_count:ideas.filter(i=>Number(i.submitted_by)===Number(m.id)).length,update_count:updates.filter(u=>u.user_id===m.id).length}));return {cycle,ideas,projects,updates,contribution}}
async function compressImage(file){
  if(!file.type.startsWith('image/')||file.size<260*1024)return file;
  const bitmap=await createImageBitmap(file),max=1600,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  canvas.getContext('2d',{alpha:false}).drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
  const type='image/webp';let quality=.72;
  const toBlob=q=>new Promise(r=>canvas.toBlob(r,type,q));let blob=await toBlob(quality);
  while(blob&&blob.size>420*1024&&quality>.46){quality-=.08;blob=await toBlob(quality)}
  return blob?new File([blob],file.name.replace(/\.[^.]+$/,'.webp'),{type,lastModified:Date.now()}):file;
}
async function fileData(input){
  let f=input.files?.[0];if(!f)return null;if(f.size>8*1024*1024)throw new Error('Attachment must be under 8 MB');
  f=await compressImage(f);
  return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve({name:f.name,type:f.type,size:f.size,data:r.result});r.onerror=reject;r.readAsDataURL(f)})
}
function storedLogin(){try{return JSON.parse(localStorage.getItem('rndLoggedInMember')||'null')}catch{return null}}
function activeUser(){return Number(storedLogin()?.id)||0}
function currentMember(){return state.members.find(m=>Number(m.id)===activeUser()&&Number(m.active)!==0)||null}

let teamChatMessages=[],teamChatStop=null,teamChatStarted=false,teamChatOpen=false,teamChatUnread=0,teamChatInitialSync=true;
function chatSeenKey(){return `rnd_chat_seen_${activeUser()||0}`}
function chatLastSeen(){try{return Number(localStorage.getItem(chatSeenKey())||0)}catch{return 0}}
function markTeamChatSeen(){
  const latest=Math.max(0,...teamChatMessages.map(x=>Number(x.created_at)||0));
  if(latest)try{localStorage.setItem(chatSeenKey(),String(latest))}catch{}
  teamChatUnread=0;updateTeamChatUnread();
}
function chatTime(ms){
  const d=new Date(Number(ms)||Date.now());
  const same=d.toDateString()===new Date().toDateString();
  return same?d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})+' · '+d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
}
function updateTeamChatIdentity(){
  const m=currentMember(),host=$('#teamChatIdentity');if(!host)return;
  if(!m){host.innerHTML='<span class="team-chat-mini-avatar">R</span><span>Signed in profile</span>';return}
  const initial=(m.name||'R').trim().charAt(0).toUpperCase();
  host.innerHTML=`<span class="team-chat-mini-avatar">${esc(initial)}</span><span><b>${esc(m.name)}</b><small>${memberRoleLabel(m)}</small></span>`;
}
function renderTeamChat(){
  const host=$('#teamChatMessages');if(!host)return;
  const me=currentMember(),authUid=window.rndCloud?.status?.()?.uid||'';
  if(!teamChatMessages.length){host.innerHTML='<div class="team-chat-empty">No messages yet. Start the team discussion.</div>';return}
  host.innerHTML=teamChatMessages.map(msg=>{
    const own=me&&Number(msg.member_id)===Number(me.id);
    const deletable=own&&msg.auth_uid&&authUid&&String(msg.auth_uid)===String(authUid);
    const savedMember=state.members.find(m=>Number(m.id)===Number(msg.member_id));
    const senderName=String(savedMember?.name||msg.name||'Unknown');
    const senderRole=savedMember?.role||msg.role||'member';
    const initial=senderName.trim().charAt(0).toUpperCase()||'?';
    return `<article class="team-chat-message ${own?'own':''}" data-chat-id="${esc(msg.id)}"><div class="team-chat-avatar" title="${esc(senderName)}">${esc(initial)}</div><div class="team-chat-bubble"><div class="team-chat-meta"><b>${esc(senderName)}</b><span>${memberRoleLabel(savedMember||{name:senderName,role:senderRole})}</span><time>${esc(chatTime(msg.created_at))}</time></div><p>${esc(msg.text).replace(/\n/g,'<br>')}</p><div class="team-chat-actions"><button type="button" data-chat-copy="${esc(msg.id)}">Copy</button>${deletable?`<button type="button" class="danger" data-chat-delete="${esc(msg.id)}">Delete</button>`:''}</div></div></article>`;
  }).join('');
  host.querySelectorAll('[data-chat-copy]').forEach(btn=>btn.onclick=async()=>{const msg=teamChatMessages.find(x=>String(x.id)===String(btn.dataset.chatCopy));if(!msg)return;try{await navigator.clipboard.writeText(msg.text);toast('Message copied.')}catch{toast('Unable to copy message.',true)}});
  host.querySelectorAll('[data-chat-delete]').forEach(btn=>btn.onclick=async()=>{const id=btn.dataset.chatDelete;if(!id)return;if(!confirm('Delete this message?'))return;try{btn.disabled=true;await window.rndCloud.deleteChatMessage(id);teamChatMessages=teamChatMessages.filter(x=>String(x.id)!==String(id));renderTeamChat();toast('Message deleted.')}catch(err){toast(err?.message||'Unable to delete message.',true)}finally{btn.disabled=false}});
  if(teamChatOpen)requestAnimationFrame(()=>{host.scrollTop=host.scrollHeight});
}
function setTeamChatStatus(text,ok=true){const el=$('#teamChatStatus');if(el){el.textContent=text;el.classList.toggle('offline',!ok)}const send=$('#teamChatSend');if(send&&send.dataset.sending!=='1')send.disabled=false}
function updateTeamChatUnread(){const badge=$('#teamChatUnread');if(badge){badge.textContent=String(teamChatUnread);badge.classList.toggle('hidden',teamChatUnread<=0);updateUnifiedNotificationBadge();if(!$('#notificationPanel')?.classList.contains('hidden'))renderNotificationCenter();}updateUnifiedNotificationBadge()}
function setTeamChatOpen(open){
  teamChatOpen=Boolean(open);
  if(teamChatOpen){markTeamChatSeen();const host=$('#teamChatMessages');requestAnimationFrame(()=>{if(host)host.scrollTop=host.scrollHeight});setTimeout(()=>$('#teamChatInput')?.focus(),80)}
}
function startTeamChat(){
  updateTeamChatIdentity();
  if(!currentMember()||!window.rndCloud?.enabled||typeof window.rndCloud.watchChat!=='function'){setTeamChatStatus(cloudRuntimeStatus==='offline'?'Chat offline · reconnecting…':'Connecting to Firebase…',false);return}
  if(teamChatStarted)return;
  teamChatStarted=true;setTeamChatStatus('Live · shared with everyone',true);
  teamChatInitialSync=true;
  teamChatStop=window.rndCloud.watchChat(rows=>{
    const me=currentMember(),previousIds=new Set(teamChatMessages.map(x=>String(x.id)));
    teamChatMessages=Array.isArray(rows)?rows:[];
    if(teamChatOpen){
      markTeamChatSeen();
    }else{
      const seen=chatLastSeen();
      if(teamChatInitialSync){
        if(seen>0)teamChatUnread=teamChatMessages.filter(x=>Number(x.created_at)>seen&&Number(x.member_id)!==Number(me?.id)).length;
        else{
          const latest=Math.max(0,...teamChatMessages.map(x=>Number(x.created_at)||0));
          if(latest)try{localStorage.setItem(chatSeenKey(),String(latest))}catch{}
          teamChatUnread=0;
        }
        teamChatInitialSync=false;
      }else{
        const newlyArrived=teamChatMessages.filter(x=>!previousIds.has(String(x.id))&&Number(x.member_id)!==Number(me?.id));
        teamChatUnread+=newlyArrived.length;
      }
    }
    renderTeamChat();updateTeamChatUnread();
  },status=>{if(status?.connected)setTeamChatStatus('Live · shared with everyone',true);else{setTeamChatStatus('Chat offline · reconnecting…',false);teamChatStarted=false;setCloudRuntimeStatus('offline',status?.message||'Team chat connection interrupted.')}});
}
function stopTeamChat(){
  if(typeof teamChatStop==='function'){try{teamChatStop()}catch{}};
  window.rndCloud?.stopChat?.();teamChatStop=null;teamChatStarted=false;teamChatInitialSync=true;teamChatMessages=[];teamChatUnread=0;updateTeamChatUnread();renderTeamChat();setTeamChatOpen(false);
}




const EXCEL_COLS=26;
const EXCEL_ROWS=120;
const EXCEL_LETTERS=Array.from({length:EXCEL_COLS},(_,i)=>String.fromCharCode(65+i));
let excelSheets=[],excelActiveSheetId='',excelSheetRows=new Map(),excelSheetFormats=new Map(),masterSheetStop=null,masterSheetStarted=false,masterSheetSaveTimers=new Map(),excelActiveCell={row:1,col:0},excelSwitching=false;
function excelDefaultSheet(){return{id:'sheet1',name:'Sheet1',order:1,color:'#217346',tab_width:120,column_widths:{},row_heights:{},created_at:Date.now(),updated_at:Date.now()}}
function excelActiveSheet(){return excelSheets.find(s=>s.id===excelActiveSheetId)||excelSheets[0]||null}
function excelSheetKey(){return excelActiveSheetId||excelActiveSheet()?.id||''}
function excelRowDoc(row){return excelSheetRows.get(Number(row))||{}}
function excelRowFormats(row){return excelSheetFormats.get(Number(row))||{}}
function excelCellFormat(row,col){return excelRowFormats(row)[EXCEL_LETTERS[col]]||{}}
function excelNonEmptyCount(){let n=0;excelSheetRows.forEach(row=>Object.values(row||{}).forEach(v=>{if(String(v||'').length)n++}));return n}
function excelCellRef(row,col){return `${EXCEL_LETTERS[col]}${row}`}
function excelClampRow(row){return Math.max(1,Math.min(EXCEL_ROWS,Number(row)||1))}
function excelClampCol(col){return Math.max(0,Math.min(EXCEL_COLS-1,Number(col)||0))}
function excelNormalizeRowMap(rowMap){const clean={};EXCEL_LETTERS.forEach(letter=>{const value=String(rowMap?.[letter]??'').replace(/\r/g,'').slice(0,4000);if(value!=='')clean[letter]=value});return clean}
function excelNormalizeFormatMap(map){const out={};EXCEL_LETTERS.forEach(k=>{const f=map?.[k]||{},x={};if(/^#[0-9a-f]{6}$/i.test(f.b||''))x.b=f.b;if(/^#[0-9a-f]{6}$/i.test(f.t||''))x.t=f.t;if(Object.keys(x).length)out[k]=x});return out}
function excelSafeSheetName(name){return String(name||'').trim().replace(/[\\/:*?\[\]]/g,' ').replace(/\s+/g,' ').slice(0,31)||'Sheet'}
function excelUniqueSheetName(base='Sheet'){const names=new Set(excelSheets.map(s=>s.name.toLowerCase()));let candidate=excelSafeSheetName(base),n=1;while(names.has(candidate.toLowerCase()))candidate=`${excelSafeSheetName(base).replace(/\d+$/,'')||'Sheet'}${++n}`;return candidate}
function excelColumnWidth(col){const s=excelActiveSheet();return Math.max(60,Math.min(420,Number(s?.column_widths?.[EXCEL_LETTERS[col]])||130))}
function excelRowHeight(row){const s=excelActiveSheet();return Math.max(22,Math.min(180,Number(s?.row_heights?.[row])||26))}
function renderExcelHead(){const head=$('#excelGridHead');if(!head)return;head.innerHTML=`<tr><th class="excel-corner"></th>${EXCEL_LETTERS.map((c,i)=>`<th class="excel-col-head" data-resize-col="${i}" style="width:${excelColumnWidth(i)}px;min-width:${excelColumnWidth(i)}px;max-width:${excelColumnWidth(i)}px">${c}<span class="excel-col-resizer" data-col-resizer="${i}"></span></th>`).join('')}</tr>`;bindExcelResizers()}
function renderExcelSheetTabs(){const wrap=$('#excelSheetTabs');if(!wrap)return;wrap.innerHTML=[...excelSheets].sort((a,b)=>(a.order||0)-(b.order||0)).map(s=>`<button class="excel-sheet-tab ${s.id===excelActiveSheetId?'active':''}" style="--tab-color:${esc(s.color||'#217346')};width:${Math.max(80,Math.min(240,Number(s.tab_width)||120))}px" type="button" data-sheet-id="${esc(s.id)}" title="${esc(s.name)}">${esc(s.name)}</button>`).join('');$$('[data-sheet-id]').forEach(btn=>{btn.onclick=e=>{e.preventDefault();e.stopPropagation();switchExcelSheet(btn.dataset.sheetId)};btn.ondblclick=e=>{e.preventDefault();e.stopPropagation();renameExcelSheet(btn.dataset.sheetId)};btn.oncontextmenu=e=>{e.preventDefault();deleteExcelSheet(btn.dataset.sheetId)}});syncExcelFormatControls()}
function renderMasterSheet(){const body=$('#masterSheetBody');if(!body)return;renderExcelHead();renderExcelSheetTabs();let html='';for(let r=1;r<=EXCEL_ROWS;r++){const row=excelRowDoc(r),h=excelRowHeight(r);html+=`<tr data-excel-row="${r}" style="height:${h}px"><th class="excel-row-head" data-resize-row="${r}" style="height:${h}px">${r}<span class="excel-row-resizer" data-row-resizer="${r}"></span></th>`;for(let c=0;c<EXCEL_COLS;c++){const letter=EXCEL_LETTERS[c],value=String(row[letter]||''),fmt=excelCellFormat(r,c),w=excelColumnWidth(c);html+=`<td class="excel-cell" contenteditable="true" tabindex="0" data-excel-row="${r}" data-excel-col="${c}" data-excel-ref="${letter}${r}" spellcheck="false" style="width:${w}px;min-width:${w}px;max-width:${w}px;height:${h}px;${fmt.b?`background:${fmt.b};`:''}${fmt.t?`color:${fmt.t};`:''}">${esc(value)}</td>`}html+='</tr>'}body.innerHTML=html;const count=excelNonEmptyCount();$('#masterSheetCount').textContent=`${count} saved cell${count===1?'':'s'}`;bindMasterSheetGrid();bindExcelResizers();excelSelectCell(excelActiveCell.row,excelActiveCell.col,false)}
function excelCellElement(row,col){return $(`.excel-cell[data-excel-row="${row}"][data-excel-col="${col}"]`)}
function excelSelectCell(row,col,focus=true){row=excelClampRow(row);col=excelClampCol(col);excelActiveCell={row,col};$$('.excel-cell.excel-active').forEach(x=>x.classList.remove('excel-active'));const cell=excelCellElement(row,col);if(cell){cell.classList.add('excel-active');$('#excelNameBox').textContent=excelCellRef(row,col);$('#excelFormulaBar').value=cell.textContent||'';syncExcelFormatControls();if(focus)cell.focus()}}
function excelCommitCell(row,col,value){if(!excelSheetKey())return;row=excelClampRow(row);col=excelClampCol(col);const letter=EXCEL_LETTERS[col],current={...excelRowDoc(row)},clean=String(value??'').replace(/\r/g,'').slice(0,4000);if(clean==='')delete current[letter];else current[letter]=clean;const normalized=excelNormalizeRowMap(current);if(Object.keys(normalized).length)excelSheetRows.set(row,normalized);else excelSheetRows.delete(row);const cell=excelCellElement(row,col);if(cell&&cell.textContent!==clean)cell.textContent=clean;const count=excelNonEmptyCount();$('#masterSheetCount').textContent=`${count} saved cell${count===1?'':'s'}`;scheduleMasterSheetSave(row)}
function scheduleMasterSheetSave(row,immediate=false){row=excelClampRow(row);const sheetId=excelSheetKey();if(!sheetId)return;const timerKey=`${sheetId}:${row}`;clearTimeout(masterSheetSaveTimers.get(timerKey));const run=async()=>{if(!window.rndCloud?.enabled||typeof window.rndCloud.saveExcelGridRow!=='function')return;try{await window.rndCloud.saveExcelGridRow(sheetId,row,excelNormalizeRowMap(excelRowDoc(row)),excelNormalizeFormatMap(excelRowFormats(row)));setMasterSheetStatus('Live · saved',true)}catch(err){setMasterSheetStatus('Save pending',false);toast(err?.message||'Unable to save spreadsheet row.',true)}};if(immediate)run();else masterSheetSaveTimers.set(timerKey,setTimeout(run,350))}
function excelUpdateFormulaFromActive(){const {row,col}=excelActiveCell,cell=excelCellElement(row,col);if(cell)$('#excelFormulaBar').value=cell.textContent||''}
function excelClearCell(){const {row,col}=excelActiveCell,cell=excelCellElement(row,col);if(!cell)return;cell.textContent='';excelCommitCell(row,col,'');$('#excelFormulaBar').value='';cell.focus()}
function excelClearRow(){const row=excelActiveCell.row;excelSheetRows.delete(row);excelSheetFormats.delete(row);for(let c=0;c<EXCEL_COLS;c++){const cell=excelCellElement(row,c);if(cell){cell.textContent='';cell.style.background='';cell.style.color=''}}$('#excelFormulaBar').value='';const count=excelNonEmptyCount();$('#masterSheetCount').textContent=`${count} saved cell${count===1?'':'s'}`;scheduleMasterSheetSave(row,true)}
function excelPasteMatrix(startRow,startCol,text){const rows=String(text||'').replace(/\r/g,'').split('\n');if(rows.length&&rows[rows.length-1]==='')rows.pop();const touched=new Set();rows.forEach((line,ri)=>line.split('\t').forEach((value,ci)=>{const row=startRow+ri,col=startCol+ci;if(row>EXCEL_ROWS||col>=EXCEL_COLS)return;const letter=EXCEL_LETTERS[col],map={...excelRowDoc(row)};if(value==='')delete map[letter];else map[letter]=value.slice(0,4000);const clean=excelNormalizeRowMap(map);if(Object.keys(clean).length)excelSheetRows.set(row,clean);else excelSheetRows.delete(row);const cell=excelCellElement(row,col);if(cell)cell.textContent=value.slice(0,4000);touched.add(row)}));touched.forEach(row=>scheduleMasterSheetSave(row));const count=excelNonEmptyCount();$('#masterSheetCount').textContent=`${count} saved cell${count===1?'':'s'}`;excelUpdateFormulaFromActive()}
function bindMasterSheetGrid(){$$('.excel-cell').forEach(cell=>{const row=Number(cell.dataset.excelRow),col=Number(cell.dataset.excelCol);cell.addEventListener('focus',()=>excelSelectCell(row,col,false));cell.addEventListener('click',()=>excelSelectCell(row,col,false));cell.addEventListener('input',()=>{excelCommitCell(row,col,cell.textContent||'');excelUpdateFormulaFromActive()});cell.addEventListener('paste',e=>{const text=e.clipboardData?.getData('text/plain')||'';if(text.includes('\t')||text.includes('\n')){e.preventDefault();excelPasteMatrix(row,col,text)}});cell.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();excelCommitCell(row,col,cell.textContent||'');excelSelectCell(row+1,col,true)}else if(e.key==='Enter'&&e.shiftKey){e.preventDefault();excelCommitCell(row,col,cell.textContent||'');excelSelectCell(row-1,col,true)}else if((e.key==='Delete'||e.key==='Backspace')&&!cell.textContent){e.preventDefault();excelClearCell()}})})}
function applyExcelCellColor(kind,color){const {row,col}=excelActiveCell,letter=EXCEL_LETTERS[col],rowFmt={...excelRowFormats(row)},fmt={...(rowFmt[letter]||{})};if(kind==='b'){if(color)fmt.b=color;else delete fmt.b}else if(kind==='t'){if(color)fmt.t=color;else delete fmt.t}if(Object.keys(fmt).length)rowFmt[letter]=fmt;else delete rowFmt[letter];if(Object.keys(rowFmt).length)excelSheetFormats.set(row,rowFmt);else excelSheetFormats.delete(row);const cell=excelCellElement(row,col);if(cell){if(kind==='b')cell.style.background=color||'';else cell.style.color=color||''}scheduleMasterSheetSave(row);syncExcelFormatControls()}
function syncExcelFormatControls(){const s=excelActiveSheet(),fmt=excelCellFormat(excelActiveCell.row,excelActiveCell.col),fill=$('#excelFillColor'),text=$('#excelTextColor'),tab=$('#excelTabColor'),tw=$('#excelTabWidth');if(fill)fill.value=fmt.b||'#ffffff';if(text)text.value=fmt.t||'#1f2937';if(tab)tab.value=s?.color||'#217346';if(tw)tw.value=String(Math.max(80,Math.min(240,Number(s?.tab_width)||120)))}
async function saveExcelLayoutPatch(patch){const s=excelActiveSheet();if(!s)return;Object.assign(s,patch);try{await window.rndCloud.updateExcelSheet(s.id,patch);renderExcelSheetTabs()}catch(err){toast(err?.message||'Unable to save Excel layout.',true)}}
function bindExcelResizers(){$$('[data-col-resizer]').forEach(handle=>{handle.onmousedown=e=>{e.preventDefault();e.stopPropagation();const col=Number(handle.dataset.colResizer),startX=e.clientX,startW=excelColumnWidth(col),letter=EXCEL_LETTERS[col];const move=ev=>{const w=Math.max(60,Math.min(420,startW+ev.clientX-startX));$$(`[data-resize-col="${col}"],.excel-cell[data-excel-col="${col}"]`).forEach(el=>{el.style.width=`${w}px`;el.style.minWidth=`${w}px`;el.style.maxWidth=`${w}px`})};const up=ev=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);const w=Math.max(60,Math.min(420,startW+ev.clientX-startX)),cw={...(excelActiveSheet()?.column_widths||{}),[letter]:Math.round(w)};saveExcelLayoutPatch({column_widths:cw})};document.addEventListener('mousemove',move);document.addEventListener('mouseup',up)}});$$('[data-row-resizer]').forEach(handle=>{handle.onmousedown=e=>{e.preventDefault();e.stopPropagation();const row=Number(handle.dataset.rowResizer),startY=e.clientY,startH=excelRowHeight(row);const move=ev=>{const h=Math.max(22,Math.min(180,startH+ev.clientY-startY)),tr=$(`tr[data-excel-row="${row}"]`);if(tr)tr.style.height=`${h}px`;$$(`.excel-cell[data-excel-row="${row}"],.excel-row-head[data-resize-row="${row}"]`).forEach(el=>el.style.height=`${h}px`)};const up=ev=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);const h=Math.max(22,Math.min(180,startH+ev.clientY-startY)),rh={...(excelActiveSheet()?.row_heights||{}),[row]:Math.round(h)};saveExcelLayoutPatch({row_heights:rh})};document.addEventListener('mousemove',move);document.addEventListener('mouseup',up)}})}
function setMasterSheetStatus(text,ok=true){const el=$('#masterSheetStatus');if(el){el.textContent=text;el.classList.toggle('offline',!ok)}}
async function addExcelSheet(){if(!window.rndCloud?.enabled)return toast('Firebase is not connected.',true);try{const name=excelUniqueSheetName(`Sheet${excelSheets.length+1}`),saved=await window.rndCloud.createExcelSheet({name,order:excelSheets.length+1,color:'#217346',tab_width:120});excelSheets.push(saved);await switchExcelSheet(saved.id,{saveMeta:true,force:true});toast(`${saved.name} created.`)}catch(err){toast(err?.message||'Unable to add sheet.',true)}}
async function renameExcelSheet(id){const sheet=excelSheets.find(s=>s.id===id);if(!sheet)return;const entered=prompt('Rename sheet',sheet.name);if(entered===null)return;const name=excelSafeSheetName(entered);if(excelSheets.some(s=>s.id!==id&&s.name.toLowerCase()===name.toLowerCase()))return toast('A sheet with that name already exists.',true);try{const saved=await window.rndCloud.updateExcelSheet(id,{name});Object.assign(sheet,saved);renderExcelSheetTabs();toast('Sheet renamed.')}catch(err){toast(err?.message||'Unable to rename sheet.',true)}}
async function deleteExcelSheet(id){if(excelSheets.length<=1)return toast('At least one sheet must remain.',true);const sheet=excelSheets.find(s=>s.id===id);if(!sheet||!confirm(`Delete "${sheet.name}" and all of its saved cells?`))return;try{await window.rndCloud.deleteExcelSheet(id);excelSheets=excelSheets.filter(s=>s.id!==id);if(excelActiveSheetId===id)await switchExcelSheet(excelSheets[0].id,{saveMeta:true,force:true});else renderExcelSheetTabs();toast('Sheet deleted.')}catch(err){toast(err?.message||'Unable to delete sheet.',true)}}
async function loadExcelSheetRows(sheetId){const data=await window.rndCloud.loadExcelGrid(sheetId);excelSheetRows=new Map();excelSheetFormats=new Map();(data||[]).forEach(item=>{const row=Number(item.row);if(row>=1&&row<=EXCEL_ROWS){const clean=excelNormalizeRowMap(item.cells||{}),fm=excelNormalizeFormatMap(item.formats||{});if(Object.keys(clean).length)excelSheetRows.set(row,clean);if(Object.keys(fm).length)excelSheetFormats.set(row,fm)}});renderMasterSheet()}
async function switchExcelSheet(id,{saveMeta=true,force=false}={}){if(!id||excelSwitching)return;if(!force&&id===excelActiveSheetId){renderExcelSheetTabs();return}excelSwitching=true;try{excelActiveSheetId=id;excelActiveCell={row:1,col:0};excelSheetRows=new Map();excelSheetFormats=new Map();renderExcelSheetTabs();setMasterSheetStatus('Loading sheet…',true);await loadExcelSheetRows(id);if(saveMeta)await window.rndCloud.saveExcelWorkbookMeta({active_sheet_id:id});setMasterSheetStatus('Live · Firebase shared',true)}catch(err){toast(err?.message||'Unable to switch sheet.',true)}finally{excelSwitching=false}}
function startMasterSheet(){if(masterSheetStarted)return;if(!window.rndCloud?.enabled||typeof window.rndCloud.watchExcelWorkbook!=='function'){setMasterSheetStatus('Offline · reconnecting…',false);return}masterSheetStarted=true;setMasterSheetStatus('Live · Firebase shared',true);masterSheetStop=window.rndCloud.watchExcelWorkbook(async data=>{const sheets=Array.isArray(data?.sheets)?data.sheets:[];excelSheets=sheets.length?sheets:[excelDefaultSheet()];const requested=data?.meta?.active_sheet_id,valid=excelSheets.some(s=>s.id===excelActiveSheetId)?excelActiveSheetId:(excelSheets.some(s=>s.id===requested)?requested:excelSheets[0].id);if(!excelActiveSheetId){await switchExcelSheet(valid,{saveMeta:false,force:true})}else{renderExcelSheetTabs()}},status=>setMasterSheetStatus(status?.connected?'Live · Firebase shared':'Offline · reconnecting…',Boolean(status?.connected)))}
function stopMasterSheet(){if(typeof masterSheetStop==='function'){try{masterSheetStop()}catch{}}window.rndCloud?.stopExcelWorkbook?.();masterSheetStop=null;masterSheetStarted=false;excelSheets=[];excelActiveSheetId='';excelSheetRows=new Map();excelSheetFormats=new Map();masterSheetSaveTimers.forEach(t=>clearTimeout(t));masterSheetSaveTimers.clear()}
function excelCsvEscape(value){const s=String(value??'');return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
function exportExcelCsv(){let lastRow=1,lastCol=0;excelSheetRows.forEach((row,r)=>{if(Object.keys(row).length){lastRow=Math.max(lastRow,r);Object.keys(row).forEach(k=>lastCol=Math.max(lastCol,EXCEL_LETTERS.indexOf(k)))}});const lines=[];for(let r=1;r<=lastRow;r++){const row=excelRowDoc(r);lines.push(Array.from({length:lastCol+1},(_,c)=>excelCsvEscape(row[EXCEL_LETTERS[c]]||'')).join(','))}const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${excelSafeSheetName(excelActiveSheet()?.name||'Sheet')}-${today()}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Current sheet exported as CSV.')}

function isLead(member=currentMember()){return Boolean(member&&member.role!=='visitor'&&normalizeName(member.name)==='kabil')}
function memberRoleLabel(member){return member?.role==='visitor'?'ADMIN · VISITOR':isLead(member)?'R&D LEAD':'R&D MEMBER'}
function canEditTask(project){return Boolean(project&&!isVisitor()&&Number(project.owner_id)===Number(currentMember()?.id))}
function canEditTrackerProject(p){return Boolean(p&&!isVisitor()&&(isLead()||canEditTask(p)))}
function trackerEffectiveDate(p,row){
  if(row?.manual_extra){const date=trackerDateToIso(row.date);if(/^\d{4}-\d{2}-\d{2}$/.test(date))return date;}
  const sheet=trackerSheetRows(p),index=sheet.filter(r=>!r.manual_extra&&Number(r.row_index)<=Number(row?.row_index)).length-1;
  return trackerDateToIso(trackerPeriodDates(p)[Math.max(0,index)]||'');
}
function canEditTrackerRow(p,row){return !isVisitor()&&Boolean(p)&&(canEditTask(p)||(isLead()&&trackerEffectiveDate(p,row)<today()))}
function requireLead(){if(!isLead())throw new Error('Only Kabil · R&D Lead can manage weekly assignments and priorities.')}
function requireTaskOwner(project){if(!canEditTask(project))throw new Error('You can update only your own assigned task.')}
function taskPriority(project){return state.ideas.find(i=>Number(i.id)===Number(project?.idea_id))?.priority||'Medium'}
function isVisitor(){return currentMember()?.role==='visitor'}
function workingMembers(){return state.members.filter(m=>m.role!=='visitor'&&Number(m.active)!==0).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))}
function persistLogin(member){if(activeUser()!==Number(member.id))state.selectedProject=null;localStorage.setItem('rndLoggedInMember',JSON.stringify({id:member.id,name:member.name,role:member.role||'member'}));localStorage.setItem('rndActiveUser',String(member.id))}
function clearLogin(){localStorage.removeItem('rndLoggedInMember');localStorage.removeItem('rndActiveUser')}
function activeDepartments(){return state.departments.filter(d=>Number(d.active)!==0).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0)||Number(a.id)-Number(b.id))}
function isRndDepartment(department){return ['rd','rnd','r and d','research and development'].includes(normalizeName(department?.name))}
function renderDepartmentGate(){
  const grid=$('#departmentGateGrid');if(!grid)return;
  const departments=activeDepartments();
  grid.innerHTML=departments.length?departments.map(department=>{const available=isRndDepartment(department)||['production','quality'].includes(normalizeName(department.name));return `<button type="button" class="department-choice ${available?'available':''}" data-department-id="${department.id}" aria-label="${esc(department.name)} dashboard${available?'':' setup pending'}"><strong>${esc(department.name)}</strong><span>${available?'OPEN DASHBOARD →':'SETUP PENDING'}</span></button>`}).join(''):'<div class="empty-state">No active departments are configured.</div>';
  grid.querySelectorAll('[data-department-id]').forEach(button=>button.onclick=()=>selectDepartment(Number(button.dataset.departmentId)));
}
function departmentHistory(kind,id,replace=false){
  const route={rndDepartmentRoute:kind,departmentId:id||null,departmentHistoryReady:true},url=kind==='workspace'?'#department='+id:'#departments';
  if(replace)history.replaceState({...history.state,...route},'',url);
  else if(history.state?.rndDepartmentRoute!==kind||Number(history.state?.departmentId)!==Number(id||0))history.pushState({...history.state,...route},'',url);
}
function showDepartmentGate(navigate=true){window.closeProduction?.();window.closeQuality?.();if(navigate)departmentHistory('departments',null);localStorage.removeItem('selectedDepartmentId');stopTeamChat();document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());$('#appShell').classList.add('app-locked');$('#loginGate').classList.add('hidden');$('#departmentGate').classList.remove('hidden');$('#departmentGateMessage').textContent='';renderDepartmentGate()}
function selectDepartment(id,navigate=true){
  const department=activeDepartments().find(d=>Number(d.id)===Number(id));if(!department)return;
  if(!isRndDepartment(department)&&!['production','quality'].includes(normalizeName(department.name))){$('#departmentGateMessage').textContent=`${department.name} dashboard will be configured in the next update.`;return}
  if(navigate)departmentHistory('workspace',department.id);
  localStorage.setItem('selectedDepartmentId',String(department.id));$('#departmentGate').classList.add('hidden');
  if(normalizeName(department.name)==='quality'){window.closeProduction?.();window.openQuality?.();return}
  window.closeQuality?.();
  if(normalizeName(department.name)==='production'){window.openProduction?.();return}
  window.closeProduction?.();
  const saved=storedLogin(),member=saved?state.members.find(m=>Number(m.id)===Number(saved.id)&&Number(m.active)!==0):null;
  if(member){persistLogin(member);showApp()}else showLogin();
}
function restoreDepartmentRoute(){
  const route=history.state,id=route?.rndDepartmentRoute==='departments'?0:Number(route?.departmentId||localStorage.getItem('selectedDepartmentId'));
  const selected=activeDepartments().find(d=>Number(d.id)===id&&(isRndDepartment(d)||['production','quality'].includes(normalizeName(d.name))));
  if(selected){if(!route?.departmentHistoryReady){departmentHistory('departments',null,true);departmentHistory('workspace',selected.id)}else departmentHistory('workspace',selected.id,true);selectDepartment(selected.id,false)}
  else{departmentHistory('departments',null,true);showDepartmentGate(false)}
}
function showLogin(){$('#departmentGate').classList.add('hidden');$('#appShell').classList.add('app-locked');$('#loginGate').classList.remove('hidden');$('#loginName').focus()}
function updateCompactProfile(){
  const member=currentMember();if(!member)return;
  const initial=(member.name||'R').trim().charAt(0).toUpperCase()||'R';
  const initialEl=$('#profileQuickInitial'),avatar=$('#profileQuickAvatar'),name=$('#profileQuickName'),role=$('#profileQuickRole');
  if(initialEl)initialEl.textContent=initial;if(avatar)avatar.textContent=initial;if(name)name.textContent=member.name;
  if(role)role.textContent=memberRoleLabel(member);
  const settingsName=$('#settingsSignedInName');if(settingsName)settingsName.textContent=member.name;
}
function showApp(){const member=currentMember();if(!member){showLogin();return}$('#departmentGate').classList.add('hidden');$('#loginGate').classList.add('hidden');$('#appShell').classList.remove('app-locked');updateCompactProfile();try{renderAll()}catch(e){console.error('Initial app render failed',e);try{renderPage(state.page||'dashboard')}catch(inner){console.error('Page render failed',inner)}}setTimeout(maybeDailyReminder,500);maybeShowPendingTaskPopup();updateTeamChatIdentity();setTimeout(startTeamChat,120)}
let cloudRuntimeStatus='connecting', cloudRuntimeMessage='';
let cloudRetryTimer=null,cloudRetryAttempt=0,cloudBootInFlight=false;
function scheduleCloudReconnect(immediate=false){
  if(!window.rndCloud?.configured?.()||navigator.onLine===false)return;
  if(cloudRetryTimer&&!immediate)return;
  clearTimeout(cloudRetryTimer);
  cloudRetryTimer=setTimeout(async()=>{
    cloudRetryTimer=null;
    if(cloudBootInFlight){scheduleCloudReconnect();return}
    cloudBooted=false;cloudWatching=false;
    await bootCloud();
  },immediate?0:Math.min(3000*2**cloudRetryAttempt++,60000));
}

function setCloudRuntimeStatus(status,message=''){
  cloudRuntimeStatus=status;
  if(status==='offline')scheduleCloudReconnect();
  if(status==='live'){clearTimeout(cloudRetryTimer);cloudRetryTimer=null;cloudRetryAttempt=0;cloudRuntimeMessage='';}
  if(message) cloudRuntimeMessage=String(message);
  const dot=$('#profileCloudDot'),cloudText=$('#profileQuickCloud');
  if(dot){dot.className='profile-cloud-dot '+status;dot.title=status==='live'?'Cloud online':status==='offline'?'Cloud offline':'Cloud connecting';}
  if(cloudText){cloudText.textContent=status==='live'?'Online':status==='offline'?'Offline':'Connecting';cloudText.className=status==='live'?'cloud-good':status==='offline'?'cloud-warn':'';}
  const cs=$('#cloudStatus');
  if(cs){cs.textContent=status==='live'?'Connected · shared Firebase database':status==='offline'?(cloudRuntimeMessage||'Firebase offline · local cache active'):'Connecting to Firebase…';cs.className=status==='live'?'cloud-good':'cloud-warn';}
  const ce=$('#cloudErrorDetail');if(ce){ce.textContent=status==='offline'?(cloudRuntimeMessage||'No Firebase error detail available.'):' ';ce.classList.toggle('hidden',status!=='offline');}
  if(status==='live'&&currentMember())setTimeout(startTeamChat,0);else if(status==='offline')setTeamChatStatus('Chat offline · reconnecting…',false);
}
let cloudBooted=false,cloudWatching=false;
function cloudIsEmpty(s){return !s||['members','departments','ideas','cycles','projects','progress'].every(k=>!(s[k]||[]).length)}
let lastRemoteSignature='';
let remoteApplyChain=Promise.resolve();
function applyRemoteSnapshot(remote){
  if(!remote)return Promise.resolve();
  const snapshot=JSON.parse(JSON.stringify(remote));
  const run=()=>applyRemoteSnapshotNow(snapshot);
  const task=remoteApplyChain.then(run,run);
  remoteApplyChain=task.catch(e=>{setCloudRuntimeStatus('offline',e?.message||String(e))});
  return task;
}
async function applyRemoteSnapshotNow(remote){
  if(!remote)return;
  const signature=JSON.stringify(['members','departments','ideas','cycles','projects','progress'].map(k=>remote[k]||[]));
  if(signature===lastRemoteSignature){setCloudRuntimeStatus('live');return}
  const local=await readSnapshot()||seedSnapshot();
  const reconciled=reconcileRemoteSnapshot(remote,local);
  await writeSnapshot(reconciled);
  const ui={page:state.page,selectedProject:state.selectedProject,reportType:state.reportType};
  Object.assign(state,enrich(reconciled),ui);
  lastRemoteSignature=signature;
  const saved=storedLogin();
  if(saved){
    let member=state.members.find(m=>Number(m.id)===Number(saved.id)&&Number(m.active)!==0);
    if(!member){
      const cachedMember=(local.members||[]).find(m=>Number(m.id)===Number(saved.id)&&Number(m.active)!==0);
      if(cachedMember){state.members.push({...cachedMember});member=cachedMember;}
    }
    if(member)persistLogin(member);
  }
  setCloudRuntimeStatus('live');
  if(!$('#appShell').classList.contains('app-locked'))scheduleRender();
}
async function bootCloud(){
  if(cloudBooted||cloudBootInFlight||!window.rndCloud)return;cloudBooted=true;cloudBootInFlight=true;
  try{
    setCloudRuntimeStatus('connecting');
    const result=await window.rndCloud.init();
    if(!result.enabled){setCloudRuntimeStatus('offline',result.reason||'Firebase is not configured.');return;}
    const remote=await window.rndCloud.loadSnapshot();
    const remoteMemberIds=(remote?.members||[]).map(m=>Number(m.id)).filter(Number.isFinite);
    const local=await readSnapshot()||seedSnapshot();
    const remoteHadData=!cloudIsEmpty(remote);
    const merged=remoteHadData?reconcileRemoteSnapshot(remote,local):migrateSnapshot(local);
    await writeSnapshot(merged);
    const ui={page:state.page,selectedProject:state.selectedProject,reportType:state.reportType};
    Object.assign(state,enrich(merged),ui);
    // Initial migration only when the shared database is empty. Normal edits use
    // targeted writes, which greatly reduces Firestore write quota usage.
    if(!remoteHadData) await window.rndCloud.syncSnapshot(rawSnapshot());
    // One-time login repair: consolidate duplicate names, remap historical references,
    // then remove obsolete duplicate member documents from Firestore.
    const canonicalIds=new Set(state.members.map(m=>Number(m.id)));
    const obsoleteMemberIds=remoteMemberIds.filter(id=>!canonicalIds.has(id));
    if(obsoleteMemberIds.length){
      await window.rndCloud.syncSnapshot(rawSnapshot());
      await window.rndCloud.deleteMany?.('members',obsoleteMemberIds);
    }
    const flushed=await flushPendingCloudOps();
    if(!flushed)throw new Error(cloudRuntimeMessage||'Cloud changes are waiting to sync.');
    setCloudRuntimeStatus('live');
    if(!cloudWatching){
      cloudWatching=true;
      window.rndCloud.watch(applyRemoteSnapshot,status=>{setCloudRuntimeStatus(status?.connected?'live':'offline',status?.message||status?.error?.message||'');if(status?.connected)void flushPendingCloudOps()});
    }
    if(!$('#appShell').classList.contains('app-locked'))scheduleRender();
  }catch(e){
    cloudBooted=false;cloudWatching=false;
    console.error('Firebase startup failed',e);
    setCloudRuntimeStatus('offline',`${e?.code?e.code+': ':''}${e?.message||e}`);
  }finally{cloudBootInFlight=false}
}
async function load(){
  await refreshFromStorage();
  await bootCloud();
  const saved=storedLogin(),member=saved?state.members.find(m=>Number(m.id)===Number(saved.id)&&Number(m.active)!==0):null;
  if(member)persistLogin(member);
  restoreDepartmentRoute();
}
function renderKpiReport(){
  const memberSel=$('#kpiMemberSelect'),periodSel=$('#kpiPeriodType'),weekSel=$('#kpiWeekSelect'),host=$('#kpiReportContent');if(!memberSel||!periodSel||!weekSel||!host)return;
  const members=workingMembers().slice(0,4),me=currentMember();
  if(!memberSel.options.length){memberSel.innerHTML=members.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');if(me&&members.some(m=>Number(m.id)===Number(me.id)))memberSel.value=String(me.id);weekSel.value=String(inferredWeekForDay(new Date().getDate()));memberSel.onchange=periodSel.onchange=weekSel.onchange=()=>renderKpiReport()}
  const member=members.find(m=>Number(m.id)===Number(memberSel.value))||members[0];if(!member){host.innerHTML='<div class="empty-state">No R&D members available.</div>';return}
  const monthKey=String(today()).slice(0,7),week=Number(weekSel.value)||1,monthly=periodSel.value==='monthly';
  const cycles=state.cycles.filter(c=>monthKeyFromDate(c.start_date)===monthKey&&(monthly||workCycleWeek(c)===week)),cycleIds=new Set(cycles.map(c=>Number(c.id)));
  const projects=state.projects.filter(p=>cycleIds.has(Number(p.cycle_id))&&Number(p.owner_id)===Number(member.id)),completed=projects.filter(p=>p.status==='completed'||Number(p.progress||0)>=100).length;
  const ideas=state.ideas.filter(i=>Number(i.submitted_by)===Number(member.id)&&String(i.submission_date||'').slice(0,7)===monthKey&&(monthly||inferredWeekForDay(Number(String(i.submission_date).slice(8,10)))===week));
  const teamProjects=state.projects.filter(p=>cycleIds.has(Number(p.cycle_id))),teamCompleted=teamProjects.filter(p=>p.status==='completed'||Number(p.progress||0)>=100).length;
  host.innerHTML=`<section class="panel kpi-report-card"><div class="kpi-report-head"><div class="kpi-report-avatar">${esc(member.name.charAt(0).toUpperCase())}</div><div><span class="kicker">${monthly?'MONTHLY':`WEEK ${week}`} KPI REPORT</span><h3>${esc(member.name)}</h3><p>R&D performance snapshot · ${esc(monthKey)}</p></div></div><div class="kpi-report-grid"><article><span>NEW PRODUCT IDEAS</span><strong>${ideas.length}${monthly?'':' / 7'}</strong><small>${monthly?'Ideas submitted this month':'Individual KPI · 1 idea/day'}</small></article><article><span>MY WEEKLY ASSIGNMENTS</span><strong>${projects.length}</strong><small>${completed} completed</small></article><article><span>AUTOMATION OF MANUAL PROCESS</span><strong>${teamCompleted}${monthly?'':' / 16'}</strong><small>Team KPI · 2/week × 8 departments</small></article><article><span>DEVELOPMENT OF NEW PRODUCT</span><strong>${monthly?`${Math.min(teamCompleted,2)} / 2`:teamCompleted}</strong><small>Team KPI · monthly target 2 products</small></article></div><div class="kpi-note"><b>TEAM KPI</b><p>Automation and New Product Development are shared team targets. Daily Ideas and weekly assignments use the selected member's data.</p></div></section>`;
}

const WORK_DATA_START='2026-10-26';
function startTodayCleanupPlan(snapshot){
  const before=value=>/^\d{4}-\d{2}-\d{2}/.test(String(value||''))&&String(value).slice(0,10)<WORK_DATA_START;
  const cycles=(snapshot.cycles||[]).filter(r=>before(r.start_date)),cycleIds=new Set(cycles.map(r=>Number(r.id)));
  const projects=(snapshot.projects||[]).filter(r=>before(r.start_date)||cycleIds.has(Number(r.cycle_id))),projectIds=new Set(projects.map(r=>Number(r.id)));
  const ideas=(snapshot.ideas||[]).filter(r=>before(r.submission_date)&&!(snapshot.projects||[]).some(p=>!projectIds.has(Number(p.id))&&Number(p.idea_id)===Number(r.id)));
  const progress=(snapshot.progress||[]).filter(r=>before(r.update_date)||projectIds.has(Number(r.project_id)));
  return {progress,projects,cycles,ideas};
}
function renderStartTodayCleanup(){
  let box=$('#startTodayCleanup');if(!box){box=document.createElement('div');box.id='startTodayCleanup';$('#databaseStats')?.after(box)}
  box.hidden=!isLead();if(!isLead())return;
  const plan=startTodayCleanupPlan(rawSnapshot()),total=Object.values(plan).reduce((n,rows)=>n+rows.length,0);
  box.innerHTML=`<p class="storage-note">Start date: 26 October 2026. Remove earlier ideas, weeks, tasks and progress. Profiles, departments, settings and chat remain. A backup downloads first.</p><button type="button" class="ghost-btn" id="startTodayCleanupBtn" ${total?'':'disabled'}>${total?`Back up & delete ${total} earlier work records`:'No earlier work records'}</button>`;
  $('#startTodayCleanupBtn').onclick=async e=>{
    if(!isLead())return;const btn=e.currentTarget;btn.disabled=true;btn.textContent='Checking Firebase…';
    try{
      if(!window.rndCloud?.enabled)throw new Error('Connect to Firebase before clearing earlier work data.');
      if(!await flushPendingCloudOps())throw new Error('Finish pending Firebase saves before clearing earlier work data.');
      const fresh=await window.rndCloud.loadSnapshot(),plan=startTodayCleanupPlan(fresh);
      const blob=new Blob([JSON.stringify(fresh,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='RND-before-26-Oct-2026-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
      for(const [collection,rows] of Object.entries(plan)){
        for(let offset=0;offset<rows.length;offset+=200){const ids=rows.slice(offset,offset+200).map(r=>r.id);queueCloudDelete(collection,ids);if(!await flushPendingCloudOps())throw new Error('Cleanup paused. Reconnect and run it again to finish.');}
      }
      const latest=await window.rndCloud.loadSnapshot();Object.assign(state,enrich(latest));state.selectedProject=null;await persistState();scheduleRender();toast('Earlier work data cleared. Start date: 26 October 2026.');
    }catch(err){toast(err.message,true)}finally{renderStartTodayCleanup()}
  };
}
function renderSettings(){
  const deptHost=$('#departmentsSettings'),memberHost=$('#membersSettings');
  const visitor=false;
  if(deptHost){
    const active=state.departments.filter(d=>Number(d.active)!==0).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
    deptHost.innerHTML=`<div class="roster-summary department-roster-summary"><div><strong>${active.length}</strong><span>Active Departments</span></div><div><strong>EDIT</strong><span>Department Master</span></div></div><form class="member-add-form department-member-form" id="departmentAddForm"><label><span>Department Name</span><input id="newDepartmentName" maxlength="60" placeholder="Department name" ${visitor?'disabled':''}></label><button class="secondary-btn" type="submit" ${visitor?'disabled':''}>Add Department</button></form><div class="roster-list department-roster-list">${active.length?active.map((d,i)=>`<div class="roster-slot department-roster-slot" data-dept-row="${d.id}"><span class="roster-index">${String(i+1).padStart(2,'0')}</span><div class="roster-edit"><label>DEPARTMENT</label><input data-dept-name="${d.id}" value="${esc(d.name)}" maxlength="60" ${visitor?'disabled':''}></div><div class="member-row-actions department-actions"><button class="ghost-btn" type="button" data-save-dept="${d.id}" ${visitor?'disabled':''}>Save</button><button class="danger-outline-btn" type="button" data-delete-dept="${d.id}" ${visitor?'disabled':''}>×</button></div></div>`).join(''):'<div class="empty-state">No active departments.</div>'}</div>`;
  }
  if(memberHost){
    const rows=state.members.filter(m=>Number(m.active)!==0).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
    const members=rows.filter(m=>m.role!=='visitor').length,admins=rows.filter(m=>m.role==='visitor').length;
    memberHost.innerHTML=`<div class="roster-summary"><div><strong>${members}</strong><span>R&D Members</span></div><div><strong>${admins}</strong><span>Admins / Visitors</span></div></div><form class="member-add-form" id="memberAddForm"><label><span>Name</span><input id="newMemberName" maxlength="80" placeholder="Member name" ${visitor?'disabled':''}></label><label><span>Access</span><select id="newMemberRole" ${visitor?'disabled':''}><option value="member">R&D Member</option><option value="visitor">Admin / Visitor</option></select></label><button class="secondary-btn" type="submit" ${visitor?'disabled':''}>Add Login</button></form><div class="roster-list">${rows.map((m,i)=>`<div class="roster-slot ${m.role==='visitor'?'visitor-slot':''}"><span class="roster-index">${String(i+1).padStart(2,'0')}</span><div class="roster-edit"><label>NAME</label><input data-member-name="${m.id}" value="${esc(m.name)}" maxlength="80" ${visitor?'disabled':''}></div><select class="role-select" data-member-role="${m.id}" ${visitor?'disabled':''}><option value="member" ${m.role!=='visitor'?'selected':''}>${isLead(m)?'R&D Lead':'R&D Member'}</option><option value="visitor" ${m.role==='visitor'?'selected':''}>Admin / Visitor</option></select><div class="member-row-actions"><button class="ghost-btn" type="button" data-save-member="${m.id}" ${visitor?'disabled':''}>Save</button><button class="danger-outline-btn" type="button" data-delete-member="${m.id}" ${visitor?'disabled':''}>×</button></div></div>`).join('')}</div>`;
  }
  const dbStats=$('#databaseStats');if(dbStats)dbStats.innerHTML=`<div><span>Members</span><strong>${state.members.filter(m=>Number(m.active)!==0).length}</strong></div><div><span>Departments</span><strong>${state.departments.filter(d=>Number(d.active)!==0).length}</strong></div><div><span>Ideas</span><strong>${state.ideas.length}</strong></div><div><span>Projects</span><strong>${state.projects.length}</strong></div>`;
  const ss=$('#storageStatus');if(ss)ss.textContent=storageStatus();
  const m=currentMember();if($('#settingsSignedInName'))$('#settingsSignedInName').textContent=m?.name||'—';if($('#settingsSignedInRole')){$('#settingsSignedInRole').textContent=memberRoleLabel(m);$('#settingsSignedInRole').className='tag '+(m?.role==='visitor'?'visitor':'member')}
  const notif=$('#notificationStatus');if(notif)notif.textContent=!('Notification' in window)?'Not supported':Notification.permission==='granted'?'Enabled':Notification.permission==='denied'?'Blocked in browser':'Not enabled';
  renderStartTodayCleanup();
  bindSettingsActions();
}
function bindSettingsActions(){
  $('#departmentAddForm')?.addEventListener('submit',async e=>{e.preventDefault();try{await addDepartmentLocal($('#newDepartmentName').value);toast('Department added.');renderSettings();populateSelects()}catch(err){toast(err.message,true)}});
  $('#memberAddForm')?.addEventListener('submit',async e=>{e.preventDefault();try{await addMemberLocal({name:$('#newMemberName').value,role:$('#newMemberRole').value});toast('Login added.');renderSettings();populateSelects()}catch(err){toast(err.message,true)}});
  $$('[data-save-dept]').forEach(b=>b.onclick=async()=>{try{await updateDepartmentLocal(Number(b.dataset.saveDept),$(`[data-dept-name="${b.dataset.saveDept}"]`).value);toast('Department saved.');renderSettings();populateSelects()}catch(err){toast(err.message,true)}});
  $$('[data-delete-dept]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete this department?'))return;try{await deleteDepartmentLocal(Number(b.dataset.deleteDept));toast('Department removed.');renderSettings();populateSelects()}catch(err){toast(err.message,true)}});
  $$('[data-save-member]').forEach(b=>b.onclick=async()=>{try{const id=Number(b.dataset.saveMember);await updateMemberLocal(id,{name:$(`[data-member-name="${id}"]`).value,role:$(`[data-member-role="${id}"]`).value});toast('Login saved.');renderSettings();populateSelects();showApp()}catch(err){toast(err.message,true)}});
  $$('[data-delete-member]').forEach(b=>b.onclick=async()=>{if(!confirm('Remove this login?'))return;try{await deleteMemberLocal(Number(b.dataset.deleteMember));toast('Login removed.');renderSettings();populateSelects()}catch(err){toast(err.message,true)}});
}
function renderAll(){populateSelects();applyRoleAccess();renderDashboard();renderIdeas();renderWeekly();renderProjects();renderMasterSheet();renderSettings();renderNotificationCenter();maybeShowPendingTaskPopup();safeRenderAnalytics();renderReportControls();bindRecordActions()}

function populateSelects(){const workers=workingMembers();const opts=workers.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');['#ideaMember','#progressMember'].forEach(sel=>{const el=$(sel);const val=el.value||activeUser();el.innerHTML=opts;el.value=workers.some(m=>m.id===Number(val))?val:(workers[0]?.id||'')});const filterMembers=state.members.filter(m=>Number(m.active)!==0||state.ideas.some(i=>Number(i.submitted_by)===Number(m.id))||state.progress.some(p=>Number(p.user_id)===Number(m.id)));const allOpts=filterMembers.map(m=>`<option value="${m.id}">${esc(m.name)}${Number(m.active)===0?' · Archived':m.role==='visitor'?' · Visitor':''}</option>`).join('');$('#ideaPersonFilter').innerHTML='<option value="">All people</option>'+allOpts;const deps=state.departments.filter(d=>Number(d.active)!==0).map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join('');$('#ideaDepartment').innerHTML=deps;$('#ideaDeptFilter').innerHTML='<option value="">All departments</option>'+deps;$('#weekSelect').innerHTML=state.cycles.length?state.cycles.map(c=>`<option value="${c.id}">${esc(c.label)} · ${fmtDate(c.start_date)} – ${fmtDate(c.end_date)}</option>`).join(''):'<option value="">No week created</option>'}


function dashboardPendingItems(){
  const m=currentMember();if(!m)return[];
  const items=[],todayKey=today();
  const dailySubmitted=state.ideas.some(i=>Number(i.submitted_by)===Number(m.id)&&i.submission_date===todayKey);
  if(m.role!=='visitor'&&!dailySubmitted)items.push({label:'Daily Idea',detail:'Today · idea not submitted',page:'ideas',priority:1});
  const data=pendingTaskSummary();
  [...data.own.yesterday,...data.own.today].forEach((x,idx)=>items.push({label:x.task||x.project?.title||'Work task',detail:`${x.date===data.yesterdayKey?'Yesterday':'Today'} · ${x.project?.title||x.project?.project_number||'Work Tracking'}`,page:'progress',projectId:Number(x.project?.id)||0,priority:x.date===data.yesterdayKey?0:2}));
  return items.sort((a,b)=>a.priority-b.priority);
}
function goToPendingItem(page,projectId=0){
  const project=page==='progress'?state.projects.find(p=>Number(p.id)===Number(projectId)):null;
  showPage(page||'dashboard');
  if(project){
    if($('#workSearch'))$('#workSearch').value='';if($('#workStatusFilter'))$('#workStatusFilter').value='';
    const cycle=state.cycles.find(c=>Number(c.id)===Number(project.cycle_id));
    if(cycle)syncWorkPeriodFromCycle(cycle);
    else if(project.start_date){state.workMonthKey=monthKeyFromDate(project.start_date);state.workWeek=inferredWeekForDay(Number(project.start_date.slice(8,10)))}
    state.selectedProject=Number(project.id);renderProjects();
  }
  $('#notificationPanel')?.classList.add('hidden');$('#notificationBellBtn')?.setAttribute('aria-expanded','false');
}

function bindPendingNavigation(scope=document){scope.querySelectorAll?.('[data-pending-go]').forEach(el=>{el.onclick=()=>goToPendingItem(el.dataset.pendingGo,Number(el.dataset.pendingProject)||0)})}

function dashboardAllSubmittedCelebration(workers,submitters){
  const slot=$('#dashboardCelebrationSlot');if(!slot)return;
  const complete=workers.length>=4&&submitters.size>=workers.length;
  document.body.classList.toggle('dashboard-team-celebrating',complete);
  if(!complete){slot.innerHTML='';slot.classList.remove('is-complete');return}
  slot.classList.add('is-complete');
  if(slot.firstElementChild)return;
  slot.innerHTML=`<div class="celebration-inline-card"><span class="celebration-inline-icon">🏆</span><div><b>CONGRATULATIONS · GOOD WORK!</b><small>TODAY'S TEAM COMPLETE · All ${workers.length} R&D members submitted today’s idea.</small></div><span class="celebration-inline-spark">✦</span><div class="celebration-inline-confetti" aria-hidden="true">${Array.from({length:30},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></div>`;
}

function dashboardTrackerStatusScore(status){
  return status==='completed'?100:status==='in_progress'?60:status==='issue'?25:0;
}
function dashboardCurrentWeekInfo(){
  const d=today(),dt=new Date(`${d}T00:00:00`),week=inferredWeekForDay(dt.getDate()),monthKey=d.slice(0,7),me=currentMember();
  // Match the logical month/week, not only a single cycle record. This keeps assignments visible
  // even when duplicate/recreated working-week records exist in Firebase.
  const cycles=state.cycles.filter(c=>monthKeyFromDate(c.start_date)===monthKey&&workCycleWeek(c)===week);
  const cycleIds=new Set(cycles.map(c=>Number(c.id)));
  const mine=me?state.projects.filter(p=>cycleIds.has(Number(p.cycle_id))&&Number(p.owner_id)===Number(me.id)):[];
  const cycle=cycles[0]||null;
  return {week,monthKey,cycle,cycles,cycleIds,active:mine.length,mine};
}
function dashboardCurrentCycle(){return dashboardCurrentWeekInfo().cycle}
function dashboardTodayProgress(){
  const info=dashboardCurrentWeekInfo(),date=today();
  const tasks=info.mine.slice(0,2).map(p=>{
    const row=trackerRowsForProject(p).find(r=>!r.manual_extra&&trackerDateToIso(r.date)===date);
    return {project:p,score:dashboardTrackerStatusScore(row?.status||''),status:row?.status||''};
  });
  const total=tasks.reduce((n,x)=>n+x.score,0);
  return {percent:tasks.length?Math.round(total/tasks.length):0,projects:tasks.length,updated:tasks.filter(x=>x.score>0).length,tasks};
}
function dashboardMonthCompletion(){
  const monthKey=String(today()).slice(0,7),me=currentMember(),completeWeeks=new Set();
  for(let week=1;week<=4;week++){
    const cycleIds=new Set(state.cycles.filter(c=>monthKeyFromDate(c.start_date)===monthKey&&workCycleWeek(c)===week).map(c=>Number(c.id)));
    const projects=state.projects.filter(p=>cycleIds.has(Number(p.cycle_id)));
    // A shared week is complete only after both weekly assignments are complete.
    if(projects.length>=2&&projects.every(p=>p.status==='completed'||Number(p.progress||0)>=100||trackerDerivedProgress(p)>=100))completeWeeks.add(week);
  }
  const d=new Date(`${monthKey}-01T00:00:00`);
  return {weeks:[1,2,3,4].map(w=>completeWeeks.has(w)),monthName:d.toLocaleDateString('en-IN',{month:'short'}).toUpperCase()};
}
function dashboardActiveWeekTaskCount(){return dashboardCurrentWeekInfo().active}
function renderDashboard(){
  const t=today();$('#todayLabel').textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase();
  const workers=workingMembers(),todays=state.ideas.filter(i=>i.submission_date===t);
  const weekInfo=dashboardCurrentWeekInfo(),todayProgress=dashboardTodayProgress(),monthCompletion=dashboardMonthCompletion(),workerIds=new Set(workers.map(m=>m.id)),submitters=new Set(todays.filter(i=>workerIds.has(Number(i.submitted_by))).map(i=>Number(i.submitted_by)));
  dashboardAllSubmittedCelebration(workers,submitters);
  const myPending=dashboardPendingItems();
  const pendingLines=myPending.length?myPending.slice(0,5).map(x=>`<button type="button" class="dashboard-pending-line" data-pending-go="${esc(x.page)}" data-pending-project="${Number(x.projectId)||0}"><span>${esc(x.label)}</span><small>${esc(x.detail)}</small><b>→</b></button>`).join(''):'<div class="dashboard-pending-empty">No pending items for you.</div>';
  const progressTasks=[0,1].map(i=>{const x=todayProgress.tasks[i];return `<div class="today-task-line ${x?'':'is-disabled'}"><b>T${i+1}</b><div><span style="width:${x?x.score:0}%"></span></div><strong>${x?x.score:0}%</strong></div>`}).join('');
  $('#dashboardMetrics').innerHTML=`<div class="metric accent dashboard-nav" data-go="ideas" role="button" tabindex="0"><span class="m-label">IDEAS TODAY</span><strong>${submitters.size} / ${workers.length}</strong><small>members submitted today</small></div><div class="metric dashboard-nav dashboard-week-metric" data-go="weekly" role="button" tabindex="0"><div class="dashboard-week-heading"><span class="m-label">ACTIVE WEEK TASKS</span><b class="dashboard-current-week">W${weekInfo.week}</b></div><div class="dashboard-week-value"><strong>${weekInfo.active}</strong></div><small>${weekInfo.active===1?'assigned task in the current week':'assigned tasks in the current week'}</small></div><div class="metric dashboard-nav dashboard-progress-metric" data-go="progress" role="button" tabindex="0"><span class="m-label">TODAY'S PROGRESS</span><div class="today-task-progress">${progressTasks}</div><small>${todayProgress.projects?`${todayProgress.updated} / ${todayProgress.projects} my projects updated today`:'no project assigned to me today'}</small></div><div class="metric dashboard-month-metric"><span class="m-label">${monthCompletion.monthName} WEEKS COMPLETE</span><div class="month-week-lights">${monthCompletion.weeks.map((done,i)=>`<span class="${done?'done':''}" title="Week ${i+1}"><i></i><b>W${i+1}</b></span>`).join('')}</div><small>green = completed week</small></div>`;
  const pendingBtn=$('#dashboardPendingBtn'),pendingCount=$('#dashboardPendingCount');
  if(pendingBtn){pendingBtn.classList.toggle('has-pending',myPending.length>0);pendingBtn.classList.toggle('is-clear',myPending.length===0)}
  if(pendingCount)pendingCount.textContent=String(myPending.length);
  $$('#dashboardMetrics .dashboard-nav').forEach(card=>{card.onclick=()=>showPage(card.dataset.go);card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showPage(card.dataset.go)}}});
  const heroPending=$('#dashboardPendingBtn');if(heroPending&&!heroPending.dataset.bound){heroPending.dataset.bound='1';heroPending.addEventListener('click',()=>{renderNotificationCenter();$('#notificationPanel')?.classList.remove('hidden');$('#notificationBellBtn')?.setAttribute('aria-expanded','true')})}
  $('#todayActivity').innerHTML=`<div class="activity-grid">${workers.map(m=>{const n=todays.filter(i=>Number(i.submitted_by)===Number(m.id)).length;return `<div class="activity-person"><div><b>${esc(m.name)}</b><div class="muted" style="font-size:11px">${n?`${n} idea${n>1?'s':''} submitted`:'No entry yet'}</div></div><span class="status-dot ${n?'done':''}">${n?'✓ Submitted':'Pending'}</span></div>`}).join('')}</div>`;
  const ps=state.projects.filter(p=>weekInfo.cycleIds.has(Number(p.cycle_id))).sort((a,b)=>Number(Number(b.owner_id)===Number(currentMember()?.id))-Number(Number(a.owner_id)===Number(currentMember()?.id))||Number(a.id)-Number(b.id)).slice(0,2),focusCycle=weekInfo.cycles[0]||null;
  $('#weeklyFocus').innerHTML=weekInfo.cycles.length?`<div class="dashboard-focus-head"><span>Week ${weekInfo.week}</span><small>${focusCycle?`${fmtDate(focusCycle.start_date)} – ${fmtDate(focusCycle.end_date)}`:''}</small></div><div class="dashboard-focus-tasks">${ps.length?ps.map((p,i)=>`<button type="button" class="dashboard-focus-task ${Number(p.owner_id)===Number(currentMember()?.id)?'is-mine':''}" data-focus-project="${p.id}"><i>0${i+1}</i><div class="dashboard-focus-copy"><strong>${esc(p.title)}</strong><small class="dashboard-focus-owner"><em class="mine-dot"></em>${esc(p.owner_name||currentMember()?.name||'Assigned')} · ${Math.max(Number(p.progress)||0,trackerDerivedProgress(p))}% complete</small></div><b>→</b></button>`).join(''):'<div class="dashboard-focus-empty">No tasks assigned in this working week.</div>'}</div>`:'<div class="empty-state">No working week found for this month.</div>';
  $$('#weeklyFocus [data-focus-project]').forEach(el=>el.addEventListener('click',()=>goToPendingItem('progress',Number(el.dataset.focusProject)||0)));
}

function renderIdeas(){const q=$('#ideaSearch').value.toLowerCase().trim(), person=Number($('#ideaPersonFilter').value)||0, dep=Number($('#ideaDeptFilter').value)||0, date=$('#ideaDateFilter').value;const rows=state.ideas.filter(i=>(!q||[i.problem,i.proposed_idea,i.department_name,i.submitted_by_name,i.idea_number].join(' ').toLowerCase().includes(q))&&(!person||i.submitted_by===person)&&(!dep||i.department_id===dep)&&(!date||i.submission_date===date));$('#ideasTable').innerHTML=rows.length?rows.map(i=>`<tr><td>${fmtDate(i.submission_date)}</td><td><b>${esc(i.idea_number)}</b>${i.attachment_path?`<div class="sub"><a class="link" href="${i.attachment_path}" target="_blank">Attachment ↗</a></div>`:''}</td><td>${esc(i.submitted_by_name)}</td><td>${esc(i.department_name)}</td><td>${esc(i.problem)}</td><td>${esc(i.proposed_idea)}</td><td><span class="tag ${i.priority.toLowerCase()}">${esc(i.priority)}</span></td><td><span class="tag ${i.status}">${esc(i.status)}</span></td><td>${isVisitor()?'—':`<div class="row-actions"><button class="mini-action" data-edit-idea="${i.id}" title="Edit idea">Edit</button><button class="mini-action danger" data-delete-idea="${i.id}" title="Delete idea">×</button></div>`}</td></tr>`).join(''):'<tr><td colspan="9" class="empty-state">No ideas match the selected filters.</td></tr>';bindRecordActions()}
function renderWeekDeletePicker(){
  const select=$('#weekSelect');if(!select)return;
  let picker=$('#weekDeletePicker');
  if(!picker){picker=document.createElement('details');picker.id='weekDeletePicker';picker.className='week-delete-picker';select.insertAdjacentElement('afterend',picker);select.hidden=true;select.parentElement.tagName==='LABEL'&&select.parentElement.setAttribute('class','working-week-field week-picker-field')}
  picker.open=false;
  const selected=state.cycles.find(c=>Number(c.id)===Number(select.value));
  picker.innerHTML=`<summary>${esc(selected?.label||'No week created')} <span>▾</span></summary><div class="week-delete-options">${state.cycles.map(c=>`<div class="week-delete-option"><button type="button" data-pick-week="${c.id}" aria-pressed="${Number(c.id)===Number(select.value)}">${esc(c.label)} · ${fmtDate(c.start_date)} – ${fmtDate(c.end_date)}</button>${!isLead()?'':`<button type="button" class="mini-action danger" data-delete-cycle="${c.id}" aria-label="Delete ${esc(c.label)}">×</button>`}</div>`).join('')||'<p>No week created</p>'}</div>`;
  picker.querySelectorAll('[data-pick-week]').forEach(b=>b.onclick=()=>{select.value=b.dataset.pickWeek;picker.open=false;select.dispatchEvent(new Event('change'))});
  picker.onkeydown=e=>{if(e.key==='Escape')picker.open=false};
  bindRecordActions();
}
function renderWeekly(){
  // Keep Weekly Tasks aligned with the Daily Ideas reference period.
  // populateSelects() rebuilds the dropdown before this renderer runs, so
  // resolve the cycle from the shared month/week state instead of trusting
  // the browser's first option. Manual dropdown changes update this same
  // state first, so manual selection still works exactly as before.
  const periodCycle=state.cycles.find(c=>
    monthKeyFromDate(c.start_date)===state.workMonthKey &&
    workCycleWeek(c)===Number(state.workWeek)
  );
  const sel=Number(periodCycle?.id)||Number($('#weekSelect').value)||state.cycles[0]?.id;
  if(sel)$('#weekSelect').value=String(sel);
  renderWeekDeletePicker();
  const c=state.cycles.find(x=>Number(x.id)===Number(sel));
  if(!c){$('#weeklySetup').innerHTML='<div class="empty-state">Create a working week to begin shortlisting.</div>';return}
  syncWorkPeriodFromCycle(c);
  const assigned=state.projects.filter(p=>Number(p.cycle_id)===Number(c.id)&&(isVisitor()||Number(p.owner_id)===activeUser()));
  const requiredPicks=Math.max(0,2-assigned.length);
  if(assigned.length>=2||isVisitor()&&assigned.length){
    const visibleAssigned=isLead()?state.projects.filter(p=>Number(p.cycle_id)===Number(c.id)):assigned;
    const assignedCount=visibleAssigned.length;
    $('#weeklySetup').innerHTML=`<div class="panel assigned-week-panel assigned-week-complete"><div class="assigned-week-celebration"><div><span class="kicker">WEEKLY EXECUTION</span><h3>${esc(c.label)}</h3><p>${fmtDate(c.start_date)} – ${fmtDate(c.end_date)}</p></div><div class="assigned-score"><strong>${assignedCount}</strong><i></i><small>${isLead()?Math.max(2,visibleAssigned.length):2}</small><em>ASSIGNED</em></div><div class="assigned-check">✓</div></div><div class="assigned-week-grid">${visibleAssigned.map((p,i)=>`<article class="assigned-week-card assigned-week-card-live" style="--delay:${i*120}ms"><div class="assigned-week-index">0${i+1}</div><div class="assigned-week-body"><div class="focus-title"><span>${esc(p.title)}</span><strong>${Number(p.progress||0)}%</strong></div><div class="assigned-week-meta"><span>${esc(p.owner_name||'—')}</span><span>${esc(p.department_name||'—')}</span><span>${fmtDate(p.start_date)} → ${fmtDate(p.end_date)}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,Number(p.progress||0))}%"></div></div>${!isLead()?'':`<div class="assigned-task-actions"><button type="button" class="mini-action" data-edit-assigned-project="${p.id}">Edit task</button></div>`}</div></article>`).join('')}</div><div class="assigned-week-actions"><span class="tag ${c.status}">${esc(c.status)}</span>${!isLead()?'':`<button class="mini-action" data-edit-cycle="${c.id}">Edit</button><button class="mini-action danger" data-delete-cycle="${c.id}">×</button>`}</div></div>`;
    bindRecordActions();
    return;
  }
  const linked=new Set(state.projects.map(p=>Number(p.idea_id)));
  const candidates=state.ideas.filter(i=>String(i.status||'submitted').toLowerCase()==='submitted'&&!linked.has(Number(i.id))).sort((a,b)=>String(b.submission_date||'').localeCompare(String(a.submission_date||''))||Number(b.id)-Number(a.id));
  const thisWeek=candidates.filter(i=>i.submission_date>=c.start_date&&i.submission_date<=c.end_date).length;
  const backlog=Math.max(0,candidates.length-thisWeek);
  const ideaCards=candidates.map(i=>{const inWeek=i.submission_date>=c.start_date&&i.submission_date<=c.end_date;return `<label class="idea-choice weekly-idea-card"><input type="checkbox" class="ideaPick" value="${i.id}" ${isVisitor()?'disabled':''}><div class="weekly-idea-main"><div class="weekly-idea-top"><b>${esc(i.proposed_idea)}</b><span title="${inWeek?'Submitted within the selected week':'Unassigned idea submitted outside the selected week'}" class="weekly-source ${inWeek?'current':'backlog'}">${inWeek?'SELECTED WEEK':'OTHER DATES'}</span></div><div class="weekly-idea-meta"><span>${esc(i.idea_number)}</span><span>${fmtDate(i.submission_date)}</span><span>${esc(i.submitted_by_name)}</span><span>${esc(i.department_name)}</span></div><p>${esc(i.problem)}</p><button type="button" class="weekly-read-more mini-action" data-weekly-read="${i.id}" hidden>Read more</button></div></label>`}).join('');
  if(isVisitor()){
    $('#weeklySetup').innerHTML=`<section class="panel weekly-backlog-panel visitor-weekly-panel"><div class="panel-head weekly-compact-head"><div><span class="kicker">IDEA BACKLOG</span><h3>${esc(c.label)}</h3><p class="muted weekly-subcopy">Search submitted ideas available for this week.</p></div><span class="tag visitor">${esc(memberRoleLabel(currentMember()))}</span></div><div class="weekly-search-box"><span>⌕</span><input id="weeklyIdeaSearch" type="search" placeholder="Search idea, problem, member or department..." autocomplete="off" spellcheck="false"></div><div class="visitor-readonly">View only: Kabil · R&D Lead manages weekly assignments and priorities.</div><div id="candidateIdeas" class="weekly-idea-list">${ideaCards||'<div class="empty-state">No submitted, unassigned ideas are available.</div>'}</div></section>`;
    bindWeeklySearch();
    return;
  }
  $('#weeklySetup').innerHTML=`<div class="weekly-assignment-shell premium-weekly-shell"><section class="panel weekly-backlog-panel"><div class="panel-head weekly-compact-head"><div><span class="kicker">IDEA BACKLOG</span><h3>Choose ${requiredPicks} task${requiredPicks===1?'':'s'}</h3><p class="muted weekly-subcopy">Search and select the two ideas you want to execute this week.</p></div>${isLead()?`<div class="panel-actions"><button class="mini-action" data-edit-cycle="${c.id}">Edit week</button><button class="mini-action danger" data-delete-cycle="${c.id}">×</button></div>`:''}</div><div class="weekly-search-box"><span>⌕</span><input id="weeklyIdeaSearch" type="search" placeholder="Search idea, problem, member or department..." autocomplete="off" spellcheck="false"></div><div id="candidateIdeas" class="weekly-idea-list">${ideaCards||'<div class="empty-state">No submitted, unassigned ideas are available. Submit an idea first.</div>'}</div></section><aside class="weekly-rule-card premium-weekly-rule"><div class="weekly-rule-top"><span class="kicker">WEEKLY SELECTION</span><strong>${esc(c.label)}</strong></div><div class="weekly-rule-count"><span id="pickCount">0</span><small>/ ${requiredPicks}</small></div><p class="weekly-rule-range">${fmtDate(c.start_date)} – ${fmtDate(c.end_date)}</p><p class="weekly-rule-help">${isLead()?'Select ideas and assign the responsible owner.':'Select your own weekly tasks. Priority is set by the R&D Lead.'}</p><div id="ownerPickers" class="weekly-owner-pickers"></div><button class="primary-btn" id="assignWeekBtn" disabled>Create Weekly Assignment</button></aside></div>`;
  bindWeeklyPicks(requiredPicks);
  bindRecordActions();
}
function bindWeeklySearch(){
  const input=$('#weeklyIdeaSearch');if(!input)return;
  requestAnimationFrame(()=>$$('[data-weekly-read]').forEach(btn=>{const card=btn.closest('.weekly-idea-main'),title=card?.querySelector('.weekly-idea-top>b'),description=card?.querySelector('p');btn.hidden=!(title&&title.scrollHeight>title.clientHeight+1||description&&description.scrollHeight>description.clientHeight+1)}));
  $$('[data-weekly-read]').forEach(btn=>btn.onclick=event=>{
    event.preventDefault();event.stopPropagation();const idea=state.ideas.find(i=>Number(i.id)===Number(btn.dataset.weeklyRead));if(!idea)return;
    const dialog=document.createElement('dialog');dialog.className='modal work-text-dialog';dialog.innerHTML=`<div class="work-text-content"><h3>Idea details</h3><p><strong>${esc(idea.proposed_idea)}</strong></p><p>${esc(idea.problem)}</p><button type="button" class="primary-btn">Close</button></div>`;document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
  });
  input.addEventListener('input',()=>{
    const q=input.value.trim().toLowerCase();
    $$('#candidateIdeas .weekly-idea-card').forEach(card=>{
      const hay=(card.textContent||'').toLowerCase();
      card.classList.toggle('weekly-search-hidden',Boolean(q)&&!hay.includes(q));
    });
  });
}
function bindWeeklyPicks(requiredPicks=2){
  bindWeeklySearch();
  $$('.ideaPick').forEach(cb=>cb.addEventListener('change',()=>{
    const picks=$$('.ideaPick:checked');
    if(picks.length>requiredPicks){cb.checked=false;toast(`Select ${requiredPicks} idea(s).`,true)}
    const now=$$('.ideaPick:checked');
    $$('.idea-choice').forEach(x=>x.classList.toggle('selected',x.querySelector('input').checked));
    $('#pickCount').textContent=now.length;
    $('#assignWeekBtn').disabled=now.length!==requiredPicks;
    $('#ownerPickers').innerHTML=now.map((x,i)=>{
      const idea=state.ideas.find(a=>a.id===Number(x.value));
      return `<div class="owner-row"><span style="font-size:12px">0${i+1} ${esc(idea.proposed_idea.slice(0,42))}</span><select class="ownerSelect" ${isLead()?'':'disabled'}>${workingMembers().filter(m=>isLead()||Number(m.id)===activeUser()).map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select><label>Task priority<select class="taskPrioritySelect" ${isLead()?'':'disabled'}>${['Low','Medium','High','Critical'].map(priority=>`<option ${priority===(idea.priority||'Medium')?'selected':''}>${priority}</option>`).join('')}</select></label></div>`
    }).join('')
  }));
  $('#assignWeekBtn')?.addEventListener('click',assignWeek)
}
async function assignWeek(){try{const ids=$$('.ideaPick:checked').map(x=>Number(x.value));if(!ids.length||ids.length>2)return;const owners=$$('.ownerSelect').map(x=>Number(x.value));await assignWeekLocal(Number($('#weekSelect').value),ids,owners,$$('.taskPrioritySelect').map(x=>x.value));toast('Weekly tasks assigned.');scheduleRender()}catch(e){toast(e.message,true)}}
function projectHasBlocker(projectId){return state.progress.some(u=>Number(u.project_id)===Number(projectId)&&String(u.blocker||'').trim())}
function projectLastUpdate(projectId){return state.progress.filter(u=>Number(u.project_id)===Number(projectId)).sort((a,b)=>String(b.update_date||'').localeCompare(String(a.update_date||''))||Number(b.id)-Number(a.id))[0]||null}
function daysTo(date){if(!date)return null;const a=new Date(today()+'T00:00:00'),b=new Date(date+'T00:00:00');return Math.ceil((b-a)/86400000)}
function monthKeyFromDate(value){const m=String(value||'').match(/^(\d{4})-(\d{2})-/);return m?`${m[1]}-${m[2]}`:''}
function workCycleWeek(cycle){if(!cycle)return 1;const label=String(cycle.label||'').match(/week\s*([1-4])/i);if(label)return Number(label[1]);const day=Number(String(cycle.start_date||'').slice(8,10))||1;return inferredWeekForDay(day)}
function syncWorkMonthFromDate(value){const key=monthKeyFromDate(value);if(key)state.workMonthKey=key}
function syncWorkPeriodFromCycle(cycle){if(!cycle)return;const key=monthKeyFromDate(cycle.start_date);if(key)state.workMonthKey=key;state.workWeek=workCycleWeek(cycle)}
function dailyReferencePeriod(value=today()){
  const date=/^\d{4}-\d{2}-\d{2}$/.test(String(value||''))?String(value):today();
  const day=Number(date.slice(8,10))||1;
  return {date,monthKey:monthKeyFromDate(date),week:inferredWeekForDay(day)};
}
function syncPeriodFromDailyReference(){
  const ref=dailyReferencePeriod(today());
  state.workMonthKey=ref.monthKey;
  state.workWeek=ref.week;
  const cycle=state.cycles.find(c=>monthKeyFromDate(c.start_date)===ref.monthKey&&workCycleWeek(c)===ref.week);
  if(cycle&&$('#weekSelect'))$('#weekSelect').value=String(cycle.id);
  return {ref,cycle};
}
function ensureWorkPeriod(){
  if(!state.workMonthKey){
    const selected=state.cycles.find(c=>Number(c.id)===Number($('#weekSelect')?.value));
    if(selected)syncWorkPeriodFromCycle(selected);
    else if($('#ideaDateFilter')?.value)syncWorkMonthFromDate($('#ideaDateFilter').value);
    else if(state.cycles[0])syncWorkPeriodFromCycle(state.cycles[0]);
    else syncWorkMonthFromDate(today());
  }
  if(![1,2,3,4].includes(Number(state.workWeek)))state.workWeek=1;
}
function workPeriodLabel(){ensureWorkPeriod();const [y,m]=String(state.workMonthKey||'').split('-');const idx=Number(m)-1;return Number.isInteger(idx)&&idx>=0&&idx<12?`${WEEK_MONTHS[idx]} ${y}`:'Current month'}
function renderWorkPeriodNav(){ensureWorkPeriod();const monthSelect=$('#workMonthSelect'),weekSelect=$('#workWeekSelect');if(monthSelect){const [yearRaw]=String(state.workMonthKey||'').split('-'),year=Number(yearRaw)||new Date().getFullYear();monthSelect.innerHTML=WEEK_MONTHS.map((name,index)=>{const value=`${year}-${String(index+1).padStart(2,'0')}`;return `<option value="${value}">${name} ${year}</option>`}).join('');monthSelect.value=state.workMonthKey}if(weekSelect)weekSelect.value=String(state.workWeek)}
function workPeriodProjects(){ensureWorkPeriod();return state.projects.filter(p=>{const cycle=state.cycles.find(c=>Number(c.id)===Number(p.cycle_id));const date=cycle?.start_date||p.start_date;return monthKeyFromDate(date)===state.workMonthKey&&workCycleWeek(cycle||{start_date:date,label:p.cycle_label})===Number(state.workWeek)})}
function renderWorkSummary(){const host=$('#workSummary');if(!host)return;const periodRows=workPeriodProjects(),total=periodRows.length,active=periodRows.filter(p=>p.status!=='completed').length,done=periodRows.filter(p=>p.status==='completed').length,blocked=periodRows.filter(p=>projectHasBlocker(p.id)&&p.status!=='completed').length,avg=total?Math.round(periodRows.reduce((n,p)=>n+Number(p.progress||0),0)/total):0;host.innerHTML=`<article class="work-stat primary"><span>ACTIVE WORK</span><strong>${active}</strong><small>${total} projects · ${esc(workPeriodLabel())} W${state.workWeek}</small></article><article class="work-stat"><span>AVG COMPLETION</span><strong>${avg}%</strong><small>selected weekly projects</small></article><article class="work-stat"><span>COMPLETED</span><strong>${done}</strong><small>closed weekly priorities</small></article><article class="work-stat ${blocked?'alert':''}"><span>BLOCKED</span><strong>${blocked}</strong><small>${blocked?'needs attention':'no active blockers'}</small></article>`}
function filteredProjects(){const q=String($('#workSearch')?.value||'').trim().toLowerCase(),status=$('#workStatusFilter')?.value||'';return workPeriodProjects().filter(p=>{const text=`${p.project_number||''} ${p.title||''} ${p.owner_name||''} ${p.department_name||''} ${p.cycle_label||''}`.toLowerCase();if(q&&!text.includes(q))return false;if(status==='blocked')return projectHasBlocker(p.id)&&p.status!=='completed';if(status&&p.status!==status)return false;return true}).sort((a,b)=>{const rank={in_progress:0,assigned:1,completed:2};return (rank[a.status]??3)-(rank[b.status]??3)||String(b.start_date||'').localeCompare(String(a.start_date||''))})}
function bindTaskDeleteButtons(){
  $$('[data-remove-task]').forEach(b=>{
    const remove=e=>{e.stopPropagation();e.preventDefault();const p=state.projects.find(x=>Number(x.id)===Number(b.dataset.removeTask));if(!p||!isLead())return;if(!confirm(`Delete ${p.project_number}? Its progress history will be removed and the linked idea will return to Submitted.`))return;runMutationButton(b,async()=>{await deleteProjectLocal(p.id);if(Number(state.selectedProject)===Number(p.id))state.selectedProject=null},'Task deleted.')};
    b.onclick=remove;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')remove(e)};
  });
}
function renderProjects(){renderWorkPeriodNav();renderWorkSummary();const list=$('#projectList');if(!list)return;const rows=filteredProjects().sort((a,b)=>Number(canEditTask(b))-Number(canEditTask(a))||Number(a.id)-Number(b.id));const count=$('#workProjectCount');if(count)count.textContent=String(rows.length);if(!state.projects.length){list.innerHTML='<div class="empty-state">No weekly projects yet. Shortlist two ideas in Weekly Tasks to start execution.</div>';$('#projectDetail').className='project-detail work-detail empty-state';$('#projectDetail').innerHTML='No work has been assigned yet.';return}if(!rows.length){list.innerHTML=`<div class="empty-state">No projects found for ${esc(workPeriodLabel())} · Week ${state.workWeek}.</div>`;$('#projectDetail').className='project-detail work-detail empty-state';$('#projectDetail').innerHTML='Choose another week from the Work Tracking period bar.';return}if(!state.selectedProject||!rows.some(p=>Number(p.id)===Number(state.selectedProject)))state.selectedProject=rows[0].id;list.innerHTML=rows.map(p=>{const last=projectLastUpdate(p.id),blocked=projectHasBlocker(p.id),due=daysTo(p.end_date),statusLabel=p.status==='in_progress'?'IN PROGRESS':p.status==='completed'?'COMPLETED':'ASSIGNED';return `<div role="button" tabindex="0" class="work-project-card ${Number(p.id)===Number(state.selectedProject)?'active':''}" data-project="${p.id}"><div class="work-project-top"><span>${esc(p.project_number)}</span>${!isLead()?'':`<button type="button" class="task-delete-x" data-remove-task="${p.id}" aria-label="Delete ${esc(p.title)}">×</button>`}<em class="work-status ${p.status}">${statusLabel}</em></div><h4>${esc(p.title)}</h4><div class="work-readmore-space"><button type="button" class="work-readmore" data-read-project="${p.id}" hidden>Read more</button></div><div class="task-access-row"><span>${canEditTask(p)?'MY TASK · EDITABLE':'TEAM TASK · VIEW ONLY'}</span><b>${esc(taskPriority(p))} priority</b>${isLead()?`<button type="button" class="mini-action" data-lead-edit-task="${p.id}">Manage</button>`:''}</div><div class="work-project-meta"><span>${esc(p.owner_name||'Unassigned')}</span><span>${esc(p.department_name||'—')}</span></div><div class="work-progress-row"><div class="progress-track"><div class="progress-fill" style="width:${Number(p.progress||0)}%"></div></div><b>${Number(p.progress||0)}%</b></div><div class="work-project-foot"><span>${last?`Updated ${fmtDate(last.update_date)}`:'No updates yet'}</span><span class="${blocked?'danger-text':''}">${blocked?'● Blocker':p.status==='completed'?'Closed':due===null?'—':due<0?`${Math.abs(due)}d overdue`:due===0?'Due today':`${due}d left`}</span></div></div>`}).join('');$$('[data-project]').forEach(b=>b.onclick=()=>{state.selectedProject=Number(b.dataset.project);renderProjects()});$$('[data-project]').forEach(b=>b.onkeydown=e=>{if(e.target===b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();b.click()}});$$('[data-lead-edit-task]').forEach(b=>b.onclick=e=>{e.stopPropagation();openProjectEdit(Number(b.dataset.leadEditTask))});requestAnimationFrame(()=>$$('[data-read-project]').forEach(btn=>{const title=btn.closest('.work-project-card')?.querySelector('h4');btn.hidden=!title||title.scrollHeight<=title.clientHeight+1}));$$('[data-read-project]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const p=state.projects.find(x=>Number(x.id)===Number(btn.dataset.readProject));if(!p)return;const dialog=document.createElement('dialog');dialog.className='modal work-text-dialog';dialog.innerHTML=`<div class="work-text-content"><h3>Project</h3><p>${esc(p.title)}</p><button type="button" class="primary-btn">Close</button></div>`;document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove());dialog.showModal()});bindTaskDeleteButtons();renderProjectDetail()}
const trackerSaveTimers=new Map();
const TRACKER_VISIBLE_ROWS=12;
const TRACKER_TIME_SLOTS=['9:00 AM – 11:00 AM','11:00 AM – 1:30 PM','2:00 PM – 3:30 PM','3:30 PM – 5:30 PM'];
function cleanTrackerSlots(value){
  const slots={};
  for(let i=0;i<4;i++){
    const r=value?.[i];if(!r||typeof r!=='object')continue;
    slots[i]={};
    for(const key of ['task','status','issue','next_action','remarks'])slots[i][key]=String(r[key]||'').slice(0,600);
    if(!['','in_progress','completed','issue'].includes(slots[i].status))slots[i].status='';
  }
  return slots;
}
function trackerSlotMenu(p,r){
  return `<details class="tracker-slot-menu"><summary>Choose time · ${Object.keys(r.time_slots||{}).length}/4 saved</summary><div>${TRACKER_TIME_SLOTS.map((label,i)=>`<div class="tracker-slot-choice"><button type="button" data-slot-edit="${r.row_index}:${i}" ${canEditTrackerRow(p,r)?'':'disabled'}>${esc(label)}</button><button type="button" data-slot-view="${r.row_index}:${i}" ${r.time_slots?.[i]?'':'disabled'} aria-label="View ${esc(label)}" title="View saved details">&#128065;</button></div>`).join('')}</div></details>${r.task?`<details class="tracker-legacy-task"><summary>Previous task entry</summary><div>${esc(r.task)}</div></details>`:''}`;
}
function bindTrackerSlots(p){
  const host=$('#projectDetail');
  function openSlot(key,view){
    const [rowIndex,slot]=key.split(':').map(Number);
    if(!Number.isInteger(rowIndex)||!Number.isInteger(slot)||slot<0||slot>3||(!view&&!canEditTrackerProject(p)))return;
    const parent=host.querySelector(`.rnd-manual-row[data-row-index="${rowIndex}"]`);if(!parent)return;
    host.querySelectorAll('.tracker-slot-detail').forEach(el=>el.remove());
    host.querySelectorAll('.tracker-slot-menu').forEach(el=>el.open=false);
    const row=trackerRowsForProject(p).find(r=>r.row_index===rowIndex)||cleanTrackerRow({date:parent.querySelector('[data-tracker-field="date"]').value},rowIndex);
    if(!view&&!canEditTrackerRow(p,row))return;
    const saved=row.time_slots[slot]||{},disabled=view?'disabled':'';
    const tr=document.createElement('tr');tr.className='tracker-slot-detail';
    tr.innerHTML=`<td colspan="8"><div class="tracker-slot-heading"><strong>${esc(row.date)} · ${esc(TRACKER_TIME_SLOTS[slot])}${view?' · Saved details':''}</strong><button type="button" class="ghost-btn" data-slot-close>Close</button></div><div class="tracker-slot-fields">${[['task','Work done / Details'],['status','Status'],['issue','Issue / Reason'],['next_action','Next Action'],['remarks','Review / Remarks']].map(([field,label])=>`<label>${label}${field==='status'?`<select data-slot-field="status" ${disabled}><option value="">Select status</option>${['in_progress','completed','issue'].map(v=>`<option value="${v}" ${saved.status===v?'selected':''}>${trackerStatusLabel(v)}</option>`).join('')}</select>`:`<textarea data-slot-field="${field}" maxlength="600" ${disabled}>${esc(saved[field]||'')}</textarea>`}</label>`).join('')}</div>${view?'':'<div class="tracker-slot-actions"><button type="button" class="primary-btn" data-slot-save>Save</button></div>'}</td>`;
    parent.after(tr);tr.querySelector('[data-slot-close]').onclick=()=>tr.remove();
    const save=tr.querySelector('[data-slot-save]');if(save)save.onclick=async()=>{
      if(!canEditTrackerRow(p,row))return toast('This date is locked. Only the R&D Lead can edit it.',true);save.disabled=true;save.textContent='Saving…';
      try{
        const values={};tr.querySelectorAll('[data-slot-field]').forEach(el=>values[el.dataset.slotField]=el.value);
        if(!String(values.task||'').trim())throw new Error('Enter work details before saving.');
        const rows=trackerRowsForProject(p);let current=rows.find(r=>r.row_index===rowIndex);
        if(!current){current=cleanTrackerRow(row,rowIndex);rows.push(current)}
        current.time_slots[slot]=values;p.tracker_rows=rows;
        queueCloudOps([{collection:'projects',row:p}]);await persistState();const synced=await flushPendingCloudOps();
        if(Number(state.selectedProject)===Number(p.id))renderProjectDetail();
        toast(synced?'Time-slot details saved to Firebase.':'Saved on this device · Firebase sync pending.',!synced);
      }catch(e){toast(e.message,true);save.disabled=false;save.textContent='Save'}
    };
    tr.querySelector('textarea,select')?.focus();
  }
  host.querySelectorAll('[data-slot-edit]').forEach(btn=>btn.onclick=()=>openSlot(btn.dataset.slotEdit,false));
  host.querySelectorAll('[data-slot-view]').forEach(btn=>btn.onclick=()=>openSlot(btn.dataset.slotView,true));
}
function cleanTrackerRow(row={},fallbackIndex=0){
  return {
    row_index:Number.isFinite(Number(row.row_index))?Number(row.row_index):fallbackIndex,
    manual_extra:row.manual_extra===true,
    date:String(row.date||'').slice(0,40),
    stage:String(row.stage||'').slice(0,240),
    task:String(row.task||'').slice(0,600),
    status:['in_progress','completed','issue'].includes(String(row.status||''))?String(row.status):'',
    issue:String(row.issue||'').slice(0,600),
    next_action:String(row.next_action||'').slice(0,600),
    remarks:String(row.remarks||'').slice(0,600),
    time_slots:cleanTrackerSlots(row.time_slots)
  };
}
function trackerRowHasData(row={}){const r=cleanTrackerRow(row);return Object.keys(r.time_slots).length>0||r.manual_extra===true||['date','stage','task','status','issue','next_action','remarks'].some(k=>String(r[k]||'').trim())}
function trackerRowsForProject(p){return Array.isArray(p?.tracker_rows)?p.tracker_rows.map((r,i)=>cleanTrackerRow(r,i)).filter(trackerRowHasData):[]}
function trackerStatusLabel(value){return value==='completed'?'Completed':value==='issue'?'Issue':value==='in_progress'?'In Progress':''}
function trackerRowClass(value){return value==='completed'?'done':value==='issue'?'issue':value==='in_progress'?'progress':''}
function trackerDateRange(startDate,endDate){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(startDate||''))||!/^\d{4}-\d{2}-\d{2}$/.test(String(endDate||'')))return [];
  const start=Date.parse(startDate+'T00:00:00Z'),end=Date.parse(endDate+'T00:00:00Z');
  if(!Number.isFinite(start)||!Number.isFinite(end)||start>end)return [];
  const out=[];
  for(let time=start;time<=end;time+=86400000)out.push(new Date(time).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).replace(/ /g,'-'));
  return out;
}
function trackerPeriodDates(p){
  const projectDates=trackerDateRange(p?.start_date,p?.end_date);if(projectDates.length)return projectDates;
  ensureWorkPeriod();
  const cycle=state.cycles.find(c=>monthKeyFromDate(c.start_date)===state.workMonthKey&&workCycleWeek(c)===Number(state.workWeek));
  if(cycle?.start_date&&cycle?.end_date){
    return trackerDateRange(cycle.start_date,cycle.end_date);
  }
  const [yearRaw,monthRaw]=String(state.workMonthKey||'').split('-');
  const year=Number(yearRaw),month=Number(monthRaw);
  if(!Number.isInteger(year)||!Number.isInteger(month)||month<1||month>12)return Array(6).fill('');
  const startDay=((Math.max(1,Math.min(4,Number(state.workWeek)||1))-1)*6)+1;
  const monthShort=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month-1];
  return Array.from({length:6},(_,i)=>`${String(startDay+i).padStart(2,'0')}-${monthShort}-${year}`);
}
function trackerDerivedProgress(p){
  const dateCount=trackerDateRange(p?.start_date,p?.end_date).length||6;
  const rows=trackerRowsForProject(p).filter(r=>!r.manual_extra&&r.status).sort((a,b)=>Number(a.row_index)-Number(b.row_index)).slice(0,dateCount);
  const weights={issue:25,in_progress:60,completed:100};
  const total=rows.reduce((sum,row)=>sum+(weights[row.status]||0),0);
  return Math.max(0,Math.min(100,Math.round(total/dateCount)));
}
function trackerProgressColor(percent){return percent>=60?'#22c55e':percent>=26?'#facc15':'#ef4444'}
function applyTrackerDerivedProgress(p,{updateDom=true}={}){
  const progress=trackerDerivedProgress(p);
  p.progress=progress;
  p.status=progress>=100?'completed':progress>0?'in_progress':'assigned';
  p.updated_at=new Date().toISOString();
  if(updateDom){
    const dial=$('#trackerProjectProgressDial');
    if(dial){dial.style.setProperty('--p',`${progress*3.6}deg`);dial.style.setProperty('--ring-color',trackerProgressColor(progress))}
    const value=$('#trackerProjectProgressValue');if(value)value.textContent=`${progress}%`;
    const overall=$('#trackerOverallProgress');if(overall)overall.textContent=`${progress}%`;
    const card=$(`[data-project="${p.id}"]`);
    if(card){
      const fill=card.querySelector('.progress-fill');if(fill)fill.style.width=`${progress}%`;
      const pct=card.querySelector('.work-progress-row b');if(pct)pct.textContent=`${progress}%`;
      const badge=card.querySelector('.work-status');if(badge){badge.className=`work-status ${p.status}`;badge.textContent=p.status==='completed'?'COMPLETED':p.status==='in_progress'?'IN PROGRESS':'ASSIGNED'}
    }
  }
  return progress;
}
function scheduleTrackerSave(p){
  if(!canEditTrackerProject(p))return;
  const id=Number(p.id);
  p.tracker_rows=trackerRowsForProject(p).filter(trackerRowHasData);
  applyTrackerDerivedProgress(p,{updateDom:true});
  const index=state.projects.findIndex(project=>Number(project.id)===id);
  if(index<0)return;
  state.projects[index]=p;
  const ops=[{collection:'projects',row:p}],cycle=state.cycles.find(c=>Number(c.id)===Number(p.cycle_id));
  if(cycle){
    const peers=state.projects.filter(project=>Number(project.cycle_id)===Number(cycle.id));
    const status=peers.length>=2&&peers.every(project=>Number(project.progress)>=100)?'completed':'active';
    if(cycle.status!==status){cycle.status=status;cycle.updated_at=new Date().toISOString();ops.push({collection:'cycles',row:cycle})}
  }
  // Queue immediately so incoming snapshots cannot erase an edit during debounce.
  queueCloudOps(ops);
  void persistState().catch(e=>toast(e.message||'Unable to save tracker locally.',true));
  clearTimeout(trackerSaveTimers.get(id));
  trackerSaveTimers.set(id,setTimeout(()=>{
    trackerSaveTimers.delete(id);
    void flushPendingCloudOps();
  },180));
}

function updateManualTrackerSummary(p){
  const rows=trackerRowsForProject(p);
  const done=$('#trackerCompletedCount'),active=$('#trackerProgressCount'),issues=$('#trackerIssueCount');
  if(done)done.textContent=String(rows.filter(r=>r.status==='completed').length);
  if(active)active.textContent=String(rows.filter(r=>r.status==='in_progress').length);
  if(issues)issues.textContent=String(rows.filter(r=>r.status==='issue').length);
}
function trackerSheetRows(p){
  const stored=trackerRowsForProject(p),byIndex=new Map(stored.map(r=>[Number(r.row_index),r]));
  const dateCount=trackerDateRange(p?.start_date,p?.end_date).length||6;
  const count=Math.max(dateCount+stored.filter(r=>r.manual_extra).length,...stored.map(r=>Number(r.row_index)+1));
  return Array.from({length:count},(_,i)=>byIndex.get(i)||cleanTrackerRow({},i));
}
function insertManualTrackerRow(p,insertIndex){
  if(!canEditTrackerProject(p))return;
  const before=trackerSheetRows(p).find(r=>Number(r.row_index)===insertIndex-1);if(before&&!canEditTrackerRow(p,before))return;
  const rows=trackerSheetRows(p)
    .sort((a,b)=>Number(a.row_index)-Number(b.row_index))
    .map(r=>({...r}));
  rows.forEach(r=>{
    if(Number(r.row_index)>=insertIndex)r.row_index=Number(r.row_index)+1;
  });
  rows.push(cleanTrackerRow({manual_extra:true},insertIndex));
  p.tracker_rows=rows.sort((a,b)=>Number(a.row_index)-Number(b.row_index));
  p.tracker_row_count=Math.max(6,Number(p.tracker_row_count)||TRACKER_VISIBLE_ROWS)+1;
  renderProjectDetail();
  scheduleTrackerSave(p);
}
function deleteManualTrackerRow(p,rowIndex){
  if(!canEditTrackerProject(p))return;
  selectedManualTrackerRow=null;
  const currentCount=Math.max(6,Number(p.tracker_row_count)||TRACKER_VISIBLE_ROWS);
  const sheet=trackerSheetRows(p),target=sheet.find(r=>Number(r.row_index)===Number(rowIndex));
  if(!target||!canEditTrackerRow(p,target))return;
  let rows;
  if(target.manual_extra){
    rows=sheet.filter(r=>Number(r.row_index)!==Number(rowIndex)).map(r=>({...r,row_index:Number(r.row_index)>Number(rowIndex)?Number(r.row_index)-1:Number(r.row_index)}));
  }else{
    // Clear a fixed date without moving later dates, targets or timing details.
    rows=sheet.map(r=>Number(r.row_index)===Number(rowIndex)?cleanTrackerRow({date:r.date},Number(rowIndex)):r);
  }
  p.tracker_rows=rows.sort((a,b)=>Number(a.row_index)-Number(b.row_index));
  p.tracker_row_count=Math.max(6,currentCount-(target.manual_extra?1:0));
  applyTrackerDerivedProgress(p,{updateDom:false});
  renderProjectDetail();
  scheduleTrackerSave(p);
}
function bindManualTrackerGrid(p){
  $$('.rnd-manual-row').forEach((tr,domIndex)=>{
    const rowIndex=Number(tr.dataset.rowIndex);
    const rowAccess=()=>canEditTrackerRow(p,trackerSheetRows(p).find(r=>Number(r.row_index)===rowIndex));
    const inputs=[...tr.querySelectorAll('[data-tracker-field]')];
    const statusEl=tr.querySelector('[data-tracker-field="status"]');
    const nextActionEl=tr.querySelector('[data-tracker-field="next_action"]');
    const syncNextActionState=(status)=>{
      if(!nextActionEl)return;
      if(status==='completed'){
        nextActionEl.value='N/A';
        nextActionEl.disabled=true;
      }else{
        if(nextActionEl.value==='N/A')nextActionEl.value='';
        nextActionEl.disabled=!rowAccess();
      }
    };
    syncNextActionState(statusEl?.value||'');
    if(tr.dataset.manualExtra==='1'){
      const selectRow=()=>{selectedManualTrackerRow={projectId:Number(p.id),rowIndex};$$('.rnd-manual-row').forEach(x=>x.classList.toggle('row-selected',x===tr))};
      tr.addEventListener('click',selectRow);tr.addEventListener('focusin',selectRow);
    }
    const update=()=>{
      if(!rowAccess())return;
      const proposedDate=tr.querySelector('[data-tracker-field="date"]')?.value;if(!isLead()&&/^\d{4}-\d{2}-\d{2}$/.test(trackerDateToIso(proposedDate))&&trackerDateToIso(proposedDate)<today())return;
      const rows=trackerRowsForProject(p);
      let row=rows.find(r=>Number(r.row_index)===rowIndex);
      if(!row){row=cleanTrackerRow({},rowIndex);rows.push(row)}
      inputs.forEach(el=>row[el.dataset.trackerField]=String(el.value||''));
      if(row.status==='completed'){
        row.next_action='N/A';
        if(nextActionEl)nextActionEl.value='N/A';
      }else if(row.next_action==='N/A'){
        row.next_action='';
        if(nextActionEl)nextActionEl.value='';
      }
      syncNextActionState(row.status);
      p.tracker_rows=rows.filter(trackerRowHasData);
      tr.className=`rnd-manual-row ${trackerRowClass(row.status)}`.trim();
      updateManualTrackerSummary(p);
      applyTrackerDerivedProgress(p,{updateDom:true});
      scheduleTrackerSave(p);
    };
    inputs.forEach(el=>{el.addEventListener('input',update);el.addEventListener('change',update)});
  });
  $$('[data-insert-tracker-row]').forEach(btn=>{
    btn.onclick=()=>{
      const insertIndex=Number(btn.dataset.insertTrackerRow);
      if(Number.isInteger(insertIndex)&&insertIndex>=0)insertManualTrackerRow(p,insertIndex);
    };
  });
  $$('[data-delete-tracker-row]').forEach(btn=>{
    btn.onclick=()=>{
      const rowIndex=Number(btn.dataset.deleteTrackerRow);
      if(Number.isInteger(rowIndex)&&rowIndex>=0)deleteManualTrackerRow(p,rowIndex);
    };
  });
}
function renderProjectDetail(){
  const p=state.projects.find(x=>Number(x.id)===Number(state.selectedProject));
  if(!p)return;
  const idea=state.ideas.find(i=>Number(i.id)===Number(p.idea_id));
  const due=daysTo(p.end_date);
  const heroProgress=trackerRowsForProject(p).some(r=>r.status)?trackerDerivedProgress(p):Number(p.progress)||0;
  const heroRingColor=trackerProgressColor(heroProgress);
  const storedRows=trackerRowsForProject(p);
  const highestRow=storedRows.reduce((m,r)=>Math.max(m,Number(r.row_index)||0),-1);
  // Default sheet includes every date in the project heading range.
  // Extra rows appear only when the user explicitly adds them.
  const manualRows=storedRows.filter(r=>r.manual_extra===true);
  const visibleCount=6+manualRows.length;
  const rows=trackerSheetRows(p);
  const periodDates=trackerPeriodDates(p);
  let autoDateSlot=0;
  rows.forEach(row=>{
    if(row.manual_extra)return;
    if(autoDateSlot<periodDates.length){
      row.date=periodDates[autoDateSlot]||'';
      row.auto_date_slot=autoDateSlot;
      autoDateSlot++;
    }
  });
  const doneCount=storedRows.filter(r=>r.status==='completed').length;
  const issueCount=storedRows.filter(r=>r.status==='issue').length;
  const progressCount=storedRows.filter(r=>r.status==='in_progress').length;
  const daysRemaining=p.status==='completed'?0:(due===null?'—':Math.max(0,due));
  
  $('#projectDetail').className='project-detail work-detail';
  $('#projectDetail').innerHTML=`
    <div class="work-detail-head">
      <div class="work-title-block work-title-simple work-project-labels">
        <div class="work-project-label-row"><span>Name</span><b>:</b><strong>${esc(p.owner_name||'—')}</strong></div>
        <div class="work-project-label-row"><span>Project</span><b>:</b><strong>${esc(p.title)}</strong></div>
        <div class="work-project-label-row"><span>Department</span><b>:</b><strong>${esc(p.department_name||'—')}</strong></div>
      </div>
      <div class="work-progress-dial" id="trackerProjectProgressDial" style="--p:${heroProgress*3.6}deg;--ring-color:${heroRingColor}"><div><strong id="trackerProjectProgressValue">${heroProgress}%</strong><span>complete</span></div></div>
    </div>
    <div class="rnd-sheet-wrap">
      <div class="rnd-sheet">
        <div class="rnd-sheet-title-row">
          <div class="rnd-sheet-main-title">R&amp;D DAILY PROJECT PROCESS TRACKER</div>
          <div class="rnd-sheet-brand"><strong>DFAB STAINLESS SYSTEM PVT LTD</strong><span>Research &amp; Development Department&nbsp;&nbsp;|&nbsp;&nbsp;www.dfab.in</span></div>
        </div>
        <div class="rnd-sheet-band">PROJECT DETAILS</div>
        <div class="rnd-project-grid">
          <div class="sheet-label pn-label">Project Name</div><div class="sheet-value pn-value">${esc(p.title)}</div>
          <div class="sheet-label id-label">Project ID</div><div class="sheet-value id-value">${esc(p.project_number||String(p.id))}</div>
          <div class="sheet-label owner-label">Project Owner</div><div class="sheet-value owner-value">${esc(p.owner_name||'—')}</div>
          <div class="sheet-label start-label">Start Date</div><div class="sheet-value start-value">${fmtDate(p.start_date)}</div>
          <div class="sheet-label deadline-label">Deadline</div><div class="sheet-value deadline-value">${fmtDate(p.end_date)}</div>
          <div class="sheet-label days-label">Days Remaining</div><div class="sheet-value days-value">${daysRemaining}</div>
          <div class="sheet-label dept-label">Department</div><div class="sheet-value dept dept-value">${esc(p.department_name||'R&D')}</div>
          <div class="sheet-label objective-label">Project Objective / Expected Result</div><div class="sheet-value objective-value">${esc(idea?.proposed_idea||idea?.problem||'—')}</div>
        </div>
        <div class="rnd-sheet-band">DAILY STATUS SUMMARY</div>
        <div class="rnd-summary-grid">
          <div><span>Completed</span><strong id="trackerCompletedCount">${doneCount}</strong></div>
          <div><span>In Progress</span><strong id="trackerProgressCount">${progressCount}</strong></div>
          <div><span>Issues</span><strong id="trackerIssueCount">${issueCount}</strong></div>
          <div><span>Overall Progress</span><strong id="trackerOverallProgress">${heroProgress}%</strong></div>
        </div>
        <div class="rnd-status-legend"><b>Status Colour:</b><span class="done">COMPLETED</span><span class="progress">IN PROGRESS</span><span class="issue">ISSUE</span><em>Fill the cells manually. Status is selected from the dropdown in each row.</em></div>
        <div class="rnd-daily-table-scroll">
          <table class="rnd-daily-table rnd-manual-table">
            <thead><tr><th>Date</th><th>Daily Target</th><th>Timings Worked</th><th>Status</th><th>Issue / Reason</th><th>Next Action</th><th>Review / Remarks</th><th class="rnd-delete-head">Delete</th></tr></thead>
            <tbody>${rows.map((r,i)=>{const readonly=canEditTrackerRow(p,r)?'':'disabled';return `<tr class="rnd-manual-row ${trackerRowClass(r.status)} ${r.manual_extra?'manual-extra-row':''}" data-row-index="${r.row_index}" data-manual-extra="${r.manual_extra?'1':'0'}" tabindex="${r.manual_extra?'0':'-1'}">
              <td><input class="rnd-cell-input" data-tracker-field="date" value="${esc(r.date)}" ${(!r.manual_extra&&Number.isInteger(r.auto_date_slot))?'readonly':readonly} aria-label="Date row ${i+1}"></td>
              <td><textarea class="rnd-cell-input rnd-cell-textarea" data-tracker-field="stage" ${readonly} aria-label="Daily target row ${i+1}">${esc(r.stage)}</textarea></td>
              <td>${trackerSlotMenu(p,r)}</td>
              <td><select class="rnd-cell-select" data-tracker-field="status" ${readonly} aria-label="Status row ${i+1}"><option value="" ${!r.status?'selected':''}></option><option value="in_progress" ${r.status==='in_progress'?'selected':''}>In Progress</option><option value="completed" ${r.status==='completed'?'selected':''}>Completed</option><option value="issue" ${r.status==='issue'?'selected':''}>Issue</option></select></td>
              <td><textarea class="rnd-cell-input rnd-cell-textarea" data-tracker-field="issue" ${readonly} aria-label="Issue or reason row ${i+1}">${esc(r.issue)}</textarea></td>
              <td><textarea class="rnd-cell-input rnd-cell-textarea" data-tracker-field="next_action" ${r.status==='completed'?'disabled':readonly} aria-label="Next action row ${i+1}">${esc(r.status==='completed'?'N/A':r.next_action)}</textarea></td>
              <td><textarea class="rnd-cell-input rnd-cell-textarea" data-tracker-field="remarks" ${readonly} aria-label="Review or remarks row ${i+1}">${esc(r.remarks)}</textarea></td>
              <td class="rnd-delete-cell"><button type="button" class="rnd-row-delete" data-delete-tracker-row="${r.row_index}" ${!canEditTrackerRow(p,r)?'disabled':''} aria-label="Delete tracker row ${i+1}" title="Delete row"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-1 11H8L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"/></svg></button></td>
            </tr>${i<rows.length-1?`<tr class="rnd-insert-row"><td colspan="8"><button type="button" class="rnd-row-add" data-insert-tracker-row="${Number(r.row_index)+1}" ${!canEditTrackerRow(p,r)?'disabled':''} aria-label="Insert blank tracker row below this row">+</button></td></tr>`:''}`}).join('')}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  if($('#openProgressBtn'))$('#openProgressBtn').onclick=()=>openProgress(p);
  bindRecordActions();
  bindManualTrackerGrid(p);
  bindTrackerSlots(p);
}

function analyticsProjectUpdates(projectId){return state.progress.filter(u=>Number(u.project_id)===Number(projectId)).sort((a,b)=>String(a.update_date||'').localeCompare(String(b.update_date||''))||rowStamp(a)-rowStamp(b)||Number(a.id)-Number(b.id))}
function analyticsLatestForDate(projectId,date){const rows=analyticsProjectUpdates(projectId).filter(u=>u.update_date===date);return rows.at(-1)||null}
function analyticsProjectStatusText(p){const s=analyticsStatus(p);return s==='in_progress'?'IN PROGRESS':String(s).toUpperCase()}
function analyticsCsvCell(v){const x=String(v??'').replace(/"/g,'""');return `"${x}"`}
function exportAnalyticsTracking(){
  try{
    const dates=analyticsTrackingDates(state.analyticsRange),projects=analyticsFilteredProjects();
    const head=['Project No','Project / Idea','Department','Owner','Week','Start','Target','Status','Current Progress',...dates.map(d=>fmtDate(d)),'Latest Work','Latest Remarks','Latest Blocker','Next Action'];
    const rows=[head];
    projects.forEach(p=>{const m=analyticsProjectMeta(p),ups=analyticsProjectUpdates(p.id),last=ups.at(-1);rows.push([p.project_number,p.title,m.department,m.owner,m.cycle,p.start_date,p.end_date,analyticsProjectStatusText(p),`${Number(p.progress||0)}%`,...dates.map(d=>{const u=ups.filter(x=>x.update_date===d).at(-1);return u?`${u.progress_percent}%`:''}),last?.work_done||'',last?.remarks||'',last?.blocker||'',last?.next_action||''])});
    const csv='\ufeff'+rows.map(r=>r.map(analyticsCsvCell).join(',')).join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`RND_Project_Tracking_${today()}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),500);toast('Project tracking exported for Excel.');
  }catch(e){toast(e.message,true)}
}
function analyticsFilteredProjects(){
  const q=String(state.analyticsSearch||'').trim().toLowerCase(),status=String(state.analyticsStatusFilter||''),cycle=String(state.analyticsCycleFilter||'');
  return state.projects.filter(p=>{const m=analyticsProjectMeta(p),s=analyticsStatus(p);const text=`${p.project_number} ${p.title} ${m.department} ${m.owner} ${m.cycle}`.toLowerCase();return(!q||text.includes(q))&&(!status||s===status)&&(!cycle||String(p.cycle_id)===cycle)}).sort((a,b)=>String(b.start_date||'').localeCompare(String(a.start_date||''))||Number(b.id)-Number(a.id));
}
function renderAnalyticsProjectLog(projectId){
  const host=$('#analyticsProjectLog');if(!host)return;
  const p=state.projects.find(x=>Number(x.id)===Number(projectId));if(!p){host.innerHTML='<div class="empty-state">Select a project row to inspect its complete daily work log.</div>';return}
  const m=analyticsProjectMeta(p),ups=analyticsProjectUpdates(p.id).slice().reverse();
  host.innerHTML=`<div class="track-log-head"><div><span class="kicker">PROJECT DAILY LOG</span><h3>${esc(p.project_number)} · ${esc(p.title)}</h3><p>${esc(m.department)} · ${esc(m.owner)} · ${esc(m.cycle)}</p></div><div class="track-log-current"><span>CURRENT</span><strong>${Number(p.progress||0)}%</strong></div></div><div class="track-log-table-wrap"><table class="track-log-table"><thead><tr><th>Date</th><th>Updated By</th><th>Progress</th><th>Work Done</th><th>Remarks</th><th>Blocker</th><th>Next Action</th></tr></thead><tbody>${ups.length?ups.map(u=>`<tr><td>${fmtDate(u.update_date)}</td><td>${esc(u.user_name||state.members.find(x=>Number(x.id)===Number(u.user_id))?.name||'—')}</td><td><strong>${Number(u.progress_percent||0)}%</strong></td><td>${esc(u.work_done||'—')}</td><td>${esc(u.remarks||'—')}</td><td class="${u.blocker?'track-cell-blocker':''}">${esc(u.blocker||'—')}</td><td>${esc(u.next_action||'—')}</td></tr>`).join(''):'<tr><td colspan="7" class="empty-cell">No progress update has been entered for this project.</td></tr>'}</tbody></table></div>`;
}
function renderAnalyticsPanel(){
  const host=$('#analyticsOverview');if(!host)return;
  const dates=analyticsTrackingDates(state.analyticsRange),projects=analyticsFilteredProjects();
  const active=state.projects.filter(p=>analyticsStatus(p)!=='completed'),completed=state.projects.filter(p=>analyticsStatus(p)==='completed'),blocked=state.projects.filter(p=>analyticsStatus(p)==='blocked');
  const avg=state.projects.length?Math.round(state.projects.reduce((s,p)=>s+Number(p.progress||0),0)/state.projects.length):0;
  const cycleOptions=state.cycles.slice().sort((a,b)=>String(b.start_date||'').localeCompare(String(a.start_date||''))).map(c=>`<option value="${c.id}" ${String(state.analyticsCycleFilter||'')===String(c.id)?'selected':''}>${esc(c.label)}</option>`).join('');
  host.innerHTML=`
    <section class="track-kpi-strip">
      <article><span>TOTAL PROJECTS</span><strong>${state.projects.length}</strong><small>${active.length} active</small></article>
      <article><span>AVERAGE PROGRESS</span><strong>${avg}%</strong><small>Across all projects</small></article>
      <article><span>COMPLETED</span><strong>${completed.length}</strong><small>${state.projects.length?Math.round(completed.length/state.projects.length*100):0}% completion rate</small></article>
      <article class="${blocked.length?'warn':''}"><span>BLOCKED</span><strong>${blocked.length}</strong><small>${blocked.length?'Needs attention':'No active blockers'}</small></article>
      <article><span>DATE COLUMNS</span><strong>${dates.length}</strong><small>${state.analyticsRange==='all'?'Recorded update dates':`${state.analyticsRange} day view`}</small></article>
    </section>
    <section class="track-sheet-card">
      <div class="track-sheet-head"><div><span class="kicker">MASTER TRACK SHEET</span><h3>Project progress by date</h3><p>Each percentage is the latest progress recorded on that date. Hover a cell for work, remarks, blocker and next action.</p></div><div class="track-sheet-tools"><div class="work-search compact"><span>⌕</span><input id="analyticsProjectSearch" value="${esc(state.analyticsSearch||'')}" placeholder="Search project / owner / department" spellcheck="false" data-gramm="false"></div><select id="analyticsCycleFilter"><option value="">All weeks</option>${cycleOptions}</select><select id="analyticsStatusFilter"><option value="">All status</option><option value="active" ${state.analyticsStatusFilter==='active'?'selected':''}>Active</option><option value="blocked" ${state.analyticsStatusFilter==='blocked'?'selected':''}>Blocked</option><option value="overdue" ${state.analyticsStatusFilter==='overdue'?'selected':''}>Overdue</option><option value="completed" ${state.analyticsStatusFilter==='completed'?'selected':''}>Completed</option></select></div></div>
      <div class="track-sheet-scroll"><table class="track-sheet-table"><thead><tr><th class="sticky-col c1">Project No</th><th class="sticky-col c2">Project / Idea</th><th class="sticky-col c3">Owner</th><th>Dept</th><th>Week</th><th>Start</th><th>Target</th><th>Status</th><th>Current</th>${dates.map(d=>`<th class="date-head"><b>${new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</b><small>${new Date(d+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short'})}</small></th>`).join('')}</tr></thead><tbody>${projects.length?projects.map(p=>{const m=analyticsProjectMeta(p),ups=analyticsProjectUpdates(p.id),status=analyticsStatus(p);return `<tr data-analytics-project="${p.id}" class="track-project-row ${Number(state.analyticsProjectId)===Number(p.id)?'selected':''}"><td class="sticky-col c1"><strong>${esc(p.project_number)}</strong></td><td class="sticky-col c2"><b>${esc(p.title)}</b><small>${esc(m.idea?.problem||'')}</small></td><td class="sticky-col c3">${esc(m.owner)}</td><td>${esc(m.department)}</td><td>${esc(m.cycle)}</td><td>${fmtDate(p.start_date)}</td><td>${fmtDate(p.end_date)}</td><td><span class="sheet-status ${status}">${analyticsProjectStatusText(p)}</span></td><td><span class="sheet-current"><b>${Number(p.progress||0)}%</b><i><em style="width:${Math.max(0,Math.min(100,Number(p.progress||0)))}%"></em></i></span></td>${dates.map(d=>{const u=ups.filter(x=>x.update_date===d).at(-1);if(!u)return '<td class="progress-cell empty">—</td>';const prev=ups.filter(x=>x.update_date<d).at(-1),delta=Number(u.progress_percent||0)-Number(prev?.progress_percent||0),tip=[u.work_done,u.remarks&&`Remarks: ${u.remarks}`,u.blocker&&`Blocker: ${u.blocker}`,u.next_action&&`Next: ${u.next_action}`].filter(Boolean).join(' | ');return `<td class="progress-cell ${u.blocker?'has-blocker':''}" title="${esc(tip)}"><b>${Number(u.progress_percent||0)}%</b>${delta>0?`<small>+${delta}</small>`:''}${u.blocker?'<span>!</span>':''}</td>`}).join('')}</tr>`}).join(''):`<tr><td colspan="${9+dates.length}" class="empty-cell">No projects match the selected filters.</td></tr>`}</tbody></table></div>
      <div class="track-sheet-legend"><span><i class="recorded"></i>Progress entered</span><span><i class="blocked"></i>Blocker entered</span><span><b>—</b>No update for that date</span><em>${projects.length} project${projects.length===1?'':'s'} shown</em></div>
    </section>
    <section class="track-log-card" id="analyticsProjectLog"></section>`;
  $('#analyticsProjectSearch')?.addEventListener('input',e=>{state.analyticsSearch=e.target.value;clearTimeout(window.__analyticsSearchTimer);window.__analyticsSearchTimer=setTimeout(renderAnalyticsPanel,120)});
  $('#analyticsStatusFilter')?.addEventListener('change',e=>{state.analyticsStatusFilter=e.target.value;renderAnalyticsPanel()});
  $('#analyticsCycleFilter')?.addEventListener('change',e=>{state.analyticsCycleFilter=e.target.value;renderAnalyticsPanel()});
  $$('[data-analytics-project]').forEach(row=>row.addEventListener('click',()=>{state.analyticsProjectId=Number(row.dataset.analyticsProject);$$('[data-analytics-project]').forEach(r=>r.classList.toggle('selected',r===row));renderAnalyticsProjectLog(state.analyticsProjectId)}));
  if(!state.analyticsProjectId||!state.projects.some(p=>Number(p.id)===Number(state.analyticsProjectId)))state.analyticsProjectId=projects[0]?.id||null;
  renderAnalyticsProjectLog(state.analyticsProjectId);
  const exp=$('#exportTrackingBtn');if(exp)exp.onclick=exportAnalyticsTracking;
}
function analyticsBars(items,maxValue,labelKey='label',valueKey='value',suffix=''){
  const max=Math.max(1,Number(maxValue)||Math.max(0,...items.map(x=>Number(x[valueKey]||0))));
  return `<div class="analytics-bars">${items.map(x=>{const v=Number(x[valueKey]||0),w=Math.round(v/max*100);return `<div class="analytics-bar-row"><div class="analytics-bar-meta"><span>${esc(x[labelKey])}</span><b>${v}${suffix}</b></div><div class="analytics-bar-track"><i style="width:${w}%"></i></div></div>`}).join('')}</div>`;
}
function renderReportControls(){const out=$('#reportControls');if(state.reportType==='daily'){out.innerHTML=`<div class="report-controls-line"><label>Date<input type="date" id="reportDate" value="${today()}"></label><button class="primary-btn" id="runReport">Generate</button><button class="ghost-btn" id="printReport">Print / Save PDF</button><button class="ghost-btn" id="excelReport">Download Excel</button></div>`}else{out.innerHTML=`<div class="report-controls-line"><label>Working Week<select id="reportWeek">${state.cycles.map(c=>`<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select></label><button class="primary-btn" id="runReport">Generate</button><button class="ghost-btn" id="printReport">Print / Save PDF</button><button class="ghost-btn" id="excelReport">Download Excel</button></div>`}$('#runReport')?.addEventListener('click',generateReport);$('#printReport')?.addEventListener('click',()=>window.print());$('#excelReport')?.addEventListener('click',downloadExcel);generateReport()}
let currentReport={type:'daily',data:null};async function generateReport(){try{if(state.reportType==='daily'){const date=$('#reportDate')?.value||today(),d=dailyReportLocal(date);currentReport={type:'daily',data:d};const byMember=workingMembers().map(m=>({name:m.name,n:d.ideas.filter(i=>Number(i.submitted_by)===Number(m.id)).length}));$('#reportOutput').innerHTML=`<div class="report-header"><div><span class="kicker">R&D DAILY REPORT</span><h2>${fmtDate(d.date)}</h2></div><b>R&D TRACK</b></div><div class="report-kpis"><div class="report-kpi"><span class="kicker">IDEAS</span><strong>${d.ideas.length}</strong></div><div class="report-kpi"><span class="kicker">UPDATES</span><strong>${d.updates.length}</strong></div><div class="report-kpi"><span class="kicker">PEOPLE SUBMITTED</span><strong>${byMember.filter(x=>x.n).length}/${byMember.length}</strong></div><div class="report-kpi"><span class="kicker">BLOCKERS</span><strong>${d.updates.filter(x=>x.blocker).length}</strong></div></div><div class="analytics-report-grid"><section class="analytics-visual-card"><div class="visual-card-head"><span class="kicker">SUBMISSION DISTRIBUTION</span><b>By member</b></div>${analyticsBars(byMember,Math.max(1,...byMember.map(x=>x.n)),'name','n')}</section><section class="analytics-visual-card"><div class="visual-card-head"><span class="kicker">DAY HEALTH</span><b>${d.updates.filter(x=>x.blocker).length?'Attention needed':'On track'}</b></div><div class="health-ring" style="--score:${Math.round((byMember.filter(x=>x.n).length/Math.max(1,byMember.length))*100)}"><strong>${Math.round((byMember.filter(x=>x.n).length/Math.max(1,byMember.length))*100)}%</strong><span>submission coverage</span></div></section></div><h3>Idea Submission</h3><table class="mini-table"><thead><tr><th>Person</th><th>Ideas</th></tr></thead><tbody>${byMember.map(x=>`<tr><td>${esc(x.name)}</td><td>${x.n}</td></tr>`).join('')}</tbody></table><h3>Project Progress Updates</h3><table class="mini-table"><thead><tr><th>Project</th><th>Person</th><th>Progress</th><th>Work Done</th></tr></thead><tbody>${d.updates.length?d.updates.map(u=>`<tr><td>${esc(u.project_number)}</td><td>${esc(u.user_name)}</td><td>${u.progress_percent}%</td><td>${esc(u.work_done)}</td></tr>`).join(''):'<tr><td colspan="4">No progress updates.</td></tr>'}</tbody></table>`}else{const id=Number($('#reportWeek')?.value||state.cycles[0]?.id);if(!id){$('#reportOutput').innerHTML='<div class="empty-state">Create a week first.</div>';return}const d=weeklyReportLocal(id);currentReport={type:'weekly',data:d};const avg=d.projects.length?Math.round(d.projects.reduce((a,p)=>a+p.progress,0)/d.projects.length):0;$('#reportOutput').innerHTML=`<div class="report-header"><div><span class="kicker">R&D WEEKLY REPORT</span><h2>${esc(d.cycle.label)}</h2><div class="muted">${fmtDate(d.cycle.start_date)} – ${fmtDate(d.cycle.end_date)}</div></div><b>R&D TRACK</b></div><div class="report-kpis"><div class="report-kpi"><span class="kicker">IDEAS SUBMITTED</span><strong>${d.ideas.length}</strong></div><div class="report-kpi"><span class="kicker">SHORTLISTED</span><strong>${d.projects.length}</strong></div><div class="report-kpi"><span class="kicker">COMPLETED</span><strong>${d.projects.filter(p=>p.progress===100).length}</strong></div><div class="report-kpi"><span class="kicker">AVG PROGRESS</span><strong>${avg}%</strong></div></div><div class="analytics-report-grid"><section class="analytics-visual-card"><div class="visual-card-head"><span class="kicker">PROJECT PROGRESS</span><b>${avg}% average</b></div>${analyticsBars(d.projects.map(p=>({label:p.title,value:p.progress})),100,'label','value','%')}</section><section class="analytics-visual-card"><div class="visual-card-head"><span class="kicker">WEEK HEALTH</span><b>${d.projects.filter(p=>p.progress===100).length}/${d.projects.length||0} completed</b></div><div class="health-ring" style="--score:${avg}"><strong>${avg}%</strong><span>overall execution</span></div></section></div><h3>Weekly Projects</h3><table class="mini-table"><thead><tr><th>Project</th><th>Owner</th><th>Progress</th><th>Status</th></tr></thead><tbody>${d.projects.map(p=>`<tr><td>${esc(p.project_number)} · ${esc(p.title)}</td><td>${esc(p.owner_name||'—')}</td><td>${p.progress}%</td><td>${esc(p.status)}</td></tr>`).join('')}</tbody></table><h3>Team Contribution</h3><table class="mini-table"><thead><tr><th>Member</th><th>Ideas</th><th>Progress Updates</th></tr></thead><tbody>${d.contribution.map(x=>`<tr><td>${esc(x.name)}</td><td>${x.idea_count}</td><td>${x.update_count}</td></tr>`).join('')}</tbody></table>`}}catch(e){toast(e.message,true)}}
function downloadExcel(){if(!currentReport.data)return;const table=$('#reportOutput').innerHTML;const html=`<html><head><meta charset="utf-8"></head><body>${table}</body></html>`;const blob=new Blob([html],{type:'application/vnd.ms-excel'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`RND-${currentReport.type}-report.xls`;a.click();URL.revokeObjectURL(a.href)}
function openIdea(){delete $('#ideaForm').dataset.editId;$('#ideaDialogTitle').textContent='Submit Daily Idea';$('#ideaForm').reset();if(isVisitor()){toast('Admin visitors are view-only and do not submit ideas.',true);return}const d=$('#ideaDialog');$('#ideaMember').value=activeUser();$('#ideaDate').value=today();d.showModal()}
function openProgress(p){if(!canEditTask(p))return toast('This task is view only for your profile.',true);delete $('#progressForm').dataset.editId;$('#progressForm').reset();if(isVisitor()){toast('Admin visitors are view-only.',true);return}$('#progressDialogTitle').textContent=p.project_number+' — Daily Update';$('#progressMember').value=activeUser();$('#progressDate').value=today();$('#progressPercent').value=p.progress;$('#progressForm').dataset.projectId=p.id;$('#progressDialog').showModal()}
function applyRoleAccess(){const visitor=isVisitor();$('#newWeekBtn')?.classList.toggle('role-hidden',!isLead());if($('#ideaPriority'))$('#ideaPriority').disabled=!isLead();['#quickIdeaBtn','#newIdeaBtn'].forEach(id=>{const el=$(id);if(el)el.classList.toggle('role-hidden',visitor)});const note=$('#visitorNotice');if(note)note.classList.toggle('hidden',!visitor);document.body.classList.toggle('visitor-mode',visitor)}
async function runMutationButton(btn,work,success){
  if(btn?.dataset.busy==='1')return;
  if(btn){btn.dataset.busy='1';btn.disabled=true;btn.classList.add('is-busy')}
  try{await work();if(success)toast(success)}catch(e){console.error('Tracker mutation failed',e);toast(e?.message||'Unable to save this change.',true);scheduleRender()}finally{if(btn?.isConnected){btn.dataset.busy='0';btn.disabled=false;btn.classList.remove('is-busy')}}
}
function bindRecordActions(){
  $$('[data-edit-idea]').forEach(b=>b.onclick=()=>openIdeaEdit(Number(b.dataset.editIdea)));
  $$('[data-delete-idea]').forEach(b=>b.onclick=()=>{const i=state.ideas.find(x=>x.id===Number(b.dataset.deleteIdea));if(!i)return;const linked=state.projects.some(p=>p.idea_id===i.id);if(!confirm(`Delete ${i.idea_number}?${linked?' Linked project and progress history will also be removed.':''}`))return;runMutationButton(b,()=>deleteIdeaLocal(i.id),'Idea deleted.')});
  $$('[data-edit-cycle]').forEach(b=>b.onclick=()=>openCycleEdit(Number(b.dataset.editCycle)));
  $$('[data-edit-assigned-project]').forEach(b=>b.onclick=()=>openProjectEdit(Number(b.dataset.editAssignedProject)));
  $$('[data-delete-cycle]').forEach(b=>b.onclick=()=>{const c=state.cycles.find(x=>x.id===Number(b.dataset.deleteCycle));if(!c)return;if(!confirm(`Delete ${c.label}? Weekly projects and their progress will be removed; linked ideas return to Submitted.`))return;runMutationButton(b,()=>deleteCycleLocal(c.id),'Week deleted.')});
  $$('[data-edit-progress]').forEach(b=>b.onclick=()=>openProgressEdit(Number(b.dataset.editProgress)));
  $$('[data-delete-progress]').forEach(b=>b.onclick=()=>{if(!confirm('Delete this progress entry? Project progress will be recalculated.'))return;runMutationButton(b,()=>deleteProgressLocal(Number(b.dataset.deleteProgress)),'Progress entry deleted.')});
  const ep=$('#editProjectBtn');if(ep)ep.onclick=()=>openProjectEdit(state.selectedProject);
  const dp=$('#deleteProjectBtn');if(dp)dp.onclick=()=>{const p=state.projects.find(x=>x.id===state.selectedProject);if(!p)return;if(!confirm(`Delete ${p.project_number}? Its progress history will be removed and the linked idea will return to Submitted.`))return;runMutationButton(dp,async()=>{await deleteProjectLocal(p.id);state.selectedProject=null},'Project deleted.')};
}
function openIdeaEdit(id){const i=state.ideas.find(x=>x.id===id);if(!i)return;$('#ideaForm').dataset.editId=id;$('#ideaDialogTitle').textContent='Edit Daily Idea';$('#ideaMember').value=i.submitted_by;$('#ideaDepartment').value=i.department_id;$('#ideaProblem').value=i.problem;$('#ideaProposal').value=i.proposed_idea;$('#ideaBenefit').value=i.expected_benefit||'';$('#ideaPriority').value=i.priority;$('#ideaDate').value=i.submission_date;$('#ideaDialog').showModal()}
const WEEK_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const weekPickerState={year:new Date().getFullYear(),month:new Date().getMonth()};
function isoLocalDate(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function monthWeekDates(year,month,week){
  const w=Math.min(4,Math.max(1,Number(week)||1));
  const startDay=(w-1)*7+1;
  const lastDay=new Date(year,month+1,0).getDate();
  const endDay=w===4?lastDay:Math.min(startDay+6,lastDay);
  return {start:isoLocalDate(year,month,startDay),end:isoLocalDate(year,month,endDay)};
}
function inferredWeekForDay(day){return day<=7?1:day<=14?2:day<=21?3:4}
function renderWeekMonthPicker(){
  const grid=$('#weekMonthGrid');if(!grid)return;
  $('#weekYearLabel').textContent=String(weekPickerState.year);
  grid.innerHTML=WEEK_MONTHS.map((name,index)=>`<button type="button" class="month-option ${index===weekPickerState.month?'active':''}" data-week-month="${index}" aria-pressed="${index===weekPickerState.month}">${name.slice(0,3).toUpperCase()}</button>`).join('');
  grid.querySelectorAll('[data-week-month]').forEach(btn=>btn.onclick=()=>{weekPickerState.month=Number(btn.dataset.weekMonth);renderWeekMonthPicker();updateWeekPeriodFields()});
  $('#weekMonthDisplay').value=`${WEEK_MONTHS[weekPickerState.month]} ${weekPickerState.year}`;
}
function updateWeekPeriodFields(){
  const week=Number($('#weekNumber')?.value||1);
  const dates=monthWeekDates(weekPickerState.year,weekPickerState.month,week);
  $('#weekMonthDisplay').value=`${WEEK_MONTHS[weekPickerState.month]} ${weekPickerState.year}`;
  $('#weekStart').value=dates.start;$('#weekEnd').value=dates.end;
}
function setupWeekPeriodPicker(date=new Date()){
  weekPickerState.year=date.getFullYear();weekPickerState.month=date.getMonth();
  const week=inferredWeekForDay(date.getDate());
  $('#weekNumber').value=String(week);renderWeekMonthPicker();updateWeekPeriodFields();
}
function setupWeekPickerFromCycle(c){
  const source=c?.start_date?new Date(`${c.start_date}T00:00:00`):new Date();
  weekPickerState.year=source.getFullYear();weekPickerState.month=source.getMonth();
  $('#weekNumber').value=String(inferredWeekForDay(source.getDate()));renderWeekMonthPicker();updateWeekPeriodFields();
}
function openCycleEdit(id){const c=state.cycles.find(x=>x.id===id);if(!c)return;$('#weekForm').dataset.editId=id;$('#weekDialogTitle').textContent='Edit Working Week';setupWeekPickerFromCycle(c);$('#weekDialog').showModal()}
function openProgressEdit(id){const u=state.progress.find(x=>x.id===id);if(!u)return;if(!canEditTask(state.projects.find(p=>Number(p.id)===Number(u.project_id))))return toast('This task is view only for your profile.',true);const p=state.projects.find(x=>x.id===u.project_id);$('#progressForm').dataset.editId=id;$('#progressForm').dataset.projectId=u.project_id;$('#progressDialogTitle').textContent=(p?.project_number||'Project')+' — Edit Update';$('#progressMember').value=u.user_id;$('#progressDate').value=u.update_date;$('#progressPercent').value=u.progress_percent;$('#progressWork').value=u.work_done;$('#progressRemarks').value=u.remarks||'';$('#progressBlocker').value=u.blocker||'';$('#progressNext').value=u.next_action||'';$('#progressDialog').showModal()}
function openProjectEdit(id){if(!isLead())return toast('Only the R&D Lead can manage assignments.',true);const p=state.projects.find(x=>x.id===Number(id));if(!p)return;$('#projectEditId').value=p.id;$('#projectEditTitle').value=p.title;$('#projectEditOwner').innerHTML=workingMembers().map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');$('#projectEditOwner').value=p.owner_id;$('#projectEditPriority').value=taskPriority(p);$('#projectEditStart').value=p.start_date;$('#projectEditEnd').value=p.end_date;$('#projectEditDialog').showModal()}
function showPage(name){if(name==='reports')name='settings';const target=$(`#${name}Page`);if(!target)name='dashboard';state.page=name;$$('.page').forEach(p=>p.classList.remove('active'));$(`#${name}Page`).classList.add('active');$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===name));const titles={dashboard:'Dashboard',ideas:'Daily Ideas',weekly:'Weekly Tasks',progress:'Work Tracking',timeconsume:'Time Sheet',chat:'Team Chat',kpi:'KPI Report',settings:'Settings'};$('#pageTitle').textContent=titles[name]||'Dashboard';setTeamChatOpen(name==='chat');if(name==='sheet')startMasterSheet();if(name!=='progress')selectedManualTrackerRow=null;$('#sidebar').classList.remove('open');if(name==='ideas'){const dateFilter=$('#ideaDateFilter');if(dateFilter)dateFilter.value=today();syncIdeaDateDisplay()}if(name==='weekly'||name==='progress'){syncPeriodFromDailyReference();state.selectedProject=null}renderPage(name)}
function bind(){
  $('#backToDepartmentsBtn').onclick=()=>showDepartmentGate();
  window.addEventListener('popstate',restoreDepartmentRoute);
  window.addEventListener('online',()=>scheduleCloudReconnect(true));
  window.addEventListener('offline',()=>setCloudRuntimeStatus('offline','No internet connection · changes are saved locally.'));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&cloudRuntimeStatus!=='live')scheduleCloudReconnect(true)});
  $('#loginForm').onsubmit=async e=>{e.preventDefault();const name=$('#loginName').value.trim();$('#loginMessage').textContent='';$('#loginSuggestion').innerHTML='';try{const result=findLogin(name);if(result.matched){persistLogin(result.member);requestNotificationsFromGesture();$('#loginName').value='';showApp();toast(`Welcome, ${result.member.name}.`);return}$('#loginMessage').textContent=result.error||'Name not found.';if(result.suggestion){$('#loginSuggestion').innerHTML=`<div class="suggestion-box"><span>Did you mean <b>${esc(result.suggestion.name)}</b>?</span><button type="button" class="secondary-btn" id="useSuggestionBtn">Yes, use this name</button></div>`;$('#useSuggestionBtn').onclick=()=>{persistLogin(result.suggestion);requestNotificationsFromGesture();$('#loginName').value='';showApp();toast(`Welcome, ${result.suggestion.name}.`)}}}catch(err){$('#loginMessage').textContent=err.message}};
  $('#teamChatForm')?.addEventListener('submit',async e=>{e.preventDefault();const m=currentMember(),input=$('#teamChatInput'),send=$('#teamChatSend');const text=String(input?.value||'').trim();if(!m||!text)return;const oldLabel=send?.textContent||'Send';input.value='';input.focus();try{if(send){send.dataset.sending='1';send.disabled=true;send.textContent='Sending…'}setTeamChatStatus('Sending…',true);const saved=await window.rndCloud.sendChatMessage({member_id:m.id,text,reply:window.rndChatReply||null});if(saved){window.rndChatReply=null;window.renderChatReply?.()}if(saved&&!teamChatMessages.some(x=>String(x.id)===String(saved.id))){teamChatMessages=[...teamChatMessages,saved].slice(-100);renderTeamChat()}setTeamChatStatus('Live · shared with everyone',true)}catch(err){input.value=text;input.focus();setTeamChatStatus('Chat connection problem · tap Send to retry',false);toast(err?.message||'Unable to send chat message.',true)}finally{if(send){delete send.dataset.sending;send.disabled=false;send.textContent=oldLabel}}});
  $('#teamChatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#teamChatForm')?.requestSubmit()}});
  $('#excelFormulaBar')?.addEventListener('input',e=>{const {row,col}=excelActiveCell,cell=excelCellElement(row,col);if(!cell)return;cell.textContent=e.target.value;excelCommitCell(row,col,e.target.value)});
  $('#excelFormulaBar')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();excelSelectCell(excelActiveCell.row+1,excelActiveCell.col,true)}});
  $('#excelClearCellBtn')?.addEventListener('click',excelClearCell);
  $('#excelClearRowBtn')?.addEventListener('click',excelClearRow);
  $('#excelExportCsvBtn')?.addEventListener('click',exportExcelCsv);
  $('#excelAddSheetBtn')?.addEventListener('click',addExcelSheet);
  $('#excelFillColor')?.addEventListener('input',e=>applyExcelCellColor('b',e.target.value));
  $('#excelClearFillBtn')?.addEventListener('click',()=>applyExcelCellColor('b',''));
  $('#excelTextColor')?.addEventListener('input',e=>applyExcelCellColor('t',e.target.value));
  $('#excelTabColor')?.addEventListener('input',e=>saveExcelLayoutPatch({color:e.target.value}));
  $('#excelTabWidth')?.addEventListener('input',e=>{const s=excelActiveSheet();if(!s)return;s.tab_width=Number(e.target.value)||120;renderExcelSheetTabs()});
  $('#excelTabWidth')?.addEventListener('change',e=>saveExcelLayoutPatch({tab_width:Number(e.target.value)||120}));
  $('#exportDbBtn').onclick=()=>{exportDatabase();toast('Database backup downloaded.');};
  $('#importDbInput').onchange=async e=>{try{await importDatabaseFile(e.target.files?.[0]);toast('Database restored successfully.');e.target.value='';await load()}catch(err){toast(err.message,true)}};
  $('#requestStorageBtn').onclick=async()=>{const ok=await requestDurableStorage();toast(ok?'Persistent browser storage enabled.':'Browser kept standard storage mode.',!ok);renderSettings()};;
  $('#enableNotificationsBtn')?.addEventListener('click',async()=>{const ok=await enableNotifications();toast(ok?'Chrome notifications enabled.':'Notification permission was not granted.',!ok);if(ok){renderSettings();renderPendingTaskPopup()}});
  $('#pendingNotificationBtn')?.addEventListener('click',async()=>{const ok=await enableNotifications();toast(ok?'Chrome notifications enabled.':'Notification permission was not granted.',!ok);if(ok)renderPendingTaskPopup()});
  $('#notificationBellBtn')?.addEventListener('click',()=>{const panel=$('#notificationPanel'),btn=$('#notificationBellBtn');renderNotificationCenter();const open=panel.classList.contains('hidden');panel.classList.toggle('hidden',!open);btn.setAttribute('aria-expanded',open?'true':'false');$('#profileQuickPanel')?.classList.add('hidden');$('#profileQuickBtn')?.setAttribute('aria-expanded','false')});
  $('#closeNotificationPanel')?.addEventListener('click',()=>{$('#notificationPanel')?.classList.add('hidden');$('#notificationBellBtn')?.setAttribute('aria-expanded','false')});
  $('#profileQuickBtn')?.addEventListener('click',()=>{updateCompactProfile();const panel=$('#profileQuickPanel'),btn=$('#profileQuickBtn');const open=panel.classList.contains('hidden');panel.classList.toggle('hidden',!open);btn.setAttribute('aria-expanded',open?'true':'false');$('#notificationPanel')?.classList.add('hidden');$('#notificationBellBtn')?.setAttribute('aria-expanded','false')});
  $('#profileSettingsBtn')?.addEventListener('click',()=>{$('#profileQuickPanel')?.classList.add('hidden');$('#profileQuickBtn')?.setAttribute('aria-expanded','false');showPage('settings')});
  document.addEventListener('click',e=>{const weekPicker=$('#weekDeletePicker');if(weekPicker&&!weekPicker.contains(e.target))weekPicker.open=false;const notif=e.target.closest?.('.notification-center-wrap'),profile=e.target.closest?.('.profile-quick-wrap');if(!notif){$('#notificationPanel')?.classList.add('hidden');$('#notificationBellBtn')?.setAttribute('aria-expanded','false')}if(!profile){$('#profileQuickPanel')?.classList.add('hidden');$('#profileQuickBtn')?.setAttribute('aria-expanded','false')}});
  $('#logoutBtn').onclick=()=>{stopTeamChat();stopMasterSheet();clearLogin();$('#loginMessage').textContent='';$('#loginSuggestion').innerHTML='';showLogin()};
  $$('.nav-btn').forEach(b=>b.onclick=()=>showPage(b.dataset.page));$$('[data-go]').forEach(b=>b.onclick=()=>showPage(b.dataset.go));
  const toggleSidebar=()=>{const sidebar=$('#sidebar'),shell=$('#appShell'),mobile=window.matchMedia('(max-width:980px)').matches;if(mobile){sidebar.classList.toggle('open');$('#menuBtn')?.setAttribute('aria-expanded',sidebar.classList.contains('open')?'true':'false');return}const closed=shell.classList.toggle('sidebar-collapsed');localStorage.setItem(SIDEBAR_CLOSED_KEY,closed?'1':'0');$('#menuBtn')?.setAttribute('aria-expanded',closed?'false':'true')};
  $('#menuBtn').onclick=toggleSidebar;$('#sidebarCloseBtn')?.addEventListener('click',toggleSidebar);$('#sidebarReopenBtn')?.addEventListener('click',toggleSidebar);
  if(!window.matchMedia('(max-width:980px)').matches&&localStorage.getItem(SIDEBAR_CLOSED_KEY)==='1'){$('#appShell').classList.add('sidebar-collapsed');$('#menuBtn')?.setAttribute('aria-expanded','false')}
  window.addEventListener('keydown',e=>{if((e.key!=='Backspace'&&e.key!=='Delete')||!selectedManualTrackerRow||state.page!=='progress'||isVisitor())return;const p=state.projects.find(x=>Number(x.id)===Number(selectedManualTrackerRow.projectId));const row=p?.tracker_rows?.find(r=>Number(r.row_index)===Number(selectedManualTrackerRow.rowIndex));if(!p||!row?.manual_extra)return;const target=e.target,editing=target&&/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);if(editing&&String(target.value||'').length>0)return;e.preventDefault();deleteManualTrackerRow(p,selectedManualTrackerRow.rowIndex);toast('Added tracker row deleted.')});$('#quickIdeaBtn')?.addEventListener('click',()=>{requestNotificationsFromGesture();openIdea()});$('#newIdeaBtn').onclick=()=>{requestNotificationsFromGesture();openIdea()};$('#newWeekBtn').onclick=()=>{if(!isLead())return toast('Only the R&D Lead can create working weeks.',true);delete $('#weekForm').dataset.editId;$('#weekForm').reset();$('#weekDialogTitle').textContent='Create Working Week';setupWeekPeriodPicker(new Date());$('#weekDialog').showModal()};$('#weekNumber').addEventListener('change',updateWeekPeriodFields);$('#weekPrevYear').onclick=()=>{weekPickerState.year--;renderWeekMonthPicker();updateWeekPeriodFields()};$('#weekNextYear').onclick=()=>{weekPickerState.year++;renderWeekMonthPicker();updateWeekPeriodFields()};$$('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());['#ideaSearch','#ideaPersonFilter','#ideaDeptFilter'].forEach(s=>$(s).addEventListener('input',renderIdeas));$('#ideaDateFilter').addEventListener('input',()=>{syncIdeaDateDisplay();syncWorkMonthFromDate($('#ideaDateFilter').value);renderIdeas()});['#workSearch','#workStatusFilter'].forEach(s=>$(s)?.addEventListener('input',renderProjects));$('#workMonthSelect')?.addEventListener('change',()=>{const value=$('#workMonthSelect').value;if(/^\d{4}-\d{2}$/.test(value))state.workMonthKey=value;state.selectedProject=null;renderProjects()});$('#workWeekSelect')?.addEventListener('change',()=>{state.workWeek=Number($('#workWeekSelect').value)||1;state.selectedProject=null;renderProjects()});$('#clearWorkFilters')?.addEventListener('click',()=>{if($('#workSearch'))$('#workSearch').value='';if($('#workStatusFilter'))$('#workStatusFilter').value='';renderProjects()});$('#clearIdeaFilters').onclick=()=>{$('#ideaSearch').value='';$('#ideaPersonFilter').value='';$('#ideaDeptFilter').value='';$('#ideaDateFilter').value='';syncIdeaDateDisplay();renderIdeas()};$('#weekSelect').onchange=()=>{const c=state.cycles.find(x=>Number(x.id)===Number($('#weekSelect').value));if(c)syncWorkPeriodFromCycle(c);renderWeekly()};$$('.report-tab').forEach(b=>b.onclick=()=>{$$('.report-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.reportType=b.dataset.report;renderReportControls()});$$('[data-analytics-range]').forEach(b=>b.onclick=()=>{$$('[data-analytics-range]').forEach(x=>x.classList.toggle('active',x===b));state.analyticsRange=b.dataset.analyticsRange;renderAnalyticsPanel()});$('#ideaForm').onsubmit=async e=>{e.preventDefault();const submitBtn=e.submitter||e.target.querySelector('button[type="submit"],button:not([type])');if(submitBtn){submitBtn.disabled=true;submitBtn.textContent='SUBMITTING…'}try{const attachment=await fileData($('#ideaAttachment'));const payload={submitted_by:Number($('#ideaMember').value),department_id:Number($('#ideaDepartment').value),problem:$('#ideaProblem').value,proposed_idea:$('#ideaProposal').value,expected_benefit:$('#ideaBenefit').value,priority:$('#ideaPriority').value,submission_date:$('#ideaDate').value,attachment};const editId=Number(e.target.dataset.editId)||0;const row=editId?await updateIdeaLocal(editId,payload):await createIdeaLocal(payload);delete e.target.dataset.editId;$('#ideaDialog').close();e.target.reset();disableWritingAssist(e.target);scheduleRender();toast(editId?`${row.idea_number} updated.`:(row.cloud_saved?`${row.idea_number} saved to Firebase and dashboard updated.`:`${row.idea_number} saved locally · Firebase sync pending.`),!editId&&!row.cloud_saved)}catch(err){toast(err.message,true)}finally{if(submitBtn){submitBtn.disabled=false;submitBtn.textContent='Submit Idea'}}};$('#weekForm').onsubmit=async e=>{e.preventDefault();try{const week=Number($('#weekNumber').value);const payload={label:`${WEEK_MONTHS[weekPickerState.month]} - Week ${week}`,start_date:$('#weekStart').value,end_date:$('#weekEnd').value};state.workMonthKey=monthKeyFromDate(payload.start_date);state.workWeek=week;const editId=Number(e.target.dataset.editId)||0;if(editId)await updateCycleLocal(editId,payload);else await createCycleLocal(payload);delete e.target.dataset.editId;$('#weekDialog').close();e.target.reset();toast(editId?'Working week updated.':'Working week created.');scheduleRender()}catch(err){toast(err.message,true)}};$('#projectEditForm').onsubmit=async e=>{e.preventDefault();try{await updateProjectLocal(Number($('#projectEditId').value),{title:$('#projectEditTitle').value,owner_id:Number($('#projectEditOwner').value),priority:$('#projectEditPriority').value,start_date:$('#projectEditStart').value,end_date:$('#projectEditEnd').value});$('#projectEditDialog').close();toast('Project updated.')}catch(err){toast(err.message,true)}};$('#progressForm').onsubmit=async e=>{e.preventDefault();try{const attachment=await fileData($('#progressAttachment'));const payload={user_id:Number($('#progressMember').value),update_date:$('#progressDate').value,progress_percent:Number($('#progressPercent').value),work_done:$('#progressWork').value,remarks:$('#progressRemarks').value,blocker:$('#progressBlocker').value,next_action:$('#progressNext').value,attachment};const editId=Number(e.target.dataset.editId)||0;if(editId)await updateProgressLocal(editId,payload);else await addProgressLocal(Number(e.target.dataset.projectId),payload);delete e.target.dataset.editId;$('#progressDialog').close();e.target.reset();toast(editId?'Progress update edited.':'Progress update saved.');scheduleRender()}catch(err){toast(err.message,true)}}}
registerNotificationWorker();disableWritingAssist();new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)disableWritingAssist(n)}))).observe(document.documentElement,{childList:true,subtree:true});bind();load().catch(e=>{console.error('App startup failed',e);showDepartmentGate();$('#departmentGateMessage').textContent=e?.message||'Unable to connect. Cached departments are shown.'});


(function(){
  const reopen=document.getElementById('sidebarReopenBtn');
  const shell=document.getElementById('appShell');
  if(!reopen||!shell)return;
  const sync=()=>{reopen.classList.toggle('show',shell.classList.contains('sidebar-collapsed'));};
  reopen.addEventListener('click',()=>{
    shell.classList.remove('sidebar-collapsed');
    try{localStorage.setItem('rnd_sidebar_closed','0')}catch(e){}
    const menu=document.getElementById('menuBtn');if(menu)menu.setAttribute('aria-expanded','true');
    sync();
  });
  new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});
  sync();
})();

// Refresh date locks at midnight or after returning to the tab; mutation guards also recheck the date.
(()=>{let last=today();const refresh=()=>{const next=today();if(next!==last){last=next;if(state.page==='progress'&&state.selectedProject)renderProjectDetail()}};window.setInterval?.(refresh,30000);document.addEventListener('visibilitychange',refresh)})();
