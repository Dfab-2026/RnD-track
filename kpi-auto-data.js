(function(){
  const clean=value=>String(value||'').trim().toLowerCase();
  const validRange=(start,end)=>/^\d{4}-\d{2}-\d{2}$/.test(String(start||''))&&/^\d{4}-\d{2}-\d{2}$/.test(String(end||''))&&start<=end;
  const minutesFor=row=>{
    const saved=Number(row?.minutes);
    if(Number.isFinite(saved)&&saved>0)return saved;
    const from=String(row?.from||''),to=String(row?.to||'');
    if(!/^\d{2}:\d{2}$/.test(from)||!/^\d{2}:\d{2}$/.test(to))return 0;
    const [fh,fm]=from.split(':').map(Number),[th,tm]=to.split(':').map(Number),minutes=th*60+tm-(fh*60+fm);
    return minutes>0?minutes:0;
  };
  function summarize({start,end,timeRows=[],workRows=[],kaizenRows=[],person='',allPeople=false}={}){
    if(!validRange(start,end))throw new Error('A valid KPI reporting period is required.');
    const belongs=row=>allPeople||!person||clean(row?.person||row?.member||row?.owner)===clean(person);
    const inRange=row=>String(row?.date||'')>=start&&String(row?.date||'')<=end&&belongs(row);
    const times=timeRows.filter(inRange),works=workRows.filter(inRange),kaizens=kaizenRows.filter(inRange);
    const completed=list=>list.filter(row=>String(row?.status||'').toLowerCase()==='completed').length;
    const inProgress=list=>list.filter(row=>String(row?.status||'').toLowerCase()==='in_progress').length;
    const pending=list=>list.filter(row=>String(row?.status||'').toLowerCase()==='pending').length;
    const minutes=times.reduce((sum,row)=>sum+minutesFor(row),0);
    return{
      start,end,timeEntries:times.length,timeMinutes:minutes,timeHours:Number((minutes/60).toFixed(2)),
      timeCompleted:completed(times),timeInProgress:inProgress(times),timePending:pending(times),
      workRecords:works.length,workCompleted:completed(works),workInProgress:inProgress(works),workPending:pending(works),
      kaizenIdeas:kaizens.length
    };
  }
  function text(summary){
    const hours=summary.timeHours%1?summary.timeHours.toFixed(2):String(summary.timeHours);
    return `Time Sheet: ${summary.timeEntries} entries, ${hours}h (${summary.timeCompleted} completed, ${summary.timeInProgress} in progress, ${summary.timePending} pending). Work records: ${summary.workRecords} (${summary.workCompleted} completed, ${summary.workInProgress} in progress, ${summary.workPending} pending). Kaizen ideas: ${summary.kaizenIdeas}.`;
  }
  function suggestion(title,{timeRows=[],workRows=[],kaizenIdeas=0}={}){
    if(/kaizen|continuous improvement/i.test(String(title||'')))return String(kaizenIdeas);
    const ignored=new Set(['daily','weekly','monthly','quarterly','yearly','performance','target','actual','report','team','work','task','rate','the','and','for','with','from','into','per','vs','on','of','in','to','no']);
    const keywords=clean(title).replace(/[^a-z0-9]+/g,' ').split(/\s+/).filter(word=>word.length>=3&&!ignored.has(word));
    if(!keywords.length)return'';
    const candidates=[...timeRows.map(row=>({row,minutes:minutesFor(row)})),...workRows.map(row=>({row,minutes:0}))];
    const matches=candidates.filter(({row})=>{
      const source=clean([row?.task,row?.custom_task,row?.work,row?.category,row?.remarks,row?.title,row?.project,row?.idea,row?.problem,row?.benefit,row?.outcomes,row?.activity].filter(Boolean).join(' ')).replace(/[^a-z0-9]+/g,' ');
      const hits=keywords.filter(word=>source.split(/\s+/).includes(word)).length;
      return hits>=Math.min(2,keywords.length);
    });
    if(!matches.length)return'';
    const minutes=matches.reduce((sum,item)=>sum+item.minutes,0),hours=Number((minutes/60).toFixed(2));
    return `${matches.length} matching source record${matches.length===1?'':'s'} · ${hours}h`;
  }
  window.kpiAutoData={summarize,text,suggestion};
})();
