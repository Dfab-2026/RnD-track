const fs=require('fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const cloud=fs.readFileSync('firebase-cloud.js','utf8');
const dept=fs.readFileSync('department-workspace.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const a=cloud.indexOf('  function encodeDepartmentRecord(row){'),b=cloud.indexOf('  async function saveDepartmentRecord(',a);
assert(a>=0&&b>a,'Department codec exists');
const sandbox={tsToNumber:()=>1730000000000,numberToIso:()=>new Date(1730000000000).toISOString()};
vm.createContext(sandbox);vm.runInContext(cloud.slice(a,b)+'\nthis.encode=encodeDepartmentRecord;this.decode=decodeDepartmentRecord;',sandbox);
for(const type of ['kaizen','innovation']){
 const row={type:'kaizen',member:'Test Person',date:'2026-11-05',problem:'Problem',idea:'Proposal',priority:'Medium',idea_type:type};
 const stored=sandbox.encode(row);assert.equal(stored.Y,type);
 const loaded=sandbox.decode({id:'dept_rnd_test123',data:()=>({v:stored})});
 assert.equal(loaded.idea_type,type);assert.equal(loaded.problem,row.problem);assert.equal(loaded.idea,row.idea);assert.equal(loaded.member,row.member);
}
assert(dept.includes("window.rndCloud.saveDepartmentRecord('rnd',id,payload)"),'R&D uses working shared saver');
assert(!dept.includes("window.rndCloud.upsert('ideas',payload)"),'R&D Kaizen no longer uses rejected write path');
assert(dept.includes("rndKpiRecords.filter(r=>r.type==='kaizen')"),'R&D reads saved shared ideas');
assert(dept.includes("r.type==='kpi'"),'R&D KPI records still included');
assert(dept.includes("idea_type:deptKey==='rnd'?(el('IdeaType')?.value||'kaizen'):'kaizen'"),'R&D dropdown retained');
assert(html.includes('firebase-cloud.js?v=289.0.0')&&html.includes('department-workspace.js?v=289.0.0'),'Updated scripts served');
console.log('PASS v289: shared R&D Kaizen/Innovation serialization, save route, live rows, legacy compatibility, dropdown and cache bust');
