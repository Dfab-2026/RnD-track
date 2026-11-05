const fs=require('fs');
const assert=require('assert');
const read=f=>fs.readFileSync(f,'utf8');
const d=read('department-workspace.js'),q=read('quality-review.js'),a=read('app.js'),l=read('leader-center.js'),h=read('index.html'),css=read('kpi-master-v268.css');
const required={
  rnd:['Automation of Existing Manual Process','New Product Ideas','Development of New Product','DFAB AI-ERP Tool','Quotation Tool Development Update','DFAB Website Quality Update','Continuous Improvement / Kaizen','Weekly & Monthly KPI Report Submission'],
  quality:['ISO Process Implementation','Internal Audit of Each Department','Department wise quality KPI','Quality Training & Measurement of Awareness with Test','ORG Doc for Audit Readiness','Incoming, Inprocess & Final Inspections','Internal & External cordination','Quality cost reduction','Attrition Rate','Continuous Improvement / Kaizen','KPI Report'],
  productiondept:['Production Plan vs Actual','In-process Rework','In-process Rejection','OTD','Kaizen Improvement','Report Submission'],
  npd:['NPD Projects Completed','Kaizen Contribution','Drawing G/Poom Accuracy','KPI Report'],
  rfq:['Revenue Target','No. of New Customers','Revenue Pipeline Target','RFQ to Quote Conversion','Customer Visit','RFQ to PO','Customer Satisfaction'],
  outsourcing:['Vendor Addition','Vendor Improvement / Kaizen','Vendor Load Allocation','KPI Report'],
  purchase:['On-time Placement','Vendor Database Management & Addition of Vendors by Category','Supplier Rating Report','Continuous Improvement / Kaizen'],
  stores:['GRN On Time','Consumable Issue Record','ERP On-time Entry','Continuous Improvement / Kaizen'],
  hradmin:['Position Fulfillment on Time','Skill Matrix Management','No. of Training Conducted','Employee recognisition/ Employee-related Program'],
  accounts:['Record / Book Keeping','Weekly / Monthly Revenue Report','ERP Entry','Continuous Improvement / Kaizen'],
  finance:['Cash Flow Statement','GST Payable Calculation','Weekly / Monthly Revenue Forecast Vs Actual','Attendance & Team Discipline'],
  maintenance:['No. of Machines Available','Breakdown Hours','Continuous Improvement Kaizen'],
  digitalmarketing:['Digital Media Engagement','DFAB Business Competitor & Market Analysis','Revenue Generation by Lead','Weekly & Monthly KPI Report Submission']
};
for(const [key,titles] of Object.entries(required)) for(const title of titles) assert(d.includes(JSON.stringify(title))||d.includes(`'${title}'`)||d.includes(title),`${key} missing ${title}`);
assert(d.includes("deptKey!=='rnd'||norm(name)!=='kabil'"),'Kabil must only be excluded from R&D KPI contributors');
assert(!q.includes("clean(name)!=='kabil'"),'Quality must not exclude Kabil from contributors');
assert(d.includes('const weeklyTargetText=metric=>'),'weekly target conversion helper missing');
assert(d.includes('const relevant=cfg.kpis.map((k,i)=>({k,i}));'),'weekly report must include every configured KPI');
assert(d.includes('periodTargetText(k,range)'),'weekly-equivalent target must be used');
assert(d.includes('<span>TEAM PENDING</span>'),'notification panel must include team pending');
const hourly=d.slice(d.indexOf('async function hourlyReminder'),d.indexOf('async function open(department)'));
assert(hourly.includes('<span>MY PENDING</span>'),'hourly popup must show MY PENDING');
assert(!hourly.includes('<span>TEAM PENDING</span>'),'hourly popup must not show TEAM PENDING');
const legacy=a.slice(a.indexOf('function renderPendingTaskPopup'),a.indexOf('function maybeShowPendingTaskPopup'));
assert(legacy.includes('MY PENDING')&&!legacy.includes('TEAM PENDING'),'legacy R&D hourly popup must be personal only');
assert(css.includes('#dKaizenRegister tbody td{white-space:normal!important'),'Kaizen table text must wrap');
for(const title of required.quality) assert(q.includes(title),`Quality KPI model missing ${title}`);
assert(l.includes("window.departmentWorkspace?.weeklyTargetText"),'Admin KPI mirror must use weekly target conversion');
for(const ref of ['department-workspace.js?v=268.0.0','quality-review.js?v=268.0.0','leader-center.js?v=268.0.0','app.js?v=268.0.0','kpi-master-v268.css?v=268.0.0']) assert(h.includes(ref),`missing v268 cache ref ${ref}`);
console.log('v268 PASS: KPI Master catalog, weekly targets, R&D-only Kabil exclusion, notification split, Kaizen wrapping, Quality master, Admin weekly mirror');
