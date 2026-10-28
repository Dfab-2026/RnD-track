const fs=require('fs'),vm=require('vm'),assert=require('assert');
let clock=Date.parse('2026-10-28T12:00:00Z');class ClockDate extends Date{constructor(...args){super(...(args.length?args:[clock]))}static now(){return clock}}
const storage=new Map(),nodes=new Map();
const node=()=>({innerHTML:'',value:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains(){return true}},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},addEventListener(){}});
const ctx=vm.createContext({console,Date:ClockDate,Set,Map,Number,String,Math,JSON,crypto:require('crypto').webcrypto,window:{setTestDay:day=>{clock=Date.parse(day+'T12:00:00Z')}},navigator:{onLine:true},document:{body:node(),querySelector:s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll:()=>[]},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>{}});
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8').split('registerNotificationWorker();disableWritingAssist();')[0],ctx);
(async()=>{await vm.runInContext(`(async()=>{
 const check=(v,m)=>{if(!v)throw Error(m)},denied=async run=>{let failed=false;try{await run()}catch{failed=true}check(failed,'Unauthorized action accepted')};
 Object.assign(state,enrich(seedSnapshot()));persistState=async()=>{};setCloudRuntimeStatus=()=>{};renderProjectDetail=()=>{};
 state.cycles=[{id:10,label:'Week 4',start_date:'2026-10-22',end_date:'2026-10-31',status:'active'}];
 state.ideas=Array.from({length:12},(_,i)=>({id:100+i,submitted_by:1,department_id:1,status:'submitted',priority:'High',proposed_idea:'Task '+i,problem:'Problem',submission_date:today()}));
 for(let owner=1;owner<=4;owner++){
  persistLogin(state.members.find(m=>Number(m.id)===owner));
  await assignWeekLocal(10,[100+(owner-1)*2,101+(owner-1)*2],[owner,owner],['Critical','Low']);
  check(state.projects.filter(p=>Number(p.owner_id)===owner).length===2,'Every member assigns two own tasks');
  if(!isLead())check(state.ideas.find(i=>i.id===100+(owner-1)*2).priority==='High','Member cannot set priority');
 }
 check(state.projects.length===8,'All four members assigned');check(new Set(state.projects.map(p=>p.project_number)).size===8,'Unique project labels');
 persistLogin(state.members[1]);await denied(()=>assignWeekLocal(10,[108],[3]));await denied(()=>assignWeekLocal(10,[108],[2]));await denied(()=>updateProjectLocal(state.projects[0].id,{priority:'Low'}));
 const mine=state.projects.find(p=>Number(p.owner_id)===2),other=state.projects.find(p=>Number(p.owner_id)===3);
 window.setTestDay('2026-10-28');
 mine.tracker_rows=[{row_index:0,date:'22-Oct-2026',stage:'Saved target',time_slots:{0:{task:'Saved duration'}}},{row_index:6,date:'28-Oct-2026',stage:'Today'}];
 check(!canEditTrackerRow(mine,{row_index:0}),'Past base date locked');check(canEditTrackerRow(mine,{row_index:6}),'Today editable');check(!canEditTrackerRow(other,{row_index:6}),'Other task remains read-only');
 check(!canEditTrackerRow(mine,{row_index:6,manual_extra:true,date:'27-Oct-2026'}),'Past manual date locked');
 const before=JSON.stringify(mine.tracker_rows);deleteManualTrackerRow(mine,0);insertManualTrackerRow(mine,1);check(before===JSON.stringify(mine.tracker_rows),'Locked delete and insertion blocked');
 const menu=trackerSlotMenu(mine,trackerSheetRows(mine)[0]);check(menu.includes('data-slot-edit="0:0" disabled'),'Past timing edit disabled');check(menu.includes('data-slot-view="0:0" '),'Saved timing remains viewable');
 window.setTestDay('2026-10-29');check(!canEditTrackerRow(mine,{row_index:6}),'Date locks immediately after midnight');
 persistLogin(state.members[0]);check(canEditTrackerRow(mine,{row_index:0}),'Lead can edit another owner past row');check(!canEditTrackerRow(mine,{row_index:7}),'Other owner current row stays view-only');deleteManualTrackerRow(mine,0);check(!trackerSheetRows(mine)[0].stage,'Lead clears locked row');
 persistLogin(state.members[4]);check(!canEditTrackerRow(mine,{row_index:0}),'Visitor read-only');await denied(()=>assignWeekLocal(10,[108],[5]));
 })()`,ctx);console.log('PASS: all four self-assign, two-per-member limit, no assigning to others, lead-only priority, unique task labels, past date/timing/manual row locks, midnight check, lead past-row override, visitor protection');})().catch(e=>{console.error(e);process.exitCode=1});
