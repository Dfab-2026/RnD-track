/* v252 release checks: shared department/Quality only. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
const context={window:{},Date,console};vm.createContext(context);vm.runInContext(read('department-timesheet-policy.js'),context);
const policy=context.window.departmentTimesheetPolicy;
const check=(day,eligible,blocked,start,end)=>{
 const at=new Date(day+'T12:00:00'),b=policy.bounds(at);
 assert.strictEqual(b.start,start);assert.strictEqual(b.end,end);assert.strictEqual(b.max,day);
 eligible.forEach(date=>assert(policy.permitted(date,at),`${date} must be editable on ${day}`));
 blocked.forEach(date=>assert(!policy.permitted(date,at),`${date} must be locked on ${day}`));
};
check('2026-11-04',['2026-11-01','2026-11-02','2026-11-04'],['2026-10-31','2026-11-05','2026-11-08'],'2026-11-01','2026-11-07');
check('2026-11-09',['2026-11-08','2026-11-09'],['2026-11-07','2026-11-10'],'2026-11-08','2026-11-14');
check('2026-11-15',['2026-11-15'],['2026-11-14','2026-11-16'],'2026-11-15','2026-11-21');
check('2026-11-30',['2026-11-22','2026-11-30'],['2026-11-21','2026-12-01'],'2026-11-22','2026-11-30');
check('2028-02-29',['2028-02-22','2028-02-29'],['2028-02-21','2028-03-01'],'2028-02-22','2028-02-29');
assert(!policy.permitted('2026-02-30',new Date('2026-02-28T12:00:00')));
const quality=read('quality-time.js'),dept=read('department-workspace.js'),ideas=read('quality-ideas.js'),index=read('index.html'),styles=read('department-v252.css');
for(const src of [quality,dept]){
 assert(src.includes('departmentTimesheetPolicy'));
 assert(src.includes('Update')&&src.includes('Continue'));
 assert(src.includes('Updated · ')&&src.includes('created_at:original?.created_at||original?.updated_at||now'));
 assert(src.includes('min="${')&&src.includes('max="${'));
 assert(src.includes('dept-clock-hand'));
}
assert(quality.includes("if(original&&!policy().permitted(original.date))"));
assert(quality.includes('saveQualityTime(\'entries\',id,row)'));
assert(dept.includes('await save(timeEditingId||crypto.randomUUID(),row)'));
assert(dept.includes("rows('timesheet').filter(r=>norm(r.member)===norm(memberName())&&r.date===date&&String(r.id)!==String(timeEditingId))"));
assert(dept.includes('timeEditingId=entry.id'));
assert(dept.includes("latest.querySelector('[role=status]').textContent"));
assert(ideas.includes("el('IdeaMember').closest('label').after(el('IdeaDate').closest('label'))"));
assert(dept.includes('dept-kaizen-empty')&&ideas.includes('dept-kaizen-empty'));
assert(index.includes('department-timesheet-policy.js?v=252.0.0'));
assert(index.includes('department-v252.css?v=252.0.0'));
assert(styles.includes('dialog.department-kaizen-dialog.idea-entry-dialog'));
assert(styles.includes('.q-weekly-overview>article')&&styles.includes('.assigned-task-page-summary>article'));
assert(styles.includes('@media(prefers-reduced-motion:reduce)'));
assert(!styles.includes('#appShell'));
console.log('v252 PASS: month-block date bounds, past-week locking, same-record updates, Kaizen layout, theme scope, clock animation');
