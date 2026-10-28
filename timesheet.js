(function(){
  const cache={events:[],loadedKey:'',loading:false,source:''};
  const LOCAL_USAGE_URL='http://127.0.0.1:8765';
  const secondsLabel=value=>{const seconds=Math.max(0,Math.round(Number(value)||0)),hours=Math.floor(seconds/3600),minutes=Math.floor((seconds%3600)/60);return hours?`${hours}h ${minutes}m`:`${minutes}m`};
  const dateDaysAgo=days=>{const date=new Date();date.setDate(date.getDate()-days);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`};
  const cleanLabel=value=>String(value||'Unknown').trim()||'Unknown';
  function populate(){
    const select=document.querySelector('#timesheetMemberFilter');if(!select)return;
    const value=select.value,options=workingMembers().map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');
    select.innerHTML='<option value="">All R&amp;D members</option>'+options;if([...select.options].some(x=>x.value===value))select.value=value;
    const from=document.querySelector('#timesheetFromDate'),to=document.querySelector('#timesheetToDate');if(!from.value)from.value=dateDaysAgo(6);if(!to.value)to.value=today();
  }
  function groupTotals(events,key){const map=new Map();events.forEach(event=>{const label=cleanLabel(event[key]),row=map.get(label)||{label,seconds:0};row.seconds+=Number(event.active_seconds)||0;map.set(label,row)});return [...map.values()].sort((a,b)=>b.seconds-a.seconds)}
  function memberSummary(member,events){
    const system=events.filter(e=>e.source==='system'&&Number(e.member_id)===Number(member.id)),browser=events.filter(e=>e.source==='browser'&&Number(e.member_id)===Number(member.id));
    const active=system.reduce((sum,e)=>sum+Number(e.active_seconds||0),0),idle=system.reduce((sum,e)=>sum+Number(e.idle_seconds||0),0),apps=groupTotals(system,'app_name'),sites=groupTotals(browser,'site_domain');
    return{member,active,idle,apps,sites,device:system.find(e=>e.device_id)?.device_id||browser.find(e=>e.device_id)?.device_id||'Not connected',lastSeen:Math.max(0,...events.filter(e=>Number(e.member_id)===Number(member.id)).map(e=>Number(e.ended_at)||0))};
  }
  function render(events){
    const host=document.querySelector('#timesheetContent');if(!host)return;
    const memberId=Number(document.querySelector('#timesheetMemberFilter')?.value)||0,members=workingMembers().filter(m=>!memberId||Number(m.id)===memberId),visibleEvents=events.filter(e=>!memberId||Number(e.member_id)===memberId),summaries=members.map(m=>memberSummary(m,visibleEvents));
    const totalActive=summaries.reduce((sum,x)=>sum+x.active,0),totalIdle=summaries.reduce((sum,x)=>sum+x.idle,0),connected=summaries.filter(x=>x.lastSeen).length,allApps=groupTotals(visibleEvents.filter(e=>e.source==='system'),'app_name'),allSites=groupTotals(visibleEvents.filter(e=>e.source==='browser'),'site_domain');
    host.innerHTML=`<div class="timesheet-metrics"><article><span>TOTAL ACTIVE</span><strong>${secondsLabel(totalActive)}</strong><small>Selected period</small></article><article><span>TOTAL IDLE</span><strong>${secondsLabel(totalIdle)}</strong><small>Five-minute threshold</small></article><article><span>REPORTING DEVICES</span><strong>${connected}/${members.length}</strong><small>Members with agent data</small></article><article><span>EVENTS</span><strong>${visibleEvents.length}</strong><small>System + browser records</small></article></div>
      <div class="timesheet-member-grid">${summaries.map(row=>`<article class="timesheet-member-card"><header><div><span>${esc(row.device)}</span><h3>${esc(row.member.name)}</h3></div><b class="${row.lastSeen?'online':'offline'}">${row.lastSeen?'REPORTING':'NO DATA'}</b></header><div class="timesheet-member-hours"><div><span>Active</span><strong>${secondsLabel(row.active)}</strong></div><div><span>Idle</span><strong>${secondsLabel(row.idle)}</strong></div></div><div class="timesheet-top-line"><span>Top app</span><b>${esc(row.apps[0]?.label||'—')} · ${secondsLabel(row.apps[0]?.seconds||0)}</b></div><div class="timesheet-top-line"><span>Top site</span><b>${esc(row.sites[0]?.label||'—')} · ${secondsLabel(row.sites[0]?.seconds||0)}</b></div><small>Last event: ${row.lastSeen?new Date(row.lastSeen).toLocaleString('en-IN'):'Agent not installed'}</small></article>`).join('')}</div>
      <div class="timesheet-breakdown-grid"><section class="panel"><div class="panel-head"><div><span class="kicker">APPLICATIONS</span><h3>Longest-used applications</h3></div></div>${usageRows(allApps,'No application activity for this period.')}</section><section class="panel"><div class="panel-head"><div><span class="kicker">WEBSITES</span><h3>Longest-viewed domains</h3></div></div>${usageRows(allSites,'No Chrome or Edge activity for this period.')}</section></div>`;
  }
  function usageRows(rows,empty){if(!rows.length)return `<div class="empty-state">${empty}</div>`;const max=rows[0].seconds||1;return `<div class="timesheet-usage-list">${rows.slice(0,12).map((row,index)=>`<div class="timesheet-usage-row"><span>${index+1}</span><div><b>${esc(row.label)}</b><i><em style="width:${Math.max(2,Math.round(row.seconds/max*100))}%"></em></i></div><strong>${secondsLabel(row.seconds)}</strong></div>`).join('')}</div>`}
  function normalizeLocalEvent(row,index){return{id:String(row?.id||`local-${index}`),member_id:Number(row?.member_id)||0,member_name:String(row?.member_name||''),device_id:String(row?.device_id||''),date:String(row?.date||''),started_at:Number(row?.started_at)||0,ended_at:Number(row?.ended_at)||0,app_name:String(row?.app_name||''),process_name:String(row?.process_name||''),site_domain:String(row?.site_domain||''),active_seconds:Math.max(0,Number(row?.active_seconds)||0),idle_seconds:Math.max(0,Number(row?.idle_seconds)||0),source:row?.source==='browser'?'browser':'system'};}
  async function loadLocalUsage(from,to){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),2500);
    try{const response=await fetch(`${LOCAL_USAGE_URL}/usage?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&t=${Date.now()}`,{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error(`Local agent ${response.status}`);const rows=await response.json();return (Array.isArray(rows)?rows:[]).map(normalizeLocalEvent).filter(e=>e.date>=from&&e.date<=to)}finally{clearTimeout(timer)}
  }
  async function loadCloudUsage(from,to){if(!window.rndCloud?.enabled)return[];try{return await window.rndCloud.loadUsageEvents(from,to)}catch(error){console.warn('Timesheet cloud usage unavailable',error);return[]}}
  function mergeEvents(local,cloud){
    const map=new Map();[...(cloud||[]),...(local||[])].forEach((event,index)=>{const key=[event.device_id,event.source,event.started_at,event.app_name,event.site_domain].join('|')||String(event.id||index);map.set(key,event)});return [...map.values()].sort((a,b)=>Number(a.started_at)-Number(b.started_at));
  }
  async function load(force=false){
    populate();const from=document.querySelector('#timesheetFromDate').value,to=document.querySelector('#timesheetToDate').value,key=`${from}:${to}`,status=document.querySelector('#timesheetStatus');
    if(!force&&cache.loadedKey===key){render(cache.events);return}if(cache.loading)return;cache.loading=true;status.textContent='Reading Windows usage…';
    try{
      const [localResult,cloudResult]=await Promise.allSettled([loadLocalUsage(from,to),loadCloudUsage(from,to)]),local=localResult.status==='fulfilled'?localResult.value:[],cloud=cloudResult.status==='fulfilled'?cloudResult.value:[];
      cache.events=mergeEvents(local,cloud);cache.loadedKey=key;cache.source=local.length&&cloud.length?'Local agent + cloud':local.length?'Local Windows agent':cloud.length?'Cloud agent':'No usage source';
      if(localResult.status==='rejected'&&!cloud.length)status.textContent='Local usage agent is not running. Install/start it, then press Refresh.';else status.textContent=`${cache.events.length} usage records loaded · ${from} to ${to} · ${cache.source}`;
      render(cache.events);
    }catch(error){status.textContent=error?.message||'Unable to load Timesheet.';document.querySelector('#timesheetContent').innerHTML='<div class="empty-state">No usage data is available yet. Start the local R&amp;D usage agent.</div>'}finally{cache.loading=false}
  }
  function bind(){const button=document.querySelector('#refreshTimesheetBtn');if(!button||button.dataset.bound)return;button.dataset.bound='1';button.onclick=()=>load(true);document.querySelector('#timesheetMemberFilter').onchange=()=>render(cache.events)}
  window.renderTimesheet=()=>{bind();void load()};
})();
