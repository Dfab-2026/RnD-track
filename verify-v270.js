/* v270 scope: every department report, one-week attendance, existing KPI indices and output integrity. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const projectFile=n=>fs.readFileSync(n,'utf8');
const state={window:{},document:{addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},console};
vm.runInNewContext(projectFile('department-workspace.js'),state);
const config=state.window.departmentWorkspace.configs;
const expected=['rnd','production','productiondept','npd','rfq','outsourcing','quality','purchase','stores','hradmin','accounts','finance','maintenance','digitalmarketing'];
for(const key of expected){
  assert(config[key],`KPI department configuration missing: ${key}`);
  assert(config[key].kpis.length>=7,`KPI list unexpectedly empty: ${key}`);
  assert.equal(config[key].kpis.filter(k=>/attendance|team discipline/i.test(k[0])).length,1,`Exactly one Attendance KPI required: ${key}`);
}
assert.equal(config.rnd.kpis[0][0],'Automation of Existing Manual Process');
assert.equal(config.rnd.kpis.at(-1)[0],'Attendance & Team Discipline');
assert.equal(config.quality.kpis[0][0],'ISO Process Implementation');
assert.equal(state.window.departmentWorkspace.weeklyTargetText(['New KPIs','Daily – 1','Daily']),'6 / working week');
assert.equal(state.window.departmentWorkspace.weeklyTargetText(['New KPIs','2 monthly','Monthly']),'0.5 / week');
assert(state.window.departmentWorkspace.has('R&D'));
const shared=projectFile('department-workspace.js'),quality=projectFile('quality-review.js'),html=projectFile('index.html');
for(const word of ['window.dfabWeeklyKpiReport?.preview(reportModel)','window.dfabWeeklyKpiReport.download(reportModel)','attendanceTarget=range','recordedAttendanceDays=range','kpi_${range.key'])assert(shared.includes(word),`Missing shared KPI rendering feature: ${word}`);
for(const word of ['referencePreview','downloadQualityReferencePdfBtn','attendance_'+"'",'quality_kpi_actual'])assert(quality.includes(word),`Missing Quality KPI feature: ${word}`);
assert(html.includes('kpi-weekly-report.js?v=270.0.0'));
assert(html.includes('kpi-weekly-report.css?v=270.0.0'));
for(const file of ['department-workspace.js','quality-review.js','kpi-weekly-report.js'])new vm.Script(projectFile(file),{filename:file});
const reportCtx={window:{}};vm.runInNewContext(projectFile('kpi-weekly-report.js'),reportCtx);
const sample=reportCtx.window.dfabWeeklyKpiReport.normalize({department:'R&D',period:'Weekly',week:4,start:'2026-10-26',end:'2026-10-31',rows:[{title:'A',percent:100},{title:'B',percent:70},{title:'C',percent:0}]});
assert.equal(sample.total,3);assert.equal(sample.achieved,1);assert.equal(sample.incomplete,2);assert(Math.abs(sample.completion-33.333)<.01);
assert(reportCtx.window.dfabWeeklyKpiReport.preview(sample).includes('WEEKLY KPI REPORT'));
console.log(`v270 PASS: ${expected.length} department KPI masters, weekly attendance, Quality report, online preview, status charts and PDF exporter wiring`);
