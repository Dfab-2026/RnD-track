const fs=require('fs');
const daily=fs.readFileSync('quality-daily.js','utf8');
const review=fs.readFileSync('quality-review.js','utf8');
const checks=[
 ['Dashboard derives one shared weekly status from Navarasu records', /function sharedWeeklyStatus\(date=today\(\)\)/.test(daily) && /sameMember\(r\.person,'Navarasu'\)/.test(daily)],
 ['Dashboard explicitly identifies Navarasu as weekly owner', /<strong>Owner<\/strong><span>Navarasu<\/span>/.test(daily)],
 ['Mohan has view edit save access to the same weekly record', /Mohan access<\/strong><span>View · Edit · Save same Navarasu record/.test(daily)],
 ['Dashboard opens the shared Weekly Report for editing', /data-qd-go="weekly"/.test(daily)],
 ['Weekly department saves remain Navarasu-owned', /person:reportOwner/.test(review) && /const members=\['Navarasu','Mohan'\],reportOwner='Navarasu'/.test(review)],
 ['Mohan can edit the same shared training record', /kind==='training'\?`<button[^`]+data-qw-edit/.test(review) && /if\(!r\)return;for\(const k of \['candidate'/.test(review)]
];
let ok=true; for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'} ${name}`); if(!pass)ok=false;} process.exit(ok?0:1);
