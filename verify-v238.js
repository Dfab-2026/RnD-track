const fs=require('fs');
const files={index:'index.html',app:'app.js',quality:'quality-login.js',dept:'department-workspace.js',leader:'leader-center.js',styles:'styles.css'};
const s=Object.fromEntries(Object.entries(files).map(([k,f])=>[k,fs.readFileSync(f,'utf8')]));
function ok(cond,msg){if(!cond){console.error('FAIL:',msg);process.exitCode=1}else console.log('PASS:',msg)}
ok(s.index.includes('id="loginPassword" type="text" class="secure-password-entry"')&&s.index.includes('data-secure-entry="password"'),'R&D login uses masked internal secure entry');
ok(s.quality.includes("querySelector('[data-secure-entry=\"password\"]')"),'Quality login targets secure entry');
ok(s.dept.includes('name="password" type="text" class="secure-password-entry"'),'Shared department login uses secure entry');
ok(s.app.includes("querySelector('[data-secure-entry=\"password\"]')?.closest('label')?.remove()"),'Admin name-only login still removes password field');
ok(s.leader.includes('data-password type="text" class="secure-password-entry"'),'Manage Members password fields use secure entry');
ok(s.styles.includes('.secure-password-entry{-webkit-text-security:disc}'),'Secure entry remains visually masked');
ok(!/type="password"/.test(s.index+s.app+s.quality+s.dept+s.leader),'Password Manager-detectable password inputs removed from affected flows');
if(!process.exitCode)console.log('VERIFY V238 PASSED');
