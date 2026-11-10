from pathlib import Path
# exclude admin lead Kabil from non-R&D department timesheet targets
p=Path('department-workspace.js');s=p.read_text()
s=s.replace("Math.max(1,kpiMemberNames().length):1,monthTarget=", "Math.max(1,kpiMemberNames().filter(name=>deptKey==='rnd'||norm(name)!=='kabil').length):1,monthTarget=",1)
p.write_text(s)
# Add total team period goal to admin summary; daily grouped details stay unchanged.
p=Path('leader-center.js');s=p.read_text()
old="const total=filtered.reduce((s,r)=>s+(Number(r.minutes)||0),0),days=new Set(filtered.map(r=>r.date)).size,completed=filtered.filter(r=>r.status==='completed').length,head=selectedPerson==='all'?'Overall · All members':selectedPerson||'Select a person';"
new="""const total=filtered.reduce((s,r)=>s+(Number(r.minutes)||0),0),days=new Set(filtered.map(r=>r.date)).size,completed=filtered.filter(r=>r.status==='completed').length,head=selectedPerson==='all'?'Overall · All members':selectedPerson||'Select a person';
    const countedMembers=selectedPerson==='all'?Math.max(1,persons.filter(n=>dept==='R&D'||String(n).trim().toLowerCase()!=='kabil').length):1;
    const workingDays=(start,end)=>{let n=0;for(let d=new Date(start+'T12:00:00');d<=new Date(end+'T12:00:00');d.setDate(d.getDate()+1))if(d.getDay()!==0)n++;return n};
    const [yearNum,monthNum]=month.split('-').map(Number),daysExpected=exactDate?1:scope==='all'?days:workingDays(`${month}-01`,`${month}-${String(new Date(yearNum,monthNum,0).getDate()).padStart(2,'0')}`);
    const totalTargetMinutes=daysExpected*480*countedMembers;
"""
assert old in s;s=s.replace(old,new,1)
old='<strong>${(total/60).toFixed(2)}h</strong><small>${timeDuration(total)}</small>'
new='<strong>${timeDuration(total)} / ${timeDuration(totalTargetMinutes)}</strong><small>${countedMembers} counted person${countedMembers===1?\'\':\'s\'} · ${daysExpected} day${daysExpected===1?\'\':\'s\'} · ${timeDuration(Math.max(0,totalTargetMinutes-total))} remaining</small>'
assert old in s;s=s.replace(old,new,1)
p.write_text(s)
# monthly archive: human-readable per-person record counts + type breakdown
p=Path('backup-tools.js');s=p.read_text()
old="entry.minutes+=minutes;entry.records++;if(r.status==='completed')"
new="entry.minutes+=minutes;entry.records++;if(r.status==='completed')"
assert old in s
# Replace simple time-only people map with per-person summary.
start=s.index('    const people=new Map();for(const r of timeRows)');end=s.index('    need(86);',start)
replacement="""    const people=new Map();
    const personName=r=>String(r.member||r.submitted_by_name||r.owner||r.person||r.actor_name||'Unassigned').trim()||'Unassigned';
    const personRow=r=>{const name=personName(r),row=people.get(name)||{minutes:0,records:0,completed:0,inProgress:0,pending:0,kaizen:0,innovation:0,otherIdeas:0,kpis:0};people.set(name,row);return row};
    for(const r of timeRows){const row=personRow(r);row.minutes+=Number(r.minutes)||0;row.records++;if(r.status==='completed')row.completed++;else if(r.status==='in_progress')row.inProgress++;else if(r.status==='pending')row.pending++}
    for(const r of ideaRows){const row=personRow(r),kind=String(r.idea_type||r.type||r.kind||'').toLowerCase();if(kind==='kaizen'||kind==='daily_idea')row.kaizen++;else if(kind==='innovation')row.innovation++;else row.otherIdeas++}
    for(const r of kpiRows)personRow(r).kpis++;
"""
s=s[:start]+replacement+s[end:]
old="text(`${(v.minutes/60).toFixed(v.minutes%60?1:0)}h · ${v.records} records · ${v.completed} completed · ${v.inProgress} in progress · ${v.pending} pending`,P+280,y+10,14,'#5d748b');y+=54"
new="text(`${(v.minutes/60).toFixed(2)}h · ${v.records} time entries · Kaizen ${v.kaizen} · Innovation ${v.innovation}`,P+280,y+6,13,'#5d748b');text(`${v.completed} completed · ${v.inProgress} in progress · ${v.pending} pending · KPI ${v.kpis}`,P+280,y+28,12,'#5d748b');y+=54"
assert old in s;s=s.replace(old,new,1)
# download followed by explicit offer to verify & delete; no automatic cleanup.
old="await refresh();\n      }catch(error){status.textContent=error.message||'Backup failed. No deletion is permitted.'}"
new="""await refresh();
        if(window.confirm(`Archive downloads started for ${label} ${m}. AFTER you have verified that both PDF and JSON are safely saved, would you like to review optional Firebase cleanup? Choose Cancel to keep everything.`)){
          const matching=(await window.rndCloud.loadBackupHistory(key)).find(x=>x.month===m&&x.fingerprint===fingerprint&&!x.deleted_at);
          if(matching?.id)await deleteBackedMonth(m,matching.id,history.querySelector(`[data-history-id="${CSS.escape(matching.id)}"]`));
        }
      }catch(error){status.textContent=error.message||'Backup failed. No deletion is permitted.'}"""
assert old in s;s=s.replace(old,new,1)
p.write_text(s)
# ensure the backend cannot delete active/current-month data, even if someone calls API directly.
p=Path('firebase-cloud.js');s=p.read_text()
needle="if(!/^\\d{4}-\\d{2}$/.test(String(month)))throw new Error('Choose a valid month.');\n    if(!verification.expectedFingerprint"
replacement="""if(!/^\\d{4}-\\d{2}$/.test(String(month)))throw new Error('Choose a valid month.');
    const now=new Date(),currentMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    if(month>=currentMonth)throw new Error('Only completed past months may be deleted; current or future work must be kept.');
    if(!verification.expectedFingerprint"""
assert needle in s;s=s.replace(needle,replacement,1)
p.write_text(s)
print('team summary, per-person monthly archive and safe month guard updated')
