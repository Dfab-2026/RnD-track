const fs=require('fs');
const d=fs.readFileSync('department-workspace.js','utf8');
const q=fs.readFileSync('quality-time.js','utf8');
const r=fs.readFileSync('time-consume.js','utf8');
const a=fs.readFileSync('app.js','utf8');
function pass(name,cond){if(!cond)throw new Error('FAIL '+name);console.log('PASS '+name)}
const store=d.slice(d.indexOf('stores:['),d.indexOf('hradmin:['));
['Incoming Inspection','ERP ENTRY','Stock order','stock access','Internal communication','Kaizen','5S','No Work','Training','Meeting','Documentation','Leave'].forEach(x=>pass('Stores '+x,store.includes(x)));
pass('Stores Others',d.includes('option value="other">Others'));
pass('Shared AM/PM select',d.includes("name=\"from\" required>${timeOptions('09:00')}"));
pass('Quality AM/PM select',q.includes("id=\"qtFrom\" required>${timeOptions('09:00')}"));
pass('R&D AM/PM select',r.includes("id=\"rtcFrom\" required>${timeOptions('09:00')}"));
pass('Others manual shared',d.includes('f.elements.other.disabled=!yes'));
pass('Others manual Quality',q.includes("$('OtherTask').disabled=!other"));
pass('Others manual R&D',r.includes("$('rtcOtherTask').disabled=!other"));
pass('R&D weekly Time Sheet Summary',a.includes('data-rnd-weekly-tab="summary">Time Sheet Summary'));
pass('R&D weekly KPI Summary',a.includes('data-rnd-weekly-tab="kpi">Weekly KPI Status'));
pass('R&D weekly snapshot',r.includes('window.rndTimeWeeklySnapshot'));
console.log('v211 verification passed');
