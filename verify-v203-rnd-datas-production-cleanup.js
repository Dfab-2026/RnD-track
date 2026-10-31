const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('app.js','utf8');
const time=fs.readFileSync('time-consume.js','utf8');
const dept=fs.readFileSync('department-workspace.js','utf8');
const css=fs.readFileSync('time-consume.css','utf8');
function ok(v,m){if(!v)throw new Error(m)}
ok(html.includes('data-page="datas"'),'R&D Datas nav missing');
ok(html.includes('id="datasPage"')&&html.includes('id="rndDataRoot"'),'R&D Datas page missing');
ok(app.includes("datas:'Datas'")&&app.includes("name==='datas')window.renderRndData?.()"),'R&D Datas route missing');
ok(app.includes('HOURS SPENT')&&app.includes('data-go="datas"')&&app.includes('window.rndTimeSummary?.().monthLabel'),'Dashboard Hours Spent not linked to live summary');
ok(time.includes('function renderData()')&&time.includes('Day · Week · Month'),'R&D Datas summary renderer missing');
ok(time.includes('Task Working Hours · This Month'),'Task-wise hours summary missing');
ok(time.includes('window.rndTimeSummary=')&&time.includes('monthLabel:duration(d.monthMinutes)'),'Shared dashboard/data calculation missing');
ok(!time.includes('id="rtcSummaryCards"'),'Time Sheet still contains duplicate summary cards');
ok(!dept.includes('Open existing Production project Time Sheet'),'Legacy Production Time Sheet button still present');
ok(!dept.includes("#dLegacyProduction")&&!dept.includes("id=\"dLegacyProduction\""),'Legacy Production handler still present');
ok(css.includes('.rnd-data-hero'),'R&D Datas styling missing');
console.log('v203 R&D Datas + Production cleanup verification passed.');
