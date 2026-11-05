const fs=require('fs'),vm=require('vm'),assert=require('assert');const src=fs.readFileSync(__dirname+'/app.js','utf8');const ctx=vm.createContext({});
vm.runInContext(src.slice(src.indexOf('const TRACKER_TIME_SLOTS='),src.indexOf('function trackerProgressColor(')),ctx);
vm.runInContext(src.slice(src.indexOf('function trackerSheetRows('),src.indexOf('function insertManualTrackerRow(')),ctx);
for(const [start,end,count] of [['2026-10-22','2026-10-31',10],['2026-10-26','2026-10-26',1],['2026-10-28','2026-11-03',7],['2028-02-27','2028-03-01',4]]){
 ctx.p={start_date:start,end_date:end,tracker_rows:[]};const dates=vm.runInContext('trackerPeriodDates(p)',ctx);assert.equal(dates.length,count);assert.equal(vm.runInContext('trackerSheetRows(p).length',ctx),count);
 ctx.p.tracker_rows=Array.from({length:count},(_,row_index)=>({row_index,status:'completed',date:dates[row_index]}));assert.equal(vm.runInContext('trackerDerivedProgress(p)',ctx),100);
 ctx.p.tracker_rows[count-1].status='';assert(vm.runInContext('trackerDerivedProgress(p)',ctx)<100);
 ctx.p.tracker_rows.push({row_index:count,manual_extra:true,task:'Manual entry',time_slots:{0:{task:'Saved duration'}}});const rows=vm.runInContext('trackerSheetRows(p)',ctx);assert.equal(rows.length,count+1);assert.equal(rows[count].time_slots[0].task,'Saved duration');
}
assert.equal(vm.runInContext("trackerDateRange('2026-10-28','2026-10-22').length",ctx),0);
console.log('PASS: inclusive heading date range, one-day/month-boundary/leap-year ranges, all date rows default, completion across range, preserved manual/timing rows');
