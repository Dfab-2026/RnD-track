const fs=require('fs');
const qt=fs.readFileSync('quality-time.js','utf8');
const app=fs.readFileSync('app.js','utf8');
const must=[
  "value:'daily_incoming_inspection',label:'Incoming Inspection'",
  "value:'daily_inprocess_inspection',label:'In-Process Inspection'",
  "value:'daily_final_inspection',label:'Final Inspection'",
  "LEGACY_TASK_LABELS={daily_inspection:'Incoming / In-process / Final Inspection'}"
];
for(const x of must) if(!qt.includes(x)) throw new Error('Missing Quality Time Sheet task: '+x);
if(qt.includes("{group:'Daily',value:'daily_inspection',label:'Incoming / In-process / Final Inspection'}")) throw new Error('Combined inspection task is still selectable');
if(!app.includes("if(isRndDepartment(department)){const saved=storedLogin();if(saved?.role==='visitor')clearLogin();return false}")) throw new Error('R&D admin exception missing');
if(!app.includes("if(normalizeName(department.name)==='quality')")) throw new Error('Quality direct admin route missing');
if(!app.includes("if(generic){window.closeProduction?.();window.departmentWorkspace.open(department);return true}")) throw new Error('Shared department direct admin route missing');
console.log('v188 Quality inspection tasks + admin routing OK');
