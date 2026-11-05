(function(){
  const PHONE='918428866121';
  function openHelp(){
    document.getElementById('dfabHelpDialog')?.remove();
    const dialog=document.createElement('dialog');dialog.id='dfabHelpDialog';dialog.className='dfab-help-dialog';
    dialog.innerHTML='<form method="dialog" class="dfab-help-panel"><div class="dfab-help-head"><div><span class="kicker">TRACKER SUPPORT</span><h2>Report an issue</h2><p>Describe what happened and where you saw it.</p></div><button type="button" data-close aria-label="Close support form">×</button></div><label>Page / section<input name="page" maxlength="100" placeholder="e.g. Quality · KPI Report" required></label><label>Issue details<textarea name="description" rows="5" maxlength="1500" minlength="10" placeholder="What did you do? What went wrong?" required></textarea></label><div class="dfab-help-actions"><button type="button" data-close class="ghost-btn">Cancel</button><button type="submit" class="primary-btn">Continue to WhatsApp</button></div><p class="dfab-help-note">WhatsApp opens with a prepared message. Review it and tap Send there to submit.</p></form>';
    document.body.append(dialog);
    dialog.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('close',()=>dialog.remove(),{once:true});
    dialog.querySelector('form').addEventListener('submit',event=>{
      event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
      const page=form.elements.page.value.trim(),description=form.elements.description.value.trim();
      if(!page||description.length<10){form.elements.description.setCustomValidity('Provide at least 10 characters.');form.reportValidity();return}
      const message=`DFAB KPI Tracker support request\nPage: ${page}\nIssue: ${description}`;
      const url=`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
      const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';document.body.append(link);link.click();link.remove();
      dialog.close();
    });
    dialog.querySelector('[name="description"]').addEventListener('input',e=>e.target.setCustomValidity(''));
    dialog.showModal();dialog.querySelector('[name="page"]').focus();
  }
  document.addEventListener('click',event=>{if(event.target.closest('[data-dfab-help]'))openHelp()});
  window.dfabHelp={button:()=>'<button type="button" class="secondary-btn dfab-help-button" data-dfab-help>Help · Report an issue</button>',open:openHelp};
})();
