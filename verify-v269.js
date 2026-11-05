const fs=require('fs');
const assert=require('assert');
const d=fs.readFileSync('department-workspace.js','utf8');
const h=fs.readFileSync('index.html','utf8');
assert(d.includes("const kpiMemberNames=()=>[...new Set((memberDirectoryLoaded?memberDirectory.filter(x=>x.active!==false&&Number(x.active)!==0&&String(x.role||'member')!=='visitor').map(x=>x.name):allowedMembers()).filter(name=>name))]"),'KPI contributor list must include every active non-visitor member, including Kabil in R&D');
assert(!d.includes("deptKey!=='rnd'||norm(name)!=='kabil'"),'R&D KPI contributor list must no longer exclude Kabil');
assert(d.includes("if(norm(name)==='kabil')return'lead'"),'Kabil must remain Lead');
assert(h.includes('department-workspace.js?v=269.0.0'),'v269 cache reference missing');
console.log('v269 PASS: Kabil remains R&D Lead and is included in R&D KPI/member count.');
