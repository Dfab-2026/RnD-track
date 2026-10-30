const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const dept=fs.readFileSync('department-workspace.js','utf8');
const checks=[
 ['three authorized admins only',/const DEPARTMENT_ADMIN_NAMES=\['Kabil','Suresh Kumar','Pramod Kumar'\]/.test(app)],
 ['admin uses same existing login card',/const base=document\.querySelector\('#loginGate \.login-card'\)/.test(app)&&/cloneNode\(true\)/.test(app)],
 ['admin asks name only',!/select name="admin"/.test(app)&&/input\.placeholder='Enter your name'/.test(app)],
 ['wrong admin rejected',/Wrong \/ Not authorized/.test(app)],
 ['admin session persists until logout',/localStorage\.setItem\(DEPARTMENT_ADMIN_KEY/.test(app)&&/localStorage\.removeItem\(DEPARTMENT_ADMIN_KEY\)/.test(app)],
 ['admin all-department bypass retained',/if\(departmentAdminActive\(\)\)\{const visitor=state\.members/.test(app)],
 ['generic departments have explicit member allowlists',/const MEMBER_ACCESS=\{production:\[\],npd:\[\],rfq:\[\]/.test(dept)],
 ['generic arbitrary name login blocked',/const input=new FormData\(e\.currentTarget\)\.get\('name'\)\.trim\(\),name=resolveMember\(input\)/.test(dept)],
 ['unconfigured department access reports pending setup',/Member access is not configured yet\./.test(dept)],
 ['saved generic login revalidated',/member=adminView\(\)\?window\.adminSession\.name\(\):resolveMember\(saved\)/.test(dept)],
];
let bad=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)bad++}process.exitCode=bad?1:0;
