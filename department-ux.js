/* Department-only interaction primitives. R&D and the four management tools retain their existing flows. */
(function () {
  'use strict';
  let toastTimer;
  let confirmationOpen=false;
  const normalizeError = error => {
    const code=String(error?.code||'').toLowerCase(),message=String(error?.message||'').trim();
    if(code.includes('permission-denied'))return 'Access denied by Firebase. Check your account permissions and Firestore rules; nothing was saved.';
    if(code.includes('unauthenticated'))return 'Your Firebase session has expired. Reopen the page and sign in again.';
    if(code.includes('unavailable')||code.includes('network'))return 'Firebase is currently unreachable. Check your internet connection and retry.';
    if(code.includes('deadline-exceeded'))return 'Firebase did not respond in time. Refresh the records before trying again.';
    if(code.includes('resource-exhausted'))return 'The database has reached a usage limit. Contact the administrator.';
    if(code.includes('failed-precondition'))return 'Firebase could not complete the request. Please refresh and retry.';
    return message||'Operation failed. Please retry.';
  };
  function notice(message,kind='success') {
    let el=document.getElementById('departmentActionNotice');
    if(!el){el=document.createElement('div');el.id='departmentActionNotice';el.className='department-action-notice';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.append(el)}
    el.className='department-action-notice is-visible '+(kind==='error'?'is-error':'is-success');
    el.textContent=String(message||'');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>el.classList.remove('is-visible'),4800);
  }
  function confirmAction(message,options={}) {
    if(confirmationOpen)return Promise.resolve(false);
    confirmationOpen=true;
    return new Promise(resolve=>{
      const dialog=document.createElement('dialog');
      dialog.className='department-confirm-dialog';
      dialog.setAttribute('aria-label',options.title||'Confirm action');
      const wrap=document.createElement('div');wrap.className='department-confirm-body';
      const eyebrow=document.createElement('span');eyebrow.className='kicker';eyebrow.textContent='CONFIRMATION';
      const heading=document.createElement('h2');heading.textContent=options.title||'Delete record?';
      const desc=document.createElement('p');desc.textContent=String(message||'This change cannot be undone.');
      const actions=document.createElement('div');actions.className='department-confirm-actions';
      const cancel=document.createElement('button');cancel.type='button';cancel.className='ghost-btn';cancel.textContent='Cancel';
      const accept=document.createElement('button');accept.type='button';accept.className='danger-btn';accept.textContent=options.confirmLabel||'Delete';
      actions.append(cancel,accept);wrap.append(eyebrow,heading,desc,actions);dialog.append(wrap);document.body.append(dialog);
      let decision=false,finished=false;
      cancel.addEventListener('click',()=>dialog.close());
      accept.addEventListener('click',()=>{decision=true;dialog.close()});
      dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
      dialog.addEventListener('close',()=>{if(finished)return;finished=true;confirmationOpen=false;dialog.remove();resolve(decision)},{once:true});
      try{dialog.showModal();cancel.focus()}catch(err){confirmationOpen=false;dialog.remove();resolve(false);notice(normalizeError(err),'error')}
    });
  }
  window.departmentUX=Object.freeze({confirm:confirmAction,notice,error:normalizeError});
})();
