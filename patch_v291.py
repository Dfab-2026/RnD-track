from pathlib import Path
p=Path('department-workspace.js');s=p.read_text()
old="monthTarget=workdays(month.start,month.end)*480,todayKaizen=kaizenKpiStats({start:today,end:today});"
new="adminTeamSize=adminView()?Math.max(1,kpiMemberNames().length):1,monthTarget=workdays(month.start,month.end)*480*adminTeamSize,todayKaizen=kaizenKpiStats({start:today,end:today});"
assert old in s;s=s.replace(old,new,1)
s=s.replace('<small>Target 8h</small></button><button class="metric qd-dashboard-link" data-go="weekly"><span class="m-label">WEEK</span><strong>${fmtHours(weekMin)}h</strong><small>Target 48h</small>', '<small>Target ${fmtHours(8*adminTeamSize)}h</small></button><button class="metric qd-dashboard-link" data-go="weekly"><span class="m-label">WEEK</span><strong>${fmtHours(weekMin)}h</strong><small>Target ${fmtHours(workdays(week.start,week.end)*8*adminTeamSize)}h</small>',1)
# Restrict selectable clock values to working day while preserving 6PM as a final selection.
old='for(let n=9*60;n<24*60;n+=15)';assert old in s;s=s.replace(old,'for(let n=9*60;n<=18*60;n+=15)',1)
p.write_text(s)
p=Path('quality-time.js');s=p.read_text();assert old in s;s=s.replace(old,'for(let n=9*60;n<=18*60;n+=15)',1);p.write_text(s)
# In admin quality workspace the dashboard is controlled by the parent context; no change to employee totals.
p=Path('quality-daily.js');s=p.read_text()
# Do not modify Quality employee-only hours until admin context is verified.
# Team Kaizen KPI needs a weekly member multiplier in admin report, not member view.
p=Path('leader-center.js');s=p.read_text()
old="isKaizen?Math.min(100,Math.round(kaizenRows.length/(Math.max(1,5))*100)):0;"
new="isKaizen?Math.min(100,Math.round(kaizenRows.length/(Math.max(1,(period==='weekly'?5:20)*memberCount))*100)):0;"
assert old in s;s=s.replace(old,new,1)
old="return{name:k[0],target,actual:old?.actual??(isKaizen?kaizenRows.length:isAttendance?attendanceDays:''),percent:pct"
new="return{name:k[0],target:isKaizen?String((period==='weekly'?5:20)*memberCount)+' ideas ('+memberCount+' members)':target,actual:old?.actual??(isKaizen?kaizenRows.length:isAttendance?attendanceDays:''),percent:pct"
assert old in s;s=s.replace(old,new,1)
# R&D unified Kaizen metric should actually count marked Kaizen, not just problem text.
old="value:ideas.filter(i=>String(i.problem||'').trim()).length,target:weekly?5:20,detail:'Shared · 5 ideas/week from all four members’ Problem / Observation entries.'"
new="value:ideas.filter(i=>String(i.idea_type||'').toLowerCase()==='kaizen').length,target:(weekly?5:20)*Math.max(1,members.length),detail:'Marked Kaizen ideas only · 5 per member per week; team target scales with active members.'"
assert old in s;s=s.replace(old,new,1)
p.write_text(s)
print('Patched team target, weekly kaizen, and time dropdown limits')
