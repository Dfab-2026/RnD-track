const fs=require('fs');
const lc=fs.readFileSync('leader-center.js','utf8');
const qr=fs.readFileSync('quality-review.js','utf8');
const dw=fs.readFileSync('department-workspace.js','utf8');
function ok(x,m){if(!x)throw new Error(m)}
ok(lc.includes("window.qualityReview.render('report',host,context)"),'Quality exact KPI component not mounted');
ok(lc.includes('watchDepartmentRecords(department'),'Generic KPI live watcher missing');
ok(lc.includes("watchQualityTime('records'"),'Quality KPI live watcher missing');
ok(lc.includes("id=`kpi_${range.key.replace(/[^a-z0-9]+/gi,'_')}_${i}`"),'Leader KPI id mismatch');
ok(dw.includes("save(`kpi_${range.key.replace(/[^a-z0-9]+/gi,'_')}_${i}`,row)"),'Department KPI id pattern changed');
ok(qr.includes("actor_role:'all_departments_leader'"),'Quality leader audit missing');
ok(qr.includes("editable=Boolean(window.adminSession?.active?.())"),'Quality leader KPI edit access missing');
ok(qr.includes("person:window.adminSession?.active?.()?reportOwner:ctx.person()"),'Quality KPI leader save owner sync missing');
console.log('v195 KPI live mirror verification passed');
