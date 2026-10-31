const fs=require('fs');
function ok(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const q=fs.readFileSync('quality.css','utf8');
const d=fs.readFileSync('department-workspace.css','utf8');
ok(q.includes('v213 — final dashboard graph-card height override'),'Quality final height override present');
ok(d.includes('v213 — final dashboard graph-card height override'),'Department final height override present');
ok(q.includes('min-height:430px!important')&&q.includes('min-height:310px!important'),'Quality graph card/chart visibly taller');
ok(d.includes('min-height:430px!important')&&d.includes('min-height:310px!important'),'Department graph card/chart visibly taller');
ok(q.lastIndexOf('v213 — final dashboard graph-card height override')>q.lastIndexOf('max-height:160px'),'Quality override comes after old cap');
ok(d.lastIndexOf('v213 — final dashboard graph-card height override')>d.lastIndexOf('max-height:160px'),'Department override comes after old cap');
