const fs=require('fs');
function ok(c,m){if(!c){console.error('FAIL:',m);process.exitCode=1}else console.log('PASS:',m)}
const backup=fs.readFileSync('backup-tools.js','utf8');
const idx=fs.readFileSync('index.html','utf8');
const dept=fs.readFileSync('department-workspace.js','utf8');
const qlogin=fs.readFileSync('quality-login.js','utf8');
const time=fs.readFileSync('time-consume.js','utf8');
ok(backup.includes('for(let day=1;day<=bounds.days;day++)')&&backup.includes('No records for this date.'),'Backup PDF renders every calendar date');
ok(backup.includes('day 1 through the last day of that month'),'Settings explains full-month PDF coverage');
ok(!idx.includes('id="enableNotificationsBtn"')&&!idx.includes('id="notificationStatus"'),'R&D Settings notification control removed');
ok(!dept.includes('id="dNotify"'),'Shared department Settings notification control removed');
ok(dept.includes('window.requestNotificationsFromGesture?.()'),'Shared department login triggers browser permission flow');
ok(qlogin.includes('window.requestNotificationsFromGesture?.()'),'Quality login triggers browser permission flow');
ok(time.includes('rnd-data-weekly-stack')&&!time.includes('data-rnd-data-panel="kpi" hidden'),'R&D Datas weekly Time Sheet/KPI panels are expanded');
ok(time.includes('TIME SHEET SUMMARY')&&time.includes('WEEKLY KPI STATUS'),'R&D Datas keeps both required report summaries');
