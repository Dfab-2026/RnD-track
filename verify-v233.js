const fs=require('fs');
const leader=fs.readFileSync('leader-center.js','utf8');
const css=fs.readFileSync('leader-center.css','utf8');
const checks=[
 ['Preview Excel button',leader.includes('id="lmDownloadExcel" type="button">Preview Excel</button>')],
 ['Preview opens before download',leader.includes('previewMembersExcel')&&leader.includes("dialog.showModal()")],
 ['Preview latest Firebase loader',leader.includes('loadMemberExcelRows')&&leader.includes('loadDepartmentMembers(dept.key)')],
 ['Preview table',leader.includes('member-excel-preview-table')&&leader.includes('<th>Department</th><th>Name</th><th>Role</th><th>Password</th>')],
 ['Download only in preview',leader.includes('data-download')&&leader.includes('saveMembersExcel(catalog,all)')],
 ['Secured password status preserved',leader.includes("r.has_password?'Set (secured)':'Not set'")],
 ['Preview CSS',css.includes('.member-excel-preview-dialog')&&css.includes('.member-excel-preview-table-wrap')]
];
let failed=false;for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+' '+name);if(!ok)failed=true}if(failed)process.exit(1);console.log('VERIFY V233 PASSED');
