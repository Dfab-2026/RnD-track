const fs=require('fs');
const dw=fs.readFileSync('department-workspace.js','utf8');
const lc=fs.readFileSync('leader-center.js','utf8');
const qr=fs.readFileSync('quality-review.js','utf8');
function ok(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
['kpi-filter-panel q-review-filter','kpi107-report-actions','kpi101-heading','kpi101-legend','kpi102-guide','kpi101-section','kpi101-grid','kpi101-card'].forEach(c=>ok(dw.includes(c),'department KPI uses Quality shell class '+c));
['kpi107-report-actions','kpi101-heading','kpi101-legend','kpi102-guide','kpi101-section','kpi101-grid'].forEach(c=>ok(lc.includes(c),'admin KPI mirror uses Quality shell class '+c));
['production','npd','rfq','outsourcing','purchase','stores','hradmin','accounts','finance','maintenance','digitalmarketing'].forEach(k=>ok(new RegExp(k+':\\{name:').test(dw),'KPI config exists for '+k));
ok(lc.includes("if(department==='quality')"),'admin KPI routes Quality to dedicated Quality component');
ok(lc.includes('watchDepartmentRecords'),'admin/shared KPI has live Firebase mirror listener');
ok(dw.includes("type:'kpi'") && lc.includes("type:'kpi'"),'department and admin use same KPI record type');
ok(qr.includes('kpi101-legend')&&qr.includes('kpi102-guide'),'Quality reference shell is intact');
console.log('v196 Quality-style KPI shell verification complete');
