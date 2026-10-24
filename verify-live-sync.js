// Offline regression checks. Does not contact Firebase or modify production data.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname,storage=new Map(),nodes=new Map(),timers=[];
const node=()=>({innerHTML:'',textContent:'',value:'',dataset:{},style:{setProperty(){}},querySelector(){return null},className:'',classList:{toggle(){},add(){},remove(){},contains(){return true}},querySelectorAll(){return[]},setAttribute(){},addEventListener(){}});
const context=vm.createContext({console,Date,Set,Map,Number,String,Math,JSON,crypto:require('crypto').webcrypto,navigator:{onLine:true},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{body:node(),querySelector:s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll:()=>[],getElementById:()=>null},window:{},setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length},clearTimeout(){},requestAnimationFrame:()=>{}});
vm.runInContext(fs.readFileSync(root+'/app.js','utf8').split('registerNotificationWorker();disableWritingAssist();')[0],context);
(async()=>{
 await vm.runInContext(`(async()=>{
 const check=(x,m)=>{if(!x)throw Error(m)};
 Object.assign(state,enrich(seedSnapshot()));persistLogin(state.members[0]);
 const month=today().slice(0,7),week=inferredWeekForDay(new Date().getDate());
 state.cycles=[{id:101,label:'Week '+week,start_date:month+'-'+String((week-1)*7+1).padStart(2,'0'),end_date:month+'-28'}];
 state.projects=[{id:201,cycle_id:101,owner_id:1,owner_name:'Kabil',title:'Task A',progress:100,status:'completed'},{id:202,cycle_id:101,owner_id:2,owner_name:'Abinaya',title:'Task B',progress:60,status:'in_progress'}];
 for(const member of state.members.slice(0,2)){persistLogin(member);check(!dashboardMonthCompletion().weeks[week-1],'One completed task must not turn week green');check(dashboardCurrentWeekInfo().mine.length===1,'Profile assignment count');renderDashboard();check($('#weeklyFocus').innerHTML.includes('Task A')&&$('#weeklyFocus').innerHTML.includes('Task B'),'Both weekly tasks shown')}
 state.projects[1].status='completed';state.projects[1].progress=100;
 for(const member of state.members.slice(0,2)){persistLogin(member);check(dashboardMonthCompletion().weeks[week-1],'Both completed turns week green for everyone')}
 const originalPersist=persistState;persistState=async()=>{};
 state.projects.forEach(p=>{persistLogin(state.members.find(m=>Number(m.id)===Number(p.owner_id)));p.tracker_rows=Array.from({length:6},(_,row_index)=>({row_index,status:'completed'}));scheduleTrackerSave(p)});
 check(trackerSaveTimers.size===2,'Each project has an independent debounce timer');
 check(pendingCloudOps().filter(op=>op.collection==='projects').length===2,'Both sheets queued immediately');
 check(state.cycles[0].status==='completed','Two completed sheets complete cycle');
 state.projects[1].tracker_rows[0].status='in_progress';scheduleTrackerSave(state.projects[1]);
 check(state.cycles[0].status==='active','Reopened sheet reopens cycle');
 clearPendingCloudOps();persistState=originalPersist;
 state.projects.pop();check(!dashboardMonthCompletion().weeks[week-1],'Single remaining task is not a complete week');
 // Version-aware acknowledgement must retain an edit made while an older save is in flight.
 queueCloudOps([{collection:'projects',row:{id:8,progress:10}}]);const sent=pendingCloudOps();queueCloudOps([{collection:'projects',row:{id:8,progress:60}}]);removePendingCloudOps(sent);check(pendingCloudOps()[0].row.progress===60,'New edit retained after old acknowledgement');clearPendingCloudOps();
 const statuses=[];setCloudRuntimeStatus=(status)=>statuses.push(status);
 let release,calls=[],concurrent=0,maxConcurrent=0;
 window.rndCloud={enabled:true,writeMany:async ops=>{concurrent++;maxConcurrent=Math.max(maxConcurrent,concurrent);calls.push(JSON.parse(JSON.stringify(ops)));if(calls.length===1)await new Promise(r=>release=r);concurrent--},deleteMany:async()=>{}};
 queueCloudOps([{collection:'projects',row:{id:8,progress:10}}]);const flushing=flushPendingCloudOps();queueCloudOps([{collection:'projects',row:{id:8,progress:100}}]);check(flushPendingCloudOps()===flushing,'One shared flush');release();check(await flushing,'Flush success');check(calls.length===2&&calls[1][0].row.progress===100&&maxConcurrent===1,'New edit drains in order');check(!pendingCloudOps().length,'Acknowledged queue cleared');await flushPendingCloudOps();await Promise.resolve();check(cloudFlushPromise===null,'Empty flush releases lock');
 window.rndCloud.writeMany=async()=>{throw Error('Network unavailable')};queueCloudOps([{collection:'projects',row:{id:9,progress:20}}]);check(!await flushPendingCloudOps(),'Failure returned');check(pendingCloudOps().length===1,'Failed write retained');window.rndCloud.writeMany=async()=>{};check(await flushPendingCloudOps(),'Retry succeeds');check(!pendingCloudOps().length,'Queue drained after recovery');
 // Deliberately slow the first local disk write: a later snapshot must still win.
 let stored=seedSnapshot();readSnapshot=async()=>JSON.parse(JSON.stringify(stored));writeSnapshot=async snap=>{await Promise.resolve();stored=JSON.parse(JSON.stringify(snap))};
 const base=seedSnapshot();base.cycles=state.cycles;const first={...base,projects:[{id:99,cycle_id:101,owner_id:1}]},second={...base,projects:[{id:99,cycle_id:101,owner_id:2}]};state.page='dashboard';await Promise.all([applyRemoteSnapshot(first),applyRemoteSnapshot(second)]);check(state.projects[0].owner_id===2&&stored.projects[0].owner_id===2,'Latest remote owner wins');check(state.page==='dashboard','Current page retained');
 })()`,context);
 console.log('PASS: immediate per-project tracker queue, independent save timers, cycle completion/reopen');
 console.log('PASS: two-task week completion, both focus tasks, per-profile assignments, rapid edits, single save queue, offline retention/retry, ordered live snapshots');
 // Reconnect scheduling stays bounded and avoids duplicate timers.
 const before=timers.length;
 vm.runInContext("window.rndCloud.configured=()=>true;cloudRetryTimer=null;cloudRetryAttempt=0;scheduleCloudReconnect();scheduleCloudReconnect();",context);
 assert.equal(timers.length,before+1);assert.equal(timers[before].ms,3000);console.log('PASS: automatic reconnect scheduled once with backoff');
})().catch(e=>{console.error(e);process.exitCode=1});
