(function(){
  let root,entries=[],stop=null,session=0,connected=false,saving=false;
  const $=id=>document.getElementById('qt'+id),owner=()=>window.qualitySession.current(),key=s=>String(s||'').trim().toLowerCase();
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
    {group:'Task List',value:'master_leave',label:'Leave'},
    {group:'Task List',value:'master_nowork',label:'No Work'},
    {group:'Other',value:'other',label:'Others'}
  ];
  const LEGACY_TASK_LABELS={daily_inspection:'Incoming / In-process / Final Inspection',daily_documents:'ORG Document for Audit Readiness',daily_coordination:'Internal & External Coordination',kaizen_idea:'Kaizen Idea / Continuous Improvement',weekly_audit:'Internal Audit of Each Department',weekly_department_kpi:'Department-wise Quality KPI',weekly_training:'Quality Training & Awareness',weekly_kpi_report:'Weekly KPI Report Submission',monthly_cost_reduction:'Quality Cost Reduction',monthly_kpi_report:'Monthly KPI Report Submission',iso_implementation:'ISO Process Implementation'};
  const taskLabel=(value,row)=>value==='other'?(String(row?.work||row?.custom_task||'Other task').trim()||'Other task'):(TASKS.find(t=>t.value===value)?.label||LEGACY_TASK_LABELS[value]||value||'Task');
  const clockLabel=value=>{if(!/^\d{2}:\d{2}$/.test(String(value||'')))return String(value||'');const [h,m]=String(value).split(':').map(Number),period=h>=12?'PM':'AM',hh=h%12||12;return `${hh}:${String(m).padStart(2,'0')} ${period}`};
  const timeOptions=selected=>{let html='<option value="">Select time</option>';for(let n=9*60;n<24*60;n+=15){const value=`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;html+=`<option value="${value}" ${value===selected?'selected':''}>${clockLabel(value)}</option>`}return html};
  function status(message){if($('Status'))$('Status').textContent=message}
  function monthOf(date){return String(date||today()).slice(0,7)}
  function options(){return [...new Set(TASKS.map(t=>t.group))].map(group=>`<optgroup label="${esc(group)}">${TASKS.filter(t=>t.group===group).map(t=>`<option value="${esc(t.value)}">${esc(t.label)}</option>`).join('')}</optgroup>`).join('')}
  function duration(minutes){const h=Math.floor((Number(minutes)||0)/60),m=(Number(minutes)||0)%60;return `${h}h ${m}m`}
  function filters(){return{date:$('FilterDate')?.value||'',po:key($('FilterPo')?.value||''),task:$('FilterTask')?.value||'',state:$('FilterStatus')?.value||''}}
  function paint(){
    if(!root||root.hidden)return;
    const date=$('Date');if(date&&!date.value)date.value=today();
    if($('Save'))$('Save').disabled=saving||!connected;
    const f=filters();
    const rows=entries.filter(e=>key(e.owner)===key(owner())&&(!f.date||e.date===f.date)&&(!f.po||key(e.po_number).includes(f.po))&&(!f.task||e.project_id===f.task)&&(!f.state||e.status===f.state)).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.from).localeCompare(String(a.from)));
    if($('Entries'))$('Entries').innerHTML=rows.length?rows.map(e=>`<article class="tc-entry qt-entry-row"><header><strong>${esc(taskLabel(e.project_id,e))}</strong><span>${esc(fmtDate(e.date))} · PO ${esc(e.po_number||'—')} · ${esc(clockLabel(e.from))}–${esc(clockLabel(e.to))} · <b>${duration(e.minutes)}</b></span></header><div class="qt-entry-meta"><span class="q-status ${e.status==='completed'?'done':'open'}">${esc(e.status==='completed'?'Completed':e.status==='in_progress'?'In progress':'Pending')}</span>${e.remarks?`<small>${esc(e.remarks)}</small>`:'<small>No remarks</small>'}</div></article>`).join(''):'<div class="empty-state">No saved Time Sheet records match these filters.</div>';
  }
  async function open(mount){
    if(!window.qualitySession.current()){window.openQuality();return}
    close();const token=++session;root=document.getElementById('qualityTimeWorkspace');if(!root){root=document.createElement('main');root.id='qualityTimeWorkspace';root.className='production-workspace';document.body.append(root)}
    if(mount)mount.append(root);root.hidden=false;document.getElementById('appShell').classList.add('app-locked');document.getElementById('loginGate').classList.add('hidden');
    root.innerHTML=`<div class="production-inner qt-rnd-sheet"><div class="section-toolbar"><div><span class="kicker">QUALITY WORK LOG</span><h2>Time Sheet</h2><p>Enter one work record in a single row. PO Number identifies the product/job for this entry.</p></div><span class="tc-person">${esc(owner())}</span></div><section class="panel tc-panel"><form id="qtForm" class="qt-inline-form"><label>Date<input id="qtDate" type="date" value="${today()}" required></label><label>PO Number<input id="qtPo" type="text" maxlength="80" autocomplete="off" placeholder="PO number / NA / NO PO" required></label><label class="qt-task-field">Task<div class="qt-task-controls"><select id="qtTask" required><option value="">Select task</option>${options()}</select><input id="qtOtherTask" type="text" maxlength="180" autocomplete="off" placeholder="Enter other task" hidden></div></label><label>From<div class="tc-clock-field"><input id="qtFrom" type="text" value="09:00" readonly required aria-label="From time"><button type="button" data-qt-clock="qtFrom" aria-label="Choose From time">🕘</button></div></label><label>To<div class="tc-clock-field"><input id="qtTo" type="text" value="" readonly required aria-label="To time"><button type="button" data-qt-clock="qtTo" aria-label="Choose To time">🕘</button></div></label><label>Status<select id="qtEntryStatus" required><option value="completed">Completed</option><option value="in_progress">In progress</option><option value="pending">Pending</option></select></label><label class="qt-remarks-field">Remarks<input id="qtRemarks" maxlength="1000" placeholder="Remarks"></label><button type="submit" id="qtSave" class="primary-btn" disabled>Save</button><p id="qtStatus" class="qt-inline-status" role="status" aria-live="polite">Connecting to Firebase…</p></form></section><section class="panel tc-panel"><div class="panel-head"><div><h3>Saved records</h3><span>Firebase history</span></div></div><div class="qt-filters"><label>Date<input id="qtFilterDate" type="date"></label><label>PO Number<input id="qtFilterPo" type="text" maxlength="80" placeholder="Search PO"></label><label>Task<select id="qtFilterTask"><option value="">All tasks</option>${options()}</select></label><label>Status<select id="qtFilterStatus"><option value="">All status</option><option value="completed">Completed</option><option value="in_progress">In progress</option><option value="pending">Pending</option></select></label><button type="button" class="ghost-btn" id="qtClearFilters">Clear</button></div><div id="qtEntries"></div></section></div>`;
    const syncOtherTask=()=>{const other=$('Task').value==='other';$('OtherTask').hidden=!other;$('OtherTask').disabled=!other;$('OtherTask').required=other;if(!other)$('OtherTask').value='';else requestAnimationFrame(()=>$('OtherTask').focus())};$('Task').onchange=syncOtherTask;syncOtherTask();root.querySelectorAll('[data-qt-clock]').forEach(b=>{const input=$(b.dataset.qtClock);const open=()=>{if(typeof window.rndTimeClock==='function')window.rndTimeClock(input);else status('Time picker is loading. Please retry.');};b.onclick=open;if(input){input.onclick=open;input.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}}}});$('Form').onsubmit=save;
    ['FilterDate','FilterTask','FilterStatus'].forEach(id=>$(id).onchange=paint);$('FilterPo').oninput=paint;$('ClearFilters').onclick=()=>{['FilterDate','FilterPo','FilterTask','FilterStatus'].forEach(id=>$(id).value='');paint()};paint();
    try{stop=await window.rndCloud.watchQualityTime('entries',rows=>{if(token!==session)return;entries=rows;connected=true;status('Firebase connected · live Time Sheet');paint()},error=>{if(token!==session)return;connected=false;paint();status(error.message||'Firebase connection interrupted.')})}catch(error){if(token===session)status(error.message)}
  }
  function close(){session++;stop?.();stop=null;connected=false;entries=[];if(root)root.hidden=true}
  async function save(event){
    event.preventDefault();if(saving)return;if(!connected)return status('Firebase is still connecting. Please retry in a moment.');
    const date=$('Date').value,po=$('Po').value.trim(),task=$('Task').value,customTask=$('OtherTask')?.value.trim()||'',from=$('From').value,to=$('To').value,state=$('EntryStatus').value,remarks=$('Remarks').value.trim(),minutes=window.rndTimeConsume.minutes(to)-window.rndTimeConsume.minutes(from);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return status('Choose a valid date.');if(!po)return status('Enter a PO Number, or use NA / N/A / NO PO when not applicable.');if(!TASKS.some(t=>t.value===task))return status('Choose a task.');if(task==='other'&&!customTask)return status('Enter the task name for Others.');if(!['completed','in_progress','pending'].includes(state))return status('Choose a valid status.');if(remarks.length>1000)return status('Keep remarks within 1,000 characters.');if(!Number.isFinite(minutes)||minutes<=0)return status('Choose a To time later than the From time.');
    if(entries.some(e=>key(e.owner)===key(owner())&&e.date===date&&e.from<to&&from<e.to))return status('This time period overlaps a saved entry.');
    saving=true;paint();status('Saving to Firebase…');try{await window.rndCloud.saveQualityTime('entries',crypto.randomUUID(),{project_id:task,owner:owner(),date,po_number:po,from,to,minutes,work:task==='other'?customTask:taskLabel(task),custom_task:task==='other'?customTask:'',status:state,remarks,created_at:new Date().toISOString()});$('From').value=to;$('To').value='';$('Remarks').value='';if($('Task').value==='other')$('OtherTask').value='';status('Time Sheet record saved to Firebase.')}catch(error){status('Not saved · '+error.message)}finally{saving=false;paint()}
  }
  window.openQualityTime=open;window.closeQualityTime=close;window.qualityTimeTasks=TASKS;
})();
