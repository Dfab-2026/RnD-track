const fs=require('fs');
const leader=fs.readFileSync('leader-center.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const checks=[
 ['Excel button',leader.includes('id="lmDownloadExcel"')],
 ['Excel handler',leader.includes('downloadMembersExcel(e.currentTarget)')],
 ['All Members sheet',leader.includes("excelSheet('All Members',all)")],
 ['Department sheets',leader.includes('groups.map(g=>excelSheet(g.name,g.rows))')],
 ['Latest Firebase load',leader.includes('await window.rndCloud.loadDepartmentMembers(dept.key)')],
 ['Password secured status',leader.includes("r.has_password?'Set (secured)':'Not set'")],
 ['Excel download extension',leader.includes('DFAB-Member-Logins-${stamp}.xls')],
 ['Cache v232',index.includes('leader-center.js?v=232.0.0')]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++}process.exit(failed?1:0);
