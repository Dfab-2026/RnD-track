const fs=require('fs');
const p='firebase-config.js';
const s=fs.readFileSync(p,'utf8');
if(/PASTE_API_KEY|PASTE_PROJECT_ID|PASTE_APP_ID/.test(s)){
  console.error('FIREBASE CONFIG MISSING');
  console.error('Run SETUP-FIREBASE.bat once, then run this check again.');
  process.exit(1);
}
for(const key of ['apiKey','projectId','appId']){
  if(!s.includes(key)){console.error('Missing Firebase key:',key);process.exit(1)}
}
console.log('PASS: Firebase Web config is present.');
