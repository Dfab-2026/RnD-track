(function(){
  const CONFIG={
<<<<<<< HEAD
    rnd:{name:"R&D",kpis:[
      ["Automation of Existing Manual Process","2 per week – each department","Weekly"],
      ["New Product Ideas","20 Solutions 5 Products by March 27","Daily"],
      ["Development of New Product","2 monthly","Monthly"],
      ["DFAB AI-ERP Tool","3 Months","Daily/Weekly/Monthly"],
      ["Quotation Tool Development Update","1 Month","Daily / Weekly"],
      ["DFAB Website Quality Update","New Tech","Monthly / Quaterly"],
      ["Continuous Improvement / Kaizen","Weekly –5 Kaizen","Weekly"],
      ["Weekly & Monthly KPI Report Submission","Submit KPI report","Weekly"],
=======
    quality:{name:'Quality',kpis:[
      ['Daily improvement ideas','1 per working day','Daily'],
      ['Daily task completion','3 daily activities','Daily'],
      ['Weekly internal department audits','All departments','Weekly'],
      ['Weekly department-wise quality KPI','All departments','Weekly'],
      ['Quality cost reduction','10%','Monthly'],
      ['Attrition rate','0%','Yearly'],
      ['ISO process implementation','All departments · 3 months','Quarterly']
    ]},
    productiondept:{name:'Production',kpis:[
      ['Production Plan vs Actual','100%','Weekly / Monthly'],['In-process Rework','< 2%','Weekly / Monthly'],['In-process Rejection','0%','Weekly / Monthly'],['OTD','100%','Weekly / Monthly'],['Kaizen Improvement','5 Kaizen / week','Weekly / Monthly'],['Quotation Accuracy','100%','Weekly / Monthly'],['Project Documentation Coordination','Coordinate / maintain','Weekly / Monthly'],['Attrition Rate','< 2%','Weekly / Monthly'],['Customer Complaint','0','Weekly / Monthly'],['Team Attendance Discipline','100%','Weekly / Monthly'],['Safety Incident','0','Weekly / Monthly'],['Cost Reduction in Operations','10%','Weekly / Monthly'],['Monthly-19 Invoice','Avg invoice value ₹1 Lakh','Weekly / Monthly'],['Report Submission','Weekly and monthly management review','Weekly / Monthly']
    ]},
    production:{name:'Welding Qualification',legacyProduction:true,kpis:[
      ['Production Plan vs Actual','100%','Weekly / Monthly'],['In-process Rework','< 2%','Weekly / Monthly'],['In-process Rejection','0%','Weekly / Monthly'],['OTD','100%','Weekly / Monthly'],['Kaizen Improvement','5 Kaizen / week','Weekly / Monthly'],['Quotation Accuracy','100%','Weekly / Monthly'],['Project Documentation Coordination','Coordinate / maintain','Weekly / Monthly'],['Attrition Rate','< 2%','Weekly / Monthly'],['Customer Complaint','0','Weekly / Monthly'],['Team Attendance Discipline','100%','Weekly / Monthly'],['Safety Incident','0','Weekly / Monthly'],['Cost Reduction in Operations','10%','Weekly / Monthly'],['Monthly-19 Invoice','Avg invoice value ₹1 Lakh','Weekly / Monthly'],['Report Submission','Weekly and monthly management review','Weekly / Monthly']
>>>>>>> origin/main
    ]},
    quality:{name:"Quality",kpis:[
      ["ISO Process Implementation","100% in all departments","Within 3 months"],
      ["Internal Audit of Each Department","Report Deviation","Bi-weekly"],
      ["Department wise quality KPI","Consolidate & Publish","Weekly"],
      ["Quality Training & Measurement of Awareness with Test","Provide Training","Weekly"],
      ["ORG Doc for Audit Readiness","Maintain all the records","Every Day"],
      ["Incoming, Inprocess & Final Inspections","Execute the offered inspection & Report","Every Day"],
      ["Internal & External cordination","Seemless Cordination","Every Day"],
      ["Quality cost reduction","10%","Monthly"],
      ["Attrition Rate","0","Yearly"],
      ["Continuous Improvement / Kaizen","5 Kaizen / week","Weekly"],
      ["KPI Report","Publish weekly & monthly","Weekly / Monthly"],
    ]},
    productiondept:{name:"Production",kpis:[
      ["Production Plan vs Actual","100%","Weekly / Monthly"],
      ["In-process Rework","< 2%","Weekly / Monthly"],
      ["In-process Rejection","0%","Weekly / Monthly"],
      ["OTD","100%","Weekly / Monthly"],
      ["Kaizen Improvement","Weekly –5 Kaizen","Weekly / Monthly"],
      ["Quotation Accuracy","100%","Weekly / Monthly"],
      ["Project Documentation Coordination","Coordinate / maintain","Weekly / Monthly"],
      ["Attrition Rate","< 2%","Weekly / Monthly"],
      ["Customer Complaint","0","Weekly / Monthly"],
      ["Team Attendance Discipline","100%","Weekly / Monthly"],
      ["Safety Incident","0","Weekly / Monthly"],
      ["Cost Reduction in Operations","10%","Weekly / Monthly"],
      ["Monthly-19 Invoice","Avg invoice value ₹1 Lakh","Weekly / Monthly"],
      ["Report Submission","Weekly and monthly for management review","Weekly / Monthly"],
    ]},
    production:{name:"Welding Qualification",legacyProduction:true,kpis:[
      ["Production Plan vs Actual","100%","Weekly / Monthly"],
      ["In-process Rework","< 2%","Weekly / Monthly"],
      ["In-process Rejection","0%","Weekly / Monthly"],
      ["OTD","100%","Weekly / Monthly"],
      ["Kaizen Improvement","Weekly –5 Kaizen","Weekly / Monthly"],
      ["Quotation Accuracy","100%","Weekly / Monthly"],
      ["Project Documentation Coordination","Coordinate / maintain","Weekly / Monthly"],
      ["Attrition Rate","< 2%","Weekly / Monthly"],
      ["Customer Complaint","0","Weekly / Monthly"],
      ["Team Attendance Discipline","100%","Weekly / Monthly"],
      ["Safety Incident","0","Weekly / Monthly"],
      ["Cost Reduction in Operations","10%","Weekly / Monthly"],
      ["Monthly-19 Invoice","Avg invoice value ₹1 Lakh","Weekly / Monthly"],
      ["Report Submission","Weekly and monthly for management review","Weekly / Monthly"],
    ]},
    npd:{name:"NPD",kpis:[
      ["NPD Projects Completed","Weekly: 4, Monthly: 16, by each NPD Engineer","Weekly / Monthly"],
      ["OTD","100%","Weekly / Monthly"],
      ["Project Documentation","100%","Weekly / Monthly"],
      ["Internal Defect","< 1","Weekly / Monthly"],
      ["External Defect","0","Weekly / Monthly"],
      ["Team Coordination","100%","Weekly / Monthly"],
      ["Customer / Loading Hours","100%","Weekly / Monthly"],
      ["Team Attendance Discipline","100%","Weekly / Monthly"],
      ["Kaizen Contribution","W-01","Weekly / Monthly"],
      ["Drawing G/Poom Accuracy","100%","Weekly / Monthly"],
      ["Safety Incident","0","Weekly / Monthly"],
      ["Cost Reduction","10% from quotation","Weekly / Monthly"],
      ["Monthly-19 Invoice","Avg invoice value ₹1 Lakh","Weekly / Monthly"],
      ["KPI Report","Publish weekly & monthly","Weekly / Monthly"],
    ]},
    rfq:{name:"Sales",kpis:[
      ["Revenue Target","Annual: ₹25.2 Cr · Weekly: ₹52.5 Lakh · Monthly: ₹2.1 Cr · Quarterly: ₹8.4 Cr · Yearly: ₹25.2 Cr","Weekly / Monthly / Quarterly / Yearly"],
      ["No. of New Customers","Weekly: 5 · Monthly: 20 · Quarterly: 80 · Yearly: 240","Weekly / Monthly / Quarterly / Yearly"],
      ["Revenue Pipeline Target","Weekly: ₹1.8 Cr · Monthly: ₹7.2 Cr · Quarterly: ₹28.8 Cr · Yearly: ₹86.4 Cr","Weekly / Monthly / Quarterly / Yearly"],
      ["RFQ to Quote Conversion","Minimum 90%","Weekly review"],
      ["Customer Follow-up","As needed","As Needed / Weekly"],
      ["Customer Visit","Weekly: 2 · Monthly: 8 · Quarterly: 32 · Yearly: 96","Weekly / Monthly / Quarterly / Yearly"],
      ["RFQ to PO","80%","Weekly review"],
      ["Customer Analysis & Strategy to Grow","Strategy / action required","Weekly review"],
      ["Existing Customer Growth Projection","50% extra from current capacity","Weekly review"],
      ["Customer Satisfaction","100%","Weekly review"],
    ]},
    outsourcing:{name:"Outsourcing",kpis:[
      ["Vendor Addition","Daily - 2 · Monthly - 12 · Yearly - 48","Weekly / Monthly"],
      ["OTD","100%","Weekly / Monthly"],
      ["Cost Reduction","10%","Weekly / Monthly"],
      ["Internal & External Collaboration","100%","Weekly / Monthly"],
      ["Rework","< 1%","Weekly / Monthly"],
      ["Rejection","0","Weekly / Monthly"],
      ["Vendor Improvement / Kaizen","Weekly -5","Weekly / Monthly"],
      ["Vendor Complaint","0","Weekly / Monthly"],
      ["Process Planning & Documentation","100%","Weekly / Monthly"],
      ["Vendor Load Allocation","1 Vendor / 1 Project","Weekly / Monthly"],
      ["Team Attendance Discipline","100%","Weekly / Monthly"],
      ["Attrition Rate","0","Weekly / Monthly"],
      ["Monthly -19 Invoice","Aug: ₹1 Lakh","Weekly / Monthly"],
      ["KPI Report","Publish weekly & monthly","Weekly / Monthly"],
    ]},
    purchase:{name:"Purchase",kpis:[
      ["On-time Placement","≤ 1 day","Daily"],
      ["Vendor Database Management & Addition of Vendors by Category","Daily – 1","Daily"],
      ["PO Accuracy & Technical Specification","100%","Weekly"],
      ["Cost Reduction","10%","Weekly"],
      ["Rejection Rate","0","Every Day"],
      ["Supplier Rating Report","Report","Every Day"],
      ["Internal & External Coordination","Complete coordination","Every Day"],
      ["Attendance & Team Discipline","100%","Monthly"],
      ["Continuous Improvement / Kaizen","Weekly –5 Kaizen","Yearly"],
      ["Weekly & Monthly KPI Report Submission","Submit KPI report","Weekly"],
    ]},
    stores:{name:"Stores",kpis:[
      ["GRN On Time","< 1 day","Daily"],
      ["Consumable Issue Record","Record with each W/O","Daily"],
      ["MINI Items Qty Tracking – Stock Aging","Track","Daily / Weekly"],
      ["ERP On-time Entry","On time","Weekly"],
      ["Inward Entry","On time","Every Day"],
      ["Material Traceability","Maintain traceability","Every Day"],
      ["Internal & External Coordination","Complete coordination","Every Day"],
      ["Attendance & Team Discipline","100%","Monthly"],
      ["Continuous Improvement / Kaizen","14–5 Kaizen","Yearly"],
      ["Weekly & Monthly KPI Report Submission","Submit KPI report","Weekly"],
    ]},
    hradmin:{name:"HR & Admin",kpis:[
      ["Position Fulfillment on Time","100%","As Needed"],
      ["Organization Compliance Fulfillment Against Documents","100%","Daily"],
      ["Skill Matrix Management","100%","Weekly / Monthly"],
      ["Employee Engagement","100%","Weekly"],
      ["Employee Satisfaction","100%","Every Day"],
      ["Attrition Rate","< 2%","Every Day"],
      ["No. of Training Conducted","Weekly – 1 each department","Weekly"],
      ["Employee recognisition/ Employee-related Program","Monthly based on performance","Monthly"],
      ["Continuous Improvement / Kaizen","Weekly –5 Kaizen","Weekly"],
      ["Weekly & Monthly KPI Report Submission","Submit KPI report","Weekly / Monthly"],
    ]},
    accounts:{name:"Accounts",kpis:[
      ["Record / Book Keeping","No pending task","Daily"],
      ["Invoicing","On time","Daily"],
      ["Rework","<1%","Daily"],
      ["Quotation Accuracy","100%","Daily"],
      ["Customer Coordination & Internal","100%","Every Day"],
      ["Attrition Rate","0","Monthly"],
      ["Weekly / Monthly Revenue Report","Monthly","Weekly / Monthly"],
      ["ERP Entry","100%","Daily"],
      ["Continuous Improvement / Kaizen","Weekly –5 Kaizen","Weekly"],
      ["Weekly & Monthly KPI Report Submission","Submit KPI report","Weekly / Monthly"],
    ]},
    finance:{name:"Finance",kpis:[
      ["Purchase Entry","100%","Daily"],
      ["Cash Flow Statement","Maintain / update","Daily"],
      ["Receivable / Payable Statement","Maintain / update","Daily"],
      ["Margin Projection Report","Report","Daily"],
      ["Party Payment","On time","Every Day"],
      ["Company Statutory Payments","100%","Monthly"],
      ["Bad Debt Recovery","Recover / monitor","Daily"],
      ["GST Payable Calculation","Accurate","Weekly"],
      ["Weekly / Monthly Revenue Forecast Vs Actual","Monthly","Weekly / Monthly"],
      ["Continuous Improvement","5 kaizen weekly","Weekly"],
      ["Attrition","0","Daily"],
      ["ERP Entry","100%","Daily"],
      ["Attendance & Team Discipline","100%","Monthly"],
    ]},
    maintenance:{name:"Maintenance",kpis:[
      ["No. of Machines Available","Maintain availability","Daily"],
      ["Monthly Maintenance","Monthly","Daily"],
      ["Breakdown Hours","Monitor / minimize","Daily"],
      ["Spare Availability","Maintain availability","Daily"],
      ["Weekly / Monthly Report","Monthly","Weekly / Monthly"],
      ["Continuous Improvement Kaizen","5-weekly","Yearly"],
    ]},
    digitalmarketing:{name:"Digital Marketing",kpis:[
      ["Digital Media Engagement","LinkedIn – 3/week; Facebook – 3/week; Instagram – 3/week","Weekly"],
      ["DFAB Business Competitor & Market Analysis","Analysis","Weekly"],
      ["New Customer Addition","3 Weekly","Weekly"],
      ["Event & Product Shoots","When required with work order","Daily/Weekly"],
      ["New Business Leads & Opportunity","Generate / Track","Daily/Weekly"],
      ["Revenue Generation by Lead","₹10 Lakh per month","Monthly"],
      ["Continuous Improvement / Kaizen","Weekly –5 Kaizen","Weekly"],
      ["Weekly & Monthly KPI Report Submission","Submit KPI report","Weekly"],
    ]},
  };
<<<<<<< HEAD
  // Keep existing KPI indices stable: attendance is appended only where missing.
  Object.values(CONFIG).forEach(department=>{
    if(!department.kpis.some(metric=>/attendance|team discipline/i.test(String(metric[0]))))
      department.kpis.push(['Attendance & Team Discipline','6 scheduled days per active member per week','Weekly']);
  });
=======
>>>>>>> origin/main
  const PAGES={dashboard:'Dashboard',kaizen:'Kaizen Ideas',weekly:'Weekly Report',kpi:'KPI Report',assigned:'Assigned Tasks',timesheet:'Time Sheet',settings:'Settings'};
  const MASTER_TIME_TASKS={
    rnd:['R&D Project Work','Product Development','Automation / Software Development','Testing / Validation','Research / Analysis','Quotation / Technical Support','Documentation','Internal Communication / Followup','External Communication / Followup','Training','Meeting','5S','Kaizen','Leave','No Work','ERP Entry'],
    productiondept:[],
    npd:[
      'Drawing Review for Production','Purchase Indent Creation','Fabrication Drawing Creation','Manufacturing Process Planning','Fabrication Fitup','Fabrication Welding','Inprocess Inspection','Final Inspection','Report / Quality / Project Report Preparation','Project Documentation','Internal Communication / Followup','External Communication / Followup','Training','Customer Visit','Leave'
    ],
    production:[
      'Drawing Review','PWPS','Weld Data Book Creation','Material Indent Creation','Welding Trial','Quotation Preparation','Internal Communication / Followup','External Communication / Followup','Customer Visit','Vendor Visit','Reports','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work'
    ],
    rfq:[
      'Customer Communication','Lead Generation','Drawing Feasibility Review','Quotation Preparation','Vendor Discussion','Internal Communication / Followup','External Communication / Followup','Customer Visit','Vendor Visit','Reports','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work'
    ],
    outsourcing:[
      'ERP Entry','Material Indent Creation','Process Plan Creation','Supplier discussion','Supplier visit','Material procurement','Drawing review','Incoming Inspection','Inprocess Inspection','Final Inspection','Packing & Dispatch','Report preparation','Leave','Meetings','Internal Communication / Followup','External Communication / Followup','Kaizen Implementation','5S','Assembly and Verification','No Work'
    ],
    purchase:[
      'Material Sourcing','Material purchase','PO Creation','Internal Communication / Followup','External Communication / Followup','ERP Entry','Vendor place visit','Training','Meeting','5S','Kaizen','Leave','No Work'
    ],
    stores:[
      'Incoming Inspection','ERP ENTRY','Stock order','stock access','Internal communication','Kaizen','5S','No Work','Training','Meeting','Documentation','Leave'
    ],
    hradmin:[
      'Hiring','Documentation','Admin Activities','Training','Meeting','5S','Kaizen','Leave','No Work'
    ],
    accounts:[
      'Invoicing','DC','Reports','Customer Communication','Quotation','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work','Tally Entry'
    ],
    finance:[
      'Report Preparation','Compliance Activities','Tally Entry','ERP Entry','Payments','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work'
    ],
    maintenance:[
      'Zone Wise Audit','Maintaince','ERP Entry','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work'
    ],
    digitalmarketing:[
      'Market Research','Instagram Post','Linked-in Post','Youtube Upload','Website Update','Lead Generation','Reports','Documentation','Training','Meeting','5S','Kaizen','Leave','No Work'
    ]
  };
  const MEMBER_ACCESS={rnd:[],productiondept:[],production:[],npd:[],rfq:[],outsourcing:['Sai','Sakthi','Venkatachala','Mithilesh'],purchase:[],stores:[],hradmin:[],accounts:[],finance:[],maintenance:[],digitalmarketing:[]};
  const MEMBER_ROLES={outsourcing:{sai:'lead',sakthi:'member',venkatachala:'member',mithilesh:'member'}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const norm=s=>String(s||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'');
  const keyForName=name=>{const n=norm(name);if(n==='randd'||n==='rnd')return'rnd';if(n==='hrandadmin'||n==='hradmin')return'hradmin';if(n==='digitalmarketing'||n==='marketing')return'digitalmarketing';if(n==='weldingqualification')return'production';if(n==='production')return'productiondept';if(n==='sales'||n==='rfq')return'rfq';return n};
  const isoToday=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const fmt=s=>s?new Date(s+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';
  const mins=t=>{const [h,m]=String(t||'').split(':').map(Number);return h*60+m};
  const duration=m=>`${Math.floor((Number(m)||0)/60)}h ${(Number(m)||0)%60}m`;
  const currentMonth=()=>isoToday().slice(0,7);
  const weekRange=date=>{const d=new Date(date+'T12:00:00'),day=(d.getDay()+6)%7,start=new Date(d);start.setDate(d.getDate()-day);const end=new Date(start);end.setDate(start.getDate()+6);const f=x=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;return{start:f(start),end:f(end)}};
  const monthRange=date=>{const month=String(date).slice(0,7),[y,m]=month.split('-').map(Number);return{start:month+'-01',end:`${month}-${String(new Date(y,m,0).getDate()).padStart(2,'0')}`}};
  const workdays=(start,end)=>{let n=0;for(let d=new Date(start+'T12:00:00');d<=new Date(end+'T12:00:00');d.setDate(d.getDate()+1))if(d.getDay()!==0)n++;return n};
  const sumMinutes=rows=>rows.reduce((s,r)=>s+(Number(r.minutes)||0),0);
  const fmtHours=m=>(Number(m||0)/60).toFixed(Number(m||0)%60?1:0);
  let root=null,deptKey='',cfg=null,records=[],stop=null,memberDirectory=[],memberDirectoryLoaded=false,page='dashboard',member='',server=false,recordsLoaded=false,busy=false,reportPeriod='weekly',reportMonth='',reportWeek=1,weeklyDate='',weeklyTab='summary',dashboardTask='all',dashboardPeriod='week',kaizenEdit='',kaizenSearch='',kaizenPerson='',kaizenDate='',timeEditingId='';
  const personKey=()=>`department_member_${deptKey}`;
  const leadSessionKey='dfabDepartmentLeadSession';
  const syncAssignedTaskLeadSession=()=>{
    if(adminView())return;
    const name=memberName();
    if(name&&memberRole()==='lead')localStorage.setItem(leadSessionKey,JSON.stringify({departmentKey:deptKey,department:cfg?.name||deptKey,person:name}));
    else localStorage.removeItem(leadSessionKey)
  };
  const adminView=()=>Boolean(window.adminSession?.active?.());
  const allowedMembers=()=>memberDirectoryLoaded?memberDirectory.filter(x=>x.active!==false).map(x=>x.name):(MEMBER_ACCESS[deptKey]||[]);
  const resolveMember=value=>allowedMembers().find(name=>norm(name)===norm(value))||'';
  const loginWords=value=>String(value||'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);
  const editDistance=(a,b)=>{a=String(a||'');b=String(b||'');const prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let left=i,diag=prev[0];prev[0]=i;for(let j=1;j<=b.length;j++){const up=prev[j],next=Math.min(up+1,left+1,diag+(a[i-1]===b[j-1]?0:1));diag=up;prev[j]=next;left=next}}return prev[b.length]};
  const suggestedMember=value=>{const input=String(value||'').trim();if(input.length<2)return'';const compact=norm(input),words=loginWords(input);let best='',bestScore=-Infinity;for(const name of allowedMembers()){const ncompact=norm(name),nwords=loginWords(name);let score=0;if(ncompact.startsWith(compact)||compact.startsWith(ncompact))score+=10;if(ncompact.includes(compact)||compact.includes(ncompact))score+=7;for(const w of words){let wordBest=0;for(const nw of nwords){if(nw===w)wordBest=Math.max(wordBest,7);else if(nw.startsWith(w)||w.startsWith(nw))wordBest=Math.max(wordBest,5);else{const d=editDistance(w,nw),m=Math.max(w.length,nw.length)||1;if(d<=2||d/m<=0.34)wordBest=Math.max(wordBest,3.5-d/m)}}score+=wordBest}const dist=editDistance(compact,ncompact),max=Math.max(compact.length,ncompact.length)||1;score+=(1-dist/max)*5;if(score>bestScore){bestScore=score;best=name}}return bestScore>=5?best:''};
  const memberRole=()=>{if(adminView())return'all_departments_leader';const name=memberName();if(norm(name)==='kabil')return'lead';const dynamic=memberDirectory.find(x=>norm(x.name)===norm(name));return dynamic?.role||MEMBER_ROLES[deptKey]?.[norm(name)]||'member'};
  const memberRoleLabel=()=>memberRole()==='lead'?`${cfg.name} Lead`:memberRole()==='all_departments_leader'?'All Departments Leader':`${cfg.name} Member`;
  const memberName=()=>adminView()?window.adminSession.name():resolveMember(member||localStorage.getItem(personKey())||'');
  const kpiMemberNames=()=>[...new Set((memberDirectoryLoaded?memberDirectory.filter(x=>x.active!==false&&Number(x.active)!==0&&String(x.role||'member')!=='visitor').map(x=>x.name):allowedMembers()).filter(name=>name))];
  const rangeDayCount=range=>Math.max(0,Math.round((new Date(range.end+'T12:00:00')-new Date(range.start+'T12:00:00'))/86400000)+1);
  const isKaizenMetric=title=>/kaizen|continuous improvement|improvement ideas/i.test(String(title||''));
  const tidyNumber=value=>{const n=Number(value);if(!Number.isFinite(n))return String(value);return Number.isInteger(n)?String(n):String(Math.round(n*100)/100)};
  const weeklyTargetText=metric=>{const title=String(metric?.[0]||''),target=String(metric?.[1]||'').trim(),frequency=String(metric?.[2]||'').trim(),t=target.replace(/\s+/g,' '),f=frequency.toLowerCase();let m;
    if((m=t.match(/weekly\s*[:\-–]?\s*₹?\s*([\d.]+)\s*(lakh|cr)?/i))){return `${m[2]?'₹':''}${tidyNumber(m[1])}${m[2]?' '+m[2]:''} / week`}
    if((m=t.match(/(\d+(?:\.\d+)?)\s*(?:kaizen)?\s*(?:\/\s*week|per\s+week|weekly)/i)))return `${tidyNumber(m[1])} / week`;
    if((m=t.match(/(?:w[-\s]?0*1|weekly\s*[–-]\s*(\d+))/i)))return `${tidyNumber(m[1]||1)} / week`;
    if(/^\d+(?:\.\d+)?\s+months?$/i.test(t))return `Weekly milestone toward ${t.toLowerCase()} completion`;
    if((m=t.match(/daily\s*[–\-:]\s*(\d+(?:\.\d+)?)/i)))return `${tidyNumber(Number(m[1])*6)} / working week`;
    if((m=t.match(/(\d+(?:\.\d+)?)\s*(?:per\s+day|daily)/i)))return `${tidyNumber(Number(m[1])*6)} / working week`;
    if(/daily|every day/.test(f)){if(/^0\s*%?$/.test(t))return `0 for the week`;if(/%/.test(t))return `${t} maintained through the week`;return `6 working-day checkpoints · ${t}`}
    if(/bi-weekly/.test(f))return `Weekly checkpoint · 1 cycle every 2 weeks`;
    if(/within\s*3\s*months|3\s*months/i.test(f+' '+t))return `Weekly milestone toward 3-month target · ${t}`;
    if(/as needed/.test(f+' '+t))return `As needed during this week`;
    if(/monthly/.test(f)){if((m=t.match(/₹\s*(\d+(?:\.\d+)?)\s*(lakh|cr)\s*(?:per\s+month|monthly)?/i)))return `₹${tidyNumber(Number(m[1])/4)} ${m[2]} / week`;if((m=t.match(/(\d+(?:\.\d+)?)\s*(?:monthly|per\s+month)/i)))return `${tidyNumber(Number(m[1])/4)} / week`;return `Weekly checkpoint toward monthly target · ${t}`}
    if(/quaterly|quarterly/.test(f))return `Weekly checkpoint toward quarterly target · ${t}`;
    if(/yearly/.test(f))return `Weekly checkpoint toward yearly target · ${t}`;
    return t||title;
  };
  const weeklyKaizenTarget=metric=>{const t=String(metric?.[1]||'');let m=t.match(/weekly\s*[:\-–]?\s*(\d+)/i)||t.match(/(\d+)\s*(?:kaizen)?\s*(?:\/\s*week|weekly)/i)||t.match(/w[-\s]?0*(\d+)/i);if(m)return Math.max(1,Number(m[1])||1);const nums=(t.match(/\d+/g)||[]).map(Number);return nums.length?Math.max(1,nums[nums.length-1]):5};
  const isAttendanceMetric=title=>/attendance|team discipline/i.test(String(title||''));
  const attendanceTarget=range=>kpiMemberNames().length*(reportPeriod==='weekly'?Math.min(6,workdays(range.start,range.end)):workdays(range.start,range.end));
  const recordedAttendanceDays=range=>new Set(rows('timesheet').filter(r=>r.date>=range.start&&r.date<=range.end&&!/leave/i.test(String(r.task||r.task_type||''))&&kpiMemberNames().some(name=>norm(name)===norm(r.member))).map(r=>norm(r.member)+'@'+r.date)).size;
  const periodTargetText=(metric,range)=>isAttendanceMetric(metric[0])?`${attendanceTarget(range)} person-days (${kpiMemberNames().length} member${kpiMemberNames().length===1?'':'s'} × ${reportPeriod==='weekly'?'6 working days':workdays(range.start,range.end)+' working days'})`:reportPeriod==='weekly'?weeklyTargetText(metric):String(metric?.[1]||'');
  const kaizenKpiStats=range=>{const names=kpiMemberNames(),days=rangeDayCount(range),nameSet=new Set(names.map(norm)),sourceRows=rows('kaizen').filter(r=>r.date>=range.start&&r.date<=range.end&&nameSet.has(norm(r.member))&&(deptKey!=='rnd'||String(r.idea_type||'kaizen').toLowerCase()==='kaizen')),byMember=names.map(name=>{const done=new Set(sourceRows.filter(r=>norm(r.member)===norm(name)).map(r=>r.date)).size;return{name,done,missing:Math.max(0,days-done)}}),actual=byMember.reduce((n,r)=>n+r.done,0),target=names.length*days;return{names,days,actual,target,progress:target?Math.min(100,Math.round(actual/target*100)):100,byMember}};
  const rows=t=>records.filter(r=>r.type===t);
<<<<<<< HEAD
  let rndSnapshot=null,rndTimeEntries=[],rndKpiRecords=[],rndSnapshotLoaded=false,rndTimeLoaded=false,rndKpiLoaded=false;
  const rndMemberById=id=>(rndSnapshot?.members||[]).find(m=>Number(m.id)===Number(id));
  const rndMemberId=name=>Number((rndSnapshot?.members||[]).find(m=>norm(m.name)===norm(name))?.id)||0;
  const rndDepartmentId=()=>Number((rndSnapshot?.departments||[]).find(d=>/^(r&d|rnd|research)/i.test(String(d.name||'')))?.id)||Number((rndSnapshot?.departments||[])[0]?.id)||0;
  const rndIdeaRow=row=>({id:`rnd_idea_${row.id}`,rnd_id:Number(row.id),type:'kaizen',member:row.submitted_by_name||rndMemberById(row.submitted_by)?.name||'',date:row.submission_date||'',problem:row.problem||'',idea:row.proposed_idea||'',benefit:row.expected_benefit||'',priority:row.priority||'Medium',status:'completed',idea_type:String(row.idea_type||'kaizen').toLowerCase()==='innovation'?'innovation':'kaizen',updated_at:row.updated_at||row.created_at||''});
  const rndTimeRow=row=>({...row,type:'timesheet',member:row.owner||rndMemberById(row.member_id)?.name||'',updated_at:row.updated_at||row.created_at||'',revision:Number(row.revision)||0});
  function refreshRndRecords(){
    if(deptKey!=='rnd')return;
    const ideas=(rndSnapshot?.ideas||[]).map(rndIdeaRow),times=rndTimeEntries.map(rndTimeRow),kpis=rndKpiRecords.filter(r=>r.type==='kpi');
    records=[...ideas,...times,...kpis];recordsLoaded=rndSnapshotLoaded&&rndTimeLoaded&&rndKpiLoaded;
    if(root&&!root.hidden&&deptKey==='rnd')paint();
  }
=======
>>>>>>> origin/main
  let qualityLegacyRecords=[],qualityLegacyEntries=[],qualityRecordsLoaded=false,qualityEntriesLoaded=false;
  function qualityTimeRow(entry){
    const taskType=String(entry.project_id||'other'),source=window.qualityTimeTasks?.find(item=>item.value===taskType);
    const custom=taskType==='other'?String(entry.work||'').trim():'';
    return {...entry,type:'timesheet',member:entry.owner||entry.person||'',task_type:taskType,
      task:source?.label||entry.work||({daily_inspection:'Incoming / In-process / Final Inspection',daily_documents:'ORG Document for Audit Readiness',daily_coordination:'Internal & External Coordination',kaizen_idea:'Kaizen Idea',weekly_audit:'Internal Audit'}[taskType])||taskType,custom_task:custom,po_number:entry.po_number||'',
      updated_at:entry.updated_at||entry.created_at||'',revision:Number(entry.revision)||0,remarks:entry.remarks||''};
  }
  function refreshQualityRecords(){
    const ideas=qualityLegacyRecords.filter(row=>row.kind==='daily_idea'||row.kind==='kaizen').map(row=>({
      ...row,type:'kaizen',member:row.person||'',problem:row.problem||'',idea:row.idea||'',benefit:row.benefit||'',
      priority:row.priority||'Medium',updated_at:row.updated_at||''}));
    records=[...ideas,...qualityLegacyEntries.map(qualityTimeRow)];
    recordsLoaded=qualityRecordsLoaded&&qualityEntriesLoaded;
    if(root&&!root.hidden&&deptKey==='quality')paint();
  }
  function qualityContext(){return{
    records:qualityLegacyRecords,timeEntries:qualityLegacyEntries,timeEntriesReady:qualityEntriesLoaded,
<<<<<<< HEAD
    timeEntriesError:'',ready:server,person:memberName,eligibleMembers:kpiMemberNames,sharedKaizenRows:()=>rows('kaizen'),
=======
    timeEntriesError:'',ready:server,person:memberName,
>>>>>>> origin/main
    upsert:row=>{qualityLegacyRecords=[...qualityLegacyRecords.filter(x=>String(x.id)!==String(row.id)),row];refreshQualityRecords()},
    remove:id=>{qualityLegacyRecords=qualityLegacyRecords.filter(x=>String(x.id)!==String(id));refreshQualityRecords()},
    navigate:id=>go(['audit','training','inspection','kpi'].includes(id)?'weekly':id==='ideas'?'kaizen':id==='report'?'kpi':id)
  }}

  const COMMON_TIME_TASKS=['Leave','No Work','ERP Entry','Meeting','Documentation','Training','Kaizen','5S','Internal Communication / Followup','External Communication / Followup'];
<<<<<<< HEAD
  const taskDefs=()=>{if(deptKey==='quality'&&Array.isArray(window.qualityTimeTasks)){return window.qualityTimeTasks.map(t=>({value:t.value,label:t.label,group:'Task List'})).filter(t=>t.value!=='other')}if(deptKey==='rnd'){const projects=(rndSnapshot?.projects||[]).filter(p=>p&&p.title).map(p=>({value:`project_${p.id}`,label:`${p.project_number?`${p.project_number} · `:''}${p.title}`,group:'R&D Projects'}));const base=(MASTER_TIME_TASKS.rnd||[]).map(label=>({value:`master_${norm(label)}`,label,group:'Task List'}));const existing=new Set([...projects,...base].map(x=>norm(x.label)));return[...projects,...base,...COMMON_TIME_TASKS.filter(label=>!existing.has(norm(label))).map(label=>({value:`master_${norm(label)}`,label,group:'Task List'}))]}const master=MASTER_TIME_TASKS[deptKey];const departmentTasks=master?.length?master.map(label=>({value:`master_${norm(label)}`,label,group:'Task List'})):cfg.kpis.map((k,i)=>({value:`kpi_${i}`,label:k[0],group:/daily|every day|as needed/i.test(k[2])?'Daily':/monthly/i.test(k[2])&&!/weekly/i.test(k[2])?'Monthly':'Weekly'}));const existing=new Set(departmentTasks.map(t=>norm(t.label)));return [...departmentTasks,...COMMON_TIME_TASKS.filter(label=>!existing.has(norm(label))).map(label=>({value:`master_${norm(label)}`,label,group:'Task List'}))]};
=======
  const taskDefs=()=>{if(deptKey==='quality'&&Array.isArray(window.qualityTimeTasks)){return window.qualityTimeTasks.map(t=>({value:t.value,label:t.label,group:'Task List'})).filter(t=>t.value!=='other')}const master=MASTER_TIME_TASKS[deptKey];const departmentTasks=master?.length?master.map(label=>({value:`master_${norm(label)}`,label,group:'Task List'})):cfg.kpis.map((k,i)=>({value:`kpi_${i}`,label:k[0],group:/daily|every day|as needed/i.test(k[2])?'Daily':/monthly/i.test(k[2])&&!/weekly/i.test(k[2])?'Monthly':'Weekly'}));const existing=new Set(departmentTasks.map(t=>norm(t.label)));return [...departmentTasks,...COMMON_TIME_TASKS.filter(label=>!existing.has(norm(label))).map(label=>({value:`master_${norm(label)}`,label,group:'Task List'}))]};
>>>>>>> origin/main
  const taskLabel=r=>r.task_type==='other'?(r.custom_task||r.task||'Other task'):(taskDefs().find(t=>t.value===r.task_type)?.label||r.task||'Task');
  const clockLabel=value=>{if(!/^\d{2}:\d{2}$/.test(String(value||'')))return String(value||'');const [h,m]=String(value).split(':').map(Number),period=h>=12?'PM':'AM',hh=h%12||12;return `${hh}:${String(m).padStart(2,'0')} ${period}`};
  const timeOptions=selected=>{let html='<option value="">Select time</option>';for(let n=9*60;n<24*60;n+=15){const value=`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;html+=`<option value="${value}" ${value===selected?'selected':''}>${clockLabel(value)}</option>`}return html};
  const statusLabel=s=>s==='completed'?'Completed':s==='in_progress'?'In progress':'Pending';
  const timePolicy=()=>window.departmentTimesheetPolicy;
  function reportRange(){const month=reportMonth||currentMonth(),[y,m]=month.split('-').map(Number);if(reportPeriod==='monthly')return{...monthRange(month+'-01'),key:`month:${month}`};const last=new Date(y,m,0).getDate(),start=(reportWeek-1)*7+1,end=reportWeek===4?last:Math.min(reportWeek*7,last);return{start:`${month}-${String(start).padStart(2,'0')}`,end:`${month}-${String(end).padStart(2,'0')}`,key:`week:${month}:W${reportWeek}`}}
  function currentWeek(){return weekRange(weeklyDate||isoToday())}
<<<<<<< HEAD
  async function save(id,row){if(!server)throw Error('Firebase is not connected yet.');if(deptKey==='rnd'){
    if(row.type==='timesheet'){
      const payload={...row,member_id:rndMemberId(row.member),owner:row.member,project_id:String(row.task_type||'').startsWith('project_')?Number(String(row.task_type).slice(8)):Number(row.project_id)||0};
      const saved=await window.rndCloud.saveRndTime(id,payload);rndTimeEntries=[...rndTimeEntries.filter(x=>String(x.id)!==String(id)),saved];refreshRndRecords();return saved;
    }
    if(row.type==='kaizen'){
      const ideaType=String(row.idea_type||'kaizen').toLowerCase()==='innovation'?'innovation':'kaizen',original=(rndSnapshot?.ideas||[]).find(x=>Number(x.id)===Number(row.rnd_id||String(id).replace(/^rnd_idea_/,'')));
      const date=row.date||isoToday(),memberId=rndMemberId(row.member);if(!memberId)throw Error('R&D member mapping is unavailable. Refresh and retry.');
      const duplicate=(rndSnapshot?.ideas||[]).find(x=>Number(x.submitted_by)===memberId&&x.submission_date===date&&String(x.idea_type||'kaizen').toLowerCase()===ideaType&&Number(x.id)!==Number(original?.id));if(duplicate)throw Error(`${ideaType==='innovation'?'Innovation Idea':'Kaizen'} is already submitted for this date. Edit the existing entry.`);
      const numericId=original?.id||Math.max(0,...(rndSnapshot?.ideas||[]).map(x=>Number(x.id)||0))+1,seq=(rndSnapshot?.ideas||[]).filter(x=>x.submission_date===date&&Number(x.id)!==Number(numericId)).length+1,now=row.updated_at||new Date().toISOString();
      const payload={...original,id:numericId,idea_number:original?.idea_number||`IDEA-${date.replaceAll('-','')}-${String(seq).padStart(2,'0')}`,submitted_by:memberId,department_id:original?.department_id||rndDepartmentId(),problem:row.problem,proposed_idea:row.idea,expected_benefit:row.benefit||'',priority:row.priority||'Medium',submission_date:date,status:'submitted',idea_type:ideaType,attachment:original?.attachment||null,created_at:original?.created_at||now,updated_at:now};
      await window.rndCloud.upsert('ideas',payload);rndSnapshot={...(rndSnapshot||{}),ideas:[...(rndSnapshot?.ideas||[]).filter(x=>Number(x.id)!==Number(numericId)),payload]};refreshRndRecords();return payload;
    }
    if(row.type==='kpi'){const actor=memberName(),role=memberRole();return window.rndCloud.saveDepartmentRecord('rnd',id,{...row,actor_role:role==='lead'?'department_lead':role==='all_departments_leader'?'all_departments_leader':'department_member',actor_scope:adminView()?'all_departments':'rnd',actor_name:actor,department_key:'rnd'});}
  }if(deptKey==='quality'){if(row.type==='timesheet'){const older=qualityLegacyEntries.find(x=>String(x.id)===String(id));const payload={...older,project_id:row.task_type,owner:row.member,date:row.date,po_number:row.po_number,from:row.from,to:row.to,minutes:row.minutes,status:row.status,remarks:row.remarks,work:row.task_type==='other'?(row.custom_task||row.task):(older?.project_id===row.task_type&&older?.work?older.work:row.task),created_at:older?.created_at||row.created_at||new Date().toISOString(),updated_at:row.updated_at||new Date().toISOString(),revision:Number(row.revision)||0};const saved=await window.rndCloud.saveQualityTime('entries',id,payload);qualityLegacyEntries=[...qualityLegacyEntries.filter(x=>String(x.id)!==String(id)),{...payload,id}];refreshQualityRecords();return saved}if(row.type==='kaizen'){const match=qualityLegacyRecords.find(x=>x.kind==='daily_idea'&&x.date===row.date&&norm(x.person)===norm(row.member)&&String(x.id)!==String(id));if(match)throw Error('A Kaizen idea already exists for this date. Edit the existing entry.');const payload={kind:'daily_idea',person:row.member,date:row.date,status:'completed',problem:row.problem,idea:row.idea,priority:row.priority,updated_at:row.updated_at||new Date().toISOString()};const saved=await window.rndCloud.saveQualityTime('records',id,payload);qualityLegacyRecords=[...qualityLegacyRecords.filter(x=>String(x.id)!==String(id)),{...payload,id}];refreshQualityRecords();return saved}throw Error('Quality KPI and inspection records must be saved from their dedicated report controls.')}const actor=memberName(),role=memberRole();return window.rndCloud.saveDepartmentRecord(deptKey,id,{...row,actor_role:role==='lead'?'department_lead':role==='all_departments_leader'?'all_departments_leader':'department_member',actor_scope:adminView()?'all_departments':deptKey,actor_name:actor,department_key:deptKey})}
  async function remove(id){if(!server)throw Error('Firebase is not connected yet.');if(deptKey==='rnd'){
    const original=records.find(r=>String(r.id)===String(id)&&r.type==='kaizen');if(!original)throw Error('R&D idea was not found.');await window.rndCloud.deleteMany('ideas',[Number(original.rnd_id)]);rndSnapshot={...(rndSnapshot||{}),ideas:(rndSnapshot?.ideas||[]).filter(x=>Number(x.id)!==Number(original.rnd_id))};refreshRndRecords();return;
  }if(deptKey==='quality'){const original=qualityLegacyRecords.find(x=>String(x.id)===String(id));if(!original||!['daily_idea','kaizen'].includes(original.kind))throw Error('Only Quality Kaizen records may be deleted here.');await window.rndCloud.deleteQualityRecord(id);qualityLegacyRecords=qualityLegacyRecords.filter(x=>String(x.id)!==String(id));refreshQualityRecords();return} return window.rndCloud.deleteDepartmentRecord(deptKey,id)}
  async function removeTimeRecord(id){
    if(!server)throw Error('Firebase is not connected yet.');
    if(deptKey==='rnd'){
      await window.rndCloud.deleteRndTime(id);rndTimeEntries=rndTimeEntries.filter(x=>String(x.id)!==String(id));refreshRndRecords();return;
    }
=======
  async function save(id,row){if(!server)throw Error('Firebase is not connected yet.');if(deptKey==='quality'){if(row.type==='timesheet'){const older=qualityLegacyEntries.find(x=>String(x.id)===String(id));const payload={...older,project_id:row.task_type,owner:row.member,date:row.date,po_number:row.po_number,from:row.from,to:row.to,minutes:row.minutes,status:row.status,remarks:row.remarks,work:row.task_type==='other'?(row.custom_task||row.task):(older?.project_id===row.task_type&&older?.work?older.work:row.task),created_at:older?.created_at||row.created_at||new Date().toISOString(),updated_at:row.updated_at||new Date().toISOString(),revision:Number(row.revision)||0};const saved=await window.rndCloud.saveQualityTime('entries',id,payload);qualityLegacyEntries=[...qualityLegacyEntries.filter(x=>String(x.id)!==String(id)),{...payload,id}];refreshQualityRecords();return saved}if(row.type==='kaizen'){const match=qualityLegacyRecords.find(x=>x.kind==='daily_idea'&&x.date===row.date&&norm(x.person)===norm(row.member)&&String(x.id)!==String(id));if(match)throw Error('A Kaizen idea already exists for this date. Edit the existing entry.');const payload={kind:'daily_idea',person:row.member,date:row.date,status:'completed',problem:row.problem,idea:row.idea,priority:row.priority,updated_at:row.updated_at||new Date().toISOString()};const saved=await window.rndCloud.saveQualityTime('records',id,payload);qualityLegacyRecords=[...qualityLegacyRecords.filter(x=>String(x.id)!==String(id)),{...payload,id}];refreshQualityRecords();return saved}throw Error('Quality KPI and inspection records must be saved from their dedicated report controls.')}const actor=memberName(),role=memberRole();return window.rndCloud.saveDepartmentRecord(deptKey,id,{...row,actor_role:role==='lead'?'department_lead':role==='all_departments_leader'?'all_departments_leader':'department_member',actor_scope:adminView()?'all_departments':deptKey,actor_name:actor,department_key:deptKey})}
  async function remove(id){if(!server)throw Error('Firebase is not connected yet.');if(deptKey==='quality'){const original=qualityLegacyRecords.find(x=>String(x.id)===String(id));if(!original||!['daily_idea','kaizen'].includes(original.kind))throw Error('Only Quality Kaizen records may be deleted here.');await window.rndCloud.deleteQualityRecord(id);qualityLegacyRecords=qualityLegacyRecords.filter(x=>String(x.id)!==String(id));refreshQualityRecords();return} return window.rndCloud.deleteDepartmentRecord(deptKey,id)}
  async function removeTimeRecord(id){
    if(!server)throw Error('Firebase is not connected yet.');
>>>>>>> origin/main
    if(deptKey==='quality'){
      await window.rndCloud.deleteQualityTimeEntry(id);
      qualityLegacyEntries=qualityLegacyEntries.filter(x=>String(x.id)!==String(id));
      refreshQualityRecords();
      return;
    }
    await window.rndCloud.deleteDepartmentRecord(deptKey,id);
    records=records.filter(x=>String(x.id)!==String(id));
  }
  function shell(){
    if(root.querySelector('.quality-shell'))return;
    root.innerHTML=`<div class="quality-shell"><aside class="sidebar q-sidebar" id="dSidebar"><div class="brand"><span class="brand-mark dfab-brand-mark"><img src="assets/dfab-logo.png" alt="DFAB" width="44" height="44"></span><div class="brand-copy"><strong>${esc(cfg.name.toUpperCase())} TRACK</strong><small>DFAB OPERATIONS</small></div><button type="button" class="q-collapse" id="dCollapse" aria-label="Collapse navigation">‹</button><button type="button" class="q-close-nav" id="dCloseNav" aria-label="Close navigation">×</button></div><nav aria-label="${esc(cfg.name)} pages">${window.departmentSharedUI.navigation('department',page)}</nav><div class="side-note"><b>${esc(cfg.name.toUpperCase())} TEAM</b><p>Kaizen, weekly work, KPI and Time Sheet records.</p></div><button type="button" class="nav-btn q-departments" id="dBack"><span>←</span><b>All departments</b></button></aside><button type="button" class="workspace-reopen" id="dReopen" aria-label="Open sidebar" title="Open sidebar">☰</button><button type="button" class="q-backdrop" id="dBackdrop" aria-label="Close navigation" hidden></button><div class="main q-main"><header class="topbar"><button type="button" class="q-open-nav" id="dOpenNav" aria-label="Open navigation" aria-controls="dSidebar" aria-expanded="false">☰</button><div><div class="eyebrow">${esc(cfg.name.toUpperCase())} OPERATIONS</div><div class="dfab-page-heading"><img src="assets/dfab-logo.png" alt="DFAB" width="66" height="28"><h1 id="dTitle">Dashboard</h1></div></div><div class="top-actions compact-top-actions"><div class="notification-center-wrap header-tool-wrap"><button class="header-tool-btn notification-bell" id="dBell" type="button" aria-label="Open notifications" aria-expanded="false">🔔<span id="dBellBadge" class="notification-badge hidden">0</span></button><section class="notification-panel hidden" id="dNotifications"><div class="notification-panel-head"><h3>Notifications</h3><button class="icon-btn" id="dCloseNotifications">×</button></div><div id="dNotificationItems" class="notification-panel-content"></div></section></div><div class="profile-quick-wrap"><button class="profile-quick-btn" id="dProfile" type="button" aria-label="Open profile" aria-expanded="false"><span>${esc(memberName().charAt(0)||'D')}</span><i class="profile-cloud-dot connecting" id="dCloudDot"></i></button><section class="profile-quick-panel hidden" id="dProfilePanel"><div class="profile-quick-head"><div class="profile-quick-avatar">${esc(memberName().charAt(0)||'D')}</div><div><strong>${esc(memberName())}</strong><small>${esc(memberRoleLabel().toUpperCase())}</small></div></div><div class="profile-quick-row"><span>Data status</span><b id="dProfileCloud">Connecting</b></div><button class="ghost-btn" id="dProfileSettings">Open Settings</button></section></div></div></header><div class="q-scroll" id="dScroll"><div class="quality-person"><span class="q-signed-in">Signed in as <strong>${esc(memberName())}</strong></span><span id="dConnection">Connecting…</span></div><div id="dContent"></div></div></div></div>`;
    root.querySelector('#dBack').onclick=()=>showDepartmentGate();
    root.querySelectorAll('[data-d-page]').forEach(b=>b.onclick=()=>go(b.dataset.dPage));root.querySelector('#dTime').onclick=()=>go('timesheet');
    root.querySelector('#dCollapse').onclick=()=>root.classList.toggle('q-collapsed');root.querySelector('#dReopen').onclick=()=>root.classList.remove('q-collapsed');
    const mobileNav=open=>{root.querySelector('#dSidebar')?.classList.toggle('open',open);root.querySelector('#dBackdrop').hidden=!open;root.querySelector('#dOpenNav')?.setAttribute('aria-expanded',String(open))};
    root.querySelector('#dOpenNav').onclick=()=>mobileNav(true);root.querySelector('#dCloseNav').onclick=()=>mobileNav(false);root.querySelector('#dBackdrop').onclick=()=>mobileNav(false);
    root.querySelectorAll('#dSidebar .nav-btn').forEach(button=>button.addEventListener('click',()=>mobileNav(false)));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&root&&!root.hidden)mobileNav(false)},{signal:(root._mobileNavController=new AbortController()).signal});
    const closeHeaderPanels=()=>{const profile=root.querySelector('#dProfilePanel'),notifications=root.querySelector('#dNotifications'),profileBtn=root.querySelector('#dProfile'),bell=root.querySelector('#dBell');profile?.classList.add('hidden');notifications?.classList.add('hidden');profileBtn?.setAttribute('aria-expanded','false');bell?.setAttribute('aria-expanded','false')};
    root.querySelector('#dProfile').onclick=()=>{const panel=root.querySelector('#dProfilePanel'),show=panel.classList.contains('hidden');closeHeaderPanels();panel.classList.toggle('hidden',!show);root.querySelector('#dProfile').setAttribute('aria-expanded',String(show))};
    root.querySelector('#dProfileSettings').onclick=()=>{closeHeaderPanels();go('settings')};
<<<<<<< HEAD
    root.querySelector('#dBell').onclick=()=>{const panel=root.querySelector('#dNotifications'),show=panel.classList.contains('hidden');closeHeaderPanels();if(show)void renderNotifications();panel.classList.toggle('hidden',!show);root.querySelector('#dBell').setAttribute('aria-expanded',String(show))};root.querySelector('#dCloseNotifications').onclick=closeHeaderPanels;
=======
    root.querySelector('#dBell').onclick=()=>{const panel=root.querySelector('#dNotifications'),show=panel.classList.contains('hidden');closeHeaderPanels();if(show)renderNotifications();panel.classList.toggle('hidden',!show);root.querySelector('#dBell').setAttribute('aria-expanded',String(show))};root.querySelector('#dCloseNotifications').onclick=closeHeaderPanels;
>>>>>>> origin/main
    const outsideHeaderPanels=event=>{if(root&&!root.hidden&&!event.target.closest?.('.profile-quick-wrap,.notification-center-wrap'))closeHeaderPanels()};document.addEventListener('pointerdown',outsideHeaderPanels);root._departmentPanelCleanup=()=>document.removeEventListener('pointerdown',outsideHeaderPanels);
  }
  function content(){return root.querySelector('#dContent')}
  function activate(){root.classList.toggle('q-dashboard-page',page==='dashboard');root.classList.toggle('q-kaizen-page',page==='kaizen');root.querySelectorAll('[data-d-page],#dTime').forEach(b=>b.classList.toggle('active',page==='timesheet'?b.id==='dTime':b.dataset.dPage===page));root.querySelector('#dTitle').textContent=page==='timesheet'?'Time Sheet':PAGES[page]||'Dashboard';root.querySelector('#dScroll').scrollTop=0}
  function go(next){root?.querySelector('#dProfilePanel')?.classList.add('hidden');root?.querySelector('#dNotifications')?.classList.add('hidden');root?.querySelector('#dProfile')?.setAttribute('aria-expanded','false');root?.querySelector('#dBell')?.setAttribute('aria-expanded','false');if(next!=='timesheet'||page!=='timesheet')timeEditingId='';page=next;activate();paint()}
  function updateCloud(){if(!root)return;const dot=root.querySelector('#dCloudDot'),label=root.querySelector('#dProfileCloud'),connection=root.querySelector('#dConnection');dot?.classList.toggle('connecting',!server);dot?.classList.toggle('online',server);if(label)label.textContent=server?'Live data':'Syncing data';if(connection)connection.textContent=server?'Data synchronized':'Checking data synchronization…'}
<<<<<<< HEAD
  function pendingItems(){if(adminView())return[];if(deptKey==='quality')return (window.qualityReview?.dueItems?.(qualityContext())||[]).map(r=>({title:r.title||'Quality KPI review',page:'kpi',date:r.date||isoToday()}));const today=isoToday(),kaizenToday=rows('kaizen').some(r=>r.date===today&&norm(r.member)===norm(memberName())&&(deptKey!=='rnd'||String(r.idea_type||'kaizen').toLowerCase()==='kaizen'));const pending=[];if(!(deptKey==='rnd'&&norm(memberName())==='kabil')&&!kaizenToday)pending.push({title:"Submit today's Kaizen Idea",page:'kaizen',date:today});const w=currentWeek(),weeklyKpis=cfg.kpis.map((k,i)=>({k,i})).filter(x=>/weekly/i.test(x.k[2]));const kpiRows=rows('kpi').filter(r=>r.period===`week:${w.start.slice(0,7)}:W${Math.min(4,Math.ceil(Number(w.start.slice(-2))/7))}`);weeklyKpis.forEach(({k,i})=>{const r=kpiRows.find(x=>Number(x.kpi_index)===i);if(!r||Number(r.progress)<100)pending.push({title:k[0],page:'kpi',date:w.end})});return pending}
  async function teamPendingItems(){if(adminView())return[];const me=memberName(),today=isoToday(),items=[];try{const assigned=(await window.rndCloud.loadAssignedTasks()).filter(t=>t.department_key===deptKey&&t.status!=='completed'&&norm(t.person)!==norm(me));assigned.forEach(t=>items.push({title:t.task||'Assigned task',owner:t.person||'Team member',page:'assigned',date:t.assigned_at?.slice?.(0,10)||today,type:'ASSIGNED TASK'}))}catch{}
    const names=kpiMemberNames().filter(name=>norm(name)!==norm(me));names.forEach(name=>{const done=rows('kaizen').some(r=>r.date===today&&norm(r.member)===norm(name)&&(deptKey!=='rnd'||String(r.idea_type||'kaizen').toLowerCase()==='kaizen'));if(!done)items.push({title:"Today's Kaizen not submitted",owner:name,page:'kaizen',date:today,type:'KAIZEN IDEA'})});return items}
  function setBadgeCount(n){const b=root?.querySelector('#dBellBadge');if(!b)return;b.textContent=String(Math.min(n,99));b.classList.toggle('hidden',!n)}
  function updateBadge(){const own=pendingItems();setBadgeCount(own.length);teamPendingItems().then(team=>{if(root&&!root.hidden)setBadgeCount(own.length+team.length)}).catch(()=>{})}
  async function renderNotifications(){const mine=pendingItems(),team=await teamPendingItems(),host=root.querySelector('#dNotificationItems');if(!host)return;const item=(x,mineItem)=>`<button class="notification-item ${mineItem?'mine':'team'}" data-open="${x.page}"><div class="notification-item-main"><div class="notification-item-top"><span class="notification-owner">${mineItem?'MY TASK':esc(x.owner||'TEAM')}</span><span class="notification-date">${fmt(x.date)}</span></div><strong>${esc(x.type|| (x.page==='kaizen'?'KAIZEN IDEA':'KPI REVIEW'))}</strong><small>${esc(x.title)}</small></div><span class="pending-status">PENDING</span></button>`;host.innerHTML=`<section class="notification-group"><div class="notification-group-title"><span>MY PENDING</span><b>${mine.length}</b></div>${mine.length?mine.map(x=>item(x,true)).join(''):'<div class="notification-empty">No pending items for you.</div>'}</section><section class="notification-group"><div class="notification-group-title"><span>TEAM PENDING</span><b>${team.length}</b></div>${team.length?team.map(x=>item(x,false)).join(''):'<div class="notification-empty">No team pending items.</div>'}</section>`;setBadgeCount(mine.length+team.length);host.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{root.querySelector('#dNotifications').classList.add('hidden');go(b.dataset.open)})}
  function dashboard(){
    if(!recordsLoaded){content().innerHTML=`<div class="qd-dashboard dashboard-loading-state"><div class="metric-grid q-overview-metrics qd-four-metrics">${['KAIZEN IDEAS','DAILY','WEEK','MONTHLY'].map(label=>`<div class="metric dashboard-metric-loading"><span class="m-label">${label}</span><strong>—</strong><small>Syncing Firebase…</small></div>`).join('')}</div><section class="panel dashboard-loading-panel"><span class="kicker">TASK ANALYTICS</span><h3>Loading live dashboard data…</h3><p>Your dashboard will appear as soon as the latest department records are available.</p></section></div>`;return}
    const times=rows('timesheet').filter(r=>adminView()||norm(r.member)===norm(memberName())),today=isoToday(),week=weekRange(today),month=monthRange(today),m=list=>sumMinutes(list),dayMin=m(times.filter(r=>r.date===today)),weekMin=m(times.filter(r=>r.date>=week.start&&r.date<=week.end)),monthMin=m(times.filter(r=>r.date>=month.start&&r.date<=month.end)),monthTarget=workdays(month.start,month.end)*480,todayKaizen=kaizenKpiStats({start:today,end:today});
=======
  function pendingItems(){if(adminView())return[];if(deptKey==='quality')return (window.qualityReview?.dueItems?.(qualityContext())||[]).map(r=>({title:r.title||'Quality KPI review',page:'kpi',date:r.date||isoToday()}));const today=isoToday(),kaizenToday=rows('kaizen').some(r=>r.date===today&&norm(r.member)===norm(memberName()));const pending=[];if(!kaizenToday)pending.push({title:"Submit today's Kaizen Idea",page:'kaizen',date:today});const w=currentWeek(),weeklyKpis=cfg.kpis.map((k,i)=>({k,i})).filter(x=>/weekly/i.test(x.k[2]));const kpiRows=rows('kpi').filter(r=>r.period===`week:${w.start.slice(0,7)}:W${Math.min(4,Math.ceil(Number(w.start.slice(-2))/7))}`);weeklyKpis.forEach(({k,i})=>{const r=kpiRows.find(x=>Number(x.kpi_index)===i);if(!r||Number(r.progress)<100)pending.push({title:k[0],page:'kpi',date:w.end})});return pending}
  function updateBadge(){const n=pendingItems().length,b=root?.querySelector('#dBellBadge');if(!b)return;b.textContent=String(Math.min(n,99));b.classList.toggle('hidden',!n)}
  function renderNotifications(){const list=pendingItems(),host=root.querySelector('#dNotificationItems');host.innerHTML=list.length?`<section class="notification-group"><div class="notification-group-title"><span>MY PENDING</span><b>${list.length}</b></div>${list.map(x=>`<button class="notification-item mine" data-open="${x.page}"><div class="notification-item-main"><div class="notification-item-top"><span class="notification-owner">MY TASK</span><span class="notification-date">${fmt(x.date)}</span></div><strong>${x.page==='kaizen'?'KAIZEN IDEA':'KPI REVIEW'}</strong><small>${esc(x.title)}</small></div><span class="pending-status">PENDING</span></button>`).join('')}</section>`:'<div class="notification-empty">No pending tasks.</div>';host.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{root.querySelector('#dNotifications').classList.add('hidden');go(b.dataset.open)})}
  function dashboard(){
    if(!recordsLoaded){content().innerHTML=`<div class="qd-dashboard dashboard-loading-state"><div class="metric-grid q-overview-metrics qd-four-metrics">${['KAIZEN IDEAS','DAILY','WEEK','MONTHLY'].map(label=>`<div class="metric dashboard-metric-loading"><span class="m-label">${label}</span><strong>—</strong><small>Syncing Firebase…</small></div>`).join('')}</div><section class="panel dashboard-loading-panel"><span class="kicker">TASK ANALYTICS</span><h3>Loading live dashboard data…</h3><p>Your dashboard will appear as soon as the latest department records are available.</p></section></div>`;return}
    const times=rows('timesheet').filter(r=>adminView()||norm(r.member)===norm(memberName())),today=isoToday(),week=weekRange(today),month=monthRange(today),m=list=>sumMinutes(list),dayMin=m(times.filter(r=>r.date===today)),weekMin=m(times.filter(r=>r.date>=week.start&&r.date<=week.end)),monthMin=m(times.filter(r=>r.date>=month.start&&r.date<=month.end)),monthTarget=workdays(month.start,month.end)*480,kaizen=rows('kaizen').filter(r=>r.date===today&&(adminView()||norm(r.member)===norm(memberName()))).length;
>>>>>>> origin/main
    const defs=taskDefs(),manual=[...new Set(times.filter(r=>r.task_type==='other').map(r=>r.custom_task).filter(Boolean))],opts=[{value:'all',label:'All tasks'},...defs.map(x=>({value:x.value,label:x.label})),...manual.map(x=>({value:'other:'+x,label:x+' (Others)'}))];if(!opts.some(x=>x.value===dashboardTask))dashboardTask='all';
    const start=dashboardPeriod==='month'?month.start:week.start,end=dashboardPeriod==='month'?month.end:week.end,match=r=>dashboardTask==='all'||r.task_type===dashboardTask||(dashboardTask.startsWith('other:')&&r.task_type==='other'&&r.custom_task===dashboardTask.slice(6)),selected=times.filter(r=>r.date>=start&&r.date<=end&&match(r));
    const points=[];for(let d=new Date(start+'T12:00:00'),last=new Date(end+'T12:00:00');d<=last;d.setDate(d.getDate()+1)){const date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,day=selected.filter(r=>r.date===date),by=s=>sumMinutes(day.filter(r=>r.status===s));points.push({label:d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'}),done:by('completed'),progress:by('in_progress'),pending:by('pending'),total:sumMinutes(day)})}const max=Math.max(60,...points.map(x=>x.total)),chart=points.map(p=>{const total=Math.round(p.total/max*100),done=p.total?Math.round(p.done/p.total*total):0,prog=p.total?Math.round(p.progress/p.total*total):0,pend=Math.max(0,total-done-prog);return `<div class="qd-task-chart-col"><div class="qd-task-chart-bar"><i class="done" style="height:${done}%"></i><i class="progress" style="height:${prog}%"></i><i class="pending" style="height:${pend}%"></i></div><b>${fmtHours(p.total)}h</b><span>${p.label}</span></div>`}).join('');
    content().innerHTML=`<div class="qd-dashboard"><div class="metric-grid q-overview-metrics qd-four-metrics"><button class="metric qd-dashboard-link" data-go="kaizen"><span class="m-label">KAIZEN IDEAS</span><strong>${todayKaizen.actual}/${todayKaizen.target}</strong><small>Today · counted team</small></button><button class="metric qd-dashboard-link" data-go="timesheet"><span class="m-label">DAILY</span><strong>${fmtHours(dayMin)}h</strong><small>Target 8h</small></button><button class="metric qd-dashboard-link" data-go="weekly"><span class="m-label">WEEK</span><strong>${fmtHours(weekMin)}h</strong><small>Target 48h</small></button><button class="metric qd-dashboard-link" data-go="timesheet"><span class="m-label">MONTHLY</span><strong>${fmtHours(monthMin)}h</strong><small>Target ${fmtHours(monthTarget)}h</small></button></div><section class="panel qd-task-analytics"><div class="panel-head"><div><span class="kicker">TASK ANALYTICS</span><h3>Time Sheet task graph</h3></div><div class="qd-chart-filters"><label>Task<select id="dDashTask">${opts.map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select></label><label>Period<select id="dDashPeriod"><option value="week">Week</option><option value="month">Month</option></select></label></div></div><div class="qd-chart-summary"><span><i class="done"></i>Completed ${fmtHours(sumMinutes(selected.filter(r=>r.status==='completed')))}h</span><span><i class="progress"></i>In progress ${fmtHours(sumMinutes(selected.filter(r=>r.status==='in_progress')))}h</span><span><i class="pending"></i>Pending ${fmtHours(sumMinutes(selected.filter(r=>r.status==='pending')))}h</span></div><div class="qd-task-chart">${chart}</div></section></div>`;
    content().querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));content().querySelector('#dDashTask').value=dashboardTask;content().querySelector('#dDashPeriod').value=dashboardPeriod;content().querySelector('#dDashTask').onchange=e=>{dashboardTask=e.target.value;dashboard()};content().querySelector('#dDashPeriod').onchange=e=>{dashboardPeriod=e.target.value;dashboard()};
  }
  function kaizen(){
    if(!kaizenDate)kaizenDate=isoToday();
    const members=[...new Set([memberName(),...rows('kaizen').map(r=>r.member).filter(Boolean)])].sort((a,b)=>a.localeCompare(b));
    content().innerHTML=`<div id="dKaizenRegister"><div class="section-toolbar"><div><span class="kicker">KAIZEN INPUT</span><h2>${deptKey==='rnd'?'Kaizen / Innovation Ideas':'Kaizen Ideas'}</h2><p>Capture ${esc(cfg.name)} improvement problems and ${deptKey==='rnd'?'innovation ideas':'Kaizen solutions'}.</p></div><button type="button" class="primary-btn" id="dKaizenNew">${deptKey==='rnd'?'+ NEW IDEA':'+ NEW KAIZEN'}</button></div><div class="filter-line"><input id="dKaizenSearch" placeholder="Search problem, Kaizen, department..."><select id="dKaizenPerson"><option value="">All people</option>${members.map(n=>`<option>${esc(n)}</option>`).join('')}</select><select id="dKaizenDepartment"><option value="">All departments</option><option>${esc(cfg.name)}</option></select><input id="dKaizenDate" type="date" value="${esc(kaizenDate)}" aria-label="Filter ideas by date"><button type="button" class="ghost-btn" id="dKaizenClear">Clear</button></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Idea</th>${deptKey==='rnd'?'<th>Type</th>':''}<th>Person</th><th>Department</th><th>Problem</th><th>Proposed Solution</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody id="dKaizenRows"></tbody></table></div><p id="dKaizenMessage" role="status"></p></div>`;
    content().querySelector('#dKaizenNew').onclick=()=>openKaizen();
    content().querySelector('#dKaizenSearch').value=kaizenSearch;
    content().querySelector('#dKaizenPerson').value=kaizenPerson;
    content().querySelector('#dKaizenSearch').oninput=e=>{kaizenSearch=e.target.value;renderKaizenRows()};
    content().querySelector('#dKaizenPerson').onchange=e=>{kaizenPerson=e.target.value;renderKaizenRows()};
    content().querySelector('#dKaizenDepartment').onchange=renderKaizenRows;
    content().querySelector('#dKaizenDate').onchange=e=>{kaizenDate=e.target.value;renderKaizenRows()};
    content().querySelector('#dKaizenClear').onclick=()=>{kaizenSearch='';kaizenPerson='';kaizenDate='';content().querySelector('#dKaizenSearch').value='';content().querySelector('#dKaizenPerson').value='';content().querySelector('#dKaizenDepartment').value='';content().querySelector('#dKaizenDate').value='';renderKaizenRows()};
    renderKaizenRows();
  }
  function renderKaizenRows(){
    const body=content().querySelector('#dKaizenRows');if(!body)return;
    const q=kaizenSearch.trim().toLowerCase(),deptFilter=content().querySelector('#dKaizenDepartment')?.value||'';
    const list=rows('kaizen').filter(r=>(!kaizenPerson||norm(r.member)===norm(kaizenPerson))&&(!kaizenDate||r.date===kaizenDate)&&(!deptFilter||deptFilter===cfg.name)&&(!q||[r.member,r.problem,r.idea,r.benefit,cfg.name,r.id].join(' ').toLowerCase().includes(q))).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.updated_at||'').localeCompare(String(a.updated_at||'')));
<<<<<<< HEAD
    body.innerHTML=list.length?list.map((r,index)=>`<tr><td>${fmt(r.date)}</td><td><b>${esc(cfg.name.slice(0,3).toUpperCase())}-${deptKey==='rnd'?(String(r.idea_type||'kaizen')==='innovation'?'IN':'KZ'):'KZ'}-${esc(String(r.date||'').replaceAll('-',''))}-${String(index+1).padStart(2,'0')}</b>${r.attachment?.url?`<div class="sub"><a class="link" href="${esc(r.attachment.url)}" target="_blank" rel="noopener noreferrer">Attachment ↗</a></div>`:''}</td>${deptKey==='rnd'?`<td><span class="tag ${String(r.idea_type||'kaizen')==='innovation'?'innovation':'submitted'}">${String(r.idea_type||'kaizen')==='innovation'?'Innovation Idea':'Kaizen'}</span></td>`:''}<td>${esc(r.member)}</td><td>${esc(cfg.name)}</td><td>${esc(r.problem||'')}</td><td>${esc(r.idea||'')}${r.benefit?`<div class="sub">Benefit: ${esc(r.benefit)}</div>`:''}</td><td><span class="tag ${(r.priority||'Medium').toLowerCase()}">${esc(r.priority||'Medium')}</span></td><td><span class="tag submitted">Submitted</span></td><td>${norm(r.member)===norm(memberName())?`<div class="row-actions"><button type="button" class="mini-action" data-kaizen-edit="${esc(r.id)}">Edit</button><button type="button" class="mini-action danger" data-kaizen-delete="${esc(r.id)}" aria-label="Delete Kaizen idea">×</button></div>`:'—'}</td></tr>`).join(''):`<tr class="dept-kaizen-empty"><td colspan="${deptKey==='rnd'?10:9}"><div class="dept-empty-wrap"><span class="dept-empty-icon" aria-hidden="true">✦</span><strong>No matching Kaizen ideas</strong><span>Change the search, person or date filter, or select New Kaizen to add an idea.</span></div></td></tr>`;
=======
    body.innerHTML=list.length?list.map((r,index)=>`<tr><td>${fmt(r.date)}</td><td><b>${esc(cfg.name.slice(0,3).toUpperCase())}-KZ-${esc(String(r.date||'').replaceAll('-',''))}-${String(index+1).padStart(2,'0')}</b>${r.attachment?.url?`<div class="sub"><a class="link" href="${esc(r.attachment.url)}" target="_blank" rel="noopener noreferrer">Attachment ↗</a></div>`:''}</td><td>${esc(r.member)}</td><td>${esc(cfg.name)}</td><td>${esc(r.problem||'')}</td><td>${esc(r.idea||'')}${r.benefit?`<div class="sub">Benefit: ${esc(r.benefit)}</div>`:''}</td><td><span class="tag ${(r.priority||'Medium').toLowerCase()}">${esc(r.priority||'Medium')}</span></td><td><span class="tag submitted">Submitted</span></td><td>${norm(r.member)===norm(memberName())?`<div class="row-actions"><button type="button" class="mini-action" data-kaizen-edit="${esc(r.id)}">Edit</button><button type="button" class="mini-action danger" data-kaizen-delete="${esc(r.id)}" aria-label="Delete Kaizen idea">×</button></div>`:'—'}</td></tr>`).join(''):'<tr class="dept-kaizen-empty"><td colspan="9"><div class="dept-empty-wrap"><span class="dept-empty-icon" aria-hidden="true">✦</span><strong>No matching Kaizen ideas</strong><span>Change the search, person or date filter, or select New Kaizen to add an idea.</span></div></td></tr>';
>>>>>>> origin/main
    body.querySelectorAll('[data-kaizen-edit]').forEach(b=>b.onclick=()=>openKaizen(b.dataset.kaizenEdit));
    body.querySelectorAll('[data-kaizen-delete]').forEach(b=>b.onclick=async()=>{const row=records.find(r=>r.id===b.dataset.kaizenDelete&&r.type==='kaizen');if(!row||norm(row.member)!==norm(memberName())||!await window.departmentUX.confirm('Delete this Kaizen idea? Dashboard and KPI totals will update.'))return;b.disabled=true;try{await remove(row.id);renderKaizenRows()}catch(err){const m=content().querySelector('#dKaizenMessage');if(m)m.textContent=err.message||'Unable to delete.';b.disabled=false}});
  }
  function openKaizen(id=''){
    const original=records.find(r=>r.id===id&&r.type==='kaizen');if(original&&norm(original.member)!==norm(memberName()))return;
    const base=document.getElementById('ideaDialog');if(!base)return alert('Kaizen form is unavailable. Please reload the page.');
    const dialog=base.cloneNode(true);dialog.id='departmentKaizenDialog';dialog.removeAttribute('open');dialog.querySelectorAll('[id]').forEach(el=>el.id='dk'+el.id.charAt(0).toUpperCase()+el.id.slice(1));dialog.setAttribute('aria-labelledby','dkIdeaDialogTitle');dialog.setAttribute('aria-describedby','dkIdeaDialogDescription');document.body.append(dialog);
<<<<<<< HEAD
    const el=id=>dialog.querySelector('#dk'+id),form=el('IdeaForm');form.removeAttribute('method');form.reset();dialog.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dialog.close());dialog.querySelector('.kicker').textContent=`${deptKey==='rnd'?'R&D IDEAS':'KAIZEN IDEAS'} · ${cfg.name.toUpperCase()}`;el('IdeaDialogTitle').textContent=deptKey==='rnd'?(original?'Edit R&D Idea':'Submit R&D Idea'):(original?'Edit Kaizen Idea':'Submit Kaizen Idea');el('IdeaMember').innerHTML=`<option>${esc(memberName())}</option>`;el('IdeaMember').disabled=true;el('IdeaDepartment').innerHTML=`<option>${esc(cfg.name)}</option>`;el('IdeaDepartment').disabled=true;el('IdeaDate').value=original?.date||isoToday();el('IdeaDate').readOnly=true;el('IdeaMember').closest('label').after(el('IdeaDate').closest('label'));dialog.classList.add('department-kaizen-dialog');const typeField=el('IdeaType')?.closest('label');if(typeField){typeField.hidden=deptKey!=='rnd';el('IdeaType').disabled=deptKey!=='rnd';if(deptKey==='rnd')el('IdeaType').value=original?.idea_type||'kaizen'}const attachmentField=el('IdeaAttachment')?.closest('label');if(attachmentField)attachmentField.hidden=true;el('IdeaProblem').value=original?.problem||'';el('IdeaProposal').value=original?.idea||'';el('IdeaPriority').value=original?.priority||'Medium';if(original?.benefit&&!Array.from(el('IdeaBenefit').options).some(o=>o.value===original.benefit)){const option=document.createElement('option');option.value=original.benefit;option.textContent=original.benefit;el('IdeaBenefit').append(option)}el('IdeaBenefit').value=original?.benefit||'';
=======
    const el=id=>dialog.querySelector('#dk'+id),form=el('IdeaForm');form.removeAttribute('method');form.reset();dialog.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dialog.close());dialog.querySelector('.kicker').textContent=`KAIZEN IDEAS · ${cfg.name.toUpperCase()}`;el('IdeaDialogTitle').textContent=original?'Edit Kaizen Idea':'Submit Kaizen Idea';el('IdeaMember').innerHTML=`<option>${esc(memberName())}</option>`;el('IdeaMember').disabled=true;el('IdeaDepartment').innerHTML=`<option>${esc(cfg.name)}</option>`;el('IdeaDepartment').disabled=true;el('IdeaDate').value=original?.date||isoToday();el('IdeaDate').readOnly=true;el('IdeaMember').closest('label').after(el('IdeaDate').closest('label'));dialog.classList.add('department-kaizen-dialog');el('IdeaProblem').value=original?.problem||'';el('IdeaProposal').value=original?.idea||'';el('IdeaPriority').value=original?.priority||'Medium';if(original?.benefit&&!Array.from(el('IdeaBenefit').options).some(o=>o.value===original.benefit)){const option=document.createElement('option');option.value=original.benefit;option.textContent=original.benefit;el('IdeaBenefit').append(option)}el('IdeaBenefit').value=original?.benefit||'';
>>>>>>> origin/main
    const note=document.createElement('p');note.setAttribute('role','status');note.className='qi-save-note';form.querySelector('.modal-actions').before(note);const button=form.querySelector('[type=submit]');button.textContent=original?'Save changes':'Submit Kaizen';
    form.onsubmit=async event=>{event.preventDefault();if(button.dataset.saving)return;const row={type:'kaizen',member:memberName(),date:original?.date||isoToday(),problem:el('IdeaProblem').value.trim(),idea:el('IdeaProposal').value.trim(),benefit:el('IdeaBenefit').value,priority:el('IdeaPriority').value,status:'completed',idea_type:deptKey==='rnd'?(el('IdeaType')?.value||'kaizen'):'kaizen',rnd_id:original?.rnd_id||0,updated_at:new Date().toISOString()};if(original?.attachment)row.attachment=original.attachment;let uploaded=null;try{if(!server)throw Error('Firebase is still connecting. Please retry in a moment.');if(!row.problem||!row.idea)throw Error('Enter the problem and proposed solution.');if(!['Low','Medium','High','Critical'].includes(row.priority))throw Error('Select a valid priority.');if(deptKey!=='rnd'&&!original&&rows('kaizen').some(r=>r.date===isoToday()&&norm(r.member)===norm(memberName())))throw Error('Your Kaizen idea is already submitted today. Use Edit to update it.');button.dataset.saving='1';button.disabled=true;note.textContent='Saving…';const input=null,file=null;if(file){if(file.size>10*1024*1024)throw Error('Attachment must be 10 MB or smaller.');if(!window.firebase?.storage)throw Error('Attachment storage is unavailable.');const ref=firebase.storage().ref(`rnd-track/departments/${deptKey}/kaizen/${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`);uploaded=ref;await ref.put(file,{contentType:file.type||'application/octet-stream'});row.attachment={name:file.name,type:file.type,size:file.size,path:ref.fullPath,url:await ref.getDownloadURL()}}const recordId=original?.id||crypto.randomUUID();await save(recordId,row);dialog.close();renderKaizenRows();const msg=content().querySelector('#dKaizenMessage');if(msg)msg.textContent=original?'Kaizen updated.':'Kaizen saved to Firebase.'}catch(err){if(uploaded)try{await uploaded.delete()}catch{}note.textContent=err.message||'Unable to save. Please retry.'}finally{delete button.dataset.saving;button.disabled=false}};
    dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();el('IdeaProblem').focus();
  }
  function weekly(){
<<<<<<< HEAD
    const w=currentWeek(),times=rows('timesheet').filter(r=>r.date>=w.start&&r.date<=w.end&&(adminView()||norm(r.member)===norm(memberName()))),kaizens=rows('kaizen').filter(r=>r.date>=w.start&&r.date<=w.end&&(adminView()||norm(r.member)===norm(memberName()))&&(deptKey!=='rnd'||String(r.idea_type||'kaizen').toLowerCase()==='kaizen')),weeklyKpis=cfg.kpis.map((k,i)=>({k,i})).filter(x=>/weekly/i.test(x.k[2])),month=w.start.slice(0,7),weekNo=Math.min(4,Math.ceil(Number(w.start.slice(-2))/7)),period=`week:${month}:W${weekNo}`,kpiRows=rows('kpi').filter(r=>r.period===period),completed=weeklyKpis.filter(({i})=>Number(kpiRows.find(r=>Number(r.kpi_index)===i)?.progress)>=100).length;
=======
    const w=currentWeek(),times=rows('timesheet').filter(r=>r.date>=w.start&&r.date<=w.end&&(adminView()||norm(r.member)===norm(memberName()))),kaizens=rows('kaizen').filter(r=>r.date>=w.start&&r.date<=w.end&&(adminView()||norm(r.member)===norm(memberName()))),weeklyKpis=cfg.kpis.map((k,i)=>({k,i})).filter(x=>/weekly/i.test(x.k[2])),month=w.start.slice(0,7),weekNo=Math.min(4,Math.ceil(Number(w.start.slice(-2))/7)),period=`week:${month}:W${weekNo}`,kpiRows=rows('kpi').filter(r=>r.period===period),completed=weeklyKpis.filter(({i})=>Number(kpiRows.find(r=>Number(r.kpi_index)===i)?.progress)>=100).length;
>>>>>>> origin/main
    const taskCards=(()=>{
      // Render every configured task, even before it receives entries.
      // Custom/Other entries always accumulate in a single Others card.
      const choices=taskDefs().filter(t=>t.value!=='other');
      const known=new Set(choices.map(t=>t.value));
      const legacy=[...new Set(times.map(r=>r.task_type).filter(v=>v&&v!=='other'&&!known.has(v)))];
      const tasks=[...choices,...legacy.map(value=>({value,label:times.find(r=>r.task_type===value)?.task||value,group:'Task List'})),{value:'other',label:'Others',group:'Task List'}];
      const weekTotal=sumMinutes(times);
      return tasks.map(t=>{
        const list=times.filter(r=>(r.task_type||'other')===t.value);
        const minutes=sumMinutes(list),completed=list.filter(r=>r.status==='completed').length,
          inProgress=list.filter(r=>r.status==='in_progress').length,pending=list.filter(r=>r.status==='pending').length;
        const percent=Math.min(100,Math.round(weekTotal?100*minutes/weekTotal:0));
        return `<article class="q-weekly-task-summary dept-hour-bar" style="--week-fill:${percent}%" aria-label="${esc(t.label)}: ${fmtHours(minutes)} hours"><div><span>${esc(t.group||'Task List')}</span><strong>${esc(t.label)}</strong></div><b>${fmtHours(minutes)}h</b><small>${list.length} record${list.length===1?'':'s'} · ${completed} completed · ${inProgress} in progress · ${pending} pending</small><div class="dept-hour-track" aria-hidden="true"><span style="width:${percent}%"></span></div></article>`;
      }).join('');
    })();
    const weeklyKpiCards=weeklyKpis.length?weeklyKpis.map(({k,i})=>{const r=kpiRows.find(x=>Number(x.kpi_index)===i),p=Math.max(0,Math.min(100,Number(r?.progress)||0)),status=p>=100?'✓ ACHIEVED':'○ IN PROGRESS';return `<article class="q-weekly-task-summary dept-hour-bar dept-kpi-bar ${p>=100?'completed':''}" style="--week-fill:${p}%"><div><span>${esc(k[2])}</span><strong>${esc(k[0])}</strong></div><b>${p}%</b><small>Target · ${esc(k[1])} · ${status}</small><div class="dept-hour-track" role="img" aria-label="${p} percent complete"><span style="width:var(--week-fill)"></span></div></article>`}).join(''):'<div class="empty-state">No weekly KPI is configured for this department.</div>';
    content().innerHTML=`<div class="section-toolbar"><div><span class="kicker">WEEKLY CONTROL</span><h2>Weekly Report</h2><p id="dwWeeklyRange">${fmt(w.start)} → ${fmt(w.end)} · Weekly view</p></div><label class="q-week-selector">Select date<input id="dWeeklyDate" type="date" value="${weeklyDate||isoToday()}"></label></div>
      <section class="q-weekly-overview" aria-label="Weekly report completion"><article><span>TIME SHEET</span><strong>${fmtHours(sumMinutes(times))}h</strong><small>hours logged this week</small></article><article><span>KAIZEN</span><strong>${kaizens.length}</strong><small>ideas this week</small></article><article><span>WEEKLY KPI</span><strong>${deptKey==='quality'?'View report':`${completed}/${weeklyKpis.length}`}</strong><small>${deptKey==='quality'?'Quality KPI details':'targets achieved'}</small></article></section>
      <div class="q-weekly-tabs" role="tablist" aria-label="Weekly report sections"><button type="button" role="tab" data-dw-tab="summary">Time Sheet Summary</button><button type="button" role="tab" data-dw-tab="kpi">Weekly KPI Status</button>${deptKey==='quality'?'<button type="button" role="tab" data-dw-tab="quality">Inspection & Training</button>':''}</div>
      <div class="q-weekly-workspace">
<<<<<<< HEAD
        <section class="panel q-weekly-report-panel" data-dw-panel="summary" role="tabpanel"><div class="q-weekly-panel-head"><div><span class="kicker">TIME SHEET SUMMARY</span><h3>Weekly Task Summary</h3><p>Every ${esc(cfg.name)} Time Sheet task recorded during the selected week is summarized here for the selected week. Bars show each task’s share of total logged hours.</p></div><div class="q-weekly-head-actions"><b>${times.length} records</b></div></div><div class="q-weekly-timesheet-summary">${taskCards}</div></section>
=======
        <section class="panel q-weekly-report-panel" data-dw-panel="summary" role="tabpanel"><div class="q-weekly-panel-head"><div><span class="kicker">TIME SHEET SUMMARY</span><h3>Weekly Task Summary</h3><p>Every ${esc(cfg.name)} Time Sheet task recorded during the selected week is summarized here automatically. Bars show each task’s share of total logged hours.</p></div><div class="q-weekly-head-actions"><b>${times.length} records</b></div></div><div class="q-weekly-timesheet-summary">${taskCards}</div></section>
>>>>>>> origin/main
        <section class="panel q-weekly-report-panel" data-dw-panel="kpi" role="tabpanel"><div class="q-weekly-panel-head"><div><span class="kicker">WEEKLY KPI STATUS</span><h3>${esc(cfg.name)} weekly KPI progress</h3><p>Weekly KPI progress uses the same saved KPI Report values for this selected week.</p></div><div class="q-weekly-head-actions"><b>${completed}/${weeklyKpis.length} achieved</b><button class="secondary-btn" id="dOpenKpi">Open KPI Report</button></div></div><div class="q-weekly-timesheet-summary">${weeklyKpiCards}</div></section>
        ${deptKey==='quality'?'<section class="panel q-weekly-report-panel quality-legacy-detail" data-dw-panel="quality" role="tabpanel"><div id="dQualityWeeklyDetails"></div></section>':''}
      </div>`;
    if(deptKey==='quality'){const q=content().querySelector('#dQualityWeeklyDetails');if(q){window.qualityReview.render('weekly',q,qualityContext());const dateInput=q.querySelector('#qwDate');if(dateInput&&weeklyDate){dateInput.value=weeklyDate;dateInput.dispatchEvent(new Event('change',{bubbles:true}));}q.dataset.qualityReady='1';}}
    const applyView=()=>{if(deptKey==='quality'&&weeklyTab==='kpi'){const q=content().querySelector('[data-dw-panel="kpi"]');if(q&&!q.dataset.qualityReady){window.qualityReview.render('report',q,qualityContext());q.dataset.qualityReady='1'}}else if(deptKey==='quality'&&weeklyTab==='quality'){const q=content().querySelector('#dQualityWeeklyDetails');if(q){window.qualityReview.render('weekly',q,qualityContext());const dateInput=q.querySelector('#qwDate');if(dateInput&&weeklyDate){dateInput.value=weeklyDate;dateInput.dispatchEvent(new Event('change',{bubbles:true}));}}}content().querySelectorAll('[data-dw-tab]').forEach(button=>{const active=button.dataset.dwTab===weeklyTab;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});content().querySelectorAll('[data-dw-panel]').forEach(panel=>panel.hidden=panel.dataset.dwPanel!==weeklyTab)};
    content().querySelectorAll('[data-dw-tab]').forEach(button=>button.onclick=()=>{weeklyTab=button.dataset.dwTab;applyView()});content().querySelector('#dWeeklyDate').onchange=e=>{weeklyDate=e.target.value;weekly()};content().querySelector('#dOpenKpi').onclick=()=>go('kpi');applyView();
  }
  function kpi(){
    if(deptKey==='quality'){window.qualityReview.render('report',content(),qualityContext());return}
    const range=reportRange(),data=rows('kpi').filter(r=>r.period===range.key),allPeople=adminView();
    const timeRows=rows('timesheet').filter(r=>r.date>=range.start&&r.date<=range.end&&(allPeople||norm(r.member)===norm(memberName())));
<<<<<<< HEAD
    const teamKaizen=kaizenKpiStats(range),kaizenRows=rows('kaizen').filter(r=>r.date>=range.start&&r.date<=range.end&&(deptKey!=='rnd'||String(r.idea_type||'kaizen').toLowerCase()==='kaizen')),workRows=records.filter(r=>!['timesheet','kaizen','kpi'].includes(r.type)&&r.date>=range.start&&r.date<=range.end&&(allPeople||norm(r.member)===norm(memberName())));
    const source=window.kpiAutoData?.summarize({start:range.start,end:range.end,timeRows,workRows,kaizenRows})||{timeEntries:timeRows.length,timeMinutes:timeRows.reduce((n,r)=>n+(Number(r.minutes)||0),0),timeCompleted:0,timeInProgress:0,timePending:0,workRecords:workRows.length,workCompleted:0,workInProgress:0,workPending:0,kaizenIdeas:teamKaizen.actual,timeHours:0};source.kaizenIdeas=teamKaizen.actual;
    const relevant=cfg.kpis.map((k,i)=>({k,i}));
    const kpiActual=(metric,index)=>{const saved=data.find(r=>Number(r.kpi_index)===index);if(saved&&String(saved.actual??'').trim()!==''&&!isKaizenMetric(metric[0]))return String(saved.actual);if(isKaizenMetric(metric[0]))return String(teamKaizen.actual);return window.kpiAutoData?.suggestion(metric[0],{timeRows,workRows,kaizenIdeas:teamKaizen.actual})??''};
    const stateOf=({k,i})=>{
      const automatic=isKaizenMetric(k[0]),attendance=isAttendanceMetric(k[0]),r=data.find(x=>Number(x.kpi_index)===i),kaizenTarget=automatic?(reportPeriod==='weekly'?weeklyKaizenTarget(k):weeklyKaizenTarget(k)*Math.max(1,Math.ceil(rangeDayCount(range)/7))):0;
      const storedActual=r&&String(r.actual??'').trim()!==''?String(r.actual):'';
      const actual=automatic?String(teamKaizen.actual):attendance?(storedActual||String(recordedAttendanceDays(range))):kpiActual(k,i);
      const target=automatic?`${kaizenTarget} Kaizen`:periodTargetText(k,range);
      const p=automatic?(kaizenTarget?Math.min(100,Math.round(teamKaizen.actual/kaizenTarget*100)):0):attendance?(attendanceTarget(range)>0?Math.min(100,Math.round((Math.max(0,Number(actual)||0)/attendanceTarget(range))*100)):0):Math.max(0,Math.min(100,Number(r?.progress)||0));
      const recorded=Number.isFinite(Number(r?.progress))&&r?.progress!==undefined&&r?.progress!==null?Math.max(0,Math.min(100,Number(r.progress))):p;const reportStatus=r?.status==='completed'?'completed':r?.status==='not_completed'?'not_completed':recorded>=100?'completed':'not_completed';return{k,i,automatic,attendance,r,p:recorded,actual,pass:reportStatus==='completed',reportStatus,target,kaizenTarget};
    };
    const states=relevant.map(stateOf),achieved=states.filter(x=>x.pass).length,pending=Math.max(0,states.length-achieved),timeHours=(Number(source.timeMinutes||0)/60).toFixed(1),kaizenState=states.find(x=>x.automatic),periodKaizenTarget=kaizenState?.kaizenTarget||0;
    const leadPerson=memberDirectory.find(item=>String(item.role||'').toLowerCase()==='lead'&&item.active!==false)?.name||(deptKey==='rnd'?'Kabil':'');
    const reportModel={department:cfg.name,period:reportPeriod==='weekly'?'Weekly':'Monthly',week:reportPeriod==='weekly'?reportWeek:0,start:range.start,end:range.end,lead:leadPerson,manager:deptKey==='rnd'?'Akash':'',rows:states.map(x=>({name:x.k[0],target:x.target,actual:x.actual,percent:x.p,status:x.reportStatus,remarks:x.r?.remarks||''}))};
    const weeklyPreview=window.dfabWeeklyKpiReport?.preview(reportModel,{editable:true})||'<div class="empty-state">KPI report unavailable. Refresh the application.</div>';
    content().innerHTML=`<div class="section-toolbar kref-only-title"><div><span class="kicker">PERFORMANCE CONTROL</span><h2>KPI Report</h2></div><div class="kref-report-buttons"><button class="ghost-btn" id="dKpiA4Print" type="button">Print A4</button><button class="secondary-btn" id="dKpiA4Download" type="button">Download A4 PDF</button></div></div>
      <section class="panel kpi-filter-panel q-review-filter kpi-premium-filter kref-only-filter"><label><span>PERIOD</span><select id="dKpiPeriod"><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label><label><span>MONTH</span><input id="dKpiMonth" type="month" value="${reportMonth||currentMonth()}"></label><div id="dKpiWeekWrap" class="dept-kpi-week-range"><label><span>WEEK</span><select id="dKpiWeek">${[1,2,3,4].map(n=>`<option value="${n}">Week ${n}</option>`).join('')}</select></label><label><span>FROM</span><input type="text" value="${fmt(range.start)}" readonly></label><label><span>TO</span><input type="text" value="${fmt(range.end)}" readonly></label></div></section>
      <div id="dKpiEditableReport">${weeklyPreview}</div>`;
    const period=content().querySelector('#dKpiPeriod'),month=content().querySelector('#dKpiMonth'),week=content().querySelector('#dKpiWeek');
    period.value=reportPeriod;week.value=String(reportWeek);
    content().querySelector('#dKpiWeekWrap').classList.toggle('dept-kpi-monthly',reportPeriod!=='weekly');
    period.onchange=()=>{reportPeriod=period.value;kpi()};month.onchange=()=>{reportMonth=month.value;kpi()};week.onchange=()=>{reportWeek=Number(week.value);kpi()};
    content().querySelector('#dKpiA4Download').onclick=()=>window.dfabWeeklyKpiReport.download(reportModel);
    content().querySelector('#dKpiA4Print').onclick=()=>{try{window.dfabWeeklyKpiReport.printA4(reportModel)}catch(error){window.departmentUX?.notice?window.departmentUX.notice(error.message,'error'):alert(error.message)}};
    window.dfabWeeklyKpiReport?.bindEditable(content().querySelector('#dKpiEditableReport'),async(i,edited)=>{
      if(busy)throw Error('A KPI save is already in progress.');
      if(!server)throw Error('Firebase is not connected yet.');
      const previous=states[i]?.r,record={...previous,type:'kpi',member:previous?.member||memberName(),date:isoToday(),period:range.key,kpi_index:i,actual:previous?.actual??states[i]?.actual??'',progress:edited.percent,status:edited.status,remarks:previous?.remarks||'',updated_at:new Date().toISOString()};
      busy=true;
      try{await save(`kpi_${range.key.replace(/[^a-z0-9]+/gi,'_')}_${i}`,record);kpi();}
      finally{busy=false;}
    });
  }

  async function saveKpi(e){e.preventDefault();if(busy)return;const f=e.currentTarget,i=Number(f.dataset.kpi),d=new FormData(f),range=reportRange(),progress=isAttendanceMetric(cfg.kpis[i]?.[0])&&String(d.get('actual')||'').trim()!==''&&attendanceTarget(range)>0?Math.max(0,Math.min(100,Math.round(Number(d.get('actual'))/attendanceTarget(range)*100))):Math.max(0,Math.min(100,Number(d.get('progress'))||0)),row={type:'kpi',member:memberName(),date:isoToday(),period:range.key,kpi_index:i,actual:String(d.get('actual')||'').trim(),progress,status:progress>=100?'completed':progress>0?'in_progress':'pending',remarks:String(d.get('remarks')||'').trim(),updated_at:new Date().toISOString()};busy=true;try{const submit=f.querySelector('[type=submit]');if(submit)submit.disabled=true;f.querySelector('[role=status]').textContent='Saving…';await save(`kpi_${range.key.replace(/[^a-z0-9]+/gi,'_')}_${i}`,row);kpi();window.departmentUX.notice('KPI saved.')}catch(err){f.querySelector('[role=status]').textContent=window.departmentUX.error(err);window.departmentUX.notice(window.departmentUX.error(err),'error')}finally{busy=false;const submit=f.querySelector('[type=submit]');if(submit)submit.disabled=false}}
  async function downloadKpi(){try{if(!window.rndKpiPdf)throw Error('PDF renderer unavailable.');const range=reportRange(),data=rows('kpi').filter(r=>r.period===range.key),cards=cfg.kpis.map((k,i)=>{const r=data.find(x=>Number(x.kpi_index)===i),p=Math.max(0,Math.min(100,Number(r?.progress)||0));return{section:`${cfg.name} KPI`,title:k[0],owner:memberName(),value:p,target:100,unit:'%',passed:p>=100,detail:`Target: ${reportPeriod==='weekly'?weeklyTargetText(k):k[1]} · Source frequency: ${k[2]}`,review:p>=100?'Achieved':'Progress update',remarks:r?.remarks||'',contributionLabel:'',contributors:[]}}),model={department:cfg.name.toUpperCase(),reportTitle:'KPI Performance Report',member:memberName(),period:reportPeriod==='weekly'?`Week ${reportWeek}`:'Monthly',month:reportMonth||currentMonth(),week:reportPeriod==='weekly'?`Week ${reportWeek}`:'',range:`${fmt(range.start)} – ${fmt(range.end)}`,generated:new Date().toLocaleString('en-IN'),by:memberName(),cards},pages=window.rndKpiPdf.render(model),bytes=window.rndKpiPdf.build(pages),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download=`DFAB-${cfg.name.replace(/[^A-Za-z0-9]+/g,'-')}-KPI-${reportMonth||currentMonth()}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}catch(e){alert(e.message)}}
=======
    const kaizenRows=rows('kaizen').filter(r=>r.date>=range.start&&r.date<=range.end&&(allPeople||norm(r.member)===norm(memberName())));
    const workRows=records.filter(r=>!['timesheet','kaizen','kpi'].includes(r.type)&&r.date>=range.start&&r.date<=range.end&&(allPeople||norm(r.member)===norm(memberName())));
    const source=window.kpiAutoData?.summarize({start:range.start,end:range.end,timeRows,workRows,kaizenRows})||{timeEntries:timeRows.length,timeMinutes:timeRows.reduce((n,r)=>n+(Number(r.minutes)||0),0),timeCompleted:0,timeInProgress:0,timePending:0,workRecords:workRows.length,workCompleted:0,workInProgress:0,workPending:0,kaizenIdeas:kaizenRows.length,timeHours:0};
    const isKaizenMetric=title=>/kaizen|continuous improvement|improvement ideas/i.test(String(title||''));
    const kpiActual=(metric,index)=>{const saved=data.find(r=>Number(r.kpi_index)===index);if(saved&&String(saved.actual??'').trim()!=='')return String(saved.actual);if(isKaizenMetric(metric[0]))return String(source.kaizenIdeas);return window.kpiAutoData?.suggestion(metric[0],{timeRows,workRows,kaizenIdeas:source.kaizenIdeas})??''};
    const achieved=cfg.kpis.filter((_,i)=>Number(data.find(r=>Number(r.kpi_index)===i)?.progress)>=100).length;
    content().innerHTML=`<div class="section-toolbar"><div><span class="kicker">PERFORMANCE CONTROL</span><h2>KPI Report</h2><p>Weekly and monthly ${esc(cfg.name)} performance using KPI Master targets.</p></div></div><section class="panel kpi-filter-panel q-review-filter"><label><span>MEMBER</span><select disabled><option>${esc(memberName())}</option></select></label><label><span>PERIOD</span><select id="dKpiPeriod"><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label><label><span>MONTH</span><input id="dKpiMonth" type="month" value="${reportMonth||currentMonth()}"></label><div id="dKpiWeekWrap" class="dept-kpi-week-range"><label><span>WEEK</span><select id="dKpiWeek">${[1,2,3,4].map(n=>`<option value="${n}">Week ${n}</option>`).join('')}</select></label><label><span>FROM</span><input type="text" value="${fmt(range.start)}" readonly aria-label="Reporting start date"></label><label><span>TO</span><input type="text" value="${fmt(range.end)}" readonly aria-label="Reporting end date"></label></div></section><section class="panel kpi-auto-evidence"><div><span class="kicker">REPORT SOURCE DATA</span><h3>Saved work for this period</h3><p>Recorded activity for the selected reporting period.</p></div><div class="kpi-auto-evidence-grid"><article><span>TIME SHEET</span><strong>${source.timeEntries}</strong><small>${(source.timeMinutes/60).toFixed(1)} hours · ${source.timeCompleted} completed · ${source.timeInProgress} in progress · ${source.timePending} pending</small></article><article><span>OTHER WORK RECORDS</span><strong>${source.workRecords}</strong><small>${source.workCompleted} completed · ${source.workInProgress} in progress · ${source.workPending} pending</small></article><article><span>KAIZEN IDEAS</span><strong>${source.kaizenIdeas}</strong><small>Ideas recorded in the selected period</small></article></div></section><div class="kpi107-report-actions"><span>Report actions</span><button class="secondary-btn" id="dDownloadKpi">Download PDF</button></div><div id="dKpiReportContent"><div class="kpi101-heading"><div><span class="kicker">${reportPeriod==='weekly'?'WEEK '+reportWeek:'MONTHLY'} PERFORMANCE REVIEW</span><h3>${esc(cfg.name)} KPI Report</h3><p>${esc(reportMonth||currentMonth())} · ${achieved} achieved · ${cfg.kpis.length-achieved} below target</p></div><div class="kpi101-legend"><span>● Achieved</span><span>● Below target</span></div></div><div class="kpi102-guide"><b>Live KPI review · update actuals, completion and remarks for this reporting period</b><span>This page mirrors the Quality KPI report structure. All updates save to the same department KPI records used by Dashboard, Weekly Report and Admin KPI Control.</span></div><h3 class="kpi101-section">Department KPI performance</h3><div class="kpi101-grid">${cfg.kpis.map((k,i)=>{const r=data.find(x=>Number(x.kpi_index)===i),p=Math.max(0,Math.min(100,Number(r?.progress)||0)),pass=p>=100,actual=kpiActual(k,i);return `<article class="kpi101-card ${pass?'passed':'missed'}"><div class="kpi101-card-top"><span>${esc(memberName())}</span><b>${pass?'✓ ACHIEVED':'○ IN PROGRESS'}</b></div><h4>${esc(k[0])}</h4><div class="kpi101-score">${p}<small>/ 100 %</small></div><div class="kpi101-bar"><i style="width:${p}%"></i></div><p>Target · ${esc(k[1])}</p><div class="kpi102-accountability">Frequency · ${esc(k[2])}</div><form data-kpi="${i}"><label>Actual / result<input name="actual" value="${esc(actual)}" maxlength="180" placeholder="Enter actual result"></label><label>Completion %<input name="progress" type="number" min="0" max="100" step="1" value="${p}" required></label><label>Remarks<textarea name="remarks" rows="2" maxlength="1000">${esc(r?.remarks||'')}</textarea></label><button class="mini-action">Save progress</button><small role="status">${r?.updated_at?'Saved '+new Date(r.updated_at).toLocaleDateString('en-IN'):''}</small></form></article>`}).join('')}</div></div>`;
    const period=content().querySelector('#dKpiPeriod'),month=content().querySelector('#dKpiMonth'),week=content().querySelector('#dKpiWeek');period.value=reportPeriod;week.value=String(reportWeek);content().querySelector('#dKpiWeekWrap').classList.toggle('dept-kpi-monthly',reportPeriod!=='weekly');period.onchange=()=>{reportPeriod=period.value;kpi()};month.onchange=()=>{reportMonth=month.value;kpi()};week.onchange=()=>{reportWeek=Number(week.value);kpi()};content().querySelector('#dDownloadKpi').onclick=downloadKpi;content().querySelectorAll('[data-kpi]').forEach(f=>f.onsubmit=saveKpi)
  }
  async function saveKpi(e){e.preventDefault();if(busy)return;const f=e.currentTarget,i=Number(f.dataset.kpi),d=new FormData(f),range=reportRange(),progress=Math.max(0,Math.min(100,Number(d.get('progress'))||0)),row={type:'kpi',member:memberName(),date:isoToday(),period:range.key,kpi_index:i,actual:String(d.get('actual')||'').trim(),progress,status:progress>=100?'completed':progress>0?'in_progress':'pending',remarks:String(d.get('remarks')||'').trim(),updated_at:new Date().toISOString()};busy=true;try{const submit=f.querySelector('[type=submit]');if(submit)submit.disabled=true;f.querySelector('[role=status]').textContent='Saving…';await save(`kpi_${range.key.replace(/[^a-z0-9]+/gi,'_')}_${i}`,row);kpi();window.departmentUX.notice('KPI saved.')}catch(err){f.querySelector('[role=status]').textContent=window.departmentUX.error(err);window.departmentUX.notice(window.departmentUX.error(err),'error')}finally{busy=false;const submit=f.querySelector('[type=submit]');if(submit)submit.disabled=false}}
  async function downloadKpi(){try{if(!window.rndKpiPdf)throw Error('PDF renderer unavailable.');const range=reportRange(),data=rows('kpi').filter(r=>r.period===range.key),cards=cfg.kpis.map((k,i)=>{const r=data.find(x=>Number(x.kpi_index)===i),p=Math.max(0,Math.min(100,Number(r?.progress)||0));return{section:`${cfg.name} KPI`,title:k[0],owner:memberName(),value:p,target:100,unit:'%',passed:p>=100,detail:`Target: ${k[1]} · Frequency: ${k[2]}`,review:p>=100?'Achieved':'Progress update',remarks:r?.remarks||'',contributionLabel:'',contributors:[]}}),model={department:cfg.name.toUpperCase(),reportTitle:'KPI Performance Report',member:memberName(),period:reportPeriod==='weekly'?`Week ${reportWeek}`:'Monthly',month:reportMonth||currentMonth(),week:reportPeriod==='weekly'?`Week ${reportWeek}`:'',range:`${fmt(range.start)} – ${fmt(range.end)}`,generated:new Date().toLocaleString('en-IN'),by:memberName(),cards},pages=window.rndKpiPdf.render(model),bytes=window.rndKpiPdf.build(pages),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download=`DFAB-${cfg.name.replace(/[^A-Za-z0-9]+/g,'-')}-KPI-${reportMonth||currentMonth()}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}catch(e){alert(e.message)}}
>>>>>>> origin/main
  function taskOptions(){const groups=[...new Set(taskDefs().map(t=>t.group))];return groups.map(g=>`<optgroup label="${g}">${taskDefs().filter(t=>t.group===g).map(t=>`<option value="${t.value}">${esc(t.label)}</option>`).join('')}</optgroup>`).join('')+`<optgroup label="Other"><option value="other">Others</option></optgroup>`}
  function timesheet(){const list=rows('timesheet').filter(r=>adminView()||norm(r.member)===norm(memberName())).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.from).localeCompare(String(a.from)));content().innerHTML=`<div class="section-toolbar"><div><span class="kicker">${esc(cfg.name.toUpperCase())} WORK LOG</span><h2>Time Sheet</h2><p>Enter one work record in a single row. WO identifies the product/job for this entry.</p></div></div><section class="panel tc-panel"><form id="dTimeForm" class="qt-inline-form"><label>Date<input name="date" type="date" value="${isoToday()}" min="${timePolicy().bounds().start}" max="${timePolicy().bounds().max}" required></label><label>WO<input name="po_number" type="text" maxlength="80" autocomplete="off" placeholder="WO / NA / N/A" required></label><label class="qt-task-field">Task<div class="qt-task-controls"><select name="task" required><option value="">Select task</option>${taskOptions()}</select><input name="other" type="text" maxlength="180" autocomplete="off" placeholder="Enter other task" hidden></div></label><label>From<div class="tc-clock-field"><input name="from" type="text" value="09:00" readonly required aria-label="From time"><button type="button" data-d-clock="from" aria-label="Choose From time"><svg class="dept-clock-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path class="dept-clock-hand" d="M12 6v6l4 2"/></svg></button></div></label><label>To<div class="tc-clock-field"><input name="to" type="text" value="" readonly required aria-label="To time"><button type="button" data-d-clock="to" aria-label="Choose To time"><svg class="dept-clock-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path class="dept-clock-hand" d="M12 6v6l4 2"/></svg></button></div></label><label>Status<select name="status"><option value="completed">Completed</option><option value="in_progress">In progress</option><option value="pending">Pending</option></select></label><label class="qt-remarks-field">Remarks<input name="remarks" maxlength="1000" placeholder="Remarks"></label><div class="dept-time-actions"><button class="primary-btn" type="submit" data-time-submit>Save</button><button type="button" class="ghost-btn" data-time-cancel hidden>Cancel edit</button></div><p class="dept-week-guide">${esc(timePolicy().message())}</p><p class="qt-inline-status" role="status" aria-live="polite"></p></form></section><section class="panel tc-panel"><div class="panel-head"><div><h3>Saved records</h3><span>Saved work records</span></div></div><div class="qt-filters"><label>Date<input id="dFilterDate" type="date" value="" aria-label="Filter saved records by date"></label><label>WO<input id="dFilterPo" type="text" maxlength="80" placeholder="Search WO"></label><label>Task<select id="dFilterTask"><option value="">All tasks</option>${taskOptions()}</select></label><label>Status<select id="dFilterStatus"><option value="">All status</option><option value="completed">Completed</option><option value="in_progress">In progress</option><option value="pending">Pending</option></select></label><button class="ghost-btn" id="dClearFilters">Clear</button></div><div id="dTimeRows"></div></section>`;const f=content().querySelector('#dTimeForm'),syncOther=()=>{const yes=f.elements.task.value==='other';f.elements.other.hidden=!yes;f.elements.other.disabled=!yes;f.elements.other.required=yes;if(!yes)f.elements.other.value='';else requestAnimationFrame(()=>f.elements.other.focus())};f.elements.task.onchange=syncOther;syncOther();f.querySelectorAll('[data-d-clock]').forEach(b=>{const input=f.elements[b.dataset.dClock],open=()=>{if(typeof window.rndTimeClock==='function')window.rndTimeClock(input);else f.querySelector('[role=status]').textContent='Time picker is loading. Please retry.';};b.onclick=open;if(input){input.onclick=open;input.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}}}});f.onsubmit=saveTime;const refreshDates=()=>{const range=timePolicy().bounds();f.elements.date.min=range.start;f.elements.date.max=range.max};f.elements.date.addEventListener('focus',refreshDates);f.elements.date.addEventListener('pointerdown',refreshDates);f.elements.date.addEventListener('change',()=>{const filterDate=content()?.querySelector('#dFilterDate');if(filterDate&&!content().querySelector('#dFilterPo').value&&!content().querySelector('#dFilterTask').value&&!content().querySelector('#dFilterStatus').value){renderTimeRows()}});f.querySelector('[data-time-cancel]').onclick=()=>{timeEditingId='';f.closest('.tc-panel')?.classList.remove('dept-time-edit-active');f.reset();f.elements.date.value=isoToday();f.elements.from.value='09:00';f.elements.to.value='';syncOther();f.querySelector('[data-time-submit]').textContent='Save';f.querySelector('[data-time-cancel]').hidden=true;f.querySelector('[role=status]').textContent='Edit cancelled.'};content().querySelector('#dFilterDate').onchange=()=>{content().querySelector('#dFilterDate').dataset.explicit='1';renderTimeRows()};['dFilterTask','dFilterStatus'].forEach(id=>content().querySelector('#'+id).onchange=()=>{const filter=content().querySelector('#dFilterDate');if(filter.dataset.explicit!=='1')filter.value='';renderTimeRows()});content().querySelector('#dFilterPo').oninput=()=>{const filter=content().querySelector('#dFilterDate');if(filter.dataset.explicit!=='1')filter.value='';renderTimeRows()};content().querySelector('#dClearFilters').onclick=()=>{['dFilterDate','dFilterPo','dFilterTask','dFilterStatus'].forEach(id=>content().querySelector('#'+id).value='');content().querySelector('#dFilterDate').dataset.explicit='0';renderTimeRows()};renderTimeRows()}
  let timeRecordsPage=0,timeRecordsFilterKey='';
  function renderTimeRows(){const host=content().querySelector('#dTimeRows');if(!host)return;const date=content().querySelector('#dFilterDate').value,po=norm(content().querySelector('#dFilterPo').value),task=content().querySelector('#dFilterTask').value,status=content().querySelector('#dFilterStatus').value,list=rows('timesheet').filter(r=>(adminView()||norm(r.member)===norm(memberName()))&&(!date||r.date===date)&&(!po||norm(r.po_number).includes(po))&&(!task||r.task_type===task)&&(!status||r.status===status)).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.from).localeCompare(String(a.from)));const shown=list;host.dataset.recordCount=String(list.length);host.innerHTML=shown.length?shown.map(r=>`<article class="tc-entry qt-entry-row${Number(r.revision)>0?' dept-record-updated':''}"><header><strong>${esc(taskLabel(r))}</strong><span class="tc-entry-details"><span>${fmt(r.date)}</span><span>WO ${esc(r.po_number||'—')}</span><span class="tc-entry-time-range"><b>From</b> ${esc(clockLabel(r.from))} <b>To</b> ${esc(clockLabel(r.to))}</span><b>${duration(r.minutes)}</b></span></header><div class="qt-entry-meta"><span class="q-status ${r.status==='completed'?'done':'open'}">${statusLabel(r.status)}</span>${r.remarks?`<small>${esc(r.remarks)}</small>`:'<small>No remarks</small>'}${(adminView()||norm(r.member)===norm(memberName()))&&timePolicy().permitted(r.date)&&(r.status==='pending'||r.status==='in_progress')?`<button type="button" class="mini-action dept-resume dept-continue" data-time-edit="${esc(r.id)}" aria-label="Continue ${esc(taskLabel(r))}">Continue</button>`:''}${Number(r.revision)>0&&r.updated_at?`<span class="dept-update-chip">Updated</span><small class="dept-updated-at">Last updated ${esc(new Date(r.updated_at).toLocaleString('en-IN'))}</small>`:''}${adminView()||norm(r.member)===norm(memberName())?`<button type="button" class="icon-btn dept-time-delete" data-time-delete="${esc(r.id)}" aria-label="Delete saved Time Sheet record" title="Delete record">×</button>`:''}</div></article>`).join(''):'<div class="empty-state">No saved Time Sheet records match these filters.</div>';host.querySelectorAll('[data-time-edit]').forEach(b=>b.onclick=()=>continueTime(b.dataset.timeEdit));
    host.querySelectorAll('[data-time-delete]').forEach(b=>b.onclick=async()=>{
      const entry=rows('timesheet').find(r=>String(r.id)===String(b.dataset.timeDelete));
      if(!entry||(!adminView()&&norm(entry.member)!==norm(memberName())))return;
      if(!await window.departmentUX.confirm('Delete this saved Time Sheet record? This cannot be undone.'))return;
      b.disabled=true;
      try{await removeTimeRecord(entry.id);if(String(timeEditingId)===String(entry.id)){timeEditingId='';timesheet();}else renderTimeRows();window.departmentUX.notice('Time Sheet record deleted.');}
      catch(err){window.departmentUX.notice(window.departmentUX.error(err),'error');b.disabled=false;}
    });
  }
  function continueTime(id){
    const entry=rows('timesheet').find(r=>String(r.id)===String(id));
    const f=content().querySelector('#dTimeForm');
    if(!f||!entry||(!adminView()&&norm(entry.member)!==norm(memberName())))return;
    if(!timePolicy().permitted(entry.date)){f.querySelector('[role=status]').textContent='The previous week is closed. This record is read-only.';return;}
    timeEditingId=entry.id;f.closest('.tc-panel')?.classList.add('dept-time-edit-active');f.elements.date.value=entry.date;f.elements.po_number.value=entry.po_number||'';
    const known=taskDefs().some(t=>t.value===entry.task_type);f.elements.task.value=known?entry.task_type:'other';
    const other=f.elements.other;other.hidden=known;other.disabled=known;other.required=!known;other.value=known?'':(entry.custom_task||entry.task||'');
    f.elements.from.value=entry.from||'09:00';f.elements.to.value=entry.to||'';f.elements.status.value=entry.status||'pending';f.elements.remarks.value=entry.remarks||'';
    f.querySelector('[data-time-submit]').textContent='Update';f.querySelector('[data-time-cancel]').hidden=false;
    f.querySelector('[role=status]').textContent='Continuing saved task · Changes update the same record.';
    f.scrollIntoView({block:'nearest',behavior:'smooth'});f.elements.po_number.focus({preventScroll:true});
  }
  async function saveTime(e){e.preventDefault();if(busy)return;const f=e.currentTarget,d=new FormData(f),from=String(d.get('from')),to=String(d.get('to')),minutes=mins(to)-mins(from),type=String(d.get('task')),custom=String(d.get('other')||'').trim(),task=type==='other'?custom:(taskDefs().find(t=>t.value===type)?.label||'');if(!task)return f.querySelector('[role=status]').textContent='Choose or enter a task.';if(!Number.isFinite(minutes)||minutes<=0)return f.querySelector('[role=status]').textContent='To time must be later than From time.';const date=String(d.get('date'));if(!timePolicy().permitted(date))return f.querySelector('[role=status]').textContent=timePolicy().message();const original=timeEditingId?rows('timesheet').find(r=>String(r.id)===String(timeEditingId)):null;if(timeEditingId&&!original)return f.querySelector('[role=status]').textContent='The original record is unavailable. Refresh and retry.';if(original&&((!adminView()&&norm(original.member)!==norm(memberName()))||!timePolicy().permitted(original.date)))return f.querySelector('[role=status]').textContent='This entry cannot be changed after its week closes.';const recordOwner=original?.member||memberName();const existing=rows('timesheet').filter(r=>norm(r.member)===norm(recordOwner)&&r.date===date&&String(r.id)!==String(timeEditingId));if(existing.some(r=>r.from<to&&from<r.to))return f.querySelector('[role=status]').textContent='This time overlaps a saved record.';const po=String(d.get('po_number')||'').trim();if(!po)return f.querySelector('[role=status]').textContent='Enter a WO, or use NA / N/A when not applicable.';const now=new Date().toISOString(),row={...original,type:'timesheet',member:recordOwner,date,po_number:po,task_type:type,task,custom_task:type==='other'?custom:'',from,to,minutes,status:String(d.get('status')),remarks:String(d.get('remarks')||'').trim(),created_at:original?.created_at||original?.updated_at||now,updated_at:now,revision:original?(Number(original.revision)||0)+1:0};busy=true;try{const button=f.querySelector('[data-time-submit]');button.disabled=true;f.querySelector('[role=status]').textContent=original?'Updating in Firebase…':'Saving to Firebase…';if(!timePolicy().permitted(date))throw Error('The current week has closed.');await save(timeEditingId||crypto.randomUUID(),row);timeEditingId='';f.closest('.tc-panel')?.classList.remove('dept-time-edit-active');button.textContent='Save';f.querySelector('[data-time-cancel]').hidden=true;f.elements.from.value=to;f.elements.to.value='';f.elements.remarks.value='';if(type==='other')f.elements.other.value='';const latest=content()?.querySelector('#dTimeForm')||f;latest.querySelector('[role=status]').textContent=(original?'Updated · ':'Saved · ')+new Date(now).toLocaleString('en-IN');window.departmentUX.notice(original?'Time Sheet updated.':'Time Sheet saved.')}catch(err){const latest=content()?.querySelector('#dTimeForm')||f;latest.querySelector('[role=status]').textContent=window.departmentUX.error(err)}finally{busy=false;f.querySelector('[data-time-submit]').disabled=false}}
  function assigned(){content().innerHTML=`<div class="section-toolbar"><div><span class="kicker">WORK ASSIGNMENTS</span><h2>Assigned Tasks</h2><p>View your assigned work, completion status and Lead rating in one place.</p></div></div><div id="dAssignedTasksPage"></div>`;window.assignedTasks?.renderEmployeePage?.(content().querySelector('#dAssignedTasksPage'))}
<<<<<<< HEAD
  function settings(){
    const isAdmin=adminView();
    const name=memberName();
    const role=memberRoleLabel();
    const isConnected=Boolean(server);
    const canBackup=!isAdmin&&memberRole()==='lead';
    const initials=String(name||cfg.name||'D').trim().slice(0,1).toUpperCase();
    content().innerHTML=`<div class="section-toolbar dw-settings-heading"><div><span class="kicker">DEPARTMENT SETTINGS</span><h2>Settings</h2><p>Account, workspace connection and department records</p></div></div>
      <div class="dw-settings" aria-label="Department settings">
        <section class="panel dw-settings-card dw-settings-profile" aria-labelledby="dwSettingsProfileTitle">
          <div class="dw-settings-card-head"><span class="dw-settings-symbol" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20v-2a6.5 6.5 0 0 1 13 0v2"/></svg></span><div><span class="kicker">ACCOUNT & ACCESS</span><h3 id="dwSettingsProfileTitle">Your profile</h3></div></div>
          <div class="dw-settings-identity"><div class="dw-settings-avatar" aria-hidden="true">${esc(initials)}</div><div class="dw-settings-person"><strong>${esc(name)}</strong><span>${esc(role)}</span></div></div>
          <p class="dw-settings-description">You are signed in to the ${esc(cfg.name)} workspace.</p>
          <div class="dw-settings-actions">${window.dfabHelp?.button?.()||''}<button class="danger-btn" id="dLogout" type="button">${isAdmin?'Leader logout':'Log out'}</button></div>
        </section>
        <section class="panel dw-settings-card dw-settings-data" aria-labelledby="dwSettingsDataTitle">
          <div class="dw-settings-card-head"><span class="dw-settings-symbol dw-settings-symbol-data" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/></svg></span><div><span class="kicker">DATABASE</span><h3 id="dwSettingsDataTitle">Workspace connection</h3></div></div>
          <div class="dw-settings-connection" role="status"><span class="dw-settings-indicator ${isConnected?'is-connected':'is-syncing'}" aria-hidden="true"></span><strong>${isConnected?'Data synchronized':'Syncing data…'}</strong></div>
          <p class="dw-settings-description">${esc(cfg.name)} records are synchronized with the company database.</p>
        </section>
      </div>
      ${canBackup?'<div class="dw-settings-backup" id="dMonthlyBackup"></div>':''}`;
    content().querySelector('#dLogout').onclick=()=>{if(isAdmin){window.adminSession.logout();close();showDepartmentGate();return}localStorage.removeItem(personKey());try{const savedLead=JSON.parse(localStorage.getItem(leadSessionKey)||'null');if(savedLead?.departmentKey===deptKey)localStorage.removeItem(leadSessionKey)}catch{localStorage.removeItem(leadSessionKey)}if(deptKey==='quality')window.qualitySession?.logout?.();member='';stop?.();stop=null;login()};
    if(canBackup)window.monthBackup?.mount(content().querySelector('#dMonthlyBackup'),{key:deptKey,label:cfg.name,mode:deptKey==='quality'?'quality':deptKey==='rnd'?'rnd':'department'});
  }

=======
  function settings(){content().innerHTML=`<div class="section-toolbar"><div><span class="kicker">DEPARTMENT SETTINGS</span><h2>Settings</h2></div></div><div class="dw-settings"><section class="panel"><span class="kicker">PROFILE</span><h3>${esc(memberName())}</h3><p>${esc(memberRoleLabel())}</p>${window.dfabHelp?.button?.()||''}<button class="danger-btn" id="dLogout">${adminView()?'Leader logout':'Log out'}</button></section><section class="panel"><span class="kicker">DATABASE</span><h3>${server?'Data synchronized':'Syncing data…'}</h3><p>Department records synchronize to the company database.</p></section></div>${(!adminView()&&memberRole()==='lead')?'<div id="dMonthlyBackup"></div>':''}`;content().querySelector('#dLogout').onclick=()=>{if(adminView()){window.adminSession.logout();close();showDepartmentGate();return}localStorage.removeItem(personKey());try{const savedLead=JSON.parse(localStorage.getItem(leadSessionKey)||'null');if(savedLead?.departmentKey===deptKey)localStorage.removeItem(leadSessionKey)}catch{localStorage.removeItem(leadSessionKey)}if(deptKey==='quality')window.qualitySession?.logout?.();member='';stop?.();stop=null;login()};if(!adminView()&&memberRole()==='lead')window.monthBackup?.mount(content().querySelector('#dMonthlyBackup'),{key:deptKey,label:cfg.name,mode:deptKey==='quality'?'quality':'department'})}
  function applyAdminReadonly(){if(!root)return;root.classList.remove('admin-view-only');}
>>>>>>> origin/main
  function paint(){if(!root||root.hidden)return;shell();updateCloud();updateBadge();activate();if(!memberName())return login();if(page==='timesheet'&&content().querySelector('#dTimeForm')?.contains(document.activeElement)){renderTimeRows();applyAdminReadonly();return}({dashboard,kaizen,weekly,kpi,timesheet,assigned,settings}[page]||dashboard)();applyAdminReadonly()}
  function login(){root.innerHTML=`<div class="dw-login"><div class="dw-login-card"><img src="assets/dfab-logo.png" alt="DFAB"><span class="kicker">${esc(cfg.name.toUpperCase())} DEPARTMENT</span><h2>Sign in</h2><p>Enter your approved ${esc(cfg.name)} member name and password.</p><form id="dLoginForm"><label>Name<input name="name" autocomplete="username" required maxlength="80"></label><label>Password<span class="password-entry-wrap"><input name="password" type="text" class="secure-password-entry" data-secure-entry="password" autocomplete="off" spellcheck="false" autocorrect="off" autocapitalize="off" data-lpignore="true" data-1p-ignore="true" required minlength="4" maxlength="64"><button class="password-visibility-toggle" type="button" data-password-toggle aria-label="Show password" aria-pressed="false"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg></button></span></label><button class="primary-btn">Continue</button><p class="login-message" id="dLoginMessage" aria-live="polite"></p><div id="dLoginSuggestion"></div></form><button class="ghost-btn" id="dLoginBack">All departments</button></div></div>`;root.querySelector('#dLoginBack').onclick=()=>showDepartmentGate();const form=root.querySelector('#dLoginForm'),inputEl=form.elements.name,passwordEl=form.elements.password,message=root.querySelector('#dLoginMessage'),suggestion=root.querySelector('#dLoginSuggestion');const clearSuggestion=()=>{suggestion.innerHTML=''};const showSuggestion=value=>{clearSuggestion();const match=suggestedMember(value);if(!match)return false;const box=document.createElement('div');box.className='suggestion-box';box.innerHTML='<span>Did you mean <b></b>?</span><button type="button" class="secondary-btn">Use this name</button>';box.querySelector('b').textContent=match;box.querySelector('button').onclick=()=>{inputEl.value=match;passwordEl.focus();clearSuggestion()};suggestion.append(box);return true};inputEl.addEventListener('input',()=>{message.textContent='';if(inputEl.value.trim().length>=2)showSuggestion(inputEl.value);else clearSuggestion()});form.onsubmit=async e=>{e.preventDefault();const input=String(new FormData(form).get('name')||'').trim(),password=String(new FormData(form).get('password')||''),name=resolveMember(input);message.textContent='';clearSuggestion();if(!name){if(!allowedMembers().length){message.textContent='Member access is not configured yet.';return}message.textContent=showSuggestion(input)?'Name not matched exactly. Choose the suggested approved name below.':'Wrong / Not authorized';return}const row=memberDirectory.find(x=>norm(x.name)===norm(name));if(!row?.password_hash||!row?.password_salt){message.textContent='Password is not set for this login. Ask Admin to set it in Manage Members.';return}if(!await window.rndPassword.verify(password,row)){message.textContent='Wrong password.';return}member=name;localStorage.setItem(personKey(),name);if(deptKey==='quality')localStorage.setItem('dfabQualityLogin',JSON.stringify({name}));syncAssignedTaskLeadSession();window.requestNotificationsFromGesture?.();root.innerHTML='';shell();connect();paint()}}
  function bindDeletes(){content().querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{if(!await window.departmentUX.confirm('Delete this saved work record?'))return;b.disabled=true;try{await remove(b.dataset.delete);window.departmentUX.notice('Record deleted.')}catch(e){window.departmentUX.notice(window.departmentUX.error(e),'error');b.disabled=false}})}
  async function connect(){stop?.();stop=null;server=false;
<<<<<<< HEAD
    if(deptKey==='rnd'){
      rndSnapshot=null;rndTimeEntries=[];rndKpiRecords=[];rndSnapshotLoaded=false;rndTimeLoaded=false;rndKpiLoaded=false;const stops=[],generationKey=deptKey;
      const onError=err=>{server=false;console.error(err);updateCloud()};
      try{
        const initial=await window.rndCloud.loadSnapshot();if(initial){rndSnapshot=initial;rndSnapshotLoaded=true;refreshRndRecords()}
        stops.push(window.rndCloud.watchRndWorkspace?.((snapshot,meta)=>{if(root?.hidden||deptKey!==generationKey)return;rndSnapshot=snapshot;rndSnapshotLoaded=true;server=Boolean(meta?.connected);refreshRndRecords()},onError)||(()=>{}));
        stops.push(await window.rndCloud.watchRndTime((list,meta)=>{if(root?.hidden||deptKey!==generationKey)return;rndTimeEntries=list;rndTimeLoaded=true;server=Boolean(meta?.connected);refreshRndRecords()},onError));
        stops.push(await window.rndCloud.watchDepartmentRecords('rnd',(list,meta)=>{if(root?.hidden||deptKey!==generationKey)return;rndKpiRecords=list;rndKpiLoaded=true;server=Boolean(meta?.connected);refreshRndRecords()},onError));
        stop=()=>stops.forEach(fn=>{try{fn?.()}catch{}});return;
      }catch(err){stops.forEach(fn=>{try{fn?.()}catch{}});onError(err);return}
    }
=======
>>>>>>> origin/main
    if(deptKey==='quality'){
      qualityLegacyRecords=[];qualityLegacyEntries=[];qualityRecordsLoaded=false;qualityEntriesLoaded=false;
      const stops=[];const generationKey=deptKey;let firstError='';
      const onError=err=>{firstError=err?.message||'Quality Firebase connection failed';server=false;console.error(firstError);updateCloud()};
      try{
        const r=await window.rndCloud.watchQualityTime('records',(list,meta)=>{if(root?.hidden||deptKey!==generationKey)return;qualityLegacyRecords=list;qualityRecordsLoaded=true;server=Boolean(meta?.connected);refreshQualityRecords()},onError);stops.push(r);
        const t=await window.rndCloud.watchQualityTime('entries',(list,meta)=>{if(root?.hidden||deptKey!==generationKey)return;qualityLegacyEntries=list;qualityEntriesLoaded=true;server=Boolean(meta?.connected);refreshQualityRecords()},onError);stops.push(t);
        stop=()=>stops.forEach(fn=>fn?.());
      }catch(err){stops.forEach(fn=>fn?.());onError(err)}
      return;
    }
    try{stop=await window.rndCloud.watchDepartmentRecords(deptKey,(list,meta)=>{records=list;recordsLoaded=true;server=Boolean(meta?.connected);paint();maybeNotify()},err=>{server=false;console.error(err);updateCloud()})}catch(err){console.error(err);updateCloud()}}
  function maybeNotify(){if(adminView()||!server||!window.notificationsEnabled?.())return;const list=pendingItems();if(!list.length)return;const sig=list.map(x=>x.title).sort().join('|'),key=`dept-pending:${deptKey}:${norm(memberName())}:${isoToday()}:${btoa(unescape(encodeURIComponent(sig))).slice(0,20)}`;if(localStorage.getItem(key))return;window.notifyUser?.(`${cfg.name} · My Pending`,`${list.length} pending item${list.length===1?'':'s'} need attention.`);localStorage.setItem(key,'1')}
<<<<<<< HEAD
  async function hourlyReminder(){
    window.monthBackup?.remind?.({key:deptKey,label:cfg?.name||deptKey,mode:deptKey==='quality'?'quality':deptKey==='rnd'?'rnd':'department',eligible:!adminView()&&memberRole()==='lead',openSettings:()=>go('settings')});
    if(adminView()||!root||root.hidden||!memberName())return;const n=new Date();if(n.getDay()===0||n.getHours()<9||n.getHours()>17)return;const key=`timesheet-hourly:${deptKey}:${norm(memberName())}:${isoToday()}:${n.getHours()}`;if(localStorage.getItem(key))return;if(document.hidden||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;
    let assigned=[];try{assigned=(await window.rndCloud.loadAssignedTasks()).filter(t=>t.department_key===deptKey&&t.status!=='completed')}catch{}
    const me=memberName(),mine=assigned.filter(t=>norm(t.person)===norm(me)),todayKaizen=rows('kaizen').some(r=>r.date===isoToday()&&norm(r.member)===norm(me)&&(deptKey!=='rnd'||String(r.idea_type||'kaizen').toLowerCase()==='kaizen'));
    const myKaizen=!(deptKey==='rnd'&&norm(me)==='kabil')&&!todayKaizen?[{task:"Today's Kaizen",person:me,page:'kaizen'}]:[];
    const item=x=>`<button type="button" class="pending-task-item" data-reminder-page="${esc(x.page||'assigned')}"><div><strong>MY PENDING</strong><h4>${esc(x.task||'Pending task')}</h4><p>${x.assigned_by?`Assigned by ${esc(x.assigned_by)}`:'Needs attention today'}</p></div><span class="pending-status">PENDING</span></button>`;
    const myRows=[...myKaizen,...mine.map(t=>({...t,page:'assigned'}))],message=`Update your ${cfg.name} Time Sheet for the work completed during the past hour.`;if(window.notificationsEnabled?.())window.notifyUser?.(`${cfg.name} · Time Sheet Reminder`,message);
    const d=document.createElement('dialog');d.className='modal tc-reminder dept-hourly-reminder';d.innerHTML=`<div class="tc-clock-inner"><span class="kicker">HOURLY WORK CHECK</span><h2>Time Sheet & Pending Work</h2><p>${esc(message)}</p><div class="dept-reminder-pending"><section><div class="notification-group-title"><span>MY PENDING</span><b>${myRows.length}</b></div>${myRows.length?myRows.map(item).join(''):'<div class="notification-empty">No pending items for you.</div>'}</section></div><div class="tc-clock-actions"><button class="ghost-btn" data-close>Close</button><button class="secondary-btn" data-assigned>Assigned Tasks</button><button class="primary-btn" data-open>Open Time Sheet</button></div></div>`;document.body.append(d);d.querySelector('[data-close]').onclick=()=>d.close();d.querySelector('[data-open]').onclick=()=>{d.close();go('timesheet')};d.querySelector('[data-assigned]').onclick=()=>{d.close();go('assigned')};d.querySelectorAll('[data-reminder-page]').forEach(b=>b.onclick=()=>{d.close();go(b.dataset.reminderPage)});d.addEventListener('close',()=>d.remove(),{once:true});d.showModal();localStorage.setItem(key,'1')
  }
  async function open(department){close();deptKey=keyForName(department.name);cfg=CONFIG[deptKey];if(!cfg)return false;memberDirectory=[];memberDirectoryLoaded=false;try{memberDirectory=deptKey==='rnd'?(await window.rndCloud.loadRndMembers()).filter(x=>x.active!==false&&Number(x.active)!==0&&String(x.role||'member')!=='visitor'):(await window.rndCloud.loadDepartmentMembers(deptKey));memberDirectoryLoaded=true}catch(error){console.warn('Department member registry unavailable, using packaged fallback',deptKey,error)}root=document.getElementById('departmentWorkspace');if(!root){root=document.createElement('main');root.id='departmentWorkspace';root.className='quality-workspace department-quality-clone department-unified-workspace';document.body.append(root)}root.hidden=false;root.classList.add('department-unified-workspace');document.body.classList.remove('leader-center-active');root.classList.remove('q-collapsed');document.getElementById('appShell')?.classList.add('app-locked');document.getElementById('loginGate')?.classList.add('hidden');if(deptKey==='quality')await window.qualitySession?.refreshMembers?.();const saved=localStorage.getItem(personKey())||(deptKey==='quality'?window.qualitySession?.current?.():'')||'';member=adminView()?window.adminSession.name():resolveMember(saved);if(!adminView()&&!member&&saved)localStorage.removeItem(personKey());if(!adminView())syncAssignedTaskLeadSession();page='dashboard';reportPeriod='weekly';reportMonth=currentMonth();reportWeek=Math.min(4,Math.max(1,Math.ceil(Number(isoToday().slice(-2))/7)));weeklyDate=isoToday();if(deptKey==='quality')window.qualityReview?.setReportState?.({period:'weekly',month:reportMonth,week:reportWeek});if(member){shell();connect()}paint();return true}
  function close(){rndSnapshot=null;rndTimeEntries=[];rndKpiRecords=[];rndSnapshotLoaded=false;rndTimeLoaded=false;rndKpiLoaded=false;qualityLegacyRecords=[];qualityLegacyEntries=[];qualityRecordsLoaded=false;qualityEntriesLoaded=false;root?._departmentPanelCleanup?.();root?._mobileNavController?.abort();if(root){delete root._departmentPanelCleanup;delete root._mobileNavController;}stop?.();stop=null;records=[];memberDirectory=[];memberDirectoryLoaded=false;server=false;recordsLoaded=false;if(root){root.hidden=true;root.innerHTML=''}}
=======
  function hourlyReminder(){window.monthBackup?.remind?.({key:deptKey,label:cfg?.name||deptKey,mode:'department',eligible:!adminView()&&memberRole()==='lead',openSettings:()=>go('settings')});if(adminView()||!root||root.hidden||!memberName())return;const n=new Date();if(n.getDay()===0||n.getHours()<9||n.getHours()>17)return;const key=`timesheet-hourly:${deptKey}:${norm(memberName())}:${isoToday()}:${n.getHours()}`;if(localStorage.getItem(key))return;const message=`Please update your ${cfg.name} Time Sheet for the work completed during the past hour.`;if(window.notificationsEnabled?.())window.notifyUser?.(`${cfg.name} · Time Sheet Reminder`,message);if(document.hidden||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;const d=document.createElement('dialog');d.className='modal tc-reminder';d.innerHTML=`<div class="tc-clock-inner"><span class="kicker">HOURLY TIME SHEET</span><h2>Update your Time Sheet</h2><p>${esc(message)}</p><div class="tc-clock-actions"><button class="ghost-btn" data-close>Close</button><button class="primary-btn" data-open>Open Time Sheet</button></div></div>`;document.body.append(d);d.querySelector('[data-close]').onclick=()=>d.close();d.querySelector('[data-open]').onclick=()=>{d.close();go('timesheet')};d.addEventListener('close',()=>d.remove(),{once:true});d.showModal();localStorage.setItem(key,'1')}
  async function open(department){close();deptKey=keyForName(department.name);cfg=CONFIG[deptKey];if(!cfg)return false;memberDirectory=[];memberDirectoryLoaded=false;try{memberDirectory=await window.rndCloud.loadDepartmentMembers(deptKey);memberDirectoryLoaded=true}catch(error){console.warn('Department member registry unavailable, using packaged fallback',deptKey,error)}root=document.getElementById('departmentWorkspace');if(!root){root=document.createElement('main');root.id='departmentWorkspace';root.className='quality-workspace department-quality-clone department-unified-workspace';document.body.append(root)}root.hidden=false;root.classList.add('department-unified-workspace');document.body.classList.remove('leader-center-active');root.classList.remove('q-collapsed');document.getElementById('appShell')?.classList.add('app-locked');document.getElementById('loginGate')?.classList.add('hidden');if(deptKey==='quality')await window.qualitySession?.refreshMembers?.();const saved=localStorage.getItem(personKey())||(deptKey==='quality'?window.qualitySession?.current?.():'')||'';member=adminView()?window.adminSession.name():resolveMember(saved);if(!adminView()&&!member&&saved)localStorage.removeItem(personKey());if(!adminView())syncAssignedTaskLeadSession();page='dashboard';reportMonth=currentMonth();reportWeek=Math.min(4,Math.max(1,Math.ceil(Number(isoToday().slice(-2))/7)));weeklyDate=isoToday();if(member){shell();connect()}paint();return true}
  function close(){qualityLegacyRecords=[];qualityLegacyEntries=[];qualityRecordsLoaded=false;qualityEntriesLoaded=false;root?._departmentPanelCleanup?.();root?._mobileNavController?.abort();if(root){delete root._departmentPanelCleanup;delete root._mobileNavController;}stop?.();stop=null;records=[];memberDirectory=[];memberDirectoryLoaded=false;server=false;recordsLoaded=false;if(root){root.hidden=true;root.innerHTML=''}}
>>>>>>> origin/main
  async function openSettings(department){const ok=await open(department);if(!ok)return false;page='settings';paint();return true}
  window.departmentWorkspace={open,openSettings,close,has:name=>Boolean(CONFIG[keyForName(name)]),configs:CONFIG,keyForName,weeklyTargetText,currentIdentity:()=>root&&!root.hidden&&memberName()&&!adminView()?{departmentKey:deptKey,department:cfg?.name||deptKey,person:memberName()}:null};
  window.departmentAssignedTaskLeadAccess=()=>{try{const x=JSON.parse(localStorage.getItem(leadSessionKey)||'null');return x?.departmentKey&&x?.department&&x?.person?x:null}catch{return null}};
  window.setInterval?.(hourlyReminder,30000);window.addEventListener?.('focus',hourlyReminder);document.addEventListener?.('visibilitychange',hourlyReminder);
})();
