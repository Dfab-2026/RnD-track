const fs=require('fs');
const leader=fs.readFileSync('leader-center.js','utf8');
const css=fs.readFileSync('leader-center.css','utf8');
const checks=[
 ['Preview Excel button',leader.includes('id="lmDownloadExcel" type="button">Preview Excel</button>')],
 ['Preview opens before download',leader.includes('previewMembersExcel')&&leader.includes("dialog.showModal()")],
 ['Preview latest Firebase loader',leader.includes('loadMemberExcelRows')&&leader.includes('loadDepartmentMembers(dept.key)')],
 ['Preview table',leader.includes('member-excel-preview-table')&&leader.includes('<th>Department</th><th>Name</th><th>Role</th><th>Saved Password</th>')],
 ['Download only in preview',leader.includes('data-download')&&leader.includes('saveMembersExcel(catalog,all)')],
 ['Saved password shown in preview',leader.includes('<th>Saved Password</th>')&&leader.includes('${esc(r.password)}</td>')],
 ['Preview CSS',css.includes('.member-excel-preview-dialog')&&css.includes('.member-excel-preview-table-wrap')]
];
let failed=false;for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+' '+name);if(!ok)failed=true}if(failed)process.exit(1);console.log('VERIFY V233 PASSED');
