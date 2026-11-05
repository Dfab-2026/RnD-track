const fs=require('fs'),assert=(v,m)=>{if(!v)throw new Error(m)};
const rnd=fs.readFileSync(__dirname+'/time-consume.js','utf8');
const quality=fs.readFileSync(__dirname+'/quality.js','utf8');
const qualityTime=fs.readFileSync(__dirname+'/quality-time.js','utf8');
const production=fs.readFileSync(__dirname+'/production.js','utf8');
const app=fs.readFileSync(__dirname+'/app.js','utf8');
for(const [name,src,prefix] of [['R&D',rnd,'timesheet-hourly:rnd'],['Quality',quality,'timesheet-hourly:quality'],['Production',production,'timesheet-hourly:production']]){
  assert(src.includes(prefix),`${name} must use a per-hour persistent reminder key`);
  assert(src.includes("now.getHours()<9")&&src.includes("now.getHours()>17"),`${name} must use the 09:00–17:59 workday reminder window`);
  assert(src.includes('Time Sheet Reminder')||src.includes('Update your Time Sheet'),`${name} must show a Time Sheet reminder message`);
}
assert(quality.includes("$('Time')?.click()"),'Quality reminder must open the Quality Time Sheet from any Quality page');
assert(rnd.includes("showPage('timeconsume')"),'R&D reminder must open the R&D Time Sheet');
assert(!qualityTime.includes("qualityTimeReminder:"),'Quality Time Sheet must not retain the old duplicate page-only reminder');
assert(rnd.includes("typeof notificationsEnabled==='function'")&&quality.includes("typeof notificationsEnabled==='function'")&&production.includes("typeof notificationsEnabled==='function'"),'All active departments must also use Chrome notifications when enabled');
assert(app.includes('pending-popup:rnd:${member.id}:${today()}:${new Date().getHours()}')&&app.includes("localStorage.setItem(hourKey,'1')"),'R&D pending popup must be limited to once per member per hour across reloads');
assert(quality.includes('pending-popup:quality:${clean(member)}:${today()}:${new Date().getHours()}')&&quality.includes("localStorage.setItem(hourKey,'1')"),'Quality pending popup must be limited to once per member per hour across reloads');
assert(!app.includes('pendingPopupShownThisOpen')&&!quality.includes('pendingPopupShownThisOpen'),'Pending popup frequency must not be limited only by the current page session');
console.log('Hourly Time Sheet reminders verified for R&D, Quality, and Production.');
