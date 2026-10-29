/* Manual project time entries use the existing project save queue and backup flow. */
(function(){
  const $=id=>document.getElementById(id);let memberKey='',saving=false,clock=null;
  const minutes=value=>{if(!/^\d{2}:\d{2}$/.test(value||''))return NaN;const [h,m]=value.split(':').map(Number);return h<24&&m<60?h*60+m:NaN};
  const duration=n=>`${Math.floor(n/60)}h ${n%60}m`;
  function ownProjects(){return state.projects.filter(p=>Number(p.owner_id)===Number(currentMember()?.id))}
  function validate(project,entry){
    if(!currentMember()||isVisitor()||!project||Number(project.owner_id)!==Number(currentMember().id))throw Error('Choose one of your assigned projects.');
    if(!entry.work.trim()||entry.work.length>2000)throw Error('Enter work done (maximum 2,000 characters).');
    if(entry.remarks.length>1000)throw Error('Keep remarks within 1,000 characters.');
    if(!Number.isFinite(minutes(entry.from))||!Number.isFinite(minutes(entry.to))||minutes(entry.to)<=minutes(entry.from))throw Error('Select a To time later than the From time.');
    const overlap=ownProjects().some(p=>(p.time_entries||[]).some(e=>e.date===entry.date&&Number(e.member_id)===Number(currentMember().id)&&minutes(e.from)<minutes(entry.to)&&minutes(entry.from)<minutes(e.to)));
    if(overlap)throw Error('This period overlaps a saved entry. Choose a different time period.');
    return minutes(entry.to)-minutes(entry.from);
  }
  function list(){
    const host=$('tcEntries');if(!host)return;const selected=$('tcProject').value;
    const rows=ownProjects().filter(p=>!selected||String(p.id)===selected).flatMap(p=>(p.time_entries||[]).map(e=>({...e,project:p.title}))).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.from).localeCompare(String(a.from)));
    host.innerHTML=rows.length?rows.map(e=>`<article class="tc-entry"><header><strong>${esc(e.project)}</strong><span>${esc(fmtDate(e.date))} · ${esc(e.from)}–${esc(e.to)} <b>${duration(Number(e.minutes)||0)}</b></span></header><p>${esc(e.work)}</p>${e.remarks?`<small>Remarks: ${esc(e.remarks)}</small>`:''}</article>`).join(''):'<div class="empty-state">No time entries saved for this project yet.</div>';
  }
  function render(){
    const root=$('timeConsumeRoot');if(!root)return;const member=currentMember(),key=String(member?.id||'');
    if(isVisitor()||!member){root.innerHTML='<div class="empty-state">Time entries are available to R&amp;D members for their assigned projects.</div>';memberKey='';return}
    if(memberKey!==key||!$('tcForm')){
      memberKey=key;root.innerHTML=`<div class="section-toolbar"><div><span class="kicker">PROJECT WORK LOG</span><h2>Time Sheet</h2><p>Record what you worked on and the time spent.</p></div><span class="tc-person">${esc(member.name)}</span></div><section class="panel tc-panel"><form id="tcForm"><div class="tc-top"><label>Assigned project<select id="tcProject" required></select></label><label>Date<input id="tcDate" type="date" readonly aria-label="Today's date"></label></div><label>What did you work on?<textarea id="tcWork" required maxlength="2000" rows="3" placeholder="Describe the work completed"></textarea></label><div class="tc-times"><label>From<div><input id="tcFrom" type="time" required><button type="button" data-tc-clock="tcFrom" aria-label="Choose From time on clock">◷</button></div></label><label>To<div><input id="tcTo" type="time" required><button type="button" data-tc-clock="tcTo" aria-label="Choose To time on clock">◷</button></div></label></div><label>Remarks <span>(optional)</span><textarea id="tcRemarks" maxlength="1000" rows="2" placeholder="Additional notes"></textarea></label><div class="tc-actions"><p id="tcStatus" role="status" aria-live="polite"></p><button class="primary-btn" id="tcSave" type="submit">Save entry</button></div></form></section><section class="panel tc-panel"><div class="panel-head"><h3>Saved entries</h3></div><div id="tcEntries"></div></section>`;
      $('tcProject').onchange=list;root.querySelectorAll('[data-tc-clock]').forEach(b=>b.onclick=()=>openClock($(b.dataset.tcClock)));$('tcForm').onsubmit=save;
    }
    const select=$('tcProject'),previous=select.value,projects=ownProjects();select.innerHTML='<option value="">Choose assigned project</option>'+projects.map(p=>`<option value="${Number(p.id)}">${esc(p.project_number||'')} · ${esc(p.title)}</option>`).join('');select.value=previous;
    if(!projects.length)select.innerHTML='<option value="">No projects assigned yet</option>';
    $('tcSave').disabled=saving||!projects.length;$('tcDate').value=today();list();
  }
  async function save(event){
    event.preventDefault();if(saving)return;
    const project=ownProjects().find(p=>String(p.id)===$('tcProject').value),entry={id:crypto.randomUUID(),member_id:Number(currentMember()?.id),date:today(),from:$('tcFrom').value,to:$('tcTo').value,work:$('tcWork').value.trim(),remarks:$('tcRemarks').value.trim(),created_at:new Date().toISOString()};
    try{entry.minutes=validate(project,entry);saving=true;$('tcSave').disabled=true;$('tcStatus').textContent='Saving…';
      project.time_entries=[...(project.time_entries||[]),entry];project.updated_at=entry.created_at;queueCloudOps([{collection:'projects',row:project}]);await persistState();
      $('tcWork').value='';$('tcRemarks').value='';$('tcFrom').value=entry.to;$('tcTo').value='';list();
      const synced=await flushPendingCloudOps();$('tcStatus').textContent=synced?'Entry saved to Firebase.':'Saved on this device. Firebase sync will retry when connected.';
    }catch(error){$('tcStatus').textContent=error.message||'Unable to save. Please try again.'}finally{saving=false;$('tcSave').disabled=!ownProjects().length}
  }
  function openClock(input){
    if(clock?.open)clock.close();const current=input.value||'09:00';let [hour,minute]=current.split(':').map(Number),mode='hour';
    clock=document.createElement('dialog');clock.className='tc-clock modal';clock.setAttribute('aria-label','Select time');
    clock.innerHTML='<div class="tc-clock-inner"><h3>Select time</h3><div class="tc-clock-value"></div><div class="tc-clock-modes"><button type="button" data-mode="hour">Hours</button><button type="button" data-mode="minute">Minutes</button><button type="button" data-period>AM / PM</button></div><div class="tc-dial"><i class="tc-hand"></i></div><div class="tc-clock-actions"><button type="button" data-cancel class="ghost-btn">Cancel</button><button type="button" data-done class="primary-btn">Use time</button></div></div>';
    document.body.append(clock);const dial=clock.querySelector('.tc-dial');
    function draw(){clock.querySelector('.tc-clock-value').textContent=`${String(hour%12||12).padStart(2,'0')}:${String(minute).padStart(2,'0')} ${hour>=12?'PM':'AM'}`;dial.querySelectorAll('button').forEach(b=>b.remove());const selected=mode==='hour'?hour%12:minute;dial.querySelector('i').style.transform=`rotate(${selected*(mode==='hour'?30:6)}deg)`;
      for(let i=0;i<12;i++){const value=mode==='hour'?(i||12):i*5,angle=i*Math.PI/6,button=document.createElement('button');button.type='button';button.textContent=String(value).padStart(mode==='minute'?2:1,'0');button.style.left=`${50+40*Math.sin(angle)}%`;button.style.top=`${50-40*Math.cos(angle)}%`;button.setAttribute('aria-label',`${value} ${mode==='hour'?'hours':'minutes'}`);button.onclick=()=>{if(mode==='hour'){hour=(value%12)+(hour>=12?12:0);mode='minute'}else minute=value;draw()};dial.append(button)}
      clock.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    }
    clock.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;draw()});clock.querySelector('[data-period]').onclick=()=>{hour=(hour+12)%24;draw()};clock.querySelector('[data-cancel]').onclick=()=>clock.close();clock.querySelector('[data-done]').onclick=()=>{input.value=`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;input.dispatchEvent(new Event('change',{bubbles:true}));clock.close();input.focus()};clock.addEventListener('close',()=>clock.remove(),{once:true});draw();clock.showModal();
  }
  function hourlyReminder(){
    const now=new Date(),member=currentMember();if(!member||isVisitor()||$('appShell')?.classList.contains('app-locked')||document.body.classList.contains('department-home-open')||now.getDay()===0||now.getHours()<9||now.getHours()>17||!ownProjects().length)return;
    const key=`timesheet-hourly:rnd:${member.id}:${today()}:${now.getHours()}`;if(localStorage.getItem(key))return;
    const message='Please update your Time Sheet for the work completed during the past hour.';
    if(typeof notificationsEnabled==='function'&&notificationsEnabled()&&typeof notifyUser==='function')notifyUser('R&D · Time Sheet Reminder',message);
    if(document.hidden){if(typeof notificationsEnabled==='function'&&notificationsEnabled())localStorage.setItem(key,'1');return}
    if(document.querySelector('dialog[open]')||/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||''))return;
    const dialog=document.createElement('dialog');dialog.className='modal tc-reminder';dialog.innerHTML='<div class="tc-clock-inner"><span class="kicker">HOURLY TIME SHEET</span><h2>Update your Time Sheet</h2><p>Please record the work completed during the past hour.</p><div class="tc-clock-actions"><button class="ghost-btn" type="button" data-later>Close</button><button class="primary-btn" type="button" data-enter>Open Time Sheet</button></div></div>';document.body.append(dialog);dialog.querySelector('[data-later]').onclick=()=>dialog.close();dialog.querySelector('[data-enter]').onclick=()=>{dialog.close();showPage('timeconsume');setTimeout(()=>$('tcWork')?.focus(),0)};dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();localStorage.setItem(key,'1');
  }
  window.renderTimeConsume=render;window.rndTimeClock=openClock;window.rndTimeConsume={minutes,validate,hourlyReminder};setInterval(hourlyReminder,30000);window.addEventListener('focus',hourlyReminder);document.addEventListener('visibilitychange',hourlyReminder);
})();
