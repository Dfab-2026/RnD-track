(function(){
  let root,entries=[],stop=null,session=0,connected=false,saving=false;
  const $=id=>document.getElementById('qt'+id),owner=()=>window.qualitySession.current(),key=s=>String(s||'').trim().toLowerCase();
  const TASKS=[
    {group:'Daily',value:'daily_incoming_inspection',label:'Incoming Inspection'},
    {group:'Daily',value:'daily_inprocess_inspection',label:'In-Process Inspection'},
    {group:'Daily',value:'daily_final_inspection',label:'Final Inspection'},
    {group:'Daily',value:'daily_documents',label:'ORG Document for Audit Readiness'},
    {group:'Daily',value:'daily_coordination',label:'Internal & External Coordination'},
    {group:'Daily',value:'kaizen_idea',label:'Kaizen Idea / Continuous Improvement'},
    {group:'Weekly',value:'weekly_audit',label:'Internal Audit of Each Department'},
    {group:'Weekly',value:'weekly_department_kpi',label:'Department-wise Quality KPI'},
    {group:'Weekly',value:'weekly_training',label:'Quality Training & Awareness'},
    {group:'Weekly',value:'weekly_kpi_report',label:'Weekly KPI Report Submission'},
    {group:'Monthly',value:'monthly_cost_reduction',label:'Quality Cost Reduction'},
    {group:'Monthly',value:'monthly_kpi_report',label:'Monthly KPI Report Submission'},
    {group:'ISO / Periodic',value:'iso_implementation',label:'ISO Process Implementation'},
    {group:'Other',value:'other',label:'Others'}
  ];
  const LEGACY_TASK_LABELS={daily_inspection:'Incoming / In-process / Final Inspection'};
  const taskLabel=(value,row)=>value==='other'?(String(row?.work||row?.custom_task||'Other task').trim()||'Other task'):(TASKS.find(t=>t.value===value)?.label||LEGACY_TASK_LABELS[value]||value||'Task');
  function status(message){if($('Status'))$('Status').textContent=message}
  function monthOf(date){return String(date||today()).slice(0,7)}
  function options(){return [...new Set(TASKS.map(t=>t.group))].map(group=>`<optgroup label="${esc(group)}">${TASKS.filter(t=>t.group===group).map(t=>`<option value="${esc(t.value)}">${esc(t.label)}</option>`).join('')}</optgroup>`).join('')}
  function duration(minutes){const h=Math.floor((Number(minutes)||0)/60),m=(Number(minutes)||0)%60;return `${h}h ${m}m`}
  function filters(){return{date:$('FilterDate')?.value||'',month:$('FilterMonth')?.value||'',task:$('FilterTask')?.value||'',state:$('FilterStatus')?.value||''}}
  function paint(){
    if(!root||root.hidden)return;
    const date=$('Date');if(date&&!date.value)date.value=today();if($('Month'))$('Month').value=monthOf(date?.value||today());
    if($('Save'))$('Save').disabled=saving||!connected;
    const f=filters();
    const rows=entries.filter(e=>key(e.owner)===key(owner())&&(!f.date||e.date===f.date)&&(!f.month||monthOf(e.date)===f.month)&&(!f.task||e.project_id===f.task)&&(!f.state||e.status===f.state)).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.from).localeCompare(String(a.from)));
    if($('Entries'))$('Entries').innerHTML=rows.length?rows.map(e=>`<article class="tc-entry qt-entry-row"><header><strong>${esc(taskLabel(e.project_id,e))}</strong><span>${esc(fmtDate(e.date))} · ${esc(e.from)}–${esc(e.to)} · <b>${duration(e.minutes)}</b></span></header><div class="qt-entry-meta"><span class="q-status ${e.status==='completed'?'done':'open'}">${esc(e.status==='completed'?'Completed':e.status==='in_progress'?'In progress':'Pending')}</span>${e.remarks?`<small>${esc(e.remarks)}</small>`:'<small>No remarks</small>'}</div></article>`).join(''):'<div class="empty-state">No saved Time Sheet records match these filters.</div>';
  }
  async function open(mount){
    if(!window.qualitySession.current()){window.openQuality();return}
    close();const token=++session;root=document.getElementById('qualityTimeWorkspace');if(!root){root=document.createElement('main');root.id='qualityTimeWorkspace';root.className='production-workspace';document.body.append(root)}
    if(mount)mount.append(root);root.hidden=false;document.getElementById('appShell').classList.add('app-locked');document.getElementById('loginGate').classList.add('hidden');
    root.innerHTML=`<div class="production-inner qt-rnd-sheet"><div class="section-toolbar"><div><span class="kicker">QUALITY WORK LOG</span><h2>Time Sheet</h2><p>Enter one work record in a single row. Date and month stay synced automatically.</p></div><span class="tc-person">${esc(owner())}</span></div><section class="panel tc-panel"><form id="qtForm" class="qt-inline-form"><label>Date<input id="qtDate" type="date" value="${today()}" required></label><label>Month<input id="qtMonth" type="month" value="${today().slice(0,7)}" readonly tabindex="-1"></label><label class="qt-task-field">Task<div class="qt-task-controls"><select id="qtTask" required><option value="">Select task</option>${options()}</select><input id="qtOtherTask" maxlength="180" placeholder="Enter task" hidden></div></label><label>From<input id="qtFrom" type="time" required></label><label>To<input id="qtTo" type="time" required></label><label>Status<select id="qtEntryStatus" required><option value="completed">Completed</option><option value="in_progress">In progress</option><option value="pending">Pending</option></select></label><label class="qt-remarks-field">Remarks<input id="qtRemarks" maxlength="1000" placeholder="Remarks"></label><button type="submit" id="qtSave" class="primary-btn" disabled>Save</button><p id="qtStatus" class="qt-inline-status" role="status" aria-live="polite">Connecting to Firebase…</p></form></section><section class="panel tc-panel"><div class="panel-head"><div><h3>Saved records</h3><span>Firebase history</span></div></div><div class="qt-filters"><label>Date<input id="qtFilterDate" type="date"></label><label>Month<input id="qtFilterMonth" type="month"></label><label>Task<select id="qtFilterTask"><option value="">All tasks</option>${options()}</select></label><label>Status<select id="qtFilterStatus"><option value="">All status</option><option value="completed">Completed</option><option value="in_progress">In progress</option><option value="pending">Pending</option></select></label><button type="button" class="ghost-btn" id="qtClearFilters">Clear</button></div><div id="qtEntries"></div></section></div>`;
    $('Date').onchange=()=>{$('Month').value=monthOf($('Date').value)};const syncOtherTask=()=>{const other=$('Task').value==='other';$('OtherTask').hidden=!other;$('OtherTask').required=other;if(!other)$('OtherTask').value=''};$('Task').onchange=syncOtherTask;syncOtherTask();$('Form').onsubmit=save;
    ['FilterDate','FilterMonth','FilterTask','FilterStatus'].forEach(id=>$(id).onchange=paint);$('ClearFilters').onclick=()=>{['FilterDate','FilterMonth','FilterTask','FilterStatus'].forEach(id=>$(id).value='');paint()};paint();
    try{stop=await window.rndCloud.watchQualityTime('entries',rows=>{if(token!==session)return;entries=rows;connected=true;status('Firebase connected · live Time Sheet');paint()},error=>{if(token!==session)return;connected=false;paint();status(error.message||'Firebase connection interrupted.')})}catch(error){if(token===session)status(error.message)}
  }
  function close(){session++;stop?.();stop=null;connected=false;entries=[];if(root)root.hidden=true}
  async function save(event){
    event.preventDefault();if(saving)return;if(!connected)return status('Firebase is still connecting. Please retry in a moment.');
    const date=$('Date').value,task=$('Task').value,customTask=$('OtherTask')?.value.trim()||'',from=$('From').value,to=$('To').value,state=$('EntryStatus').value,remarks=$('Remarks').value.trim(),minutes=window.rndTimeConsume.minutes(to)-window.rndTimeConsume.minutes(from);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return status('Choose a valid date.');if(!TASKS.some(t=>t.value===task))return status('Choose a task.');if(task==='other'&&!customTask)return status('Enter the task name for Others.');if(!['completed','in_progress','pending'].includes(state))return status('Choose a valid status.');if(remarks.length>1000)return status('Keep remarks within 1,000 characters.');if(!Number.isFinite(minutes)||minutes<=0)return status('Choose a To time later than the From time.');
    if(entries.some(e=>key(e.owner)===key(owner())&&e.date===date&&e.from<to&&from<e.to))return status('This time period overlaps a saved entry.');
    saving=true;paint();status('Saving to Firebase…');try{await window.rndCloud.saveQualityTime('entries',crypto.randomUUID(),{project_id:task,owner:owner(),date,from,to,minutes,work:task==='other'?customTask:taskLabel(task),custom_task:task==='other'?customTask:'',status:state,remarks,created_at:new Date().toISOString()});$('From').value=to;$('To').value='';$('Remarks').value='';if($('Task').value==='other')$('OtherTask').value='';status('Time Sheet record saved to Firebase.')}catch(error){status('Not saved · '+error.message)}finally{saving=false;paint()}
  }
  window.openQualityTime=open;window.closeQualityTime=close;window.qualityTimeTasks=TASKS;
})();
