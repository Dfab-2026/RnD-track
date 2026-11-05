const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/department-workspace.js','utf8');
assert(src.includes("outsourcing:['Sai','Sakthi','Venkatachala','Mithilesh']"),'Outsourcing approved names missing');
assert(src.includes("outsourcing:{sai:'lead',sakthi:'member',venkatachala:'member',mithilesh:'member'}"),'Outsourcing roles missing');
assert(src.includes("role==='lead'?'department_lead'"),'Lead Firebase audit role missing');
assert(src.includes("memberRoleLabel"),'Role profile label missing');
for(const n of ['Sai','Sakthi','Venkatachala','Mithilesh']) assert(new RegExp("['\\\"]"+n+"['\\\"]").test(src),n+' login missing');
console.log('PASS v193: Outsourcing login allows Sai lead + Sakthi/Venkatachala/Mithilesh members and stores role metadata.');
