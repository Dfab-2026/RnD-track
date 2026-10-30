const fs=require('fs');
const dep=fs.readFileSync('department-workspace.js','utf8');
const cloud=fs.readFileSync('firebase-cloud.js','utf8');
function ok(v,m){if(!v)throw new Error('FAIL: '+m);console.log('PASS',m)}
ok(dep.includes('dKaizenRegister')&&dep.includes('+ NEW KAIZEN'),'generic Kaizen uses Quality register toolbar');
ok(dep.includes('filter-line')&&dep.includes('dKaizenSearch')&&dep.includes('dKaizenPerson')&&dep.includes('dKaizenDate'),'generic Kaizen uses Quality filter row');
ok(dep.includes('<th>Date</th><th>Idea</th><th>Person</th><th>Department</th><th>Problem</th><th>Proposed Solution</th><th>Priority</th><th>Status</th><th>Actions</th>'),'generic Kaizen uses Quality table columns');
ok(dep.includes("document.getElementById('ideaDialog')")&&dep.includes("dialog.querySelector('.kicker').textContent=`KAIZEN IDEAS · ${cfg.name.toUpperCase()}`"),'generic Kaizen clones same Quality/R&D idea modal');
ok(dep.includes("el('IdeaProblem')")&&dep.includes("el('IdeaProposal')")&&dep.includes("el('IdeaPriority')")&&dep.includes("el('IdeaBenefit')")&&dep.includes("el('IdeaAttachment')"),'same Kaizen modal fields');
ok(dep.includes('data-kaizen-edit')&&dep.includes('data-kaizen-delete'),'same edit/delete actions');
ok(cloud.includes("put('h',String(r.priority")&&cloud.includes("put('o',{n:String(r.attachment.name"),'priority and attachment compacted to Firebase');
ok(cloud.includes("priority:v.h||'Medium'")&&cloud.includes('attachment:{name:v.o.n'),'priority and attachment restored from Firebase');
ok(dep.includes('qd-four-metrics')&&dep.includes('qd-task-analytics'),'Dashboard remains Quality-reference layout');
ok(dep.includes('TIME SHEET SUMMARY')&&dep.includes('kpi101-grid')&&dep.includes('qt-inline-form'),'Weekly/KPI/Time Sheet remain Quality-reference structures');
console.log('v183 verification complete');
