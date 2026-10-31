const fs=require('fs');
const must=(c,m)=>{if(!c)throw new Error(m)};
const qd=fs.readFileSync('quality-daily.js','utf8');
const dw=fs.readFileSync('department-workspace.js','utf8');
const qt=fs.readFileSync('quality-time.js','utf8');
const rt=fs.readFileSync('time-consume.js','utf8');
const fb=fs.readFileSync('firebase-cloud.js','utf8');
const lc=fs.readFileSync('leader-center.js','utf8');
for(const [name,s] of [['Quality dashboard',qd],['Department dashboard',dw],['R&D Datas',rt]]){
  must(s.includes('<span class="m-label">WEEK</span>'),name+' missing WEEK label');
  must(!s.includes('<span class="m-label">WEEKLY REPORT</span>'),name+' still has WEEKLY REPORT dashboard label');
}
for(const [name,s] of [['Quality Time Sheet',qt],['Shared Time Sheet',dw],['R&D Time Sheet',rt]]){
  must(s.includes('PO Number'),name+' missing PO Number');
  must(s.includes('po_number'),name+' missing PO field persistence/use');
}
must(!qt.includes('id="qtMonth"')&&!qt.includes('id="qtFilterMonth"'),'Quality Month controls still visible');
must(!dw.includes('id="dFilterMonth"')&&!dw.includes('name="month"'),'Shared Month controls still visible');
must(!rt.includes('id="rtcMonth"')&&!rt.includes('id="rtcFilterMonth"'),'R&D Month controls still visible');
must(fb.includes("put('Q',String(r.po_number||'')")&&fb.includes('po_number:v.Q'), 'Department Firebase PO codec missing');
must(fb.includes('po_number:d.Q')&&fb.includes('q:String(row?.po_number'), 'Quality/R&D Firebase PO codec missing');
must(lc.includes('<th>PO Number</th>')&&lc.includes("r.po_number||''"),'Admin Time Control PO linkage missing');
console.log('v208 WEEK + PO Number verification passed');
