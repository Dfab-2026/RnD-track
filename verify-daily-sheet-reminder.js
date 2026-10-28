const fs=require('fs'),vm=require('vm'),assert=require('assert');
let clock=Date.parse('2026-10-28T12:00:00Z');class ClockDate extends Date{constructor(...args){super(...(args.length?args:[clock]))}static now(){return clock}}
const storage=new Map(),nodes=new Map();
const node=()=>({innerHTML:'',value:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains(){return true}},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},addEventListener(){}});
const ctx=vm.createContext({console,Date:ClockDate,Set,Map,Number,String,Math,JSON,crypto:require('crypto').webcrypto,window:{setTestDay:day=>{clock=Date.parse(day+'T12:00:00Z')}},navigator:{onLine:true},document:{body:node(),querySelector:s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll:()=>[]},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>{}});
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8').split('registerNotificationWorker();disableWritingAssist();')[0],ctx);

ctx.document.addEventListener=()=>{};
let popup=null,opens=0;const query=ctx.document.querySelector;
ctx.document.querySelector=selector=>selector==='dialog[open]'?(popup?.open?popup:null):query(selector);
ctx.document.createElement=()=>{popup={...node(),open:false,showModal(){this.open=true;opens++},close(){this.open=false;this.listeners?.close?.()},listeners:{},addEventListener(name,fn){this.listeners[name]=fn},querySelector(){return node()}};return popup};ctx.document.body.append=()=>{};
vm.runInContext(`Object.assign(state,enrich(seedSnapshot()));persistLogin(state.members[1]);state.projects=[{id:1,owner_id:2,title:'Mine',status:'completed',progress:100,start_date:'2026-10-28',end_date:'2026-10-28',tracker_rows:[]},{id:2,owner_id:3,title:'Other',start_date:'2026-10-28',end_date:'2026-10-28',tracker_rows:[]},{id:3,owner_id:2,title:'Old',start_date:'2026-10-21',end_date:'2026-10-27',tracker_rows:[]}];`,ctx);
clock=Date.parse('2026-10-28T16:59:00');vm.runInContext(fs.readFileSync(__dirname+'/daily-sheet-reminder.js','utf8'),ctx);
assert.equal(opens,0);assert.equal(ctx.window.rndDailySheetReminder.missingRows().length,1);
clock=Date.parse('2026-10-28T17:00:00');ctx.window.rndDailySheetReminder.check();assert(popup.open);assert.equal(opens,1);assert(popup.innerHTML.includes('Mine'));
popup.close();clock+=30000;ctx.window.rndDailySheetReminder.check();assert.equal(opens,1);clock+=31000;ctx.window.rndDailySheetReminder.check();assert.equal(opens,2);
vm.runInContext(`state.projects[0].tracker_rows=[{row_index:0,date:'28-Oct-2026',stage:'Daily work',status:'issue'}];`,ctx);ctx.window.rndDailySheetReminder.check();assert(!popup.open);assert.equal(ctx.window.rndDailySheetReminder.missingRows().length,0);
vm.runInContext(`state.projects[0].tracker_rows[0].status='in_progress';`,ctx);assert.equal(ctx.window.rndDailySheetReminder.missingRows().length,0);
vm.runInContext(`persistLogin(state.members[0]);`,ctx);assert.equal(ctx.window.rndDailySheetReminder.missingRows().length,1);
vm.runInContext(`persistLogin(state.members[4]);`,ctx);assert.equal(ctx.window.rndDailySheetReminder.missingRows().length,0);
console.log('PASS: 5 PM boundary, any missing daily row, completed-project inclusion, minute-repeat after dismissal, stops when filled, Issue/In Progress accepted, owner/lead/visitor scope');
