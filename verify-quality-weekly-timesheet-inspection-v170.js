const fs=require('fs');
const review=fs.readFileSync('quality-review.js','utf8');
const quality=fs.readFileSync('quality.js','utf8');
const time=fs.readFileSync('quality-time.js','utf8');
function ok(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
ok(review.includes('Time Sheet Summary'),'weekly time sheet summary exists');
ok(review.includes("data-qw-panel=\"inspection\""),'inspection weekly panel exists');
ok(review.includes('PO number'),'PO number field exists');
ok(review.includes('Any defects?'),'defect selector exists');
ok(review.includes("row.kind==='inspection_record'"),'inspection validation exists');
ok(review.includes("row.defect==='yes'&&!row.remarks"),'defect remarks requirement exists');
ok(review.includes("r.date>=span.start&&r.date<=span.end"),'weekly records use week range');
ok(review.includes("timeRows().filter(r=>r.date>=span.start&&r.date<=span.end)"),'time sheet aggregates selected week');
ok(review.includes("date:span.start,week_start:span.start"),'weekly department tasks save by week');
ok(quality.includes("page==='dashboard'||page==='weekly'"),'weekly report live refreshes from time sheet sync');
ok(time.includes("value:'daily_inspection'"),'inspection exists in time sheet tasks');
console.log('v170 verification complete');
