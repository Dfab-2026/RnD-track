(function(){
  const pages={dashboard:'Dashboard',ideas:'Kaizen Ideas',weekly:'Weekly Report',report:'KPI Report',settings:'Settings'};
  const trackedKinds=['iso','audit','kpi','training','documents','incoming','coordination','cost','attrition','kaizen'];
  let root,records=[],timeEntries=[],stops=[],generation=0,ready=false,serverConnected=false,cloudMessage='Connecting…',page='dashboard',editId='',busy=false,reportMonth='';
  const $=id=>document.getElementById('q'+id),adminView=()=>Boolean(window.adminSession?.active?.()),person=()=>adminView()?window.adminSession.name():window.qualitySession.current(),clean=s=>String(s||'').trim().toLowerCase();
  const qualityRole=()=>clean(person())==='mohan'?'Quality Lead':'Member';
  const qualityRoleLabel=()=>clean(person())==='mohan'?'QUALITY LEAD':'MEMBER';
  const options=()=>activeDepartments().map(d=>`<option value="${Number(d.id)}">${esc(d.name)}</option>`).join('');
  let pendingPopupShownThisOpen=false,lastNotificationSignature='';
  function qualityExpectedDailyPending(){
    const date=today(),taskOwner='Navarasu';
    const found=records.find(r=>r.kind==='daily_idea'&&r.date===date&&clean(r.person)===clean(taskOwner));
    return found?[]:[{id:`missing_kaizen_${date}_${encodeURIComponent(clean(taskOwner))}`,kind:'ideas',person:taskOwner,date,status:'pending',title:"Submit today's Kaizen Idea",synthetic:true}];
  }
  function qualityPendingSummary(){
    if(adminView())return{mine:[],reviews:[],team:[],total:0};
    const me=clean(person());
    const active=records.filter(r=>['pending','in_progress'].includes(String(r.status||'')));
    const expected=qualityExpectedDailyPending();
    const combined=[...active,...expected];
    const unique=[...new Map(combined.map(r=>[r.id||`${r.kind}_${r.date}_${clean(r.person)}_${r.title||''}`,r])).values()];
    const mine=unique.filter(r=>clean(r.person)===me);
    const team=unique.filter(r=>clean(r.person)!==me);
    const reviews=window.qualityReview?.dueItems?.(dailyContext())||[];
    return {mine,reviews,team,total:mine.length+reviews.length+team.length};
  }
  function qualityNoticeLabel(row){
    if(row.kind==='report')return 'KPI REVIEW';
    if(row.kind==='ideas')return 'KAIZEN IDEA';
    return String(pages[row.kind]||row.title||'QUALITY').toUpperCase();
  }
  function qualityNoticeTitle(row){
    return row.title||state.departments.find(d=>Number(d.id)===Number(row.department_id))?.name||fmtDate(row.date)||'Pending Quality item';
  }
  function qualityNoticeHtml(row,scope){
    const status=row.kind==='report'?'REVIEW':String(row.status||'pending').replace('_',' ').toUpperCase();
    return `<button type="button" class="notification-item ${scope==='Mine'?'mine':''}" data-q-notice="${esc(row.kind||'report')}"><div class="notification-item-main"><div class="notification-item-top"><span class="notification-owner">${esc(scope==='Mine'?'MY TASK':row.person||'QUALITY TEAM')}</span><span class="notification-date">${esc(row.date?fmtDate(row.date):fmtDate(today()))}</span></div><strong>${esc(qualityNoticeLabel(row))}</strong><small>${esc(qualityNoticeTitle(row))}</small></div><span class="pending-status">${esc(status)}</span></button>`;
  }
  function updateQualityNotificationBadge(){
    const badge=$('BellBadge');if(!badge)return;const data=qualityPendingSummary();badge.textContent=String(Math.min(data.total,99));badge.classList.toggle('hidden',data.total<=0);badge.title=`${data.total} Quality pending item${data.total===1?'':'s'}`;
  }
  function renderQualityNotificationCenter(){
    const host=$('NotificationItems');if(!host)return;const data=qualityPendingSummary();
    const mine=[...data.reviews,...data.mine];
    host.innerHTML=`<section class="notification-group"><div class="notification-group-title"><span>MY PENDING</span><b>${mine.length}</b></div>${mine.map(r=>qualityNoticeHtml(r,'Mine')).join('')||'<div class="notification-empty">No pending tasks for you.</div>'}</section><section class="notification-group"><div class="notification-group-title"><span>TEAM PENDING</span><b>${data.team.length}</b></div>${data.team.map(r=>qualityNoticeHtml(r,'Team')).join('')||'<div class="notification-empty">No pending tasks from other Quality members.</div>'}</section>`;
    host.querySelectorAll('[data-q-notice]').forEach(button=>button.onclick=()=>{const kind=button.dataset.qNotice;dailyContext().navigate(kind);$('Notifications')?.classList.add('hidden');$('Bell')?.setAttribute('aria-expanded','false')});
    updateQualityNotificationBadge();
  }
  function qualityOwnPendingItems(){const data=qualityPendingSummary();return [...data.reviews,...data.mine]}
  function showQualityPendingPopup(){
    const items=qualityOwnPendingItems();if(!items.length||document.getElementById('qPendingDialog')?.open)return;
    let dialog=document.getElementById('qPendingDialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='qPendingDialog';dialog.className='modal pending-task-dialog';document.body.append(dialog)}
    dialog.innerHTML=`<div class="pending-task-panel"><div class="modal-head"><div><span class="kicker">DAILY ATTENTION</span><h2>Pending Tasks</h2><p>Your pending Quality work. Select an item to open it.</p></div><div class="pending-total"><span>PENDING</span><strong>${items.length}</strong></div></div><div class="pending-task-content"><section class="pending-day single"><div class="pending-day-head"><div><span>MY PENDING WORK</span><strong>${esc(person())}</strong></div><b>${items.length}</b></div>${items.map(r=>`<button type="button" class="pending-task-item pending-popup-link" data-q-popup="${esc(r.kind||'report')}"><div><strong>${esc(qualityNoticeLabel(r))}</strong><h4>${esc(qualityNoticeTitle(r))}</h4><p>${esc(r.kind==='report'?'KPI remarks/review is due today.':r.status==='in_progress'?'Work is still in progress.':'Pending item needs attention.')}</p></div><span class="pending-status">${r.kind==='report'?'REVIEW':String(r.status||'pending').replace('_',' ').toUpperCase()}</span></button>`).join('')}</section></div><div class="modal-actions pending-actions"><button class="secondary-btn" id="qPendingNotify" type="button">Enable Chrome Notifications</button><button class="primary-btn" id="qPendingClose" type="button">Got it</button></div></div>`;
    const notifyBtn=dialog.querySelector('#qPendingNotify');if(notifyBtn)notifyBtn.classList.toggle('hidden',!('Notification' in window)||Notification.permission==='granted');
    notifyBtn?.addEventListener('click',()=>requestNotificationsFromGesture?.());dialog.querySelector('#qPendingClose').onclick=()=>dialog.close();
    dialog.querySelectorAll('[data-q-popup]').forEach(b=>b.onclick=()=>{dialog.close();dailyContext().navigate(b.dataset.qPopup)});dialog.showModal();
  }
  function maybeShowQualityPendingPopup(){if(pendingPopupShownThisOpen||!ready)return;const items=qualityOwnPendingItems();if(!items.length)return;pendingPopupShownThisOpen=true;setTimeout(showQualityPendingPopup,450)}
  function maybeTriggerQualityNotification(){
    if(!serverConnected||!notificationsEnabled?.())return;const items=qualityOwnPendingItems();if(!items.length)return;const signature=items.map(x=>`${x.kind}:${x.id||x.title||''}:${x.status||''}`).sort().join('|');if(signature===lastNotificationSignature)return;lastNotificationSignature=signature;const key=`quality_pending_notice_${clean(person())}_${today()}_${btoa(unescape(encodeURIComponent(signature))).slice(0,24)}`;if(localStorage.getItem(key))return;notifyUser('Quality Track · My Pending',`${items.length} pending item${items.length===1?'':'s'} need your attention.`);localStorage.setItem(key,'1');
  }
  function qualityHourlyTimesheetReminder(){
    if(adminView())return;
    const now=new Date(),member=person();if(!member||!root||root.hidden||now.getDay()===0||now.getHours()<9||now.getHours()>17)return;
    const reminderKey=`timesheet-hourly:quality:${clean(member)}:${today()}:${now.getHours()}`;if(localStorage.getItem(reminderKey))return;
    const message='Please update your Time Sheet for the work completed during the past hour.';
    if(typeof notificationsEnabled==='function'&&notificationsEnabled()&&typeof notifyUser==='function')notifyUser('Quality · Time Sheet Reminder',message);
    if(document.hidden){if(typeof notificationsEnabled==='function'&&notificationsEnabled())localStorage.setItem(reminderKey,'1');return}
    if(document.querySelector('dialog[open]')||/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||''))return;
    const dialog=document.createElement('dialog');dialog.className='modal tc-reminder';dialog.id='qHourlyTimesheetReminder';dialog.innerHTML='<div class="tc-clock-inner"><span class="kicker">HOURLY TIME SHEET</span><h2>Update your Time Sheet</h2><p>Please record the work completed during the past hour.</p><div class="tc-clock-actions"><button class="ghost-btn" type="button" data-later>Close</button><button class="primary-btn" type="button" data-enter>Open Time Sheet</button></div></div>';document.body.append(dialog);
    dialog.querySelector('[data-later]').onclick=()=>dialog.close();dialog.querySelector('[data-enter]').onclick=()=>{dialog.close();$('Time')?.click();setTimeout(()=>document.getElementById('qtTask')?.focus(),0)};dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();localStorage.setItem(reminderKey,'1');
  }
  function weekRange(date=today()){const d=new Date(date+'T12:00:00'),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);const start=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');d.setDate(d.getDate()+6);return{start,end:[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}}
  const field=(label,name,type='text',required=true)=>`<label>${label}<input name="${name}" type="${type}" ${required?'required':''} maxlength="200"></label>`;
  const area=(label,name,required=true)=>`<label class="q-full">${label}<textarea name="${name}" maxlength="2000" rows="3" ${required?'required':''}></textarea></label>`;
  function renderForm(){
    root?.classList.toggle('q-dashboard-page',page==='dashboard');
    const personBar=root?.querySelector('.quality-person');if(personBar)personBar.hidden=page==='report';
    $('FormHost').parentElement.classList.toggle('q-unwrapped',['dashboard','ideas','weekly','report'].includes(page));
    if($('SavedPanel'))$('SavedPanel').hidden=['settings','dashboard','report','ideas','weekly'].includes(page);
    if(['dashboard','ideas'].includes(page)){window.qualityDaily.render(page,$('FormHost'),dailyContext());return}
    if(['weekly','report'].includes(page)){window.qualityReview.render(page,$('FormHost'),dailyContext());return}
    if(page==='settings'){$('FormHost').innerHTML=`<div class="settings-card-head"><div><span class="kicker">CURRENT SESSION</span><h3>Settings</h3></div></div><div class="setting-row"><span>Signed in as</span><strong>${esc(person())}</strong></div><div class="setting-row"><span>Role</span><strong>${esc(adminView()?'All Departments Leader':qualityRole())}</strong></div><div class="setting-row"><span>Firebase</span><strong id="qSettingsCloud">${ready?'Connected':'Connecting / offline'}</strong></div><div class="modal-actions"><button type="button" id="qTestCloud" class="ghost-btn">Test connection</button><button type="button" id="qLogout" class="primary-btn">Logout</button></div><p role="status" id="qSettingsStatus"></p><div id="qMonthlyBackup"></div>`;$('Logout').onclick=()=>{close();if(adminView()){window.adminSession.logout();showDepartmentGate();return}window.qualitySession.logout();page='dashboard';open()};$('TestCloud').onclick=async()=>{const button=$('TestCloud');button.disabled=true;try{const result=await window.rndCloud.test();$('SettingsStatus').textContent=result.message||'Connection checked.'}catch(error){$('SettingsStatus').textContent=error.message}finally{button.disabled=false}};window.monthBackup?.mount($('MonthlyBackup'),{key:'quality',label:'Quality',mode:'quality'});return}
    editId='';const dept=`<label>Department<select name="department_id" required>${options()}</select></label>`,date=`<label>Date<input name="date" type="date" value="${today()}" readonly></label>`;
    let fields=date;
    if(['iso','coordination','cost','attrition'].includes(page))fields+=field(page==='iso'?'Process / implementation activity':page==='coordination'?'Coordination activity':page==='cost'?'Cost reduction activity':'Attrition observation','title')+'<label>Status<select name="status"><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label>'+area('Details / remarks','remarks',false);
    if(page==='audit')fields+=dept+'<label>Status<select name="status"><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label>'+area('Remarks','remarks',true);
    if(page==='kpi')fields+=dept+field('Quality KPI / measure','title')+'<label>Status<select name="status"><option value="pending">Not completed</option><option value="completed">Completed</option></select></label>'+area('Remarks','remarks',false);
    if(page==='training')fields+=field('Candidate name','candidate')+field('Role','role')+field('Training from','start_date','date')+field('Training to','end_date','date')+area('Training outcomes','outcomes');
    if(page==='documents')fields+='<label>Records maintained today<select name="status"><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label>'+area('Record details / remarks','remarks',false);
    if(page==='incoming')fields+=field('Incoming material / inspection','title')+'<label class="q-check"><input name="report_submitted" type="checkbox"> Inspection report submitted</label>'+field('Report reference','report_reference','text',false)+area('Remarks','remarks',false);
    if(page==='kaizen')fields+=area('Today’s Kaizen idea','idea')+area('Expected improvement','outcomes',false);
    $('FormHost').innerHTML=`<form id="qForm"><div class="q-fields">${fields}</div><div class="tc-actions"><p id="qFormStatus" role="status"></p><button class="primary-btn" type="submit" ${ready?'':'disabled'}>Save record</button></div></form>`;
    const form=$('Form');form.onsubmit=save;
    if(page==='audit'){const sync=()=>{const completed=form.elements.status.value==='completed';form.elements.remarks.required=!completed;form.elements.remarks.closest('label').hidden=completed;if(!completed)remarksDialog(form)};form.elements.status.onchange=sync;form.elements.remarks.required=true}
    if(page==='incoming')form.elements.report_submitted.onchange=()=>{form.elements.report_reference.required=form.elements.report_submitted.checked};
    paint();
  }
  function remarksDialog(form){
    if(document.querySelector('dialog[open]'))return;const dialog=document.createElement('dialog');dialog.className='modal small';dialog.innerHTML='<form><div class="modal-head"><h2>Audit remarks</h2></div><label>Explain the pending or in-progress work<textarea required maxlength="2000" rows="4"></textarea></label><div class="modal-actions"><button type="submit" class="primary-btn">Apply remarks</button></div></form>';document.body.append(dialog);dialog.querySelector('textarea').value=form.elements.remarks.value;dialog.querySelector('form').onsubmit=e=>{e.preventDefault();form.elements.remarks.value=dialog.querySelector('textarea').value.trim();if(form.elements.remarks.value)dialog.close()};dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
  }
  function overviewRows(month=''){
    const aliases={daily_inspection:'incoming',daily_documents:'documents',daily_coordination:'coordination'};const rows=records.map(r=>aliases[r.kind]?{...r,kind:aliases[r.kind]}:r).filter(r=>trackedKinds.includes(r.kind)&&(!month||String(r.date).startsWith(month)));
    return{rows,summary:trackedKinds.map(kind=>{const group=rows.filter(r=>r.kind===kind);return{kind,total:group.length,completed:group.filter(r=>r.status==='completed').length,progress:group.filter(r=>r.status==='in_progress').length,pending:group.filter(r=>r.status==='pending').length}})};
  }
  function renderOverview(){
    if(!$('FormHost'))return;const report=page==='report';if(report&&!reportMonth)reportMonth=today().slice(0,7);const data=overviewRows(report?reportMonth:''),done=data.rows.filter(r=>r.status==='completed').length;
    $('FormHost').innerHTML=`${report?`<div class="q-report-filter"><label>Reporting month<input id="qReportMonth" type="month" value="${esc(reportMonth)}"></label><span>Counts reflect saved Quality records and their current status.</span></div>`:''}<div class="metric-grid q-overview-metrics"><article class="metric"><span class="m-label">QUALITY RECORDS</span><strong>${data.rows.length}</strong></article><article class="metric"><span class="m-label">COMPLETED</span><strong>${done}</strong></article><article class="metric"><span class="m-label">IN PROGRESS</span><strong>${data.rows.filter(r=>r.status==='in_progress').length}</strong></article><article class="metric"><span class="m-label">PENDING</span><strong>${data.rows.filter(r=>r.status==='pending').length}</strong></article></div><div class="q-overview-list">${data.summary.map(row=>`<button type="button" class="q-overview-row" data-q-overview="${row.kind}"><strong>${esc(pages[row.kind])}</strong><span>${row.total?`${row.completed} completed · ${row.progress} in progress · ${row.pending} pending`:'No records yet'}</span><b>→</b></button>`).join('')}</div>`;
    $('FormHost').querySelectorAll('[data-q-overview]').forEach(button=>button.onclick=()=>dailyContext().navigate(button.dataset.qOverview));
    if(report){const section=document.createElement('div');$('FormHost').append(section);window.qualityDaily.render('report',section,dailyContext())}
    if(report)$('ReportMonth').onchange=()=>{reportMonth=$('ReportMonth').value;if(/^\d{4}-\d{2}$/.test(reportMonth))renderOverview()};
  }
  function paint(){
    if(!root||root.hidden)return;const owner=clean(person()),rows=records.filter(r=>r.kind===page).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)));
    const stateClass=serverConnected?'live':ready?'connecting':'offline';
    const stateText=serverConnected?'Connected · Firebase':ready?'Syncing · cached data':cloudMessage||'Connecting / offline';
    updateQualityNotificationBadge();if($('Notifications')&&!$('Notifications').classList.contains('hidden'))renderQualityNotificationCenter();if(ready){maybeShowQualityPendingPopup();maybeTriggerQualityNotification()}
    if($('ProfileCloud'))$('ProfileCloud').textContent=stateText;
    if($('CloudDot'))$('CloudDot').className='profile-cloud-dot '+stateClass;
    if($('Connection'))$('Connection').textContent=serverConnected?'Firebase connected · live data':stateText;
    if(page==='settings'){if($('SettingsCloud'))$('SettingsCloud').textContent=stateText;return}
    if(['dashboard','ideas'].includes(page)){window.qualityDaily.render(page,$('FormHost'),dailyContext());return}
    if(['weekly','report'].includes(page)){window.qualityReview.render(page,$('FormHost'),dailyContext());return}
    if(page==='kaizen'){const range=weekRange(),count=records.filter(r=>r.kind==='kaizen'&&clean(r.person)===owner&&r.date>=range.start&&r.date<=range.end).length;$('Summary').textContent=`${fmtDate(range.start)} – ${fmtDate(range.end)} · ${count}/5 ideas this week · ${count>=5?'Target completed':'1 idea per day'}`}
    else $('Summary').textContent='';
    $('Records').innerHTML=rows.length?rows.map(r=>{const department=state.departments.find(d=>Number(d.id)===Number(r.department_id))?.name||'',label=r.status==='completed'?'Completed':r.status==='in_progress'?'In progress':r.status==='pending'?'Pending':'Recorded';return `<article class="tc-entry"><header><strong>${esc(r.title||r.candidate||r.idea||department||pages[r.kind])}</strong><span>${esc(fmtDate(r.date))} · ${esc(r.person)} <b class="q-status ${r.status==='completed'?'done':'open'}">${label}</b></span></header>${department?`<small>${esc(department)}</small>`:''}${r.role?`<p>${esc(r.role)} · ${esc(fmtDate(r.start_date))} – ${esc(fmtDate(r.end_date))}</p>`:''}${r.outcomes?`<p>${esc(r.outcomes)}</p>`:''}${r.remarks?`<p>${esc(r.remarks)}</p>`:''}${r.report_reference?`<small>Report: ${esc(r.report_reference)}</small>`:''}<div><button type="button" class="mini-action" data-quality-edit="${esc(r.id)}">Edit</button></div></article>`}).join(''):'<div class="empty-state">No records saved yet.</div>';
    $('Records').querySelectorAll('[data-quality-edit]').forEach(button=>button.onclick=()=>{const record=records.find(r=>r.id===button.dataset.qualityEdit);if(!record)return;if(clean(record.person)!==clean(person()))return $('FormStatus').textContent='You can edit only records saved under your login.';editId=record.id;for(const [key,value]of Object.entries(record)){const el=$('Form').elements.namedItem(key);if(el){if(el.type==='checkbox')el.checked=Boolean(value);else el.value=value}}if(page==='audit'){$('Form').elements.remarks.closest('label').hidden=record.status==='completed';$('Form').elements.remarks.required=record.status!=='completed'}$('FormStatus').textContent='Editing saved record';$('Form').scrollIntoView({behavior:'smooth',block:'start'})});
    const button=$('Form')?.querySelector('[type=submit]');if(button)button.disabled=!ready||busy;
  }
  function validate(row){
    if(!row.person||row.person.length>80)throw Error('Enter your name (maximum 80 characters).');
    if(row.kind==='audit'&&row.status!=='completed'&&!row.remarks?.trim())throw Error('Remarks are required for pending and in-progress audits.');
    if(['audit','kpi'].includes(row.kind)&&!activeDepartments().some(d=>Number(d.id)===Number(row.department_id)))throw Error('Select a department.');
    if(row.kind==='training'&&(!row.candidate?.trim()||!row.role?.trim()||!row.outcomes?.trim()||!row.start_date||!row.end_date||row.end_date<row.start_date))throw Error('Enter candidate, role, valid training period and outcomes.');
    if(row.kind==='kaizen'&&!row.idea?.trim())throw Error('Enter today’s Kaizen idea.');
    if(['kpi','incoming','iso','coordination','cost','attrition'].includes(row.kind)&&!row.title?.trim())throw Error('Enter the activity, KPI or inspection name.');
    if(row.kind==='incoming'&&row.report_submitted&&!row.report_reference?.trim())throw Error('Enter the submitted report reference.');
    for(const value of Object.values(row))if(typeof value==='string'&&value.length>2000)throw Error('Keep each field within 2,000 characters.');
    return row;
  }
  async function save(event){
    event.preventDefault();if(!ready||busy)return;const form=$('Form'),values=Object.fromEntries(new FormData(form)),row={kind:page,person:person(),...values,actor_role:adminView()?'all_departments_leader':'quality_member',actor_scope:adminView()?'all_departments':'quality',actor_name:person(),updated_at:new Date().toISOString()};
    row.date=editId?records.find(r=>r.id===editId)?.date||today():today();if(row.department_id)row.department_id=Number(row.department_id);
    if(page==='incoming'){row.report_submitted=form.elements.report_submitted.checked;row.status=row.report_submitted?'completed':'in_progress'}
    if(page==='training'||page==='kaizen')row.status='completed';if(page==='audit'&&row.status==='completed')row.remarks='';
    try{validate(row);if(!editId&&page==='kaizen'&&records.some(r=>r.kind==='kaizen'&&r.date===today()&&clean(r.person)===clean(row.person)))throw Error('One idea per day is already saved. Use Edit to update it.');busy=true;paint();$('FormStatus').textContent='Saving to Firebase…';const id=editId||(page==='kaizen'?`kaizen_${today()}_${encodeURIComponent(clean(row.person))}`:crypto.randomUUID());const confirmed=await window.rndCloud.saveQualityTime('records',id,row);records=[...records.filter(r=>r.id!==id),{...row,...confirmed,id:confirmed?.id||id}];ready=true;serverConnected=true;cloudMessage='Firebase connected · live data';localStorage.setItem('qualityMemberName',row.person);renderForm();$('FormStatus').textContent='Saved and verified in Firebase.'}catch(error){$('FormStatus').textContent=error.message||'Unable to save.'}finally{busy=false;paint()}
  }
  function close(){generation++;stops.forEach(stop=>stop?.());stops=[];ready=false;serverConnected=false;timeEntries=[];pendingPopupShownThisOpen=false;lastNotificationSignature='';cloudMessage='Connecting…';root?._qualityResize?.();if(root)root.hidden=true;window.closeQualityTime?.();window.qualitySession.hide()}
  function dailyContext(){return{records,timeEntries,ready,person,upsert:row=>{records=[...records.filter(r=>r.id!==row.id),row];paint()},remove:id=>{records=records.filter(r=>r.id!==id);paint()},navigate:id=>{const target=['audit','kpi','training'].includes(id)?'weekly':pages[id]?id:'report';root.querySelector('[data-q-page="'+target+'"]')?.click()}}}
  async function open(){
    if(!adminView()&&!window.qualitySession.current()){close();window.qualitySession.show(open);return}window.qualitySession.hide();
    close();window.closeProduction?.();const token=++generation;root=document.getElementById('qualityWorkspace');if(!root){root=document.createElement('main');root.id='qualityWorkspace';root.className='quality-workspace';document.body.append(root)}root.hidden=false;document.getElementById('appShell').classList.add('app-locked');document.getElementById('loginGate').classList.add('hidden');
    root.innerHTML=`<div class="quality-shell"><aside class="sidebar q-sidebar" id="qSidebar"><div class="brand"><span class="brand-mark dfab-brand-mark"><img src="assets/dfab-logo.png" alt="DFAB" width="44" height="44"></span><div class="brand-copy"><strong>QUALITY TRACK</strong><small>DFAB OPERATIONS</small></div><button type="button" id="qCollapse" class="q-collapse" aria-label="Collapse navigation">‹</button><button type="button" id="qCloseNav" class="q-close-nav" aria-label="Close navigation">×</button></div><nav aria-label="Quality pages">${Object.entries(pages).filter(([id])=>!['settings','incoming','documents','coordination'].includes(id)).map(([id,label],index)=>`<button type="button" data-q-page="${id}" aria-label="${label}" title="${label}" class="nav-btn ${id===page?'active':''}"><span>${String(index+1).padStart(2,'0')}</span><b>${label}</b></button>`).join('')}<button type="button" class="nav-btn" id="qTime" aria-label="Time Sheet" title="Time Sheet"><span>05</span><b>Time Sheet</b></button><button type="button" class="nav-btn" data-q-page="settings" aria-label="Settings" title="Settings"><span>06</span><b>Settings</b></button></nav><div class="side-note"><b>QUALITY TEAM</b><p>Audits, improvement and daily work records.</p></div><button type="button" class="nav-btn q-departments" id="qBack"><span>←</span><b>All departments</b></button></aside><button class="q-backdrop" id="qBackdrop" hidden aria-label="Close navigation"></button><div class="main q-main"><header class="topbar"><button type="button" class="q-open-nav" id="qOpenNav" aria-label="Open navigation" aria-controls="qSidebar" aria-expanded="false">☰</button><div><div class="eyebrow">QUALITY OPERATIONS</div><div class="dfab-page-heading"><img src="assets/dfab-logo.png" alt="DFAB" width="66" height="28"><h1 id="qTitle">${pages[page]}</h1></div></div><div class="top-actions compact-top-actions"><div class="notification-center-wrap header-tool-wrap"><button type="button" class="header-tool-btn notification-bell" id="qBell" aria-label="Open notifications" aria-expanded="false">🔔<span id="qBellBadge" class="notification-badge hidden">0</span></button><section class="notification-panel hidden" id="qNotifications" aria-label="Quality notifications"><div class="notification-panel-head"><h3>Notifications</h3><button type="button" class="icon-btn" id="qCloseNotifications" aria-label="Close notifications">×</button></div><div id="qNotificationItems" class="notification-panel-content"></div></section></div><div class="profile-quick-wrap"><button class="profile-quick-btn" id="qProfile" type="button" aria-label="Open profile" aria-expanded="false"><span>${esc(person().charAt(0))}</span><i class="profile-cloud-dot connecting" id="qCloudDot"></i></button><section class="profile-quick-panel hidden" id="qProfilePanel" aria-label="Profile details"><div class="profile-quick-head"><div class="profile-quick-avatar">${esc(person().charAt(0))}</div><div><strong>${esc(person())}</strong><small>${esc(adminView()?'ALL DEPARTMENTS LEADER':qualityRoleLabel())}</small></div></div><div class="profile-quick-row"><span>Cloud</span><b id="qProfileCloud">Connecting</b></div><button type="button" class="ghost-btn profile-settings-link" id="qProfileSettings">Open Settings</button></section></div></div></header><div class="q-scroll" id="qScroll"><div id="qRecordArea"><div class="quality-person"><span class="q-signed-in">Signed in as <strong>${esc(person())}</strong></span><span id="qConnection" role="status">Connecting…</span></div><section class="panel tc-panel"><div id="qFormHost"></div></section><section class="panel tc-panel" id="qSavedPanel"><div class="panel-head"><h3>Saved records</h3><span id="qSummary"></span></div><div id="qRecords"></div></section></div><div id="qTimeHost" hidden></div></div></div></div>`;
    $('Back').onclick=()=>showDepartmentGate();
    const mobile=()=>window.matchMedia('(max-width:980px)').matches;
    function nav(open){$('Sidebar').classList.toggle('open',open);$('Backdrop').hidden=!open;$('OpenNav').setAttribute('aria-expanded',String(open));$('Sidebar').inert=mobile()&&!open}
    function activate(id){root.querySelectorAll('[data-q-page],#qTime').forEach(b=>b.classList.toggle('active',id==='time'?b.id==='qTime':b.dataset.qPage===id));if(mobile())nav(false);$('Scroll').scrollTop=0}
    $('OpenNav').onclick=()=>{nav(true);$('Sidebar').querySelector('.nav-btn.active,.nav-btn')?.focus()};$('CloseNav').onclick=$('Backdrop').onclick=()=>{nav(false);$('OpenNav').focus()};
    const reopen=document.createElement('button');reopen.type='button';reopen.className='q-reopen';reopen.textContent='›';reopen.setAttribute('aria-label','Open navigation');root.querySelector('.quality-shell').append(reopen);const collapse=()=>{root.classList.toggle('q-collapsed');$('Collapse').setAttribute('aria-expanded',String(!root.classList.contains('q-collapsed')));localStorage.setItem('qualitySidebarCollapsed',root.classList.contains('q-collapsed')?'1':'0')};$('Collapse').onclick=reopen.onclick=collapse;root.classList.toggle('q-collapsed',localStorage.getItem('qualitySidebarCollapsed')==='1');$('Collapse').setAttribute('aria-expanded',String(!root.classList.contains('q-collapsed')));nav(false);
    root.onkeydown=event=>{if(!mobile()||!$('Sidebar').classList.contains('open'))return;if(event.key==='Escape'){nav(false);$('OpenNav').focus()}if(event.key==='Tab'){const items=[...$('Sidebar').querySelectorAll('button')].filter(b=>b.getClientRects().length&&!b.disabled),first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}};
    const media=window.matchMedia('(max-width:980px)');const resize=()=>{if(root&&!root.hidden)nav(false)};media.addEventListener('change',resize);root._qualityResize=()=>media.removeEventListener('change',resize);
    $('Time').onclick=()=>{localStorage.setItem('qualityTimeMemberName',person());$('RecordArea').hidden=true;$('TimeHost').hidden=false;$('Title').textContent='Time Sheet';activate('time');window.openQualityTime($('TimeHost'))};
    function applyAdminReadonly(){root?.classList.remove('admin-view-only');}
    root.querySelectorAll('[data-q-page]').forEach(button=>button.onclick=()=>{window.closeQualityTime?.();$('TimeHost').hidden=true;$('RecordArea').hidden=false;const nextPage=button.dataset.qPage;if(nextPage!==page){const mount=$('FormHost');mount.innerHTML='';delete mount.dataset.qReview;delete mount.dataset.qdMode;delete mount.dataset.qdDate;delete mount.dataset.qdPage;}page=nextPage;$('Title').textContent=pages[page];activate(page);renderForm();setTimeout(applyAdminReadonly,0)});renderForm();setTimeout(applyAdminReadonly,0);
    function panelsClose(){$('ProfilePanel').classList.add('hidden');$('Notifications').classList.add('hidden');$('Profile').setAttribute('aria-expanded','false');$('Bell').setAttribute('aria-expanded','false')}
    $('Profile').onclick=()=>{const show=$('ProfilePanel').classList.contains('hidden');panelsClose();$('ProfilePanel').classList.toggle('hidden',!show);$('Profile').setAttribute('aria-expanded',String(show))};
    $('ProfileSettings').onclick=()=>{panelsClose();root.querySelector('[data-q-page="settings"]').click()};$('CloseNotifications').onclick=panelsClose;
    $('Bell').onclick=()=>{const show=$('Notifications').classList.contains('hidden');panelsClose();if(show)renderQualityNotificationCenter();$('Notifications').classList.toggle('hidden',!show);$('Bell').setAttribute('aria-expanded',String(show))};
    const outside=event=>{if(!event.target.closest?.('.profile-quick-wrap,.notification-center-wrap'))panelsClose()};document.addEventListener('pointerdown',outside);const oldCleanup=root._qualityResize;root._qualityResize=()=>{oldCleanup?.();document.removeEventListener('pointerdown',outside)};
    try{
      cloudMessage='Connecting to Firebase…';paint();
      const recordStop=await window.rndCloud.watchQualityTime('records',(rows,meta={})=>{
        if(token!==generation)return;
        records=rows;
        ready=true;
        serverConnected=Boolean(meta.connected);
        cloudMessage=serverConnected?'Firebase connected · live data':'Showing cached data · checking Firebase…';
        paint();
      },error=>{
        if(token!==generation)return;
        serverConnected=false;ready=false;cloudMessage=error?.message||'Firebase connection interrupted.';paint();
      });
      if(token!==generation)recordStop();else stops.push(recordStop);
      const timeStop=await window.rndCloud.watchQualityTime('entries',(rows)=>{
        if(token!==generation)return;
        timeEntries=rows;
        if(page==='dashboard'||page==='weekly')paint();
      },()=>{});
      if(token!==generation)timeStop();else stops.push(timeStop);
    }catch(error){
      if(token===generation){serverConnected=false;ready=false;cloudMessage=error?.message||'Firebase connection failed.';paint()}
    }
  }
  window.openQuality=open;window.closeQuality=close;window.qualityValidation={validate,weekRange,overviewRows,pages,qualityRole,qualityRoleLabel};window.qualityHourlyTimesheetReminder=qualityHourlyTimesheetReminder;
  window.setInterval?.(qualityHourlyTimesheetReminder,30000);window.addEventListener?.('focus',qualityHourlyTimesheetReminder);document.addEventListener?.('visibilitychange',qualityHourlyTimesheetReminder);
})();
