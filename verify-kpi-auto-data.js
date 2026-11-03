const assert=require('assert'),fs=require('fs'),vm=require('vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/kpi-auto-data.js','utf8'),context);
const summarize=context.window.kpiAutoData.summarize;
const result=summarize({
  start:'2026-11-01',end:'2026-11-07',person:'Asha',
  timeRows:[
    {date:'2026-11-02',owner:'Asha',minutes:90,status:'completed'},
    {date:'2026-11-03',member:'Asha',from:'09:00',to:'10:30',status:'in_progress'},
    {date:'2026-11-04',owner:'Other',minutes:240,status:'completed'},
    {date:'2026-11-08',owner:'Asha',minutes:60,status:'pending'}
  ],
  workRows:[
    {date:'2026-11-02',member:'Asha',status:'completed'},
    {date:'2026-11-03',member:'Asha',status:'pending'},
    {date:'2026-11-03',member:'Other',status:'completed'}
  ],
  kaizenRows:[
    {date:'2026-11-02',member:'Asha',id:'k1'},
    {date:'2026-11-04',member:'Asha',id:'k2'},
    {date:'2026-11-04',member:'Other',id:'k3'}
  ]
});
assert.strictEqual(result.timeEntries,2);
assert.strictEqual(result.timeMinutes,180);
assert.strictEqual(result.timeHours,3);
assert.strictEqual(result.timeCompleted,1);
assert.strictEqual(result.timeInProgress,1);
assert.strictEqual(result.workRecords,2);
assert.strictEqual(result.workCompleted,1);
assert.strictEqual(result.workPending,1);
assert.strictEqual(result.kaizenIdeas,2);
assert(context.window.kpiAutoData.text(result).includes('Kaizen ideas: 2'));
assert.strictEqual(context.window.kpiAutoData.suggestion('Kaizen Improvement',{kaizenIdeas:2}), '2');
assert.strictEqual(context.window.kpiAutoData.suggestion('Customer Visit',{timeRows:[{task:'Customer visit preparation',minutes:60}]}), '1 matching source record · 1h');
assert.strictEqual(context.window.kpiAutoData.suggestion('Customer Visit',{workRows:[{title:'Customer visit'}]}), '1 matching source record · 0h');
assert.throws(()=>summarize({start:'2026-11-08',end:'2026-11-01'}),/valid KPI reporting period/);
const app=fs.readFileSync(__dirname+'/app.js','utf8'),rnd=fs.readFileSync(__dirname+'/time-consume.js','utf8'),department=fs.readFileSync(__dirname+'/department-workspace.js','utf8'),quality=fs.readFileSync(__dirname+'/quality-review.js','utf8'),html=fs.readFileSync(__dirname+'/index.html','utf8');
assert(app.includes('window.rndTimeConsume?.reportData?.(timeStart,timeEnd,member.id)'),'R&D KPI must include selected-member Time Sheet records');
assert(rnd.includes('window.rndTimeConsume={minutes,hourlyReminder,reportData}'),'R&D Time Sheet must expose period-based report totals');
assert(department.includes('AUTO-COLLECTED SOURCE DATA')&&department.includes('kaizenIdeas:source.kaizenIdeas')&&department.includes('window.kpiAutoData?.suggestion'),'shared department KPI must show source evidence and editable suggestions');
assert(quality.includes('AUTO-COLLECTED SOURCE DATA')&&quality.includes('Daily idea and task KPI values above are already counted automatically'),'Quality KPI must show time-sheet and saved-work source evidence');
assert(html.includes('kpi-auto-data.js?v=1.0.0'),'shared KPI evidence helper must be loaded before report modules');
console.log('PASS: Period/person filtering, time totals, work statuses, Kaizen counts and KPI report wiring.');
