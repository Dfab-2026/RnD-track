(function(){
  'use strict';

  function fitOne(workspace){
    if(!workspace || !workspace.classList.contains('q-dashboard-page')) return;
    if(window.innerWidth < 981) {
      const card=workspace.querySelector('.qd-task-analytics');
      if(card){ card.style.removeProperty('height'); card.style.removeProperty('min-height'); }
      return;
    }
    const scroll=workspace.querySelector('.q-scroll');
    const card=workspace.querySelector('.qd-task-analytics');
    if(!scroll || !card) return;
    const scrollRect=scroll.getBoundingClientRect();
    const cardRect=card.getBoundingClientRect();
    const bottomPad=12;
    const available=Math.floor(scrollRect.bottom-cardRect.top-bottomPad);
    if(available > 260){
      card.style.height=available+'px';
      card.style.minHeight=available+'px';
    }
  }

  function fitDashboards(){
    fitOne(document.getElementById('qualityWorkspace'));
    fitOne(document.getElementById('departmentWorkspace'));
  }

  let raf=0;
  function schedule(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(function(){
      fitDashboards();
      setTimeout(fitDashboards,40);
    });
  }

  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('DOMContentLoaded',schedule,{once:true});
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','hidden'],childList:true});
  window.dashboardViewportFit={refresh:schedule};
})();
