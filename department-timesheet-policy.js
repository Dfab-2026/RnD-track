/* 7-day month blocks for department Time Sheet entry; R&D remains unchanged. */
(function(){
  'use strict';
  const iso=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const today=()=>iso(new Date());
  function bounds(at=new Date()){
    const current=at instanceof Date?new Date(at.getTime()):new Date(String(at)+'T12:00:00');
    if(!Number.isFinite(current.getTime()))throw new Error('Invalid calendar date.');
    const year=current.getFullYear(),month=current.getMonth(),day=current.getDate();
    const first=day<=7?1:day<=14?8:day<=21?15:22;
    const last=Math.min(first===22?new Date(year,month+1,0).getDate():first+6,new Date(year,month+1,0).getDate());
    return Object.freeze({start:iso(new Date(year,month,first)),end:iso(new Date(year,month,last)),max:iso(current),today:iso(current)});
  }
  function permitted(date,at=new Date()){
    if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
    const parsed=new Date(date+'T12:00:00');
    if(!Number.isFinite(parsed.getTime())||iso(parsed)!==date)return false;
    const {start,max}=bounds(at);return date>=start&&date<=max;
  }
  function message(at=new Date()){
    const {start,max,end}=bounds(at);
    return `Entries can be created or updated only from ${start} through ${max} (current period ends ${end}). Earlier weeks are read-only.`;
  }
  window.departmentTimesheetPolicy=Object.freeze({bounds,permitted,message,today});
})();
