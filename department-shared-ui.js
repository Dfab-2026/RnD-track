/* v255: One canonical department navigation. Preserves each department’s existing data adapter. */
(function(){
  'use strict';
  const NAV=[
    {id:'dashboard',label:'Dashboard'},
    {id:'kaizen',label:'Kaizen Ideas'},
    {id:'weekly',label:'Weekly Report'},
    {id:'kpi',label:'KPI Report'},
    {id:'assigned',label:'Assigned Tasks'},
    {id:'timesheet',label:'Time Sheet'},
    {id:'settings',label:'Settings'}
  ];
  const mapQuality={dashboard:'dashboard',kaizen:'ideas',weekly:'weekly',kpi:'report',assigned:'assigned',timesheet:'time',settings:'settings'};
  const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function navigation(mode,current){
    const quality=mode==='quality';
    return NAV.map((item,index)=>{
      const id=quality?mapQuality[item.id]:item.id;
      const attrs=item.id==='timesheet'?(quality?'id="qTime"':'id="dTime"'):(quality?`data-q-page="${id}"`:`data-d-page="${id}"`);
      const selected=current===id?' active':'';
      return `<button type="button" class="nav-btn${selected}" ${attrs} aria-label="${safe(item.label)}" title="${safe(item.label)}"><span>${String(index+1).padStart(2,'0')}</span><b>${safe(item.label)}</b></button>`;
    }).join('');
  }
  window.departmentSharedUI=Object.freeze({navigation,items:NAV.map(x=>({...x}))});
})();
