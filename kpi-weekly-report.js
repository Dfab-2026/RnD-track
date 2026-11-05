/* KPI report presentation/export only. All calculations consume existing department records. */
(function(){
  'use strict';
  const clamp=n=>Math.max(0,Math.min(100,Number.isFinite(Number(n))?Number(n):0));
  const escape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const fmt=iso=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso||'')))return String(iso||'—');const [y,m,d]=iso.split('-');return `${d}/${m}/${y}`};
  const safeName=s=>String(s||'Department').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,60);
  const completed=r=>r.status==='completed';
  function normalize(model){
    if(!model||!Array.isArray(model.rows))throw Error('KPI report data is not available.');
    const rows=model.rows.map((row,i)=>({no:i+1,name:String(row.name||row.title||'KPI'),target:String(row.target||'Weekly checkpoint'),actual:String(row.actual??''),percent:clamp(row.percent??row.progress),status:['completed','not_completed'].includes(String(row.status))?String(row.status):(String(row.status)==='in_progress'||String(row.status)==='pending'?'not_completed':clamp(row.percent??row.progress)>=100?'completed':'not_completed'),remarks:String(row.remarks||'')}));
    const achieved=rows.filter(completed).length, total=rows.length, incomplete=total-achieved;
    return {...model,rows,total,achieved,incomplete,completion:total?achieved/total*100:0,department:String(model.department||'Department'),lead:String(model.lead||''),manager:String(model.manager||''),period:String(model.period||'Weekly'),week:Number(model.week)||0,start:model.start||'',end:model.end||''};
  }
  const number=n=>Number(n).toFixed(1).replace(/\.0$/,'');
  function preview(input,options={}){
    const editable=Boolean(options.editable),model=normalize(input),angle=model.completion*3.6,barColor=r=>r.percent>=90?'#16a34a':r.percent>=50?'#3484d1':'#e35454';
    const table=model.rows.map(r=>`<tr><td class="kref-no">${r.no}</td><td class="kref-target">${escape(r.name)}</td><td class="kref-standard">${escape(r.target)}</td><td class="kref-status ${completed(r)?'kref-done':'kref-pending'}">${editable?`<label class="kref-editor"><span class="sr-only">Completion status for ${escape(r.name)}</span><select data-kref-status="${r.no-1}" aria-label="${escape(r.name)} completion status"><option value="not_completed" ${!completed(r)?'selected':''}>Not Completed</option><option value="completed" ${completed(r)?'selected':''}>Completed</option></select></label>`:(completed(r)?'✓ Completed':'× Not Completed')}</td><td class="kref-num">${editable?`<div class="kref-percent-editor"><label><span class="sr-only">Percentage for ${escape(r.name)}</span><input data-kref-percent="${r.no-1}" type="number" min="0" max="100" step="1" value="${r.percent}" aria-label="${escape(r.name)} percentage"><span>%</span></label><button type="button" class="kref-save" data-kref-save="${r.no-1}" title="Save ${escape(r.name)} KPI">Save</button><small role="status" data-kref-feedback="${r.no-1}" aria-live="polite"></small></div>`:`${number(r.percent)}%`}</td></tr>`).join('');
    const bars=model.rows.map(r=>`<div class="kref-bar-item" title="${escape(r.name)}: ${number(r.percent)}%"><b>${number(r.percent)}%</b><span><i style="height:${r.percent}%;background:${barColor(r)}"></i></span><small>${r.no}</small></div>`).join('');
    return `<section class="kref-report" aria-label="${escape(model.department)} ${escape(model.period)} KPI report preview"><div class="kref-header"><div class="kref-logo">DFAB<small>STAINLESS SYSTEM PVT. LTD.</small></div><h3>${escape(model.department.toUpperCase())} DEPARTMENT / ${escape(model.period.toUpperCase())} KPI REPORT</h3></div><div class="kref-meta"><div>WEEK NO. <strong>${model.week||'—'}</strong></div><div>FROM <strong>${fmt(model.start)}</strong></div><div>TO <strong>${fmt(model.end)}</strong></div><div>PREPARED BY <strong>${escape(model.department)} Department</strong></div></div><div class="kref-table-wrap"><table class="kref-table"><thead><tr><th>No.</th><th>Targets</th><th>Target / Standard</th><th>Completion Status</th><th>Percentage %</th></tr></thead><tbody>${table}</tbody></table></div><div class="kref-charts"><article><h4>KPI COMPLETION STATUS</h4><div class="kref-donut-group"><div class="kref-donut" style="--completed-deg:${angle}deg"><b>${model.achieved}/${model.total}<small>${number(model.completion)}%</small></b></div><div class="kref-legend"><span><i class="kref-green"></i> Completed · ${model.achieved}</span><span><i class="kref-red"></i> Not completed · ${model.incomplete}</span></div></div></article><article><h4>TARGET COMPLETION (%)</h4><div class="kref-bars">${bars}</div></article><article><h4>${escape(model.period.toUpperCase())} SUMMARY</h4><dl class="kref-summary"><div><dt>Total targets</dt><dd>${model.total}</dd></div><div><dt>Completed</dt><dd>${model.achieved}</dd></div><div><dt>Not completed</dt><dd>${model.incomplete}</dd></div><div><dt>Overall completion</dt><dd>${number(model.completion)}%</dd></div></dl></article></div><div class="kref-footer"><span>Department Lead: <b>${escape(model.lead||'—')}</b></span><span>${model.manager?`Managed by: <b>${escape(model.manager)}</b>`:''}</span></div></section>`;
  }
  function draw(input){
    const m=normalize(input),canvas=document.createElement('canvas');const PRINT_SCALE=2.5;canvas.width=Math.round(1700*PRINT_SCALE);canvas.height=Math.round(1200*PRINT_SCALE);const ctx=canvas.getContext('2d');if(!ctx)throw Error('Browser canvas is unavailable.');ctx.scale(PRINT_SCALE,PRINT_SCALE);
    const C={navy:'#072d59',blue:'#154f8d',pale:'#edf5ff',line:'#bed4ec',green:'#1fad59',red:'#e94949',ink:'#142a47',muted:'#667d96',white:'#fff'};
    function fill(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
    function txt(s,x,y,size=21,color=C.ink,weight=400){ctx.font=`${weight} ${size}px Arial, sans-serif`;ctx.fillStyle=color;ctx.fillText(String(s??''),x,y)}
    function wrap(s,width,size=19,weight=400){ctx.font=`${weight} ${size}px Arial, sans-serif`;const parts=[];let line='';for(const raw of String(s??'').split(/\s+/)){let word=raw;while(word&&ctx.measureText(word).width>width){let part='';for(const c of word){if(part&&ctx.measureText(part+c).width>width)break;part+=c}if(line){parts.push(line);line=''}parts.push(part);word=word.slice(part.length)}if(!word)continue;const test=line?line+' '+word:word;if(ctx.measureText(test).width<=width)line=test;else{if(line)parts.push(line);line=word}}if(line)parts.push(line);return parts.length?parts:['']}
    function fitted(s,x,y,maxWidth,size=21,minSize=11,color=C.ink,weight=700){let n=size;ctx.font=`${weight} ${n}px Arial, sans-serif`;while(n>minSize&&ctx.measureText(String(s)).width>maxWidth){n-=1;ctx.font=`${weight} ${n}px Arial, sans-serif`}txt(s,x,y,n,color,weight)}
    function measureRows(){return m.rows.map(r=>{const a=wrap(r.name,408,19,600),b=wrap(r.target,470,17);return{...r,nameLines:a,targetLines:b,rows:Math.max(a.length,b.length,1),height:Math.max(40,12+Math.max(a.length,b.length)*22)}})}
    fill(0,0,1700,1200,'#f4f8ff');fill(0,0,1700,102,C.navy);fill(0,102,1700,9,'#3288c7');txt('DFAB',30,46,46,C.white,800);txt('STAINLESS SYSTEM PVT. LTD.',32,80,16,C.white,600);fitted(m.department.toUpperCase()+' DEPARTMENT  /  '+m.period.toUpperCase()+' KPI REPORT',320,67,1340,35,20,C.white,800);
    const meta=[['WEEK NO.',m.week||'—'],['FROM',fmt(m.start)],['TO',fmt(m.end)],['PREPARED BY',m.department+' Department']];meta.forEach((entry,i)=>{const x=26+i*422;fill(x,129,410,62,'#e5effb');txt(entry[0],x+15,153,15,C.muted,700);fitted(entry[1],x+15,180,377,24,14,C.ink,700)});
    const top=208;fill(26,top,1648,49,C.navy);const xs=[26,100,540,1038,1350,1674];['No.','Targets','Target / Standard','Completion Status','Percentage %'].forEach((s,i)=>txt(s,xs[i]+12,top+33,20,C.white,700));
    const data=measureRows();let y=top+49;const maxBottom=855;const heights=data.reduce((n,r)=>n+r.height,0);const scale=Math.min(1,(maxBottom-y)/heights); // fit all source KPIs on one page
    ctx.save();ctx.translate(0,y);ctx.scale(1,scale);let localY=0;
    for(const r of data){const h=r.height;fill(26,localY,1648,h,r.no%2===0?'#f1f7ff':'#fff');fill(1038,localY,312,h,completed(r)?'#d6f8de':'#ffe0e0');txt(r.no,58,localY+h/2+7,21,C.ink,700);r.nameLines.forEach((s,i)=>txt(s,110,localY+22+i*22,19,C.ink,600));r.targetLines.forEach((s,i)=>txt(s,551,localY+22+i*22,17,C.ink));txt(completed(r)?'✓ Completed':'× Not completed',1064,localY+h/2+7,20,completed(r)?'#0a773d':'#aa3030',700);txt(number(r.percent)+'%',1490,localY+h/2+7,22,C.ink,700);fill(26,localY+h-1,1648,1,C.line);localY+=h}ctx.restore();y+=heights*scale;
    const chartY=y+15,chartH=Math.min(355,1092-chartY);const bx=[26,590,1162],bw=[546,554,512];for(let i=0;i<3;i++){fill(bx[i],chartY,bw[i],chartH,'#fff');ctx.strokeStyle=C.line;ctx.strokeRect(bx[i],chartY,bw[i],chartH)}
    const heading=['KPI COMPLETION STATUS','TARGET COMPLETION (%)',m.period.toUpperCase()+' SUMMARY'];heading.forEach((s,i)=>{fill(bx[i]+20,chartY+10,bw[i]-40,37,C.blue);txt(s,bx[i]+36,chartY+36,19,C.white,700)});
    const radius=Math.min(75,chartH/2-42),cx=160,cy=chartY+62+radius;ctx.lineWidth=25;ctx.beginPath();ctx.strokeStyle=C.red;ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.strokeStyle=C.green;ctx.arc(cx,cy,radius,-Math.PI/2,-Math.PI/2+Math.PI*2*m.completion/100);ctx.stroke();txt(m.achieved+'/'+m.total,cx-30,cy-2,27,C.ink,700);txt(number(m.completion)+'%',cx-35,cy+26,18,C.ink,700);txt('Completed  '+m.achieved,310,chartY+113,21,C.green,700);txt('Not completed  '+m.incomplete,310,chartY+162,19,C.red,700);
    const barsX=bx[1]+40,barsY=chartY+chartH-39,barsAreaH=Math.max(40,chartH-106),barW=Math.min(26,430/Math.max(1,m.total)-8),gap=(bw[1]-85)/Math.max(1,m.total);m.rows.forEach((r,i)=>{const x=barsX+i*gap;fill(x,barsY-barsAreaH,barW,barsAreaH,'#e8f1fa');const level=barsAreaH*clamp(r.percent)/100;fill(x,barsY-level,barW,level,r.percent>=90?C.green:r.percent>=50?'#3186cd':C.red);txt(r.no,x,barsY+24,15,C.ink,600)});
    const items=[['Total targets',m.total],['Completed',m.achieved],['Not completed',m.incomplete],['Overall completion',number(m.completion)+'%']];items.forEach((r,i)=>{const iy=chartY+60+i*((chartH-75)/4);txt(r[0],bx[2]+25,iy+19,19,C.ink,i===3?700:400);txt(r[1],bx[2]+400,iy+19,22,i===3?C.green:C.ink,700);fill(bx[2]+18,iy+26,bw[2]-36,1,C.line)});
    fill(0,1174,1700,26,C.navy);fitted('Department Lead: '+(m.lead||'—'),44,1162,m.manager?820:1600,22,14,C.ink,700);if(m.manager)fitted('Managed by: '+m.manager,1095,1162,580,22,13,C.ink,700);
    return canvas;
  }
  function pdfBytes(canvas){
    const data=atob(canvas.toDataURL('image/jpeg',0.98).split(',')[1]);const picture=Uint8Array.from(data,c=>c.charCodeAt(0));const enc=new TextEncoder(),ascii=s=>enc.encode(s),merge=arr=>{const buf=new Uint8Array(arr.reduce((n,r)=>n+r.length,0));let p=0;for(const a of arr){buf.set(a,p);p+=a.length}return buf};
    const head=ascii('%PDF-1.4\n');const image=merge([ascii('<< /Type /XObject /Subtype /Image /Width '+canvas.width+' /Height '+canvas.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+picture.length+' >>\nstream\n'),picture,ascii('\nendstream')]);const A4_W=841.89,A4_H=595.28,MARGIN=3.75;/* 5 CSS px at 96 DPI = 3.75 PDF points */const fit=Math.min((A4_W-2*MARGIN)/canvas.width,(A4_H-2*MARGIN)/canvas.height);const imageW=Number((canvas.width*fit).toFixed(3)),imageH=Number((canvas.height*fit).toFixed(3));const x=Number(((A4_W-imageW)/2).toFixed(3)),y=Number(((A4_H-imageH)/2).toFixed(3));const commands=ascii(`q\n${imageW} 0 0 ${imageH} ${x} ${y} cm\n/Img Do\nQ\n`);const objects=[null,ascii('<< /Type /Catalog /Pages 2 0 R >>'),ascii('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),ascii('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /XObject << /Img 4 0 R >> >> /Contents 5 0 R >>'),image,merge([ascii('<< /Length '+commands.length+' >>\nstream\n'),commands,ascii('endstream')])];const chunks=[head],offsets=[0];let len=head.length;for(let i=1;i<objects.length;i++){offsets[i]=len;const chunk=merge([ascii(i+' 0 obj\n'),objects[i],ascii('\nendobj\n')]);chunks.push(chunk);len+=chunk.length}chunks.push(ascii('xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+len+'\n%%EOF'));return merge(chunks);
  }
  function download(input){const model=normalize(input),canvas=draw(model),bytes=pdfBytes(canvas),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),anchor=document.createElement('a');anchor.href=url;anchor.download=`DFAB-${safeName(model.department)}-${safeName(model.period)}-KPI-${model.start||'report'}.pdf`;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);return bytes.length}
  function printA4(input){
    const model=normalize(input);
    // Open the window before drawing so browser popup blockers recognize the user click.
    const page=window.open('','_blank');
    if(!page)throw Error('Your browser blocked the print window. Allow pop-ups for this site, or use Download A4 PDF and print the downloaded file.');
    try{
      const img=draw(model).toDataURL('image/png'); // lossless, high-density print output
      page.document.open();
      page.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>DFAB KPI Report - A4 Landscape Print</title><style>
        @page{size:A4 landscape;margin:0}
        *{box-sizing:border-box}
        html,body{margin:0;padding:0;background:#eef3f8;font-family:Arial,sans-serif}
        .tools{position:sticky;top:0;z-index:2;padding:12px;text-align:center;background:#eef3f8}
        .tools button{background:#0a4d85;border:0;border-radius:7px;padding:10px 22px;color:#fff;font-weight:bold;cursor:pointer}
        .sheet{width:297mm;height:210mm;display:flex;align-items:center;justify-content:center;padding:5px;background:#fff;margin:12px auto;box-shadow:0 4px 22px #bbc7d3}
        .sheet img{display:block;width:100%;height:100%;object-fit:contain}
        @media print{html,body{width:297mm;height:210mm;background:#fff!important;overflow:hidden!important}.tools{display:none!important}.sheet{margin:0!important;padding:5px!important;box-shadow:none!important;page-break-after:avoid!important;break-after:avoid!important}}
      </style></head><body><div class="tools"><button id="printButton" type="button">Print A4 Landscape</button></div><main class="sheet"><img id="reportImage" alt="DFAB KPI report"></main></body></html>`);
      page.document.close();
      page.document.getElementById('printButton').onclick=()=>page.print();
      const picture=page.document.getElementById('reportImage');
      picture.onload=()=>page.setTimeout(()=>{page.focus();page.print()},250);
      picture.src=img;
      return true;
    }catch(error){page.close();throw error}
  }
  function bindEditable(container,onSave){
    if(!container||typeof onSave!=='function')return;
    container.querySelectorAll('[data-kref-save]').forEach(button=>{
      button.onclick=async()=>{
        if(button.disabled)return;
        const index=Number(button.dataset.krefSave);
        const selector=container.querySelector(`[data-kref-status="${index}"]`),percentInput=container.querySelector(`[data-kref-percent="${index}"]`),feedback=container.querySelector(`[data-kref-feedback="${index}"]`);
        const percent=Number(percentInput?.value),status=selector?.value;
        if(!percentInput||percentInput.value.trim()===''||!Number.isFinite(percent)||percent<0||percent>100||!Number.isInteger(percent)||!['completed','not_completed'].includes(status)){
          if(feedback)feedback.textContent='Enter a whole percentage from 0 to 100.';
          return;
        }
        button.disabled=true;if(feedback)feedback.textContent='Saving…';
        try{await onSave(index,{status,percent});if(feedback)feedback.textContent='Saved';}
        catch(error){if(feedback)feedback.textContent=error?.message||'Save failed. Retry.';}
        finally{button.disabled=false;}
      };
    });
  }
  window.dfabWeeklyKpiReport={normalize,preview,bindEditable,draw,pdfBytes,download,printA4};
})();
