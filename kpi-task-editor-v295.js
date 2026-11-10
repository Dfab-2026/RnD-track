/* v295: Admin-only KPI task-title editing, stored in the existing department Firebase record path.
   Canonical KPI IDs, thresholds, progress and calculations deliberately remain untouched. */
(function(){
  'use strict';
  const cache=new Map(),inflight=new Map(),standardCache=new Map(),standardInflight=new Map(), selector='.kpi101-card h4, .kref-target';
  const normalize=s=>String(s??'').trim().replace(/\s+/g,' ');
  const code=s=>{let h=2166136261;for(const c of unescape(encodeURIComponent(s))){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')};
  const idOf=s=>`kpi_task_title_${code(normalize(s))}`;
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const validDept=dept=>/^[a-z][a-z0-9_]*$/.test(String(dept||''));
  const isAdmin=()=>Boolean(window.adminSession?.active?.());
  async function load(dept,refresh=false){
    if(!validDept(dept))throw Error('Invalid department.');
    if(!refresh&&cache.has(dept))return cache.get(dept);
    if(!refresh&&inflight.has(dept))return inflight.get(dept);
    const job=(async()=>{
      if(!window.rndCloud?.loadDepartmentRecordsOnce)throw Error('Firebase is not ready.');
      const data=await window.rndCloud.loadDepartmentRecordsOnce(dept),map=new Map();
      for(const record of data){
        if(record.type!=='kpi_task_title'||typeof record.original!=='string'||typeof record.title!=='string')continue;
        if(normalize(record.title))map.set(normalize(record.original),normalize(record.title));
      }
      cache.set(dept,map);return map;
    })();
    inflight.set(dept,job);
    try{return await job}finally{if(inflight.get(dept)===job)inflight.delete(dept)}
  }
  // The standard is a DISPLAY override, not a change to KPI IDs, percentages or calculations.
  // Key it by the canonical (pre-edit) KPI title, exactly like task title overrides.
  async function loadStandards(dept,refresh=false){
    if(!validDept(dept))throw Error('Invalid department.');
    if(!refresh&&standardCache.has(dept))return standardCache.get(dept);
    if(!refresh&&standardInflight.has(dept))return standardInflight.get(dept);
    const job=(async()=>{
      if(!window.rndCloud?.loadDepartmentRecordsOnce)throw Error('Firebase is not ready.');
      const rows=await window.rndCloud.loadDepartmentRecordsOnce(dept),map=new Map();
      for(const r of rows){
        if(r.type==='kpi_target_standard'&&typeof r.original==='string'&&typeof r.standard==='string'&&normalize(r.standard))map.set(normalize(r.original),normalize(r.standard));
      }
      standardCache.set(dept,map);return map;
    })();
    standardInflight.set(dept,job);
    try{return await job}finally{if(standardInflight.get(dept)===job)standardInflight.delete(dept)}
  }
  async function saveStandard(dept,original,next){
    if(!isAdmin())throw Error('Only an authenticated administrator can edit KPI target standards.');
    original=normalize(original);next=normalize(next);
    if(!validDept(dept)||!original||!next||next.length>500)throw Error('Enter a target / standard between 1 and 500 characters.');
    if(!window.rndCloud?.saveDepartmentRecord)throw Error('Firebase is not ready.');
    await window.rndCloud.saveDepartmentRecord(dept,`kpi_target_standard_${code(original)}`,{
      type:'kpi_target_standard',original,standard:next,department_key:dept,
      actor_role:'all_departments_leader',actor_scope:'all_departments',
      actor_name:window.adminSession?.name?.()||'Administrator',updated_at:new Date().toISOString()
    });
    const verified=await loadStandards(dept,true);
    if(verified.get(original)!==next)throw Error('Firebase did not confirm the updated target / standard.');
    return next;
  }
  // Normal department report: replace only the displayed standard cell, leaving underlying
  // target calculations and saved KPI metrics unchanged.
  function standardRows(host){
    if(!host?.querySelectorAll)return[];
    return [...host.querySelectorAll('.kref-table tbody tr')].map(tr=>({
      title:tr.querySelector('.kref-target'),standard:tr.querySelector('.kref-standard')
    })).filter(row=>row.title&&row.standard);
  }
  async function applyStandards(host,dept){
    if(!host||!validDept(dept))return;
    const rows=standardRows(host);
    for(const row of rows){
      if(!row.title.dataset.kpiTitleOriginal)row.title.dataset.kpiTitleOriginal=normalize(row.title.textContent);
      if(!row.standard.dataset.kpiStandardOriginal)row.standard.dataset.kpiStandardOriginal=normalize(row.standard.textContent);
    }
    if(!rows.length)return;
    try{
      const standards=await loadStandards(dept);
      if(!host.isConnected)return;
      for(const {title,standard} of rows){
        if(!standard.isConnected)return;
        const value=standards.get(title.dataset.kpiTitleOriginal);
        const label=standard.querySelector('[data-kpi-visible-standard]');
        if(label)label.textContent=value||standard.dataset.kpiStandardOriginal;
        else standard.textContent=value||standard.dataset.kpiStandardOriginal;
      }
    }catch(error){console.warn('KPI standards could not be loaded:',error.message)}
  }
  async function attachStandardEditors(report,dept,callbacks={}){
    if(!report||!isAdmin())return;
    const rows=standardRows(report);
    const standards=await loadStandards(dept).catch(error=>{console.warn('KPI standards unavailable:',error.message);return null});
    if(!report.isConnected||!isAdmin())return;
    callbacks.onStandards?.(standards||new Map());
    for(const {title,standard} of rows){
      const original=originalOf(title);
      if(!original||standard.querySelector('[data-kpi-inline-standard-edit]'))continue;
      const initial=normalize(standard.textContent);
      if(!standard.dataset.kpiStandardOriginal)standard.dataset.kpiStandardOriginal=initial;
      const current=standards?.get(original)||initial;
      const visible=document.createElement('span');visible.dataset.kpiVisibleStandard='';visible.textContent=current;
      const edit=document.createElement('button');edit.type='button';edit.className='kpi-inline-title-edit';
      edit.dataset.kpiInlineStandardEdit='';edit.textContent='Edit';
      edit.setAttribute('aria-label',`Edit target / standard for ${original}`);
      const form=document.createElement('form');form.className='kpi-inline-title-form';form.hidden=true;
      const input=document.createElement('textarea');input.name='standard';input.required=true;input.maxLength=500;input.rows=2;
      input.value=current;input.setAttribute('aria-label',`Target / Standard for ${original}`);
      const saveButton=document.createElement('button');saveButton.type='submit';saveButton.className='kref-save';saveButton.textContent='Save';
      const cancel=document.createElement('button');cancel.type='button';cancel.className='kpi-inline-title-cancel';cancel.textContent='Cancel';
      const status=document.createElement('small');status.className='kpi-inline-title-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
      form.append(input,saveButton,cancel,status);standard.replaceChildren(visible,edit,form);
      const close=()=>{form.hidden=true;edit.hidden=false};
      edit.onclick=()=>{form.hidden=false;edit.hidden=true;input.focus();input.select()};
      cancel.onclick=()=>{input.value=visible.textContent;status.textContent='';close()};
      form.onsubmit=async event=>{
        event.preventDefault();if(saveButton.disabled)return;
        const next=normalize(input.value);
        if(!next||next.length>500){status.textContent='Enter 1–500 characters.';return}
        if(next===visible.textContent){close();return}
        saveButton.disabled=true;cancel.disabled=true;status.textContent='Saving to Firebase…';
        try{await saveStandard(dept,original,next);if(!standard.isConnected)return;
          visible.textContent=next;callbacks.onStandardSaved?.(original,next);status.textContent='Saved';close();
        }catch(error){status.textContent=error.message||'Could not save. Retry.'}
        finally{saveButton.disabled=false;cancel.disabled=false}
      };
    }
  }
  function targets(host){
    if(!host?.querySelectorAll)return[];
    return [...host.querySelectorAll(selector)].filter(node=>!node.closest('.kpi-task-title-editor'));
  }
  function originalOf(node){
    if(!node.dataset.kpiTitleOriginal)node.dataset.kpiTitleOriginal=normalize(node.textContent);
    return node.dataset.kpiTitleOriginal;
  }
  function updateLabel(node,title){
    const label=node.querySelector('[data-kpi-visible-title]');
    if(label)label.textContent=title;
    else node.textContent=title;
  }
  async function apply(host,dept){
    if(!host||!validDept(dept))return;
    const nodes=targets(host);nodes.forEach(originalOf);
    if(!nodes.length)return;
    try{
      const titles=await load(dept);
      if(!host.isConnected)return;
      nodes.forEach(node=>{
        if(!node.isConnected)return;
        const original=originalOf(node),title=titles.get(original)||original;
        updateLabel(node,title);
        const input=node.querySelector('[data-kpi-title-input]');
        if(input&&!node.querySelector('.kpi-inline-title-form:not([hidden])'))input.value=title;
      });
    }catch(error){
      console.warn('KPI task labels could not be loaded:',error.message);
    }
    await applyStandards(host,dept);
  }
  async function save(dept,original,next){
    if(!isAdmin())throw Error('Only an authenticated administrator can edit KPI task names.');
    original=normalize(original);next=normalize(next);
    if(!validDept(dept)||!original||!next||next.length>120)throw Error('Enter a KPI task name between 1 and 120 characters.');
    if(!window.rndCloud?.saveDepartmentRecord)throw Error('Firebase is not ready.');
    const record={type:'kpi_task_title',original,title:next,department_key:dept,actor_role:'all_departments_leader',actor_scope:'all_departments',actor_name:window.adminSession?.name?.()||'Administrator',updated_at:new Date().toISOString()};
    await window.rndCloud.saveDepartmentRecord(dept,idOf(original),record);
    // Server read-back, then update the visible report.
    const titles=await load(dept,true);
    if(titles.get(original)!==next)throw Error('Firebase did not confirm the updated KPI task name.');
    return next;
  }
  async function attachEditor(body,dept,report,callbacks={}){
    if(!isAdmin()||!body||!report)return;
    // Editing is rendered inside EACH KPI row, not in a separate editor panel.
    const nodes=targets(report);
    if(!nodes.length)return;
    const titles=await load(dept).catch(error=>{
      console.warn('KPI titles unavailable:',error.message);
      return null;
    });
    if(!report.isConnected||!isAdmin())return;
    callbacks.onTitles?.(titles||new Map());
    for(const node of nodes){
      const original=originalOf(node);
      if(!original||node.querySelector('[data-kpi-inline-edit]'))continue;
      const current=titles?.get(original)||original;
      const visible=document.createElement('span');
      visible.dataset.kpiVisibleTitle='';visible.textContent=current;
      const edit=document.createElement('button');
      edit.type='button';edit.className='kpi-inline-title-edit';
      edit.dataset.kpiInlineEdit='';edit.textContent='Edit';
      edit.setAttribute('aria-label',`Edit KPI task: ${current}`);
      edit.setAttribute('aria-expanded','false');
      const form=document.createElement('form');
      form.className='kpi-inline-title-form';form.hidden=true;
      const input=document.createElement('input');
      input.type='text';input.name='title';input.required=true;input.maxLength=120;
      input.value=current;input.dataset.kpiTitleInput='';
      input.setAttribute('aria-label',`KPI task name for ${original}`);
      const saveButton=document.createElement('button');
      saveButton.type='submit';saveButton.className='kref-save';saveButton.textContent='Save';
      const cancel=document.createElement('button');
      cancel.type='button';cancel.className='kpi-inline-title-cancel';cancel.textContent='Cancel';
      const status=document.createElement('small');
      status.className='kpi-inline-title-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
      form.append(input,saveButton,cancel,status);
      // For Quality h4, controls must remain outside the heading; for report table
      // cells, they belong inside the same KPI target cell.
      if(node.tagName==='H4'){
        node.textContent='';node.append(visible);
        node.insertAdjacentElement('afterend',edit);
        edit.insertAdjacentElement('afterend',form);
      }else node.replaceChildren(visible,edit,form);
      edit.onclick=()=>{form.hidden=false;edit.hidden=true;edit.setAttribute('aria-expanded','true');input.focus();input.select()};
      const close=()=>{form.hidden=true;edit.hidden=false;edit.setAttribute('aria-expanded','false')};
      cancel.onclick=()=>{input.value=visible.textContent;status.textContent='';close()};
      form.onsubmit=async event=>{
        event.preventDefault();
        if(saveButton.disabled)return;
        const next=normalize(input.value);
        if(!next||next.length>120){status.textContent='Enter a task name between 1 and 120 characters.';return}
        if(next===visible.textContent){close();return}
        saveButton.disabled=true;cancel.disabled=true;status.textContent='Saving to Firebase…';
        try{
          await save(dept,original,next);
          if(!node.isConnected)return;
          visible.textContent=next;
          callbacks.onSaved?.(original,next);
          edit.setAttribute('aria-label',`Edit KPI task: ${next}`);
          status.textContent='Saved';close();
          // The department uses the same title records and will pick up this
          // value through its existing live department-record subscription.
        }catch(error){status.textContent=error.message||'Could not save. Retry.'}
        finally{saveButton.disabled=false;cancel.disabled=false}
      };
    }
    await attachStandardEditors(report,dept,callbacks);
  }
  window.kpiTaskTitles=Object.freeze({load,apply,save,attachEditor,loadStandards,saveStandard,applyStandards,attachStandardEditors});
})();
