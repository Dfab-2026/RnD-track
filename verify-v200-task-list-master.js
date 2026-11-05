const fs=require('fs');
const dept=fs.readFileSync('department-workspace.js','utf8');
const quality=fs.readFileSync('quality-time.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const expected={
 outsourcing:['ERP Entry','Material Indent Creation','Process Plan Creation','Supplier discussion','Supplier visit','Material procurement','Drawing review','Incoming Inspection','Inprocess Inspection','Final Inspection','Packing & Dispatch','Report preparation','Leave','Meetings','Internal Communication / Followup','External Communication / Followup','Kaizen Implementation','5S','Assembly and Verification','No Work'],
 purchase:['Material Sourcing','Material purchase','PO Creation','Internal Communication / Followup','External Communication / Followup','ERP Entry','Vendor place visit','Training','Meeting','5S','Kaizen','Leave','No Work'],
 hradmin:['Hiring','Documentation','Admin Activities','Training','Meeting','5S','Kaizen','Leave','No Work'],
 accounts:['Invoicing','DC','Reports','Customer Communication','Quotation','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work','Tally Entry'],
 finance:['Report Preparation','Compliance Activities','Tally Entry','ERP Entry','Payments','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work'],
 maintenance:['Zone Wise Audit','Maintaince','ERP Entry','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work'],
 digitalmarketing:['Market Research','Instagram Post','Linked-in Post','Youtube Upload','Website Update','Lead Generation','Reports','Customer Visit','Training','Meeting','5S','Kaizen','Leave','No Work']
};
for(const [key,list] of Object.entries(expected)){
  must(dept.includes(`${key}:[`),`Missing master task block for ${key}`);
  for(const label of list)must(dept.includes(`'${label.replaceAll("'","\\'")}'`)||dept.includes(label),`Missing ${key} task: ${label}`);
}
must(dept.includes("const taskDefs=()=>{const base=cfg.kpis.map"),'Existing KPI task definitions must be preserved');
must(dept.includes("<option value=\"other\">Others</option>"),'Others missing from shared department dropdown');
for(const label of ['Incoming Inspection','In-Process Inspection','Final Inspection','Report preparation','Documentation','Defect Verification','Customer Place Visit','Vendor Place visit','Training','Meeting','5S','Kaizen','Internal Communication / Followup','External Communication / Followup','Leave','No Work','Others'])must(quality.includes(`label:'${label}'`)||quality.includes(`label:\"${label}\"`),`Quality missing task: ${label}`);
must(quality.includes("value:'other',label:'Others'"),'Quality Others missing');
must(html.includes('quality-time.js?v=200.0.0'),'Quality Time Sheet cache version not bumped');
must(html.includes('department-workspace.js?v=200.0.0'),'Department workspace cache version not bumped');
console.log('v200 Task List Master dropdown verification passed.');
