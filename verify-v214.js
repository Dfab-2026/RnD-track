const fs=require('fs');
function ok(v,m){if(!v)throw Error(m)}
const r=fs.readFileSync('time-consume.js','utf8');
const q=fs.readFileSync('quality-time.js','utf8');
const d=fs.readFileSync('department-workspace.js','utf8');
const c=fs.readFileSync('time-consume.css','utf8');
for(const [name,s] of [['R&D',r],['Quality',q],['Shared',d]]){
  ok(s.includes('PO number / NA / NO PO'),name+' PO fallback hint missing');
  ok(!s.includes('placeholder="Enter PO number" required'),name+' old PO placeholder still used');
  ok(s.includes('tc-clock-field'),name+' manual clock field missing');
}
ok(r.includes('data-rnd-clock')&&r.includes('openClock($(b.dataset.rndClock))'),'R&D clock dial binding missing');
ok(q.includes('data-qt-clock')&&q.includes('window.rndTimeClock'),'Quality clock dial binding missing');
ok(d.includes('data-d-clock')&&d.includes('window.rndTimeClock'),'Shared clock dial binding missing');
ok(r.includes("hour=(value%12)+(hour>=12?12:0)")&&r.includes("[data-period]"),'Animated hour/minute AM/PM dial missing');
ok(c.includes('v214 manual animated clock fields'),'Clock control CSS missing');
console.log('PASS: v214 PO fallback + animated manual clock picker');
