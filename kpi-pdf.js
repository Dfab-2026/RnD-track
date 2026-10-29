/* Offline A4 PDF export of the currently visible KPI report. */
(function(){
 const W=1240,H=1754,P=70,BOTTOM=H-90;
 function snapshot(){
  const host=document.querySelector('#kpiReportContent');if(!host)throw Error('Open the KPI Report first.');
  const label=id=>{const el=document.getElementById(id);return el?.selectedOptions?.[0]?.textContent||el?.value||''};
  let section='KPI Report';const cards=[];
  for(const child of host.children){if(child.matches('.kpi101-section'))section=child.textContent.trim();if(child.matches('.kpi101-grid'))for(const card of child.querySelectorAll('.kpi101-card')){
    const score=card.querySelector('.kpi101-score'),input=card.querySelector('input[name=value]'),target=Number((score?.querySelector('small')?.textContent||'').match(/\d+/)?.[0])||0,value=input?Number(input.value):Number(score?.firstChild?.textContent)||0;
    cards.push({section,title:card.querySelector('h4')?.textContent.trim()||'',owner:card.querySelector('.kpi101-card-top>span')?.textContent.trim()||'',value,target,unit:(score?.querySelector('small')?.textContent||'').replace(/^\s*\/\s*\d+\s*/,''),passed:value>=target,detail:card.querySelector(':scope>p')?.textContent.trim()||'',review:card.querySelector('.kpi102-accountability')?.textContent.trim()||'',remarks:card.querySelector('textarea[name=remarks]')?.value.trim()||'',contributionLabel:card.querySelector('.kpi103-contribution-title')?.textContent||'',contributors:[...card.querySelectorAll('.kpi103-person')].map(row=>({name:row.querySelector('span')?.textContent||'',progress:Number(row.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow'))||0,label:row.querySelector('small')?.textContent||''}))});
  }}
  if(!cards.length)throw Error('No KPI cards are available for this filter.');
  return{department:'RESEARCH & DEVELOPMENT',reportTitle:'KPI Performance Report',member:label('kpiMemberSelect'),period:label('kpiPeriodType'),month:label('kpiMonthFilter'),week:document.getElementById('kpiPeriodType')?.value==='weekly'?label('kpiWeekSelect'):'',range:document.getElementById('kpiDateRange')?.textContent||'',generated:new Date().toLocaleString('en-IN'),by:typeof currentMember==='function'?currentMember()?.name||'':'',cards};
 }

 function qualitySnapshot(){
  const host=document.querySelector('#qKpiReportContent');if(!host)throw Error('Open the Quality KPI Report first.');
  const label=id=>{const el=document.getElementById(id);return el?.selectedOptions?.[0]?.textContent||el?.value||''};
  let section='KPI Report';const cards=[];
  for(const child of host.children){
   if(child.matches('.kpi101-section'))section=child.textContent.trim();
   if(child.matches('.kpi101-grid'))for(const card of child.querySelectorAll('.kpi101-card')){
    const score=card.querySelector('.kpi101-score'),input=card.querySelector('input[name=value]');
    const small=score?.querySelector('small')?.textContent||'';
    const targetMatch=small.match(/\/\s*([\d.]+)/),target=targetMatch?Number(targetMatch[1]):null;
    let value=input&&input.value!==''?Number(input.value):Number(score?.firstChild?.textContent)||0;
    cards.push({section,title:card.querySelector('h4')?.textContent.trim()||'',owner:card.querySelector('.kpi101-card-top>span')?.textContent.trim()||'',value,target,unit:small.replace(/^\s*\/\s*[\d.]+\s*/,''),passed:card.classList.contains('passed'),detail:card.querySelector(':scope>p')?.textContent.trim()||'',review:card.querySelector('.kpi102-accountability')?.textContent.trim()||'',remarks:card.querySelector('textarea[name=remarks]')?.value.trim()||'',contributionLabel:card.querySelector('.kpi103-contribution-title')?.textContent||'',contributors:[...card.querySelectorAll('.kpi103-person')].map(row=>({name:row.querySelector('span')?.textContent||'',progress:Number(row.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow'))||0,label:row.querySelector('small')?.textContent||''}))});
   }
  }
  if(!cards.length)throw Error('No Quality KPI cards are available for this filter.');
  const month=document.querySelector('#qrMonth')?.value||new Date().toISOString().slice(0,7);
  const period=label('qrPeriod'),week=document.getElementById('qrPeriod')?.value==='weekly'?label('qrWeek'):'';
  const range=document.querySelector('.q-review-filter .kpi101-date-range')?.textContent||'';
  return{department:'QUALITY',reportTitle:'KPI Performance Report',member:label('qrName')||'Navarasu',period,month,week,range,generated:new Date().toLocaleString('en-IN'),by:typeof qualityAppContext==='object'&&qualityAppContext?.person?qualityAppContext.person():'Navarasu',cards};
 }

 function render(model){
  const pages=[];let canvas,ctx,y,section='';
  const font=(size,bold=false)=>{ctx.font=(bold?'700 ':'400 ')+size+'px sans-serif'};
  function lines(text,size,max){font(size);const output=[];for(const para of String(text||'').split('\n')){let line='';for(const token of para.split(/\s+/)){if(!token)continue;let candidate=line?line+' '+token:token;if(ctx.measureText(candidate).width<=max){line=candidate;continue}if(line){output.push(line);line=''}if(ctx.measureText(token).width>max){for(const char of token){if(ctx.measureText(line+char).width>max){output.push(line);line=''}line+=char}}else line=token}output.push(line)}return output}
  function text(str,x,at,size=20,color='#254361',bold=false){font(size,bold);ctx.fillStyle=color;ctx.fillText(String(str),x,at)}
  function page(){canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);ctx.textBaseline='top';ctx.fillStyle='#143d69';ctx.fillRect(0,0,W,12);text('DFAB  /  '+(model.department||'RESEARCH & DEVELOPMENT'),P,40,17,'#587899',true);text(model.reportTitle||'KPI Performance Report',P,74,34,'#15395f',true);text(model.member+'  |  '+model.period+(model.week?' · '+model.week:''),P,124,21,'#31587f',true);text(model.range+'  |  '+model.month,P,155,17,'#647f98');ctx.fillStyle='#d9e4f1';ctx.fillRect(P,188,W-P*2,1);y=211;pages.push(canvas)}
  function space(height){if(y+height>BOTTOM){page();return true}return false}
  page();
  for(const item of model.cards){
    const title=lines(item.title,22,W-P*2-270),details=lines(item.detail,17,W-P*2-44),remarks=lines(item.remarks||'No remarks recorded.',18,W-P*2-44),review=lines(item.review,16,W-P*2-44),h=72+title.length*27+details.length*23+review.length*22+(item.contributors.length?33+item.contributors.length*30:0)+38+remarks.length*25+20;
    if(item.section!==section){space(h+45);text(item.section.toUpperCase(),P,y,18,'#36618f',true);y+=35;section=item.section}else if(space(h+50)){text(section.toUpperCase()+' (CONTINUED)',P,y,18,'#36618f',true);y+=35;}
    const top=y;ctx.fillStyle='#f8fbff';ctx.fillRect(P,top,W-P*2,h);ctx.strokeStyle='#d9e4ef';ctx.strokeRect(P,top,W-P*2,h);ctx.fillStyle=item.passed?'#1f9a5e':'#d64f56';ctx.fillRect(P,top,5,h);
    text(item.owner,P+22,y+16,15,'#6c8299',true);text(item.passed?'ACHIEVED':'BELOW TARGET',W-P-208,y+16,15,item.passed?'#1f8755':'#bf4049',true);y+=43;
    for(const line of title){text(line,P+22,y,22,'#1c426b',true);y+=27}
    text(item.target===null?(item.value+(item.unit?' '+item.unit:'')):(item.value+' / '+item.target+(item.unit?' '+item.unit:'')),W-P-208,top+46,23,item.passed?'#1f8755':'#bf4049',true);
    for(const line of details){text(line,P+22,y+3,17,'#627b94');y+=23}y+=9;
    if(item.contributors.length){text(item.contributionLabel,P+22,y,15,'#557697',true);y+=28;for(const member of item.contributors){text(member.name,P+22,y,17);ctx.fillStyle='#e1eaf4';ctx.fillRect(P+250,y+7,340,6);ctx.fillStyle='#4f8ed8';ctx.fillRect(P+250,y+7,340*Math.max(0,Math.min(100,member.progress))/100,6);text(member.label,P+620,y,16,'#617c97');y+=30}y+=5}
    for(const line of review){text(line,P+22,y,16,'#526e89');y+=22}y+=12;text('REMARKS',P+22,y,14,'#6a839d',true);y+=23;
    for(const line of remarks){text(line,P+22,y,18,'#344f6a');y+=25}y=top+h+15;
  }
  pages.forEach((c,index)=>{const context=c.getContext('2d');context.fillStyle='#cfddeb';context.fillRect(P,H-69,W-P*2,1);context.font='14px sans-serif';context.fillStyle='#6a829a';context.textBaseline='top';context.fillText('Generated '+model.generated+(model.by?' · '+model.by:''),P,H-50);context.fillText('Page '+(index+1)+' of '+pages.length,W-P-120,H-50)});
  return pages;
 }
 function build(canvases){
  const enc=new TextEncoder(),objects=[],pageIds=[];let next=3;
  const ascii=s=>enc.encode(s),concat=arrays=>{const out=new Uint8Array(arrays.reduce((n,a)=>n+a.length,0));let at=0;for(const a of arrays){out.set(a,at);at+=a.length}return out};
  objects[1]=ascii('<< /Type /Catalog /Pages 2 0 R >>');
  for(const canvas of canvases){const pageId=next++,imageId=next++,contentId=next++;pageIds.push(pageId);const base64=canvas.toDataURL('image/jpeg',.94).split(',')[1],binary=atob(base64),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    objects[imageId]=concat([ascii('<< /Type /XObject /Subtype /Image /Width '+W+' /Height '+H+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+bytes.length+' >>\nstream\n'),bytes,ascii('\nendstream')]);
    const commands='q\n595.28 0 0 841.89 0 0 cm\n/ReportImage Do\nQ\n';objects[contentId]=ascii('<< /Length '+ascii(commands).length+' >>\nstream\n'+commands+'endstream');
    objects[pageId]=ascii('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /ReportImage '+imageId+' 0 R >> >> /Contents '+contentId+' 0 R >>');
  }
  objects[2]=ascii('<< /Type /Pages /Count '+pageIds.length+' /Kids ['+pageIds.map(id=>id+' 0 R').join(' ')+'] >>');
  const chunks=[ascii('%PDF-1.4\n')],offsets=[0];let size=chunks[0].length;
  for(let id=1;id<next;id++){offsets[id]=size;const chunk=concat([ascii(id+' 0 obj\n'),objects[id],ascii('\nendobj\n')]);chunks.push(chunk);size+=chunk.length}
  const xref=size;chunks.push(ascii('xref\n0 '+next+'\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+next+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF'));return concat(chunks);
 }
 window.downloadKpiPdf=async function(){const button=document.getElementById('downloadKpiPdfBtn'),label=button?.textContent;if(button){button.disabled=true;button.textContent='Preparing PDF…'}try{await document.fonts?.ready;const model=snapshot(),pages=render(model),bytes=build(pages),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a');link.href=url;link.download='DFAB-KPI-'+model.month+(model.week?'-'+model.week.replace(/\s+/g,''):'-monthly')+'.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}catch(err){toast(err.message||'Unable to generate the KPI PDF.',true)}finally{if(button){button.disabled=false;button.textContent=label}}};
 window.downloadQualityKpiPdf=async function(){const button=document.getElementById('downloadQualityKpiPdfBtn'),label=button?.textContent;if(button){button.disabled=true;button.textContent='Preparing PDF…'}try{await document.fonts?.ready;const model=qualitySnapshot(),pages=render(model),bytes=build(pages),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=document.createElement('a');link.href=url;link.download='DFAB-Quality-KPI-'+model.month+(model.week?'-'+model.week.replace(/\s+/g,''):'-monthly')+'.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}catch(err){if(typeof toast==='function')toast(err.message||'Unable to generate the Quality KPI PDF.',true);else alert(err.message||'Unable to generate the Quality KPI PDF.')}finally{if(button){button.disabled=false;button.textContent=label}}};
 window.rndKpiPdf={snapshot,qualitySnapshot,render,build};
})();
