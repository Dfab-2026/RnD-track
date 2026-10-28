const fs=require('fs');
const vm=require('vm');
const files=['app.js','firebase-cloud.js','notification-sw.js','kpi-chat.js','kpi-pdf.js','responsive.js','daily-sheet-reminder.js'];
let failed=false;
for(const f of files){try{new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});console.log('PASS syntax:',f)}catch(e){failed=true;console.error('FAIL syntax:',f,e.message)}}
const html=fs.readFileSync('index.html','utf8');
for(const id of ['appShell','dashboardMetrics','weeklySetup','teamChatForm']){const n=(html.match(new RegExp(`id=["']${id}["']`,'g'))||[]).length;if(n!==1){failed=true;console.error('FAIL id:',id,'count',n)}else console.log('PASS id:',id)}
const rules=fs.readFileSync('firestore.rules','utf8');
if(!rules.includes('match /team_chat/{messageId}')||!rules.includes('allow read, create: if isSignedIn();')){failed=true;console.error('FAIL chat rules')}else console.log('PASS chat rules');
console.log(failed?'VERIFY FAILED':'VERIFY PASSED');
process.exit(failed?1:0);
