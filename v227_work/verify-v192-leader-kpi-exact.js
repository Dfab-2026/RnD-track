const fs=require('fs');
const s=fs.readFileSync('leader-center.js','utf8');
const d=fs.readFileSync('department-workspace.js','utf8');
function ok(x,m){if(!x)throw Error(m)}
ok(s.includes('exactGenericKpiRows'), 'leader KPI must use exact generic KPI period rows');
ok(s.includes("r.type==='kpi'&&r.period===range.key"), 'leader KPI must use same type/period key as department KPI');
ok(s.includes('kpi101-grid')&&s.includes('kpi101-card'), 'leader KPI must reuse exact KPI card classes');
ok(s.includes('Actual / result')&&s.includes('Completion %')&&s.includes('Remarks'), 'leader KPI cards must expose same fields');
ok(s.includes('saveDepartmentRecord(key,id,row)'), 'leader KPI save must use department Firebase save path');
ok(s.includes("`kpi_${range.key.replace(/[^a-z0-9]+/gi,'_')}_${i}`"), 'leader KPI must use same Firebase KPI document id scheme');
ok(s.includes('downloadExactGenericKpi')&&s.includes('window.rndKpiPdf'), 'leader KPI must use PDF renderer');
ok(s.includes("document.querySelector('[data-q-page=\"report\"]')?.click()"), 'Quality must open exact Quality KPI component');
ok(d.includes("type:'kpi'")&&d.includes('period:range.key')&&d.includes('saveDepartmentRecord'), 'department KPI baseline missing');
console.log('v192 leader KPI exact-source verification passed');
