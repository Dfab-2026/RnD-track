// Validate compact project data against the bundled Firestore field allowlist.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/firebase-cloud.js','utf8');
const ctx=vm.createContext({window:{addEventListener(){}},document:{addEventListener(){}},console,setTimeout,clearTimeout});
vm.runInContext(source.replace('  window.rndCloud={','  window.testCodec={encode,decode};\n  window.rndCloud={'),ctx);
const {encode,decode}=ctx.window.testCodec;
const rules=fs.readFileSync(__dirname+'/firestore.rules','utf8');
const allowlist=rules.match(/function validProject\(\)[\s\S]*?hasOnly\(\[([^\]]+)\]/)[1];
const allowed=new Set([...allowlist.matchAll(/'([^']+)'/g)].map(m=>m[1]));
const date='2026-10-24T10:00:00.000Z';
for(const owner of [1,2]){
 const row={id:owner,cycle_id:1770000000123456,idea_id:31,owner_id:owner,title:'Weekly task',project_number:'P'+owner,start_date:'2026-10-22',end_date:'2026-10-28',progress:100,status:'completed',created_at:date,updated_at:date,tracker_rows:Array.from({length:6},(_,row_index)=>({row_index,status:'completed',date:'24-Oct-2026',task:'Done'}))};
 const packed=encode('projects',row);
 for(const key of Object.keys(packed))assert(allowed.has(key),'Rules reject project field: '+key);
 const restored=decode('projects',packed,String(owner));
 assert.equal(restored.cycle_id,row.cycle_id);assert.equal(restored.owner_id,owner);assert.equal(restored.progress,100);assert.equal(restored.tracker_rows.length,6);assert.equal(restored.updated_at,date);
 // Also read data written by the previous k-field version without losing its link.
 const alternate={...packed,k:row.cycle_id,c:Date.parse(date)};
 assert.equal(decode('projects',alternate,String(owner)).cycle_id,row.cycle_id);
}
console.log('PASS: project field allowlist, cycle/owner/100%/six-row round-trip, previous compact format compatibility');
