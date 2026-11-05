/* v278 read-only smoke audit: no Firebase writes, no department data modification. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=x=>fs.readFileSync(x,'utf8');
const html=read('index.html'), css=read('kaizen-record-alignment-v277.css');
const lc=read('leader-center.js'),tasks=read('assigned-tasks.js'),app=read('app.js'),nav=read('admin-navigation-v275.css');
assert(html.includes('kaizen-record-alignment-v277.css?v=278.0.0'));
assert(css.includes('overflow-x:hidden!important'));
assert(css.includes('table-layout:fixed!important'));
assert(css.includes('white-space:nowrap!important'));
assert(css.includes('@media(max-width:900px)'));
for(const id of ['ideasPage','qiRegister','dKaizenRegister'])assert(css.includes('#'+id),`Missing scoped register ${id}`);
for(const id of ['leaderCenter','assignedTaskAdminCenter'])assert(nav.includes(id),`Missing admin screen ${id}`);
for(const fn of ['openKpi','openTime','openAnalytics','renderCards','closeFromHistory'])assert(lc.includes(fn),`Missing leader tool ${fn}`);
for(const fn of ['openAdmin','renderAdminList','rateAssignedTask','deleteAssignedTask','saveAssignedTask','closeFromHistory'])assert(tasks.includes(fn),`Missing assignment flow ${fn}`);
assert(app.includes("window.addEventListener('popstate',restoreDepartmentRoute)"));
for(const f of ['app.js','leader-center.js','assigned-tasks.js','firebase-cloud.js','quality-review.js','department-workspace.js'])new (require('node:vm').Script)(read(f),{filename:f});
console.log('PASS: no-horizontal-scroll table layout; responsive register; all four admin card entrypoints, return handlers and task actions; selected JS syntax.');
