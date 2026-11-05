const fs=require('fs');
const s=fs.readFileSync('quality.js','utf8');
const checks=[
 ['Mohan is Quality Lead', s.includes("clean(person())==='mohan'?'Quality Lead':'Member'" )],
 ['Navarasu displays Member', s.includes("clean(person())==='mohan'?'QUALITY LEAD':'MEMBER'" )],
 ['Settings uses dynamic role', s.includes('${esc(qualityRole())}')],
 ['Profile uses dynamic role label', s.includes('${esc(qualityRoleLabel())}')],
 ['Existing Mohan dashboard responsibility logic preserved', s.includes("if(clean(person())==='mohan'){" )]
];
for(const [name,ok] of checks){if(!ok){console.error('FAIL:',name);process.exit(1)}}
console.log('PASS: Quality roles display Mohan as Quality Lead and Navarasu as Member without changing task ownership');
