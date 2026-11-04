const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=f=>fs.readFileSync(__dirname+'/'+f,'utf8');
const html=read('index.html'),d=read('department-workspace.js'),q=read('quality-time.js'),k=read('quality-review.js'),css=read('department-v254.css');
for(const file of ['department-workspace.js','quality-time.js','quality-review.js','department-v254.css']) assert(html.includes(file+'?v=254.0.0'),file+' current reference');
assert(!d.includes("group:'Common Tasks'"),'no separately labeled common tasks');
assert(d.includes("group:'Task List'"),'common items remain in task list');
for(const src of [d,k]){assert(src.includes('dept-kpi-week-range'),'KPI dates grouped with week selector');assert(src.includes('Reporting start date')&&src.includes('Reporting end date'),'from/to dates are visible');}
assert(d.includes(".classList.toggle('dept-kpi-monthly'"),'monthly range remains visible');
assert(k.includes(".classList.toggle('dept-kpi-monthly'"),'Quality monthly range remains visible');
for(const src of [d,q]){assert(src.includes('recordsPage')||src.includes('timeRecordsPage'),'records paging cursor');assert(src.includes('pageSize=window.innerHeight<850?1:window.innerHeight<1100?2:3'),'responsive page sizes');assert(src.includes('Page ${'),'page indicators');assert(src.includes('Continue')&&src.includes('Updated · '),'saved update remains active');assert(src.includes('departmentTimesheetPolicy'),'week permissions retained');}
assert(css.includes('#departmentWorkspace:has(#dTimeForm) #dContent'),'shared Timesheet no-page-scroll container');
assert(css.includes('#qualityTimeWorkspace .qt-rnd-sheet'),'Quality Timesheet no-page-scroll container');
assert(!css.includes('#appShell'),'R&D app shell not modified');
console.log('v254 PASS: scoped compact Timesheets, paginated records, unified tasks, KPI week/from/to, locked R&D');
