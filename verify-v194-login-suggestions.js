const fs=require('fs');
const dept=fs.readFileSync(__dirname+'/department-workspace.js','utf8');
const quality=fs.readFileSync(__dirname+'/quality-login.js','utf8');
const app=fs.readFileSync(__dirname+'/app.js','utf8');
function ok(v,m){if(!v){console.error('FAIL:',m);process.exit(1)}}
ok(dept.includes("id=\"dLoginSuggestion\""),'department suggestion host');
ok(dept.includes('Did you mean <b></b>?'),'department did-you-mean UI');
ok(dept.includes('suggestedMember(value)'),'department fuzzy matcher');
ok(dept.includes("Venkatachala")&&dept.includes("Mithilesh"),'outsourcing approved names retained');
ok(quality.includes('const suggest=value=>'),'Quality fuzzy suggestion');
ok(quality.includes('const match=suggest(input.value);'),'Quality uses fuzzy suggestion');
ok(app.includes("function departmentAdminLogin(name)")&&app.includes("Wrong / Not authorized"),'Admin remains strict');
ok(!app.includes('suggestedAdmin'),'Admin has no fuzzy suggestion helper');
console.log('PASS v194: normal department logins suggest close approved names while Admin login stays exact.');
