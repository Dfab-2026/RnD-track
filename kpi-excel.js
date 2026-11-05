(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const cell=(value,style='')=>`<Cell${style?` ss:StyleID="${style}"`:''}><Data ss:Type="String">${esc(value)}</Data></Cell>`;
  const row=(values,style='')=>`<Row>${values.map(v=>typeof v==='object'&&v!==null?cell(v.value,v.style||style):cell(v,style)).join('')}</Row>`;
  const section=title=>row([{value:title,style:'section'}]);
  const sheet=(name,rows,widths=[])=>`<Worksheet ss:Name="${esc(String(name).slice(0,31))}"><Table>${widths.map(w=>`<Column ss:AutoFitWidth="0" ss:Width="${w}"/>`).join('')}${rows.join('')}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane><ProtectObjects>False</ProtectObjects><ProtectScenarios>False</ProtectScenarios></WorksheetOptions></Worksheet>`;
  const statusStyle=status=>String(status||'').toLowerCase().includes('achieved')?'statusGood':'statusOpen';
  function download(model){
    const generated=new Date().toLocaleString('en-IN');
    const summary=[
      row([{value:'DFAB KPI PERFORMANCE REPORT',style:'title'}]),
      row([{value:'Selected reporting period',style:'subtitle'}]),
      row([]),
      row([{value:'REPORT INFORMATION',style:'section'}]),
      row([{value:'Department',style:'label'},{value:model.department,style:'value'}]),
      row([{value:'Member / owner',style:'label'},{value:model.member,style:'value'}]),
      row([{value:'Period',style:'label'},{value:model.period,style:'value'}]),
      row([{value:'From',style:'label'},{value:model.start,style:'value'}]),
      row([{value:'To',style:'label'},{value:model.end,style:'value'}]),
      row([{value:'Generated',style:'label'},{value:generated,style:'value'}]),
      row([]),
      row([{value:'PERFORMANCE SUMMARY',style:'section'}]),
      row([{value:'Metric',style:'head'},{value:'Result',style:'head'}]),
      row(['Total KPI',model.summary.total]),
      row(['Achieved',model.summary.achieved]),
      row(['In Progress',model.summary.pending]),
      row(['Time Logged',`${model.summary.timeHours} h`]),
      row(['Kaizen',`${model.summary.kaizenActual} / ${model.summary.kaizenTarget}`])
    ];
    const header=['No.','KPI','Frequency','Target','Actual / Result','Completion %','Status','Remarks','Owner'];
    const detail=[
      row([{value:`${model.period} KPI DETAIL`,style:'section'}]),
      row(header.map(v=>({value:v,style:'head'}))),
      ...model.rows.map((x,i)=>row([
        i+1,x.title,x.frequency,x.target,x.actual,`${x.progress}%`,
        {value:x.status,style:statusStyle(x.status)},x.remarks||'',x.owner||''
      ]))
    ];
    const focus=[
      row([{value:'PERIOD FOCUS',style:'section'}]),
      row([{value:'KPI',style:'head'},{value:'Target',style:'head'},{value:'Progress',style:'head'},{value:'Status',style:'head'}]),
      ...model.rows.map(x=>row([x.title,x.target,`${x.progress}%`,{value:x.status,style:statusStyle(x.status)}]))
    ];
    const xml=`<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles>
      <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Aptos" ss:Size="10"/><Borders/><Interior/><NumberFormat/><Protection/></Style>
      <Style ss:ID="title"><Font ss:FontName="Aptos Display" ss:Bold="1" ss:Size="17" ss:Color="#0B2D59"/><Alignment ss:Vertical="Center"/></Style>
      <Style ss:ID="subtitle"><Font ss:Italic="1" ss:Color="#64748B"/></Style>
      <Style ss:ID="section"><Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#123B6D" ss:Pattern="Solid"/></Style>
      <Style ss:ID="head"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1D5FA7" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D7E3F3"/></Borders></Style>
      <Style ss:ID="label"><Font ss:Bold="1" ss:Color="#334155"/><Interior ss:Color="#EDF4FC" ss:Pattern="Solid"/></Style>
      <Style ss:ID="value"><Font ss:Color="#0F172A"/></Style>
      <Style ss:ID="statusGood"><Font ss:Bold="1" ss:Color="#166534"/><Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>
      <Style ss:ID="statusOpen"><Font ss:Bold="1" ss:Color="#9A3412"/><Interior ss:Color="#FFEDD5" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>
    </Styles>${sheet('Summary',summary,[145,250])}${sheet('KPI Detail',detail,[40,230,110,180,150,95,105,240,130])}${sheet('Period Focus',focus,[250,210,100,110])}</Workbook>`;
    const blob=new Blob([xml],{type:'application/vnd.ms-excel'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=model.filename||'DFAB-KPI-Report.xls';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
  }
  window.kpiExcelExport={download};
})();
