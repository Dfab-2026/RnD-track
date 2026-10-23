const fs=require('fs');
const vm=require('vm');
const files=['app.js','firebase-cloud.js','notification-sw.js'];
let failed=false;
for(const f of files){try{new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});console.log('PASS syntax:',f)}catch(e){failed=true;console.error('FAIL syntax:',f,e.message)}}
const html=fs.readFileSync('index.html','utf8');
for(const id of ['appShell','dashboardMetrics','weeklySetup','teamChatForm']){const n=(html.match(new RegExp(`id=["']${id}["']`,'g'))||[]).length;if(n!==1){failed=true;console.error('FAIL id:',id,'count',n)}else console.log('PASS id:',id)}
const rules=fs.readFileSync('firestore.rules','utf8');
if(!rules.includes('match /team_chat/{messageId}')||!rules.includes('allow read, create: if isSignedIn();')){failed=true;console.error('FAIL chat rules')}else console.log('PASS chat rules');

const cloud=fs.readFileSync('firebase-cloud.js','utf8');
for(const [name,needle] of [
 ['week dropdown delete','deleteSelectedWeekBtn'],
 ['chat v2 app_meta',"doc(CHAT_DOC)"],
 ['chat transaction','runTransaction'],
 ['chat compact limit','CHAT_LIMIT=80']
]){
 const hay=name==='week dropdown delete'?html:cloud;
 if(!hay.includes(needle)){failed=true;console.error('FAIL',name)}else console.log('PASS',name);
}


const v89html=fs.readFileSync('index.html','utf8');
const v89cloud=fs.readFileSync('firebase-cloud.js','utf8');
for(const [name,ok] of [
 ['hidden right chat card removed',!v89html.includes('class="chat-live-state"')],
 ['visible composer Firebase status',v89html.includes('team-chat-inline-status')],
 ['server read-back verification',v89cloud.includes("ref.get({source:'server'})")],
 ['Firebase confirmation error',v89cloud.includes('Message was not confirmed in Firebase')]
]){
 if(!ok){failed=true;console.error('FAIL',name)}else console.log('PASS',name);
}

console.log(failed?'VERIFY FAILED':'VERIFY PASSED');
process.exit(failed?1:0);
