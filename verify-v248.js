const fs=require('fs');
const css=fs.readFileSync('production-polish.css','utf8');
const index=fs.readFileSync('index.html','utf8');
function ok(c,m){if(!c){console.error('FAIL:',m);process.exitCode=1}else console.log('PASS:',m)}
ok(index.includes('production-polish.css?v=248.0.0'),'v248 production stylesheet referenced');
ok(css.includes('v248 — production layout completion pass'),'v248 layout pass present');
ok(css.includes('#qualityWorkspace.q-dashboard-page .q-scroll')&&css.includes('overflow-y:auto!important'),'Quality dashboard can scroll instead of clip');
ok(css.includes('#departmentWorkspace.q-dashboard-page .q-scroll'),'Shared department dashboards receive same no-clip treatment');
ok(css.includes('#appShell .main>#dashboardPage.active')&&css.includes('height:auto!important'),'R&D dashboard no longer forced into clipped viewport height');
ok(css.includes('.qd-task-analytics')&&css.includes('min-height:430px!important'),'Dashboard analytics card receives safe minimum height');
ok(css.includes('.work-project-grid .work-project-card h4')&&css.includes('-webkit-line-clamp:unset!important'),'Project card titles are not presentation-clipped');
ok(css.includes('#weeklySetup .weekly-idea-card')&&css.includes('max-height:none!important'),'Weekly idea cards can expand for content');
if(process.exitCode)process.exit(process.exitCode);
