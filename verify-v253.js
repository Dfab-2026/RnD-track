/* v253 scoped release checks: browser interaction tests are separate. */
const assert=require('assert'),fs=require('fs'),path=require('path');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const idx=read('index.html'),quality=read('quality-time.js'),review=read('quality-review.js'),dept=read('department-workspace.js'),style=read('department-v253.css');
for(const name of ['quality-time.js','quality-review.js','department-workspace.js']) assert(idx.includes(name+'?v=253.0.0'),name+' cache');
assert(idx.includes('department-v253.css?v=253.0.0'));
assert(quality.includes('master_erpentry') && quality.includes('master_leave') && quality.includes('master_nowork'));
for(const src of [quality,dept]){
 assert(src.includes('FilterDate') && src.includes('dataset.explicit'));
 assert(src.includes('date') && src.includes('Continue') && src.includes('Updated · '));
 assert(src.includes('departmentTimesheetPolicy'));
}
for(const label of ['Leave','No Work','ERP Entry','Meeting','Documentation','Training','Kaizen','5S']) assert(dept.includes("'"+label+"'"),label);
for(const src of [review,dept]) assert(src.includes('dept-hour-track') && src.includes('--week-fill:') && src.includes('q-weekly-task-summary'));
assert(dept.includes('dept-kpi-bar'));
assert(style.includes(':is(#qualityWorkspace,#departmentWorkspace)') && style.includes(':is(#qualityTimeWorkspace,#departmentWorkspace)'));
assert(style.includes('prefers-reduced-motion') && style.includes('.tc-clock-field'));
assert(!style.includes('#appShell'));
console.log('v253 PASS: weekly visual bars, common tasks, day/all-date saved-record filters, clock styles, scoped selectors, cache references');
