(function(){
  const MAIN_NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const REL_NS='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const savedPasswords=new Map();
  const passwordKey=(department,id)=>`${String(department||'').normalize('NFKC').replace(/[^a-z0-9]+/gi,'').toLowerCase()}:${String(id||'')}`;
  window.memberPasswordSession={
    remember(department,id,password){if(department&&id!==undefined&&id!==null&&String(password||''))savedPasswords.set(passwordKey(department,id),String(password))},
    get(department,id){return savedPasswords.get(passwordKey(department,id))||''}
  };
  const xmlDocument=text=>{
    const doc=new DOMParser().parseFromString(text,'application/xml');
    if(doc.getElementsByTagName('parsererror').length)throw new Error('The selected workbook contains invalid XML.');
    return doc;
  };
  const elements=(root,name)=>Array.from(root.getElementsByTagNameNS('*',name));
  const columnIndex=reference=>{
    const letters=String(reference||'').match(/^[A-Z]+/i)?.[0]?.toUpperCase();
    if(!letters)return -1;
    let value=0;for(const letter of letters)value=value*26+letter.charCodeAt(0)-64;
    return value-1;
  };
  const normalizePath=path=>{
    const parts=[];
    for(const part of String(path||'').replace(/\\/g,'/').split('/')){
      if(!part||part==='.')continue;
      if(part==='..')parts.pop();else parts.push(part);
    }
    return parts.join('/');
  };
  function parseSpreadsheetXml(text){
    const doc=xmlDocument(text),sheets=elements(doc,'Worksheet');
    return sheets.map(sheet=>{
      const rows=elements(sheet,'Row').map(row=>{
        const values=[];let next=0;
        for(const cell of elements(row,'Cell')){
          const index=Number(cell.getAttributeNS('urn:schemas-microsoft-com:office:spreadsheet','Index'));
          if(Number.isFinite(index)&&index>0)next=index-1;
          const data=elements(cell,'Data')[0];
          values[next++]=data?.textContent||'';
        }
        return values;
      });
      return{name:sheet.getAttributeNS('urn:schemas-microsoft-com:office:spreadsheet','Name')||sheet.getAttribute('ss:Name')||'',rows};
    });
  }
  async function inflateRaw(bytes){
    if(typeof DecompressionStream!=='function')throw new Error('This browser cannot read compressed Excel files. Save the workbook as Excel 2003 XML or CSV and try again.');
    let stream;
    try{stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))}
    catch{throw new Error('This browser cannot decompress this Excel file. Save it as Excel 2003 XML or CSV and try again.')}
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  async function unzip(buffer){
    const bytes=new Uint8Array(buffer),view=new DataView(buffer);
    let end=-1;
    for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50){end=i;break}
    if(end<0)throw new Error('The selected file is not a supported .xlsx workbook.');
    const count=view.getUint16(end+10,true),centralOffset=view.getUint32(end+16,true),decoder=new TextDecoder();
    const files=new Map();let cursor=centralOffset;
    for(let i=0;i<count;i++){
      if(view.getUint32(cursor,true)!==0x02014b50)throw new Error('The Excel workbook ZIP directory is invalid.');
      const flags=view.getUint16(cursor+8,true),method=view.getUint16(cursor+10,true),compressedSize=view.getUint32(cursor+20,true),nameLength=view.getUint16(cursor+28,true),extraLength=view.getUint16(cursor+30,true),commentLength=view.getUint16(cursor+32,true),localOffset=view.getUint32(cursor+42,true);
      const name=decoder.decode(bytes.subarray(cursor+46,cursor+46+nameLength));
      cursor+=46+nameLength+extraLength+commentLength;
      if(name.endsWith('/')||name.startsWith('__MACOSX/'))continue;
      if(flags&1)throw new Error('Password-protected Excel files are not supported for import.');
      if(view.getUint32(localOffset,true)!==0x04034b50)throw new Error('The Excel workbook contains an invalid file entry.');
      const dataOffset=localOffset+30+view.getUint16(localOffset+26,true)+view.getUint16(localOffset+28,true),compressed=bytes.subarray(dataOffset,dataOffset+compressedSize);
      let content;
      if(method===0)content=compressed;
      else if(method===8)content=await inflateRaw(compressed);
      else throw new Error('The Excel workbook uses an unsupported compression method.');
      files.set(name,content);
    }
    return files;
  }
  function parseXlsx(files){
    const decoder=new TextDecoder();
    const get=path=>files.get(path)?decoder.decode(files.get(path)):null;
    const workbookText=get('xl/workbook.xml'),relationsText=get('xl/_rels/workbook.xml.rels');
    if(!workbookText||!relationsText)throw new Error('The .xlsx workbook is missing its worksheet index.');
    const workbook=xmlDocument(workbookText),relations=xmlDocument(relationsText),targets=new Map();
    elements(relations,'Relationship').forEach(item=>targets.set(item.getAttribute('Id'),item.getAttribute('Target')));
    const sharedText=get('xl/sharedStrings.xml'),shared=sharedText?elements(xmlDocument(sharedText),'si').map(item=>elements(item,'t').map(t=>t.textContent||'').join('')):[];
    return elements(workbook,'sheet').map(sheet=>{
      const id=sheet.getAttributeNS(REL_NS,'id')||Array.from(sheet.attributes).find(a=>a.localName==='id')?.value,target=targets.get(id);
      if(!target)throw new Error('The Excel workbook contains a worksheet with no file reference.');
      const path=target.startsWith('/')?normalizePath(target.slice(1)):normalizePath(`xl/${target}`);
      const text=get(path);if(!text)throw new Error('An Excel worksheet could not be read.');
      const doc=xmlDocument(text),rows=elements(doc,'row').map(row=>{
        const values=[];
        for(const cell of elements(row,'c')){
          const index=columnIndex(cell.getAttribute('r'));if(index<0)continue;
          const type=cell.getAttribute('t'),value=elements(cell,'v')[0]?.textContent||'';
          if(type==='s')values[index]=shared[Number(value)]??'';
          else if(type==='inlineStr')values[index]=elements(cell,'t').map(t=>t.textContent||'').join('');
          else values[index]=value;
        }
        return values;
      });
      return{name:sheet.getAttribute('name')||'',rows};
    });
  }
  const header=value=>String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  function rowsFromSheets(sheets){
    const allMembers=sheets.find(sheet=>header(sheet.name)==='all members');
    const selected=allMembers?[allMembers]:sheets,records=[];
    for(const sheet of selected){
      let contexts=[];
      for(const row of sheet.rows){
        const cells=row.map(value=>header(value));
        const nameColumns=cells.map((value,index)=>['name','employee name','member name'].includes(value)?index:-1).filter(index=>index>=0);
        const passwordColumns=cells.map((value,index)=>['password','member password','saved password'].includes(value)?index:-1).filter(index=>index>=0);
        if(nameColumns.length&&passwordColumns.length){
          contexts=nameColumns.map((nameColumn,index)=>{
            const nextName=nameColumns[index+1]??Infinity;
            const passwordColumn=passwordColumns.find(column=>column>nameColumn&&column<nextName)??passwordColumns.find(column=>column<nameColumn);
            if(passwordColumn===undefined)return null;
            const departmentColumn=cells.findIndex((value,column)=>column<nameColumn&&value==='department');
            return{nameColumn,passwordColumn,departmentColumn};
          }).filter(Boolean);
          continue;
        }
        for(const context of contexts){
          const name=String(row[context.nameColumn]??'').trim(),password=String(row[context.passwordColumn]??'').trim(),department=context.departmentColumn>=0?String(row[context.departmentColumn]??'').trim():'';
          if(name&&password)records.push({name,password,department,sheet:sheet.name});
        }
      }
    }
    if(!records.length)throw new Error('No rows with a Name and Password were found. Fill the Password column and keep the header row unchanged.');
    return records;
  }
  async function parse(file){
    if(!file)throw new Error('Choose an Excel workbook to import.');
    const buffer=await file.arrayBuffer(),bytes=new Uint8Array(buffer),prefix=new TextDecoder().decode(bytes.subarray(0,Math.min(bytes.length,256))).trimStart();
    let sheets;
    if(prefix.startsWith('<?xml')||prefix.startsWith('<Workbook')||prefix.startsWith('<workbook')){
      sheets=parseSpreadsheetXml(new TextDecoder().decode(bytes));
    }else{
      const files=await unzip(buffer);
      sheets=parseXlsx(files);
    }
    return rowsFromSheets(sheets);
  }
  window.memberPasswordImport={parse};
})();
