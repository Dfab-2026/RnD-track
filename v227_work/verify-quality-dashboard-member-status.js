const fs=require('fs');
const s=fs.readFileSync('quality-daily.js','utf8');
const checks=[
 ['Mohan only responsibility is Daily Task Update', /Mohan · Daily Task Update only/.test(s)],
 ['Navarasu remains task owner', /Navarasu · Quality task owner/.test(s) && /taskOwner=\(\)=>'Navarasu'/.test(s)],
 ['Mohan dashboard target is one', /myTarget=myIsMohan\?1:3/.test(s)],
 ['Mohan completion follows shared daily task updates', /dailyUpdateComplete=dailyUpdated===tasks\.length/.test(s)],
 ['Weekly work is Navarasu owned and Mohan can edit', /Owned and counted under Navarasu · Mohan can view\/edit/.test(s)]
];
let ok=true; for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'} ${name}`); if(!pass)ok=false;} process.exit(ok?0:1);
