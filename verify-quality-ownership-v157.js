const fs=require('fs');
const daily=fs.readFileSync('quality-daily.js','utf8');
const quality=fs.readFileSync('quality.js','utf8');
const review=fs.readFileSync('quality-review.js','utf8');
const checks=[
  ['Mohan only responsibility label', daily.includes("Mohan · Daily Task Update only")],
  ['Daily task owner fixed to Navarasu', daily.includes("person:taskOwner()") && daily.includes("taskOwner=()=>\'Navarasu\'")],
  ['Mohan editor tracked without ownership', daily.includes("last_edited_by:owner()")],
  ['Daily Idea owner fixed to Navarasu', daily.includes("kind:'daily_idea',person:taskOwner()")],
  ['Dashboard states Navarasu owns all work', daily.includes('Navarasu owns all Quality work records')],
  ['Mohan can view edit save shared weekly', daily.includes('View · Edit · Save same Navarasu record')],
  ['Mohan pending is Daily Task Update only', quality.includes('mohan_daily_task_update_')],
  ['No Mohan-owned daily task missing generator', !quality.includes("if(clean(name)==='navarasu')expected" )],
  ['KPI stays Navarasu-owned', review.includes('people=[reportOwner]')]
];
let ok=true; for(const [name,pass] of checks){console.log((pass?'PASS ':'FAIL ')+name); if(!pass)ok=false;} process.exit(ok?0:1);
