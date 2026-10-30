const fs=require('fs');
const s=fs.readFileSync('department-workspace.js','utf8');
const checks=[
 ['Quality weekly overview class',s.includes('q-weekly-overview')],
 ['Quality weekly tabs class',s.includes('q-weekly-tabs')],
 ['Quality weekly workspace class',s.includes('q-weekly-workspace')],
 ['Quality weekly report panel class',s.includes('q-weekly-report-panel')],
 ['Quality weekly panel head class',s.includes('q-weekly-panel-head')],
 ['Quality timesheet summary class',s.includes('q-weekly-timesheet-summary')],
 ['Quality task summary cards',s.includes('q-weekly-task-summary')],
 ['Others summary card',s.includes('q-weekly-task-summary-other')&&s.includes('No manual tasks this week')],
 ['Selected week date',s.includes('id="dWeeklyDate"')],
 ['Weekly KPI tab',s.includes('Weekly KPI Status')],
 ['KPI report navigation',s.includes("id=\"dOpenKpi\"")],
 ['Week-specific KPI source',s.includes('weeklyKpis=cfg.kpis')&&s.includes('period=`week:${month}:W${weekNo}`')]
];
let bad=0;for(const [n,ok] of checks){console.log((ok?'PASS':'FAIL'),n);if(!ok)bad++}process.exitCode=bad?1:0;
