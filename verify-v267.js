const fs=require('fs');
const assert=require('assert');
const read=f=>fs.readFileSync(f,'utf8');
const index=read('index.html');
const dept=read('department-workspace.js');
const quality=read('quality-review.js');
const cloud=read('firebase-cloud.js');
const leader=read('leader-center.js');
const excel=read('kpi-excel.js');

const ok=(cond,msg)=>assert.ok(cond,msg);

// Asset wiring / release cache.
ok(index.includes('kpi-premium-v267.css?v=267.0.0'),'v267 KPI stylesheet must be loaded');
ok(index.includes('kpi-excel.js?v=267.0.0'),'KPI Excel exporter must be loaded');
ok(index.includes('department-workspace.js?v=267.0.0'),'shared workspace must use v267 cache key');
ok(index.includes('quality-review.js?v=267.0.0'),'Quality KPI module must use v267 cache key');
ok(index.includes('firebase-cloud.js?v=267.0.0'),'Firebase adapter must use v267 cache key');

// R&D is now a shared workspace department, with legacy data adapters retained.
ok(/rnd:\{name:'R&D',kpis:\[/.test(dept),'R&D must have a shared workspace KPI config');
ok(dept.includes("if(n==='randd'||n==='rnd')return'rnd'"),'R&D name must resolve to shared workspace key');
ok(dept.includes("deptKey==='rnd'?(await window.rndCloud.loadRndMembers())"),'R&D shared login must use R&D members');
ok(dept.includes("watchRndWorkspace"),'R&D shared workspace must watch legacy R&D workspace data');
ok(dept.includes("watchRndTime"),'R&D shared workspace must watch legacy R&D time data');
ok(dept.includes("saveRndTime"),'R&D Time Sheet must preserve legacy R&D save adapter');
ok(dept.includes("deleteRndTime"),'R&D Time Sheet must preserve delete adapter');
ok(dept.includes("window.rndCloud.upsert('ideas'"),'R&D ideas must preserve legacy ideas collection');
ok(cloud.includes('watchRndWorkspace'),'Firebase cloud adapter must expose R&D workspace watcher');
ok(cloud.includes('deleteRndTime'),'Firebase cloud adapter must expose R&D time deletion');
ok(leader.includes("filter(([key])=>key!=='rnd')"),'Admin catalog must avoid duplicate R&D after shared reconstruction');

// R&D idea type / KPI counting compatibility.
ok(dept.includes("el('IdeaType')"),'R&D idea form must expose idea type control');
ok(dept.includes("typeField.hidden=deptKey!=='rnd'"),'Idea type control must be R&D-only');
ok(dept.includes("String(r.idea_type||'kaizen').toLowerCase()==='kaizen'"),'R&D KPI count must include Kaizen only while keeping legacy records compatible');
ok(dept.includes("Innovation Idea"),'R&D saved records must display Innovation Idea type');

// Reminder is personal-only and hourly-scoped.
ok(!dept.includes('TEAM PENDING'),'Hourly reminder must not show team pending');
ok(dept.includes('MY PENDING'),'Hourly reminder must show logged-in person pending work');
ok(dept.includes('timesheet-hourly:${deptKey}:${norm(memberName())}:${isoToday()}:${n.getHours()}'),'Reminder must be scoped once per user/department/hour');

// KPI period-focused presentation.
ok(dept.includes("reportPeriod='weekly'"),'Shared KPI default period must be Weekly');
ok(dept.includes('THIS PERIOD FOCUS'),'Shared KPI must include period focus section');
ok(dept.includes('dKpiPeriod'),'Shared KPI must include Weekly/Monthly period filter');
ok(dept.includes('dDownloadKpiExcel'),'Shared KPI must expose Excel export');
ok(dept.includes('window.kpiExcelExport.download'),'Shared KPI must export selected period');
ok(quality.includes('THIS PERIOD FOCUS'),'Quality KPI must include period focus section');
ok(quality.includes('downloadQualityKpiExcelBtn'),'Quality KPI must expose Excel export');
ok(quality.includes("period==='weekly'"),'Quality KPI must support Weekly/Monthly filtering');
ok(excel.includes("sheet('Summary',summary"),'Excel export must include Summary worksheet');
ok(excel.includes("sheet('KPI Detail',detail"),'Excel export must include KPI Detail worksheet');
ok(excel.includes("sheet('Period Focus',focus"),'Excel export must include Period Focus worksheet');

// Member target rule remains in effect.
ok(dept.includes("norm(name)!=='kabil'"),'Kabil must remain excluded from KPI member denominator');
ok(dept.includes('target=names.length*days'),'Kaizen target must scale by counted members and period days');

console.log('v267 PASS: clean Weekly/Monthly KPI focus + Excel, personal hourly reminder, R&D shared reconstruction with legacy data adapters');
