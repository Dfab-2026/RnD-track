const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const q=fs.readFileSync('quality.js','utf8');
const d=fs.readFileSync('department-workspace.js','utf8');
const lc=fs.readFileSync('leader-center.css','utf8');
function ok(c,m){if(!c){console.error('FAIL:',m);process.exitCode=1}else console.log('PASS:',m)}
ok(app.includes("classList.remove('app-locked','sidebar-collapsed')"),'R&D app restores normal left sidebar');
ok(app.includes("localStorage.setItem(SIDEBAR_CLOSED_KEY,'0')"),'R&D collapsed state reset when department opens');
ok(q.includes("root.classList.remove('q-collapsed')"),'Quality restores left sidebar on open');
ok(q.includes("localStorage.setItem('qualitySidebarCollapsed','0')"),'Quality stale collapsed state cleared');
ok(d.includes("root.classList.remove('q-collapsed')"),'Shared departments restore left sidebar on open');
ok(lc.includes('body.leader-center-active #qualityWorkspace .q-sidebar'),'Leader pages suppress Quality sidebar only while active');
ok(lc.includes('body.leader-center-active #departmentWorkspace .q-sidebar'),'Leader pages suppress shared-department sidebar only while active');
ok(lc.includes('body.leader-center-active #sidebar'),'Leader pages suppress R&D sidebar only while active');
if(!process.exitCode) console.log('v207 sidebar scope verified');
