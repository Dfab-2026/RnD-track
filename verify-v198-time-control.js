const fs=require('fs');
const src=fs.readFileSync('leader-center.js','utf8');
const css=fs.readFileSync('leader-center.css','utf8');
function ok(v,m){if(!v){console.error('FAIL',m);process.exitCode=1}else console.log('PASS',m)}
ok(src.includes("shell('Person-wise Time Sheet'"),'individual Time Control title');
ok(src.includes('INDIVIDUAL TIME SHEET'),'individual timing table');
ok(src.includes('<th>Date</th><th>Task</th><th>From</th><th>To</th><th>Duration</th><th>Status</th><th>Remarks</th>'),'exact timing columns');
ok(!src.includes('<option value="all">All people</option>'),'no All people option');
ok(!src.includes('<option value="all">All departments</option>${deps'),'no all-department Time Control option');
ok(src.includes("r.department===dept&&r.person===selectedPerson"),'records restricted to selected department and person');
ok(src.includes("['Sai','Sakthi','Venkatachala','Mithilesh']"),'Outsourcing approved login people included');
ok(src.includes("names.add('Mohan');names.add('Navarasu')"),'Quality login people included');
ok(src.includes('data.rnd.members'),'R&D login people source included');
ok(src.includes('Department cards</button>')&&!src.includes('← Department cards</button>'),'leader return arrow removed');
ok(src.includes("sidebar?.classList.remove('open')"),'leader return forcibly closes mobile/sidebar state');
ok(css.includes('.leader-time-filter'),'Time Control production layout styles');
