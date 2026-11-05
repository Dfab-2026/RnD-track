'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=n=>fs.readFileSync(__dirname+'/'+n,'utf8');
const context={window:{},Date,console};vm.createContext(context);vm.runInContext(read('department-timesheet-policy.js'),context);
const policy=context.window.departmentTimesheetPolicy;
const now=new Date('2026-11-05T12:00:00');
for(const day of ['2026-11-05','2026-11-04','2026-10-15','2025-01-01'])assert.equal(policy.permitted(day,now),true,'expected valid historical date '+day);
for(const day of ['2026-11-06','2026-11-31','2026-02-29','not-a-date',''])assert.equal(policy.permitted(day,now),false,'expected invalid/future date '+day);
for(const f of ['department-workspace.js','quality-time.js','time-consume.js']){
 const s=read(f);
 assert.ok(!s.includes('This time period overlaps a saved entry.')&&!s.includes('This time overlaps a saved record.'),f+' still blocks overlapping intervals');
 assert.ok(/minutes<=0|mins<=0/.test(s),f+' must preserve positive duration validation');
 assert.ok(s.includes('Saving to Firebase'),f+' must preserve Firebase write flow');
 assert.ok(s.includes("'other'")&&s.includes('custom'),f+' must preserve custom task entry');
 assert.ok(s.includes('value=date'),f+' must filter saved rows to selected work date');
}
for(const f of ['department-workspace.js','quality-time.js'])assert.ok(!read(f).includes('min="${'),f+' still imposes min bound on date picker');
assert.ok(read('time-consume.js').includes('departmentTimesheetPolicy?.permitted(date)'),'R&D future-date protection');
const css=read('timesheet-pending-v284.css');for(const marker of ['#pendingTaskContent','.dept-hourly-reminder .dept-reminder-pending','overflow-y:auto','min-height:0'])assert.ok(css.includes(marker),marker);
const html=read('index.html');for(const file of ['timesheet-pending-v284.css','department-timesheet-policy.js','quality-time.js','time-consume.js','department-workspace.js'])assert.ok(html.includes(file+'?v=284.0.0'),file+' version missing');
console.log('PASS v284: historical dates, future rejection, overlapping ranges, Others task, positive duration, Firebase save paths, date filtering and both scrollable pending dialogs');
