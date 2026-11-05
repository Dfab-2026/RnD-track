const fs=require('fs');
const s=fs.readFileSync('quality-review.js','utf8');
const checks=[
 ['ISO KPI counts completed departments cumulatively', /departmentCount\('iso',ranges\.quarter\)/.test(s)],
 ['ISO selector excludes already-completed departments', /remainingIso=item\.iso\?depts\(\)\.filter\(d=>!completedIso\.has/.test(s)],
 ['ISO card shows completed department summary', /kpi105-iso-summary/.test(s) && /completedIso\.size/.test(s)],
 ['ISO save always marks selected remaining department completed', /status:'completed'/.test(s) && /'iso_'\+item\.scope\.start\+'_'\+department/.test(s)],
 ['ISO save remains Navarasu-owned shared KPI data', /kind:'iso',person:reportOwner/.test(s)]
];
let ok=true; for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'} ${name}`); if(!pass)ok=false;} process.exit(ok?0:1);
