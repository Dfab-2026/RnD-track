const fs=require('fs');
const d=fs.readFileSync('department-workspace.js','utf8');
const q=fs.readFileSync('quality-time.js','utf8');
const r=fs.readFileSync('time-consume.js','utf8');
const a=fs.readFileSync('app.js','utf8');
function ok(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
ok(d.includes("production:{name:'Welding Qualification'"),'Welding Qualification visible config');
ok(a.includes("const defaultDepartments=['Welding Qualification'"),'Department card renamed from Production');
ok(d.includes("if(n==='weldingqualification'||n==='production')return'production'"),'Welding alias preserves production Firebase key');
const expected={
 production:['Drawing Review','PWPS','Weld Data Book Creation','Material Indent Creation','Welding Trial','Quotation Preparation','Internal Communication / Followup','External Communication / Followup','Customer Visit','Vendor Visit','Reports','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work'],
 rfq:['Customer Communication','Lead Generation','Drawing Feasibility Review','Quotation Preparation','Vendor Discussion','Internal Communication / Followup','External Communication / Followup','Customer Visit','Vendor Visit','Reports','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work'],
 outsourcing:['ERP Entry','Material Indent Creation','Process Plan Creation','Supplier discussion','Supplier visit','Material procurement','Drawing review','Incoming Inspection','Inprocess Inspection','Final Inspection','Packing & Dispatch','Report preparation','Leave','Meetings','Internal Communication / Followup','External Communication / Followup','Kaizen Implementation','5S','Assembly and Verification','No Work'],
 purchase:['Material Sourcing','Material purchase','PO Creation','Internal Communication / Followup','External Communication / Followup','ERP Entry','Vendor place visit','Training','Meeting','5S','Kaizen','Leave','No Work'],
 hradmin:['Hiring','Documentation','Admin Activities','Training','Meeting','5S','Kaizen','Leave','No Work'],
 accounts:['Invoicing','DC','Reports','Customer Communication','Quotation','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work','Tally Entry'],
 finance:['Report Preparation','Compliance Activities','Tally Entry','ERP Entry','Payments','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work'],
 maintenance:['Zone Wise Audit','Maintaince','ERP Entry','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work'],
 digitalmarketing:['Market Research','Instagram Post','Linked-in Post','Youtube Upload','Website Update','Lead Generation','Reports','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work']
};
for(const [dept,tasks] of Object.entries(expected)){for(const t of tasks)ok(d.includes(`'${t.replaceAll("'","\\'")}'`),`${dept}: ${t}`)}
ok(d.includes("<option value=\"other\">Others</option>"),'Others remains in all generic department dropdowns');
for(const t of ['Incoming Inspection','Inprocess Inspection','Final Inspection','Report preparation','Documentation','Defect Verification','Customer Place Visit','Vendor Place visit','Training','Meeting','5S','Kaizen','Internal Communication / Followup','External Communication / Followup','Leave','No Work'])ok(q.includes(`label:'${t}'`),`Quality: ${t}`);
ok(q.includes("value:'other',label:'Others'"),'Quality Others preserved');
for(const t of ['Idea Generation','Market Research','Product research','Report preparation','Development Activity','Quality Check','Verification & Testing','Purchase','Documentation','Brainstroming','Internal Communication','Meeting','External Communication','ERP Entry','Leave','No Work'])ok(r.includes(`'${t}'`),`R&D: ${t}`);
ok(r.includes('<option value="other">Others</option>'),'R&D Others preserved');
ok(!r.includes("'Kaizen Implementation','5S','Assembly and Verification'"),'R&D dropdown matches supplied screenshot list');
console.log('v204 task master verification complete');
