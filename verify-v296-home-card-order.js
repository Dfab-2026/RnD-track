/* v296: check only requested home card order / sidebar revert / unchanged editor */
const fs=require('fs'),assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');
const home=read('leader-center.js');
const cards=home.match(/const cards=\[([\s\S]*?)\];/g)?.at(-1)||'';
assert(cards.includes("kind:'kpi'"));
assert(cards.includes("kind:'assign'"));
assert(cards.indexOf("kind:'assign'")<cards.indexOf("kind:'time'"));
assert(cards.indexOf("kind:'kpi'")>cards.indexOf("kind:'analytics'"));
const nav=read('department-shared-ui.js');
assert(nav.indexOf("id:'assigned',label:'Assigned Tasks'")<nav.indexOf("id:'kpi',label:'KPI Report'"));
const html=read('index.html');
assert(html.indexOf('data-page="assigned"><span>07')<html.indexOf('data-page="kpi"><span>08'));
assert(html.includes('kpi-task-editor-v295.js'));
const editor=read('kpi-task-editor-v295.js');
assert(editor.includes('saveDepartmentRecord')&&editor.includes('attachEditor'));
assert(home.includes('window.kpiTaskTitles?.attachEditor'));
console.log('PASS: home KPI/Assign Task positions swapped; department navigation restored; admin KPI editor retained.');
