const fs=require('fs');
const assert=require('assert');
const ws=fs.readFileSync('department-workspace.js','utf8');
const html=fs.readFileSync('index.html','utf8');

assert(html.includes('department-workspace.js?v=265.0.0'),'v265 department-workspace cache reference missing');

// Timesheet actions: Pending/In progress -> Continue; completed -> no Edit, delete X remains.
assert(ws.includes("(r.status==='pending'||r.status==='in_progress')?`<button type=\"button\" class=\"mini-action dept-resume dept-continue\""), 'Continue action missing for pending/in-progress');
assert(!ws.includes("dept-resume ${r.status==='pending'||r.status==='in_progress'?'dept-continue':'dept-edit'}"), 'Legacy completed Edit action still present');
assert(ws.includes("adminView()||norm(r.member)===norm(memberName())?`<button type=\"button\" class=\"icon-btn dept-time-delete\""), 'Delete X is not available for managed records');
assert(ws.includes("if(!entry||(!adminView()&&norm(entry.member)!==norm(memberName())))return;"), 'Delete/continue ownership guard not updated');
assert(ws.includes("const recordOwner=original?.member||memberName();"), 'Original Timesheet owner preservation missing');
assert(ws.includes("member:recordOwner"), 'Updated Timesheet record does not preserve owner');

// All shared non-R&D department KPI sections must have KPI definitions.
const required={
  quality:7, productiondept:14, production:14, npd:14, rfq:10, outsourcing:14,
  purchase:10, stores:10, hradmin:10, accounts:10, finance:13, maintenance:6, digitalmarketing:8
};
for(const [key,min] of Object.entries(required)){
  const re=new RegExp(`${key}:\\{name:'[^']+'(?:,legacyProduction:true)?,kpis:\\[(.*?)\\]\\}`, 's');
  const m=ws.match(re); assert(m,`KPI config missing for ${key}`);
  const count=(m[1].match(/\['/g)||[]).length;
  assert(count>=min,`KPI cards missing for ${key}: ${count}/${min}`);
}

// KPI renderer still produces cards and same-record save IDs.
assert(ws.includes('<div class="kpi101-grid">${cfg.kpis.map'), 'Department KPI card renderer missing');
assert(ws.includes("await save(`kpi_${range.key.replace(/[^a-z0-9]+/gi,'_')}_${i}`,row)"), 'KPI same-record save path missing');

console.log('v265 PASS: Timesheet Continue/Delete actions and department KPI sections');
