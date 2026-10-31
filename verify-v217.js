const fs=require('fs');
function ok(v,m){if(!v)throw Error(m)}
const q=fs.readFileSync('quality-daily.js','utf8'),d=fs.readFileSync('department-workspace.js','utf8'),t=fs.readFileSync('time-consume.js','utf8'),css=fs.readFileSync('time-consume.css','utf8');
ok(q.includes('qd-line-chart')&&q.includes('qd-line-path'),'Quality dashboard line chart missing');
ok(d.includes('qd-line-chart')&&d.includes('qd-line-path'),'Shared department line chart missing');
ok(t.includes('rnd-data-weekly-tabs')&&t.includes('Weekly Task Summary')&&t.includes('Weekly KPI Status'),'R&D Datas weekly summaries missing');
ok(css.includes('max-height:calc(100dvh - 24px)')&&css.includes('clamp(190px,32vh,238px)'),'Clock viewport fit missing');
console.log('v217 verification passed');
