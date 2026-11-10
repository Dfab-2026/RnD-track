(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const monthNow=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`};
  const lastDayOfMonth=()=>{const d=new Date(),tomorrow=new Date(d);tomorrow.setDate(d.getDate()+1);return tomorrow.getMonth()!==d.getMonth()};
  const humanKey=k=>String(k||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const cleanValue=(key,value)=>{if(value===null||value===undefined||value==='')return'';if(typeof value==='object'){if(key==='attachment'&&value?.data)return JSON.stringify({...value,data:'[embedded attachment data omitted from printable PDF]'});try{return JSON.stringify(value)}catch{return String(value)}}return String(value)};
  const monthBounds=month=>{const [y,m]=String(month).split('-').map(Number),last=new Date(y,m,0).getDate();return{start:`${month}-01`,end:`${month}-${String(last).padStart(2,'0')}`,days:last}};
  const recordDate=row=>{if(row?.period){const match=String(row.period).match(/\d{4}-\d{2}/);if(match&&String(row.type||row.kind||'').includes('kpi'))return match[0]+'-01'}for(const key of ['date','submission_date','update_date','start_date','week_start','created_at','updated_at']){const value=String(row?.[key]||'');const match=value.match(/\d{4}-\d{2}-\d{2}/);if(match)return match[0]}return''};
  function wrap(ctx,text,max){const out=[];for(const para of String(text||'').split(/\n/)){let line='';for(const word of para.split(/\s+/)){if(!word)continue;const next=line?line+' '+word:word;if(ctx.measureText(next).width<=max){line=next;continue}if(line)out.push(line);line=word}if(line)out.push(line)}return out.length?out:['']}
  function renderBackupPdf(model){
    const W=1240,H=1754,P=72,BOTTOM=H-88,pages=[],bounds=monthBounds(model.month),dated=new Map(),undated=[];let c,ctx,y=0;
    for(let day=1;day<=bounds.days;day++)dated.set(`${model.month}-${String(day).padStart(2,'0')}`,[]);
    for(const record of model.records||[]){const d=recordDate(record);if(dated.has(d))dated.get(d).push(record);else undated.push(record)}
    const font=(size,bold=false)=>ctx.font=`${bold?'700':'400'} ${size}px sans-serif`;
    const text=(value,x,yy,size=18,color='#284761',bold=false)=>{font(size,bold);ctx.fillStyle=color;ctx.fillText(String(value),x,yy)};
    function page(){c=document.createElement('canvas');c.width=W;c.height=H;ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.textBaseline='top';ctx.fillStyle='#123f70';ctx.fillRect(0,0,W,12);text('DFAB STAINLESS SYSTEM PVT LTD',P,42,17,'#577796',true);text(`${model.label} · Monthly Firebase Backup`,P,76,34,'#173e66',true);text(`Month ${model.month} · ${bounds.start} to ${bounds.end} · ${model.records.length} records`,P,126,20,'#315b82',true);text(`Exported ${model.exportedAt}`,P,158,16,'#6c8297');ctx.fillStyle='#d9e4ef';ctx.fillRect(P,194,W-P*2,1);y=220;pages.push(c)}
    function need(h){if(y+h>BOTTOM)page()}
    function renderRecord(record,index){
      const pairs=Object.entries(record||{}).filter(([k,v])=>!['id'].includes(k)&&v!==undefined&&v!==null&&v!=='').map(([k,v])=>[humanKey(k),cleanValue(k,v)]),title=`${index}. ${record.type||record.kind||record.source||'Record'}${record.member?' · '+record.member:record.owner?' · '+record.owner:''}`;
      let estimated=70;for(const [k,v] of pairs){font(15,true);const labelW=220;font(15);estimated+=(wrap(ctx,v,W-P*2-labelW-40).length*21)+7}estimated=Math.min(estimated,620);need(estimated+14);const top=y;ctx.fillStyle='#f8fbff';ctx.fillRect(P,top,W-P*2,estimated);ctx.strokeStyle='#d8e4ef';ctx.strokeRect(P,top,W-P*2,estimated);text(title,P+18,y+14,19,'#1b456d',true);y+=44;for(const [k,v] of pairs){const labelW=220,lines=wrap(ctx,v,W-P*2-labelW-40),rowH=Math.max(24,lines.length*21)+7;need(rowH+18);text(k,P+18,y,14,'#627e98',true);let ly=y;for(const line of lines){text(line,P+18+labelW,ly,15,'#314f69');ly+=21}y+=rowH}y+=18;
    }
    page();let recordNo=1;
    const allRecords=model.records||[],timeRows=allRecords.filter(r=>Number(r.minutes)>0||((r.from||r.start_time)&&(r.to||r.end_time))),ideaRows=allRecords.filter(r=>/idea|kaizen|innovation/.test(String(r.type||r.kind||r.source||r.idea_type||'').toLowerCase())||r.idea||r.problem),kpiRows=allRecords.filter(r=>(/kpi|audit|iso|cost_percent|attrition_percent|quality_kpi_actual|progress/i.test(String(r.type||r.kind||r.source||'')))||r.kpi_index!==undefined||(r.progress!==undefined&&r.period)),assignedRows=allRecords.filter(r=>String(r.source||r.type||'')==='assigned_tasks'||String(r.type||'')==='assigned_task');
    const people=new Map();
    for(const name of model.members||[]){if(String(name||'').trim())people.set(String(name).trim(),{minutes:0,records:0,completed:0,inProgress:0,pending:0,kaizen:0,innovation:0,otherIdeas:0,kpis:0})}
    const personName=r=>String(r.member||r.submitted_by_name||r.owner_name||r.owner||r.person||r.actor_name||'Unassigned').trim()||'Unassigned';
    const personRow=r=>{const name=personName(r),row=people.get(name)||{minutes:0,records:0,completed:0,inProgress:0,pending:0,kaizen:0,innovation:0,otherIdeas:0,kpis:0};people.set(name,row);return row};
    for(const r of timeRows){const row=personRow(r);row.minutes+=Number(r.minutes)||0;row.records++;if(r.status==='completed')row.completed++;else if(r.status==='in_progress')row.inProgress++;else if(r.status==='pending')row.pending++}
    for(const r of ideaRows){const row=personRow(r),kind=String(r.idea_type||r.type||r.kind||'').toLowerCase();if(kind==='kaizen'||kind==='daily_idea')row.kaizen++;else if(kind==='innovation')row.innovation++;else row.otherIdeas++}
    for(const r of kpiRows)personRow(r).kpis++;
    need(86);ctx.fillStyle='#173f69';ctx.fillRect(P,y,W-P*2,46);text('MONTHLY OVERVIEW',P+16,y+12,18,'#ffffff',true);y+=60;
    const overview=[['Time Sheet work',`${timeRows.length} records`],['Ideas / Kaizen',`${ideaRows.length} records`],['KPI report data',`${kpiRows.length} records`],['Assigned tasks',`${assignedRows.length} records`]];need(110);const boxW=(W-P*2-30)/4;overview.forEach(([a,b],i)=>{const x=P+i*(boxW+10);ctx.fillStyle='#f4f8fc';ctx.fillRect(x,y,boxW,82);ctx.strokeStyle='#dae5ef';ctx.strokeRect(x,y,boxW,82);text(a,x+12,y+13,13,'#688099',true);text(b,x+12,y+41,18,'#183f67',true)});y+=100;
    if(people.size){need(60);text('INDIVIDUAL TIME SHEET ACTUALS',P,y,17,'#1d4f7d',true);y+=32;for(const [name,v] of [...people.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){need(56);ctx.fillStyle='#f9fbfe';ctx.fillRect(P,y,W-P*2,46);ctx.strokeStyle='#e1e8f0';ctx.strokeRect(P,y,W-P*2,46);text(name,P+14,y+9,15,'#213f5c',true);text(`${(v.minutes/60).toFixed(2)}h · ${v.records} time entries · Kaizen ${v.kaizen} · Innovation ${v.innovation}`,P+280,y+6,13,'#5d748b');text(`${v.completed} completed · ${v.inProgress} in progress · ${v.pending} pending · KPI ${v.kpis}`,P+280,y+28,12,'#5d748b');y+=54}y+=10}
    // Human-readable, person-wise monthly performance. Raw JSON remains the source-of-truth archive.
    const shortHours=n=>`${(Math.max(0,Number(n)||0)/60).toFixed(2)}h`;
    const taskName=r=>String(r.custom_task||r.task||r.task_name||r.title||r.project_name||r.work||r.description||'Other work').trim();
    const rowMinutes=r=>{const explicit=Number(r.minutes);if(Number.isFinite(explicit)&&explicit>=0)return explicit;const a=String(r.from||r.start_time||''),b=String(r.to||r.end_time||'');if(/^\d{2}:\d{2}$/.test(a)&&/^\d{2}:\d{2}$/.test(b)){const [ah,am]=a.split(':').map(Number),[bh,bm]=b.split(':').map(Number);return Math.max(0,(bh*60+bm)-(ah*60+am))}return 0};
    const dateOf=r=>recordDate(r);
    const peopleNames=[...new Set([...people.keys(),...timeRows.map(personName),...ideaRows.map(personName),...kpiRows.map(personName)].filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    // Per-person targets are based on working days (Monday-Saturday) in the selected month.
    // Archived time entries are never altered to calculate these report-only values.
    const workdayCount=Array.from({length:bounds.days},(_,i)=>new Date(Number(model.month.slice(0,4)),Number(model.month.slice(5))-1,i+1,12)).filter(date=>date.getDay()!==0).length;
    const monthTargetMinutes=workdayCount*8*60;
    function progressCard(title,value,detail,tone){
      need(122);const color=tone==='highest'?'#157347':tone==='lowest'?'#b42318':'#b96c16';
      ctx.fillStyle=tone==='highest'?'#e9f8f0':tone==='lowest'?'#fff0ee':'#fff6e8';
      ctx.fillRect(P,y,W-P*2,108);ctx.fillStyle=color;ctx.fillRect(P,y,6,108);
      text(String(title).slice(0,57),P+21,y+11,17,color,true);
      text(String(value).slice(0,79),P+21,y+40,19,'#183f67',true);
      if(detail)text(String(detail).slice(0,106),P+21,y+77,14,'#667b90');
      y+=118;
    }

    function sectionHeading(title,subtitle='') {need(83);ctx.fillStyle='#eaf2fb';ctx.fillRect(P,y,W-P*2,44);text(title,P+14,y+10,18,'#173f69',true);y+=55;if(subtitle){text(subtitle,P+8,y,13,'#607a91');y+=26}}
    function line(left,right='',options={}) {need(34);ctx.fillStyle=options.bg||'#f7fafd';ctx.fillRect(P,y,W-P*2,30);text(String(left).slice(0,73),P+12,y+7,14,'#284761',Boolean(options.bold));if(right)text(String(right).slice(0,48),P+640,y+7,14,'#284761',true);y+=35}
    for(const person of peopleNames){
      const byPerson=r=>personName(r).toLocaleLowerCase()===person.toLocaleLowerCase();
      const individualTime=timeRows.filter(byPerson),individualIdeas=ideaRows.filter(byPerson),individualKpi=kpiRows.filter(byPerson),individualProgress=allRecords.filter(r=>byPerson(r)&&(/progress|weekly_report|weekly_task|weekly_update/i.test(String(r.source||r.type||r.kind||''))||r.progress_percent!==undefined||r.current_progress!==undefined));
      const minutesTotal=individualTime.reduce((n,r)=>n+rowMinutes(r),0);
      page();sectionHeading(`PERSON REPORT · ${person}`,`${model.month}  |  Full individual activity, ideas, hours and KPI progress`);
      const dayMap=new Map(),weekMap=new Map(),taskMap=new Map();
      for(const r of individualTime){const day=dateOf(r),mins=rowMinutes(r),task=taskName(r);if(!day)continue;
        const entry=dayMap.get(day)||{minutes:0,count:0};entry.minutes+=mins;entry.count++;dayMap.set(day,entry);
        const date=new Date(day+'T12:00:00'),weekday=(date.getDay()+6)%7;date.setDate(date.getDate()-weekday);const weekStart=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
        weekMap.set(weekStart,(weekMap.get(weekStart)||0)+mins);
        const taskEntry=taskMap.get(task)||{minutes:0,count:0};taskEntry.minutes+=mins;taskEntry.count++;taskMap.set(task,taskEntry);
      }
      const byTask=[...taskMap].sort((a,b)=>b[1].minutes-a[1].minutes||a[0].localeCompare(b[0]));
      sectionHeading('MONTHLY PERFORMANCE SNAPSHOT');
      const remaining=Math.max(0,monthTargetMinutes-minutesTotal),achievedPct=monthTargetMinutes?Math.round(minutesTotal/monthTargetMinutes*100):0;
      progressCard('MONTHLY HOURS · TARGET VS WORKED',`${shortHours(minutesTotal)} worked / ${shortHours(monthTargetMinutes)} target`,`${achievedPct}% achieved · ${shortHours(remaining)} remaining`,achievedPct>=100?'highest':achievedPct===0?'lowest':'other');
      line(`Total time: ${shortHours(minutesTotal)}`,`${individualTime.length} work entries`,{bold:true});
      line(`Kaizen: ${individualIdeas.filter(r=>String(r.idea_type||r.type||'').toLowerCase()==='kaizen').length}  |  Innovation: ${individualIdeas.filter(r=>String(r.idea_type||r.type||'').toLowerCase()==='innovation').length}`,`KPI records: ${individualKpi.length}`);
      if(byTask.length){
        byTask.forEach(([task,entry],index)=>{
          const tone=index===0?'highest':index===byTask.length-1?'lowest':'other';
          progressCard(index===0?'HIGHEST WORKING TASK':index===byTask.length-1?'LOWEST WORKING TASK':'OTHER WORKING TASK',
            task,`${shortHours(entry.minutes)} · ${entry.count} entries`,tone);
        });
      }
      line(`Highest working task: ${byTask[0]?.[0]||'No work logged'}`,byTask.length?shortHours(byTask[0][1].minutes):'—');
      const lowest=byTask.length?byTask[byTask.length-1]:null;
      line(`Lowest working task: ${lowest?.[0]||'No work logged'}`,lowest?shortHours(lowest[1].minutes):'—');
      sectionHeading('DAILY WORKING HOURS','Work dates and hours recorded by this person; 8h/day target');
      if(!dayMap.size)line('No dated time entries for this month.');
      for(const [date,v] of [...dayMap].sort((a,b)=>a[0].localeCompare(b[0])))line(`${date}   ·   ${v.count} entries`,`${shortHours(v.minutes)} / 8.00h · ${Math.round(v.minutes/480*100)}%`);
      sectionHeading('WEEKLY WORKING HOURS','Monday-start weeks; totals include only the selected month records');
      if(!weekMap.size)line('No weekly entries for this month.');
      for(const [weekStart,total] of [...weekMap].sort((a,b)=>a[0].localeCompare(b[0]))){
        let eligible=0;for(let n=0;n<7;n++){const wd=new Date(weekStart+'T12:00:00');wd.setDate(wd.getDate()+n);
          if(wd.getDay()!==0&&wd.toISOString().slice(0,7)===model.month)eligible++}
        const target=eligible*480;
        line(`Week commencing ${weekStart}`,`${shortHours(total)} / ${shortHours(target)} · ${target?Math.round(total/target*100):0}%`);
      }
      sectionHeading('TASK BREAKDOWN · HIGHEST TO LOWEST');
      if(!byTask.length)line('No task entries for this month.');
      for(const [task,v] of byTask)line(`${task.slice(0,58)} (${v.count} entries)`,shortHours(v.minutes));
      sectionHeading('KAIZEN & INNOVATION IDEA RECORDS','Full submitted content appears below and in the JSON archive');
      if(!individualIdeas.length)line('No submitted ideas for this person.');
      for(const idea of individualIdeas){
        const title=String(idea.idea_type||idea.type||'Idea').toUpperCase();
        line(`${dateOf(idea)||model.month} · ${title} · ${String(idea.idea_number||idea.id||'').slice(0,22)}`,
          `${String(idea.priority||'Medium')} · ${String(idea.status||'Submitted')}`);
        if(idea.department_name||idea.department)line('Department',String(idea.department_name||idea.department));
        if(idea.member||idea.person||idea.submitted_by_name)line('Submitted by',personName(idea));
        for(const [label,value] of [['Problem',idea.problem||idea.problem_statement],['Proposed solution',idea.proposed_idea||idea.solution||idea.idea],['Expected benefit',idea.expected_benefit||idea.outcomes||idea.benefit],['Remarks',idea.remarks]]){
          if(!value)continue;const lines=wrap(ctx,`${label}: ${String(value)}`,W-P*2-32);for(const l of lines){need(25);text(l,P+17,y+3,13,'#3b556e');y+=23}
        }
      }
      sectionHeading('WEEKLY REPORT / KPI PROGRESS');
      if(!individualKpi.length&&!individualProgress.length)line('No weekly report / KPI progress records for this person this month.');
      for(const record of [...individualKpi,...individualProgress.filter(r=>!individualKpi.includes(r))]){line(`${dateOf(record)||model.month} · ${String(record.kpi_name||record.kpi_title||record.project_title||record.task||record.title||record.type||record.source||'Progress entry').slice(0,61)}`,String(record.status||record.progress_percent||record.current_progress||record.progress||''));}
    }
    need(54);text('FULL MONTHLY RECORD DETAIL',P,y,17,'#1d4f7d',true);text('All Time Sheet, Ideas/Kaizen, KPI, assigned-task and other saved records follow by calendar date.',P+270,y+2,13,'#6f8397');y+=36;
    for(const [date,records] of dated.entries()){
      need(records.length?92:62);ctx.fillStyle='#eaf2fb';ctx.fillRect(P,y,W-P*2,42);text(new Date(date+'T12:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}),P+16,y+10,17,'#1d4f7d',true);text(`${records.length} record${records.length===1?'':'s'}`,W-P-150,y+11,14,'#5f7890',true);y+=54;
      if(!records.length){text('No records for this date.',P+16,y,15,'#8798a9');y+=34;continue}
      for(const record of records)renderRecord(record,recordNo++);
    }
    if(undated.length){need(72);ctx.fillStyle='#fff4df';ctx.fillRect(P,y,W-P*2,42);text('MONTH / PERIOD LEVEL RECORDS',P+16,y+10,17,'#8b5c18',true);y+=56;for(const record of undated)renderRecord(record,recordNo++)}
    pages.forEach((canvas,i)=>{const x=canvas.getContext('2d');x.fillStyle='#d9e4ef';x.fillRect(P,H-68,W-P*2,1);x.font='14px sans-serif';x.fillStyle='#6a829a';x.textBaseline='top';x.fillText(`Backup audit · ${model.label} · ${model.month} · ${bounds.start}–${bounds.end}`,P,H-50);x.fillText(`Page ${i+1} of ${pages.length}`,W-P-110,H-50)});return pages;
  }
  function downloadPdf(filename,model){if(!window.rndKpiPdf?.build)throw new Error('PDF export engine is unavailable. Refresh and retry.');const pages=renderBackupPdf(model),bytes=window.rndKpiPdf.build(pages),blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);return{filename:a.download,bytes:blob.size}}
  // The JSON archive is lossless; the PDF is a human-readable companion.
  const stableValue=value=>Array.isArray(value)?value.map(stableValue):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stableValue(value[key])])):value;
  const stableRecordSet=records=>(records||[]).map(record=>JSON.stringify(stableValue(record))).sort();
  async function archiveFingerprint(records){
    if(!window.crypto?.subtle)throw new Error('Secure browser context required for verified backup. Open the HTTPS website.');
    const content=JSON.stringify(stableRecordSet(records));
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(content));
    return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  }
  function downloadJson(name,records,metadata){
    const output={format:'DFAB_MONTH_ARCHIVE_V1',...metadata,records};
    const blob=new Blob([JSON.stringify(output,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name+'.json';document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
    return{filename:a.download,bytes:blob.size};
  }
  async function isBackedUp(key,month){try{return (await window.rndCloud.loadBackupHistory(key)).some(x=>x.month===month&&x.deleted_at)}catch{return false}}
  async function remind(opt={}){
    if(!opt.eligible||!window.rndCloud||!lastDayOfMonth())return;
    const month=monthNow(),hour=new Date().getHours(),localKey=`month-backup-reminder:${opt.key}:${month}:${hour}`;
    if(localStorage.getItem(localKey))return;
    if(await isBackedUp(opt.key,month))return;
    if(document.hidden||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;
    const d=document.createElement('dialog');d.className='modal month-end-backup-reminder';d.innerHTML=`<div class="month-end-backup-card"><span class="kicker">MONTH END · BACKUP REQUIRED</span><h2>${esc(opt.label||opt.key)} monthly backup is pending</h2><p>Download the complete ${esc(month)} PDF backup, then delete that month from Firebase. This reminder repeats once each hour until both steps are completed.</p><div class="modal-actions"><button type="button" class="ghost-btn" data-close>Close</button><button type="button" class="danger-btn" data-open>Open backup</button></div></div>`;document.body.append(d);d.querySelector('[data-close]').onclick=()=>d.close();d.querySelector('[data-open]').onclick=()=>{d.close();opt.openSettings?.();setTimeout(()=>document.querySelector('.month-backup')?.scrollIntoView({behavior:'smooth',block:'start'}),180)};d.addEventListener('close',()=>d.remove(),{once:true});d.showModal();localStorage.setItem(localKey,'1');
  }
  async function mount(host,opt){if(!host||!window.rndCloud)return;const key=opt.key,mode=opt.mode||'department',label=opt.label||key;host.innerHTML=`<section class="panel month-backup"><span class="kicker">MONTHLY DATA ARCHIVE</span><h3>Monthly Backup & Firebase Cleanup</h3><p>Choose a month and download one detailed PDF covering every calendar date from day 1 through the last day of that month. Dates with no records are shown too. Only compact backup-history metadata remains in Firebase.</p><div class="month-backup-controls"><label>MONTH<input type="month" data-backup-month value="${monthNow()}"></label><button class="secondary-btn" data-backup-download>Download PDF + Full JSON</button><span data-backup-status></span></div><div class="backup-history" data-backup-history></div></section>`;const month=host.querySelector('[data-backup-month]'),status=host.querySelector('[data-backup-status]'),history=host.querySelector('[data-backup-history]');
    async function deleteBackedMonth(m,historyId,button){
      const confirmDelete=message=>(mode==='rnd'||!window.departmentUX)?Promise.resolve(window.confirm(message)):window.departmentUX.confirm(message,{title:'Delete verified month?',confirmLabel:'Delete month'});
      if(button)button.disabled=true;
      try{
        status.textContent='Verifying the complete monthly archive against live Firebase data…';
        const historyRows=await window.rndCloud.loadBackupHistory(key);
        const saved=historyRows.find(row=>row.id===historyId&&row.month===m&&!row.deleted_at);
        if(!saved?.fingerprint||!saved?.jsonFilename)throw new Error('Full JSON archive verification missing. Download this month again before cleanup.');
        const live=await window.rndCloud.loadMonthBackup(key,m,mode);
        const fingerprint=await archiveFingerprint(live);
        if(live.length!==saved.count||fingerprint!==saved.fingerprint)throw new Error('Firebase data changed since backup. Download a fresh full-month archive before deleting anything.');
        const acknowledge=await confirmDelete(`Have you saved and opened both ${saved.filename} and ${saved.jsonFilename}? Confirm that the files are safely backed up elsewhere before proceeding.`);
        if(!acknowledge)return false;
        if(!await confirmDelete(`Delete ONLY ${label} data dated ${m}? ${live.length} verified archived records. Other departments and months must be kept.`))return false;
        if(!await confirmDelete(`FINAL IRREVERSIBLE ACTION: permanently delete ${live.length} ${label} records from ${m} in Firebase? Type confirmation follows.`))return false;
        const typed=window.prompt(`Type DELETE ${m} to authorize this month's cleanup:`);
        if(typed!==`DELETE ${m}`){status.textContent='Cleanup cancelled; no records were deleted.';return false}
        status.textContent='Deleting only verified archived monthly records…';
        const result=await window.rndCloud.deleteMonthData(key,m,mode,{expectedCount:live.length,expectedFingerprint:fingerprint});
        const remaining=await window.rndCloud.loadMonthBackup(key,m,mode);
        if(remaining.length)throw new Error(`${remaining.length} records still remain. Cleanup is incomplete; history was not marked deleted. Do not discard your archive.`);
        if(typeof opt.onDeleted==='function')await opt.onDeleted(m,result);
        await window.rndCloud.markBackupDeleted(historyId);
        status.textContent=`Verified cleanup complete: ${result.deleted} Firebase documents deleted for ${m}.`;
        await refresh();return true;
      }catch(error){status.textContent=error.message||'Cleanup failed; archive history remains open.';return false}
      finally{if(button&&button.isConnected)button.disabled=false}
    }
    async function refresh(){try{const list=await window.rndCloud.loadBackupHistory(key);history.innerHTML=list.length?list.map(x=>`<div class="backup-history-row"><div><strong>${esc(x.month)} · ${esc(x.filename)}</strong><small>${Number(x.count)||0} records · PDF ${(Number(x.bytes)||0).toLocaleString('en-IN')} bytes · JSON ${esc(x.jsonFilename||'not archived')} · ${new Date(Number(x.downloaded_at)||Date.now()).toLocaleString('en-IN')}${x.deleted_at?` · Cleanup complete ${new Date(Number(x.deleted_at)).toLocaleString('en-IN')}`:' · Awaiting Firebase cleanup'}</small></div><div class="backup-history-actions">${x.deleted_at?'':'<button class="backup-delete-month" data-delete-month="'+esc(x.month)+'" data-history-id="'+esc(x.id)+'">Delete month from Firebase</button>'}</div></div>`).join(''):'<div class="leader-empty">No monthly backups downloaded yet.</div>';history.querySelectorAll('[data-delete-month]').forEach(b=>b.onclick=()=>deleteBackedMonth(b.dataset.deleteMonth,b.dataset.historyId,b))}catch(e){history.innerHTML=`<div class="leader-empty">${esc(e.message||'Unable to load backup history.')}</div>`}}
    host.querySelector('[data-backup-download]').onclick=async()=>{
      const m=month.value;if(!m)return;
      const btn=host.querySelector('[data-backup-download]');btn.disabled=true;
      try{
        status.textContent='Reading all selected monthly records from the Firebase server…';
        const data=await window.rndCloud.loadMonthBackup(key,m,mode),fingerprint=await archiveFingerprint(data);
        let members=[];
        try{const rows=mode==='rnd'?await window.rndCloud.loadRndMembers():await window.rndCloud.loadDepartmentMembers(key);members=[...new Set(rows.filter(r=>r.active!==false&&r.role!=='visitor').map(r=>String(r.name||'').trim()).filter(Boolean))]}catch(error){console.warn('Member names unavailable for backup roster',error)}
        await document.fonts?.ready;
        const stamp=new Date().toISOString().replace(/[:.]/g,'-'),base=`DFAB-${label.replace(/[^A-Za-z0-9]+/g,'-')}-${m}-backup-${stamp}`;
        const pdf=downloadPdf(base,{label,key,month:m,exportedAt:new Date().toLocaleString('en-IN'),records:data,members});
        const json=downloadJson(base,data,{department:key,month:m,exportedAt:new Date().toISOString(),count:data.length,sha256:fingerprint,memberNames:members});
        await window.rndCloud.saveBackupHistory(key,m,{filename:pdf.filename,count:data.length,bytes:pdf.bytes,jsonFilename:json.filename,fingerprint});
        status.textContent=`PDF and complete JSON archive prepared for ${data.length} records. Keep both files safely; use the separate Delete button only after checking your downloads.`;
        await refresh();
        if(window.confirm(`Archive downloads started for ${label} ${m}. AFTER you have verified that both PDF and JSON are safely saved, would you like to review optional Firebase cleanup? Choose Cancel to keep everything.`)){
          const matching=(await window.rndCloud.loadBackupHistory(key)).find(x=>x.month===m&&x.fingerprint===fingerprint&&!x.deleted_at);
          if(matching?.id)await deleteBackedMonth(m,matching.id,history.querySelector(`[data-history-id="${CSS.escape(matching.id)}"]`));
        }
      }catch(error){status.textContent=error.message||'Backup failed. No deletion is permitted.'}
      finally{btn.disabled=false}
    };
    await refresh();
  }
  window.monthBackup={mount,remind,isBackedUp};
})();
