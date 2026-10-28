/* Daily sheet reminder: independent of task progress or pending-task notifications. */
(function(){
  let lastShown=0,dialog=null,lastSignature='';
  function missingRows(){
    const member=currentMember(),date=today();if(!member||isVisitor())return [];
    return state.projects.filter(p=>p.start_date<=date&&p.end_date>=date&&(isLead()||Number(p.owner_id)===Number(member.id))).flatMap(p=>{
      const row=trackerSheetRows(p).find(r=>!r.manual_extra&&trackerEffectiveDate(p,r)===date);
      // In Progress and Issue are valid daily reports. Completion is not required.
      const filled=Boolean(String(row?.stage||row?.task||'').trim()&&['completed','in_progress','issue'].includes(row?.status));
      return filled?[]:[{projectId:Number(p.id),owner:p.owner_name||state.members.find(m=>Number(m.id)===Number(p.owner_id))?.name||'Member',title:p.title,date}];
    });
  }
  function close(){if(dialog?.open)dialog.close()}
  function check(){
    const now=new Date(),rows=missingRows();
    if(now.getHours()<17||!rows.length||document.hidden){close();return}
    const signature=JSON.stringify(rows);
    if(dialog?.open){if(signature===lastSignature)return;close()}
    if(Date.now()-lastShown<60000)return;
    const active=document.activeElement;
    if(active&&/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)||document.querySelector('dialog[open]'))return;
    if(!dialog){dialog=document.createElement('dialog');dialog.className='modal daily-sheet-reminder';dialog.setAttribute('aria-labelledby','dailySheetReminderTitle');dialog.setAttribute('aria-describedby','dailySheetReminderDescription');document.body.append(dialog);dialog.addEventListener('close',()=>{lastShown=Date.now()})}
    dialog.innerHTML=`<div class="work-text-content"><span class="kicker">5 PM · DAILY SHEET REQUIRED</span><h2 id="dailySheetReminderTitle">Today's Excel entry is missing</h2><p id="dailySheetReminderDescription" class="sheet-reminder-note">${esc(fmtDate(today()))} · Fill the daily target and select a status for each listed project. In Progress or Issue is accepted. This reminder repeats every minute until the entries are filled.</p><div class="sheet-reminder-list">${rows.map(r=>`<button type="button" class="sheet-reminder-item" data-sheet-project="${r.projectId}"><strong>${esc(r.owner)}</strong><span>${esc(r.title)}</span><span>Open today's sheet →</span></button>`).join('')}</div><button type="button" class="ghost-btn" data-sheet-later>Close for now</button></div>`;
    dialog.querySelectorAll('[data-sheet-project]').forEach(btn=>btn.onclick=()=>{close();goToPendingItem('progress',Number(btn.dataset.sheetProject))});
    dialog.querySelector('[data-sheet-later]').onclick=close;lastSignature=signature;lastShown=Date.now();dialog.showModal();
  }
  window.rndDailySheetReminder={missingRows,check};
  window.setInterval?.(check,15000);
  window.addEventListener?.('focus',check);
  document.addEventListener('visibilitychange',check);
  check();
})();
