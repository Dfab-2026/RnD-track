const fs=require('fs');
function ok(v,m){if(!v){console.error('FAIL:',m);process.exitCode=1}else console.log('PASS:',m)}
const css=fs.readFileSync('production-polish.css','utf8');
const html=fs.readFileSync('index.html','utf8');
ok(html.includes('production-polish.css?v=249.0.0'),'v249 production stylesheet is loaded');
ok(css.includes('html,body{height:100%;overflow:hidden!important}'),'desktop browser page scrolling is disabled');
ok(css.includes('#appShell>.main>.page.active'),'R&D active pages are viewport-contained');
ok(css.includes('#ideasPage>.table-wrap{flex:1 1 0!important;min-height:0!important;overflow:auto!important}'),'Idea records scroll inside the table, not the page');
ok(css.includes('#qualityWorkspace .q-scroll,#departmentWorkspace .q-scroll'),'Quality/shared page shells are viewport-contained');
ok(css.includes('#departmentWorkspace #dContent'),'shared department content owns internal scrolling');
ok(css.includes('qd-task-analytics')&&css.includes('grid-template-rows:auto auto minmax(0,1fr)'),'dashboard analytics uses available viewport height');
ok(css.includes('@media (hover:hover) and (pointer:fine)'),'interactive hover feedback is desktop-pointer scoped');
ok(css.includes('@media (max-width:980px)')&&css.includes('overflow:auto!important'),'smaller screens retain safe natural scrolling');
if(!process.exitCode) console.log('v249 verification complete.');
