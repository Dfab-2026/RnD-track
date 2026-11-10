const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'firebase-cloud.js'),'utf8');
const block=source.match(/  function encodeDepartmentRecord\(row\)\{[\s\S]*?\n  async function saveDepartmentRecord/);
assert(block,'Expected shared department serializer section');
const body=block[0].replace(/\n  async function saveDepartmentRecord$/,'');
const sandbox={Date,Number,String,Math,tsToNumber:()=>Date.now(),numberToIso:()=>new Date().toISOString()};
vm.createContext(sandbox);vm.runInContext(body,sandbox);
const {encodeDepartmentRecord:encode,decodeDepartmentRecord:decode}=sandbox;
function roundTrip(id,data){return decode({id,data:()=>({v:encode(data)})});}
let saved=roundTrip('dept_quality_kpi_task_title_abc',{type:'kpi_task_title',original:'ISO Process Implementation',title:'ISO Compliance Implementation',actor_role:'all_departments_leader'});
assert.equal(saved.type,'kpi_task_title');
assert.equal(saved.original,'ISO Process Implementation');
assert.equal(saved.title,'ISO Compliance Implementation');
saved=roundTrip('dept_quality_kpi_target_standard_abc',{type:'kpi_target_standard',original:'ISO Process Implementation',standard:'Complete ISO certification in 90 days'});
assert.equal(saved.original,'ISO Process Implementation');
assert.equal(saved.standard,'Complete ISO certification in 90 days');
const regular={type:'timesheet',member:'Mohan',date:'2026-11-10',task:'Inspection',minutes:90,status:'completed'};
const regularRaw=encode(regular);
assert(!('O' in regularRaw)&&!('T' in regularRaw)&&!('S' in regularRaw),'Do not change other records');
const regularRead=roundTrip('dept_quality_normal',regular);
assert.equal(regularRead.minutes,90);assert.equal(regularRead.member,'Mohan');
assert.equal(regularRead.original,undefined);
const editor=fs.readFileSync(path.join(__dirname,'kpi-task-editor-v295.js'),'utf8');
let docs=[];let writes=0;const cloud={
  loadDepartmentRecordsOnce:async()=>docs,
  saveDepartmentRecord:async(dept,id,row)=>{
    assert.equal(dept,'quality');writes++;
    const reconstructed=roundTrip(`dept_${dept}_${id}`,row);
    docs=docs.filter(x=>x.id!==reconstructed.id).concat(reconstructed);
    return reconstructed;
  }
};
const editorSandbox={window:{rndCloud:cloud,adminSession:{active:()=>true,name:()=> 'Admin'}},console,Map,Date,Math,encodeURIComponent,unescape};
vm.createContext(editorSandbox);vm.runInContext(editor,editorSandbox);
(async()=>{
 const k=editorSandbox.window.kpiTaskTitles;
 assert.equal(await k.save('quality','ISO Process Implementation','ISO Compliance Implementation'),'ISO Compliance Implementation');
 assert.equal(await k.saveStandard('quality','ISO Process Implementation','90 day certification'),'90 day certification');
 assert.equal(writes,2);
 assert.equal((await k.load('quality',true)).get('ISO Process Implementation'),'ISO Compliance Implementation');
 assert.equal((await k.loadStandards('quality',true)).get('ISO Process Implementation'),'90 day certification');
 console.log('PASS v300: both KPI fields survive compact Firestore serialization, server-style readback, and editor confirmation; normal timesheets unchanged');
})().catch(e=>{console.error(e);process.exitCode=1});
