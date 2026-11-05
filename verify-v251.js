/* v251 locked-scope regression: run node verify-v251.js */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=f=>fs.readFileSync(require('node:path').join(__dirname,f),'utf8');
const index=read('index.html'),dept=read('department-workspace.js'),quality=read('quality.js');
const css=read('department-unified.css'),ux=read('department-ux.js'),cloud=read('firebase-cloud.js');
const lead=read('leader-center.js'),daily=read('quality-daily.js'),ideas=read('quality-ideas.js'),backups=read('backup-tools.js');
function check(name,condition){assert.ok(condition,name);console.log('PASS',name)}
check('new shared UI is scoped only to Quality/non-R&D workspaces',css.includes(':is(#qualityWorkspace,#departmentWorkspace)')&&!css.includes('#appShell'));
check('legacy R&D operational scripts retain original cache references',index.includes('app.js?v=241.0.0')&&index.includes('production.js?v=205.0.0'));
check('four Admin tools retain their original module references',index.includes('leader-center.js?v=251.0.0')&&index.includes('assigned-tasks.js?v=246.0.0'));
check('shared departments use one dashboard renderer',dept.includes('function dashboard(){')&&dept.includes('const CONFIG={'));
check('department KPI and Timesheet tasks remain configuration driven',dept.includes('kpis:[')&&dept.includes('const MASTER_TIME_TASKS='));
check('shared Assigned Tasks page correctly titled',dept.includes("assigned:'Assigned Tasks'"));
check('dashboard filter controls are constrained to analytics card',css.includes('.qd-task-analytics .qd-chart-filters')&&css.includes('max-width:100%!important'));
check('dashboard status uses operational language',dept.includes('Data synchronized')&&quality.includes('Data synchronized'));
check('in-app modal is accessible and supports cancel/delete',ux.includes('dialog.showModal()')&&ux.includes('resolve(decision)')&&ux.includes('cancel.focus()'));
check('normal department and Quality record deletes use in-app confirmation',dept.includes('await window.departmentUX.confirm')&&daily.includes('await window.departmentUX.confirm')&&ideas.includes('await window.departmentUX.confirm'));
check('Firebase member password save still hashes credentials and waits for server ACK',cloud.includes('const credential=await createPasswordCredential(password)')&&cloud.includes("await withWriteRetry(()=>ref.set(payload,{merge:true}),'Member save');await flushPendingWrites();"));
check('Member save feedback survives member-list rerender',lead.includes("savedStatus.textContent='Saved'")&&lead.includes("window.departmentUX.notice('Saved')"));
check('Monthly delete requires two app confirmations outside R&D while retaining R&D confirmation',backups.includes("mode==='rnd'||!window.departmentUX")&&backups.includes('if(!await confirmDelete')&&backups.includes('await window.rndCloud.deleteMonthData'));
check('member deletion uses in-app confirmation',lead.includes('await window.departmentUX.confirm(`Delete ${name} login from ${dept.name}?`)'));
console.log('v251 regression checks passed');
