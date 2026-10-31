const fs=require('fs');
const s=fs.readFileSync('time-consume.js','utf8');
const checks=[
 ['R&D Datas keeps Weekly Task Summary',s.includes('TIME SHEET SOURCE')&&s.includes('Weekly Task Summary')],
 ['R&D Datas uses Quality weekly cards',s.includes('q-weekly-timesheet-summary')&&s.includes('rnd-data-quality-weekly')],
 ['R&D Datas keeps Open Time Sheet action',s.includes('id="rndDataOpenTime"')&&s.includes("$('rndDataOpenTime').onclick=()=>showPage('timeconsume')")],
 ['R&D Datas no longer renders KPI panel',!s.includes('id="rndDataOpenKpi"')],
 ['R&D Datas no longer renders monthly summary card',!s.includes('Task Working Hours · This Month')],
 ['R&D Datas no longer renders top metric grid',!s.includes('rnd-data-four-metrics')]
];
let ok=true; for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'}: ${name}`);if(!pass)ok=false} if(!ok)process.exit(1);
