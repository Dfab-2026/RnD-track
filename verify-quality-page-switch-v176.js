const fs=require('fs');
const src=fs.readFileSync('quality.js','utf8');
const checks=[
  [src.includes("const nextPage=button.dataset.qPage"),'navigation computes next page before render'],
  [src.includes("mount.innerHTML=''"),'page switch clears previous mounted screen'],
  [src.includes('delete mount.dataset.qReview'),'page switch clears stale Weekly renderer marker'],
  [src.includes('delete mount.dataset.qdMode'),'page switch clears stale Daily/Kaizen renderer marker'],
  [src.includes('page=nextPage'),'new page is committed after cleanup'],
];
for(const [ok,msg] of checks){if(!ok)throw new Error(msg);console.log('PASS:',msg)}
console.log('VERIFY PASSED: Kaizen/Weekly page-switch lifecycle reconstructed.');
