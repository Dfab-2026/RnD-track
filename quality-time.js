(function(){
  let root,entries=[],stop=null,session=0,connected=false,saving=false,editing='',recordsPage=0,recordsFilterKey='';
  const policy=()=>window.departmentTimesheetPolicy;
  const $=id=>{const value=String(id);return document.getElementById(value.startsWith('qt')?value:'qt'+value)},owner=()=>window.qualitySession.current(),key=s=>String(s||'').trim().toLowerCase();
  const TASKS=[
    {group:'Task List',value:'daily_incoming_inspection',label:'Incoming Inspection'},
    {group:'Task List',value:'daily_inprocess_inspection',label:'Inprocess Inspection'},
    {group:'Task List',value:'daily_final_inspection',label:'Final Inspection'},
    {group:'Task List',value:'master_reportpreparation',label:'Report preparation'},
    {group:'Task List',value:'master_documentation',label:'Documentation'},
    {group:'Task List',value:'master_defectverification',label:'Defect Verification'},
    {group:'Task List',value:'master_customerplacevisit',label:'Customer Place Visit'},
    {group:'Task List',value:'master_vendorplacevisit',label:'Vendor Place visit'},
    {group:'Task List',value:'master_training',label:'Training'},
    {group:'Task List',value:'master_meeting',label:'Meeting'},
    {group:'Task List',value:'master_5s',label:'5S'},
    {group:'Task List',value:'master_kaizen',label:'Kaizen'},
    {group:'Task List',value:'master_internalcommunicationfollowup',label:'Internal Communication / Followup'},
    {group:'Task List',value:'master_externalcommunicationfollowup',label:'External Communication / Followup'},
    {group:'Task List',value:'master_erpentry',label:'ERP Entry'},
    {group:'Task List',value:'master_leave',label:'Leave'},
    {group:'Task List',value:'master_nowork',label:'No Work'},
    {group:'Other',value:'other',label:'Others'}
  ];
  const LEGACY_TASK_LABELS={daily_inspection:'Incoming / In-process / Final Inspection',daily_documents:'ORG Document for Audit Readiness',daily_coordination:'Internal & External Coordination',kaizen_idea:'Kaizen Idea / Continuous Improvement',weekly_audit:'Internal Audit of Each Department',weekly_department_kpi:'Department-wise Quality KPI',weekly_training:'Quality Training & Awareness',weekly_kpi_report:'Weekly KPI Report Submission',monthly_cost_reduction:'Quality Cost Reduction',monthly_kpi_report:'Monthly KPI Report Submission',iso_implementation:'ISO Process Implementation'};
  const taskLabel=(value,row)=>value==='other'?(String(row?.work||row?.custom_task||'Other task').trim()||'Other task'):(TASKS.find(t=>t.value===value)?.label||LEGACY_TASK_LABELS[value]||value||'Task');
  const clockLabel=value=>{if(!/^\d{2}:\d{2}$/.test(String(value||'')))return String(value||'');const [h,m]=String(value).split(':').map(Number),period=h>=12?'PM':'AM',hh=h%12||12;return `${hh}:${String(m).padStart(2,'0')} ${period}`};
  const timeOptions=selected=>{let html='<option value="">Select time</option>';if(/^\d{2}:\d{2}$/.test(String(selected||''))&&(Number(selected.slice(0,2))*60+Number(selected.slice(3))<540||Number(selected.slice(0,2))*60+Number(selected.slice(3))>1080))html+=`<option value="${selected}" selected>${clockLabel(selected)} (existing entry)</option>`;for(let n=9*60;n<=18*60;n+=15){const value=`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;html+=`<option value="${value}" ${value===selected?'selected':''}>${clockLabel(value)}</option>`}return html};
  function syncOtherTask(focus=true){const other=$('Task').value==='other';$('OtherTask').hidden=!other;$('OtherTask').disabled=!other;$('OtherTask').required=other;if(!other)$('OtherTask').value='';else if(focus)requestAnimationFrame(()=>$('OtherTask').focus())}
  function status(message){if($('Status'))$('Status').textContent=message}
  function monthOf(date){return String(date||today()).slice(0,7)}
  function options(){return [...new Set(TASKS.map(t=>t.group))].map(group=>`<optgroup label="${esc(group)}">${TASKS.filter(t=>t.group===group).map(t=>`<option value="${esc(t.value)}">${esc(t.label)}</option>`).join('')}</optgroup>`).join('')}
  function duration(minutes){const h=Math.floor((Number(minutes)||0)/60),m=(Number(minutes)||0)%60;return `${h}h ${m}m`}
  function filters(){return{date:$('FilterDate')?.value||'',po:key($('FilterPo')?.value||''),task:$('FilterTask')?.value||'',state:$('FilterStatus')?.value||''}}
  function paint(){
    if(!root||root.hidden)return;
    const date=$('Date');if(date&&!date.value)date.value=today();if($('From')&&!editing&&!$('Form').dataset.startTouched){const last=entries.filter(r=>key(r.owner)===key(owner())&&r.date===date.value&&/^\d{2}:\d{2}$/.test(String(r.to||''))).sort((a,b)=>String(b.to).localeCompare(String(a.to)))[0];if(last?.to&&$('From').value==='09:00')$('From').value=last.to;}
    if($('Save'))$('Save').disabled=saving||!window.rndCloud?.saveQualityTime;
    const f=filters();
    const rows=entries.filter(e=>key(e.owner)===key(owner())&&(!f.date||e.date===f.date)&&(!f.po||key(e.po_number).includes(f.po))&&(!f.task||e.project_id===f.task)&&(!f.state||e.status===f.state)).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.from).localeCompare(String(a.from)));
    const filterKey=JSON.stringify(f);if(filterKey!==recordsFilterKey){recordsFilterKey=filterKey;recordsPage=0}const pageSize=window.innerHeight<850?1:window.innerHeight<1100?2:3;const pageCount=Math.max(1,Math.ceil(rows.length/pageSize));recordsPage=Math.min(recordsPage,pageCount-1);const pageRows=rows.slice(recordsPage*pageSize,(recordsPage+1)*pageSize);
    if($('Entries')){
      $('Entries').innerHTML=pageRows.length?pageRows.map(e=>`<article class="tc-entry qt-entry-row"><header><strong>${esc(taskLabel(e.project_id,e))}</strong><span class="tc-entry-details"><span>${esc(fmtDate(e.date))}</span><span>WO ${esc(e.po_number||'—')}</span><span class="tc-entry-time-range"><b>From</b> ${esc(clockLabel(e.from))} <b>To</b> ${esc(clockLabel(e.to))}</span><b>${duration(e.minutes)}</b></span></header><div class="qt-entry-meta"><span class="q-status ${e.status==='completed'?'done':'open'}">${esc(e.status==='completed'?'Completed':e.status==='in_progress'?'In progress':'Pending')}</span>${e.remarks?`<small>${esc(e.remarks)}</small>`:'<small>No remarks</small>'}${policy().permitted(e.date)?`<button type="button" class="mini-action dept-resume" data-qt-edit="${esc(e.id)}">${e.status==='in_progress'||e.status==='pending'?'Continue':'Edit'}</button>`:'<span class="dept-locked-label" title="Previous week is closed">Week closed</span>'}${e.created_at&&e.updated_at&&e.updated_at!==e.created_at?`<small class="dept-updated-at">Updated ${esc(new Date(e.updated_at).toLocaleString('en-IN'))}</small>`:''}</div></article>`).join(''):'<div class="empty-state">No saved Time Sheet records match these filters.</div>';
      if(pageCount>1){$('Entries').insertAdjacentHTML('beforeend',`<nav class="dept-record-pages" aria-label="Saved records pages"><button type="button" data-qt-page="previous" ${recordsPage===0?'disabled':''}>Previous</button><span>Page ${recordsPage+1} of ${pageCount} · ${rows.length} records</span><button type="button" data-qt-page="next" ${recordsPage>=pageCount-1?'disabled':''}>Next</button></nav>`);$('Entries').querySelectorAll('[data-qt-page]').forEach(button=>button.onclick=()=>{recordsPage+=button.dataset.qtPage==='next'?1:-1;paint()})}
      $('Entries').querySelectorAll('[data-qt-edit]').forEach(button=>button.onclick=()=>editEntry(button.dataset.qtEdit));
    }
  }
  // Firebase history remains the underlying persisted source; the visible label says Saved work records.
  async function open(mount){
    if(!window.qualitySession.current()){window.openQuality();return}
    close();editing='';recordsPage=0;recordsFilterKey='';const token=++session;root=document.getElementById('qualityTimeWorkspace');if(!root){root=document.createElement('main');root.id='qualityTimeWorkspace';root.className='production-workspace';document.body.append(root)}
    if(mount)mount.append(root);root.hidden=false;document.getElementById('appShell').classList.add('app-locked');document.getElementById('loginGate').classList.add('hidden');
    root.innerHTML=`<div class="production-inner qt-rnd-sheet"><div class="section-toolbar"><div><span class="kicker">QUALITY WORK LOG</span><h2>Time Sheet</h2><p>Enter one work record in a single row. WO identifies the product/job for this entry.</p></div><span class="tc-person">${esc(owner())}</span></div><section class="panel tc-panel"><form id="qtForm" class="qt-inline-form"><label>Date<input id="qtDate" type="date" value="${today()}" max="${policy().bounds().max}" required></label><label>WO<input id="qtPo" type="text" maxlength="80" autocomplete="off" placeholder="WO / NA / N/A" required></label><label class="qt-task-field">Task<div class="qt-task-controls"><select id="qtTask" required><option value="">Select task</option>${options()}</select><input id="qtOtherTask" type="text" maxlength="180" autocomplete="off" placeholder="Enter other task" hidden></div></label><label>From<div class="tc-clock-field"><input id="qtFrom" type="text" value="09:00" readonly required aria-label="From time"><button type="button" data-qt-clock="qtFrom" aria-label="Choose From time"><svg class="dept-clock-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path class="dept-clock-hand" d="M12 6v6l4 2"/></svg></button></div></label><label>To<div class="tc-clock-field"><input id="qtTo" type="text" value="18:00" readonly required aria-label="To time"><button type="button" data-qt-clock="qtTo" aria-label="Choose To time"><svg class="dept-clock-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path class="dept-clock-hand" d="M12 6v6l4 2"/></svg></button></div></label><label>Status<select id="qtEntryStatus" required><option value="completed">Completed</option><option value="in_progress">In progress</option><option value="pending">Pending</option></select></label><label class="qt-remarks-field">Remarks<input id="qtRemarks" maxlength="1000" placeholder="Remarks"></label><div class="qt-form-actions"><button type="submit" id="qtSave" class="primary-btn" disabled>Save</button><button type="button" id="qtCancelEdit" class="ghost-btn" hidden>Cancel edit</button></div><p class="dept-week-guide" id="qtWeekGuide">${esc(policy().message())}</p><p id="qtStatus" class="qt-inline-status" role="status" aria-live="polite">Connecting to Firebase…</p></form></section><section class="panel tc-panel"><div class="panel-head"><div><h3>Saved records</h3><span>Saved work records</span></div></div><div class="qt-filters"><label>Date<input id="qtFilterDate" type="date" value="${today()}" aria-label="Filter saved records by date"></label><label>WO<input id="qtFilterPo" type="text" maxlength="80" placeholder="Search WO"></label><label>Task<select id="qtFilterTask"><option value="">All tasks</option>${options()}</select></label><label>Status<select id="qtFilterStatus"><option value="">All status</option><option value="completed">Completed</option><option value="in_progress">In progress</option><option value="pending">Pending</option></select></label><button type="button" class="ghost-btn" id="qtClearFilters">Clear</button></div><div id="qtEntries"></div></section></div>`;
    $('Task').onchange=()=>syncOtherTask();$('From').addEventListener('change',()=>{$('Form').dataset.startTouched='1'});$('Date').addEventListener('change',()=>{$('Form').dataset.startTouched='';$('From').value='09:00';paint()});const refreshDates=()=>{const range=policy().bounds();$('Date').removeAttribute('min');$('Date').max=range.max};$('Date').addEventListener('focus',refreshDates);$('Date').addEventListener('pointerdown',refreshDates);$('CancelEdit').onclick=cancelEdit;syncOtherTask();root.querySelectorAll('[data-qt-clock]').forEach(b=>{const input=$(b.dataset.qtClock);const open=()=>{if(typeof window.rndTimeClock==='function')window.rndTimeClock(input);else status('Time picker is loading. Please retry.');};b.onclick=open;if(input){input.onclick=open;input.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}}}});$('Form').onsubmit=save;
    $('FilterDate').onchange=()=>{$('FilterDate').dataset.explicit='1';paint()};['FilterTask','FilterStatus'].forEach(id=>$(id).onchange=()=>{if($('FilterDate').dataset.explicit!=='1')$('FilterDate').value='';paint()});$('FilterPo').oninput=()=>{if($('FilterDate').dataset.explicit!=='1')$('FilterDate').value='';paint()};$('ClearFilters').onclick=()=>{['FilterDate','FilterPo','FilterTask','FilterStatus'].forEach(id=>$(id).value='');$('FilterDate').value=today();$('FilterDate').dataset.explicit='0';paint()};$('Date').addEventListener('change',()=>{if(!$('FilterPo').value&&!$('FilterTask').value&&!$('FilterStatus').value){$('FilterDate').value=$('Date').value;$('FilterDate').dataset.explicit='0';paint()}});paint();
    try{stop=await window.rndCloud.watchQualityTime('entries',rows=>{if(token!==session)return;entries=rows;connected=true;status('Time Sheet synchronized');paint()},error=>{if(token!==session)return;connected=false;paint();status(error.message||'Firebase connection interrupted.')})}catch(error){if(token===session)status(error.message)}
  }
  function close(){session++;stop?.();stop=null;connected=false;entries=[];editing='';if(root)root.hidden=true}
  function editEntry(id){
    const entry=entries.find(row=>String(row.id)===String(id));
    if(!entry||key(entry.owner)!==key(owner()))return status('This Time Sheet entry is not available to edit.');
    if(!policy().permitted(entry.date))return status('This week is closed. Older records can be reviewed but not updated.');
    editing=entry.id;$('Date').value=entry.date||today();$('Po').value=entry.po_number||'';
    const task=TASKS.some(item=>item.value===entry.project_id)?entry.project_id:'other';
    $('Task').value=task;$('OtherTask').value=task==='other'?(entry.custom_task||entry.work||''):'';
    syncOtherTask(false);$('From').value=entry.from||'';$('To').value=entry.to||'';
    $('EntryStatus').value=['completed','in_progress','pending'].includes(entry.status)?entry.status:'pending';
    $('Remarks').value=entry.remarks||'';$('Save').textContent='Update';$('CancelEdit').hidden=false;
    status(entry.status==='in_progress'||entry.status==='pending'?'Continue the saved task, then select Update.':'Editing saved Time Sheet entry.');
    $('Form').scrollIntoView({behavior:'smooth',block:'start'});$('Po').focus({preventScroll:true});
  }
  function cancelEdit(){
    editing='';$('Form').reset();$('Date').value=today();$('From').value='09:00';$('To').value='18:00';
    $('OtherTask').value='';syncOtherTask(false);$('Save').textContent='Save';$('CancelEdit').hidden=true;
    status('Edit cancelled.');
  }
  async function save(event){
    event.preventDefault();if(saving)return;if(!window.rndCloud?.saveQualityTime)return status('Firebase Time Sheet service is unavailable.');
    const date=$('Date').value,po=$('Po').value.trim(),task=$('Task').value,customTask=$('OtherTask')?.value.trim()||'',from=$('From').value,to=$('To').value,state=$('EntryStatus').value,remarks=$('Remarks').value.trim(),minutes=window.rndTimeConsume.minutes(to)-window.rndTimeConsume.minutes(from);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return status('Choose a valid date.');if(!policy().permitted(date))return status(policy().message());if(!po)return status('Enter a WO, or use NA / N/A when not applicable.');if(!TASKS.some(t=>t.value===task))return status('Choose a task.');if(task==='other'&&!customTask)return status('Enter the task name for Others.');if(!['completed','in_progress','pending'].includes(state))return status('Choose a valid status.');if(remarks.length>1000)return status('Keep remarks within 1,000 characters.');if(!Number.isFinite(minutes)||minutes<=0)return status('Choose a To time later than the From time.');
    const original=editing?entries.find(entry=>String(entry.id)===String(editing)):null;
    if(editing&&!original)return status('This Time Sheet entry is no longer available. Refresh and retry.');
    if(original&&key(original.owner)!==key(owner()))return status('This Time Sheet entry is not available to edit.');if(original&&!policy().permitted(original.date))return status('Previous-week records are locked and cannot be updated.');
    saving=true;paint();status('Saving to Firebase…');
    try{
      if(!policy().permitted(date))throw Error('This week is now closed. The record was not saved.');
      const id=editing||crypto.randomUUID(),now=new Date().toISOString();
      const row={...original,project_id:task,owner:owner(),date,po_number:po,from,to,minutes,work:task==='other'?customTask:taskLabel(task),custom_task:task==='other'?customTask:'',status:state,remarks,created_at:original?.created_at||original?.updated_at||now,updated_at:now};
      const confirmed=await window.rndCloud.saveQualityTime('entries',id,row);
      if(String(confirmed?.date||'')!==date||key(confirmed?.owner)!==key(owner()))throw Error('Firebase returned a different record date or owner. Refresh before retrying.');
      entries=[...entries.filter(entry=>String(entry.id)!==String(id)),{...row,...confirmed,id:confirmed?.id||id}];
      $('FilterDate').value=date;for(const field of ['FilterPo','FilterTask','FilterStatus'])$(''+field).value='';recordsPage=0;
      editing='';$('Save').textContent='Save';$('CancelEdit').hidden=true;
      $('From').value=to;$('To').value='18:00';$('Remarks').value='';$('EntryStatus').value='completed';if($('Task').value==='other')$('OtherTask').value='';
      status(original?'Updated · '+new Date(now).toLocaleString('en-IN'):'Saved · '+new Date(now).toLocaleString('en-IN'));window.departmentUX?.notice?.(original?'Time Sheet updated.':'Time Sheet saved.');
    }catch(error){status('Not saved · '+error.message)}finally{saving=false;paint()}
  }
  window.openQualityTime=open;window.closeQualityTime=close;window.qualityTimeTasks=TASKS;
})();
