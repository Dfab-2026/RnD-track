const fs=require('fs');
const daily=fs.readFileSync('quality-daily.js','utf8');
const review=fs.readFileSync('quality-review.js','utf8');
const checks=[
 ['Dashboard Daily Task card navigates to daily page',/data-qd-go="daily"/.test(daily)],
 ['Dashboard Weekly Task card navigates to weekly page',/data-qd-go="weekly"/.test(daily)],
 ['Dashboard no longer embeds detailed shared weekly panel',!/<h3>Shared Weekly Task<\/h3>/.test(daily)],
 ['Dashboard no longer embeds daily task light cards',! /qd-light-card/.test(daily)],
 ['Weekly workspace has proper weekly header',/Weekly Report Workspace/.test(review)],
 ['Weekly workspace has Audit KPI Training overview',/INTERNAL AUDIT/.test(review)&&/QUALITY KPI/.test(review)&&/TRAINING/.test(review)],
 ['Weekly tabs remain separate',/data-qw-tab="audit"/.test(review)&&/data-qw-tab="kpi"/.test(review)&&/data-qw-tab="training"/.test(review)]
];
let ok=true;for(const [name,pass] of checks){console.log((pass?'PASS ':'FAIL ')+name);if(!pass)ok=false}process.exit(ok?0:1);
