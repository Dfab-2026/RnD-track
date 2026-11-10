from pathlib import Path
p=Path('backup-tools.js');s=p.read_text()
needle='  async function isBackedUp(key,month)'
insert='''  // The JSON archive is lossless; the PDF is a human-readable companion.
  const stableValue=value=>Array.isArray(value)?value.map(stableValue):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stableValue(value[key])])):value;
  const stableRecordSet=records=>(records||[]).map(record=>JSON.stringify(stableValue(record))).sort();
  async function archiveFingerprint(records){
    if(!window.crypto?.subtle)throw new Error('Secure browser context required for verified backup. Open the HTTPS website.');
    const content=JSON.stringify(stableRecordSet(records));
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(content));
    return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  }
  function downloadJson(name,records,metadata){
    const output={format:'DFAB_MONTH_ARCHIVE_V1',...metadata,records};
    const blob=new Blob([JSON.stringify(output,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name+'.json';document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
    return{filename:a.download,bytes:blob.size};
  }
'''
assert needle in s;s=s.replace(needle,insert+needle,1)
start=s.index('    async function deleteBackedMonth(');end=s.index('    async function refresh()',start)
s=s[:start]+'''    async function deleteBackedMonth(m,historyId,button){
      const confirmDelete=message=>(mode==='rnd'||!window.departmentUX)?Promise.resolve(window.confirm(message)):window.departmentUX.confirm(message,{title:'Delete verified month?',confirmLabel:'Delete month'});
      if(button)button.disabled=true;
      try{
        status.textContent='Verifying the complete monthly archive against live Firebase data…';
        const historyRows=await window.rndCloud.loadBackupHistory(key);
        const saved=historyRows.find(row=>row.id===historyId&&row.month===m&&!row.deleted_at);
        if(!saved?.fingerprint||!saved?.jsonFilename)throw new Error('Full JSON archive verification missing. Download this month again before cleanup.');
        const live=await window.rndCloud.loadMonthBackup(key,m,mode);
        const fingerprint=await archiveFingerprint(live);
        if(live.length!==saved.count||fingerprint!==saved.fingerprint)throw new Error('Firebase data changed since backup. Download a fresh full-month archive before deleting anything.');
        const acknowledge=await confirmDelete(`Have you saved and opened both ${saved.filename} and ${saved.jsonFilename}? Confirm that the files are safely backed up elsewhere before proceeding.`);
        if(!acknowledge)return false;
        if(!await confirmDelete(`Delete ONLY ${label} data dated ${m}? ${live.length} verified archived records. Other departments and months must be kept.`))return false;
        if(!await confirmDelete(`FINAL IRREVERSIBLE ACTION: permanently delete ${live.length} ${label} records from ${m} in Firebase? Type confirmation follows.`))return false;
        const typed=window.prompt(`Type DELETE ${m} to authorize this month's cleanup:`);
        if(typed!==`DELETE ${m}`){status.textContent='Cleanup cancelled; no records were deleted.';return false}
        status.textContent='Deleting only verified archived monthly records…';
        const result=await window.rndCloud.deleteMonthData(key,m,mode,{expectedCount:live.length,expectedFingerprint:fingerprint});
        const remaining=await window.rndCloud.loadMonthBackup(key,m,mode);
        if(remaining.length)throw new Error(`${remaining.length} records still remain. Cleanup is incomplete; history was not marked deleted. Do not discard your archive.`);
        if(typeof opt.onDeleted==='function')await opt.onDeleted(m,result);
        await window.rndCloud.markBackupDeleted(historyId);
        status.textContent=`Verified cleanup complete: ${result.deleted} Firebase documents deleted for ${m}.`;
        await refresh();return true;
      }catch(error){status.textContent=error.message||'Cleanup failed; archive history remains open.';return false}
      finally{if(button&&button.isConnected)button.disabled=false}
    }
'''+s[end:]
# make history indicate archive pair
s=s.replace("${Number(x.count)||0} records · ${(Number(x.bytes)||0).toLocaleString('en-IN')} bytes", "${Number(x.count)||0} records · PDF ${(Number(x.bytes)||0).toLocaleString('en-IN')} bytes · JSON ${esc(x.jsonFilename||'not archived')}")
start=s.index("    host.querySelector('[data-backup-download]').onclick=")
end=s.index('await refresh();\n  }\n  window.monthBackup',start)
s=s[:start]+'''    host.querySelector('[data-backup-download]').onclick=async()=>{
      const m=month.value;if(!m)return;
      const btn=host.querySelector('[data-backup-download]');btn.disabled=true;
      try{
        status.textContent='Reading all selected monthly records from the Firebase server…';
        const data=await window.rndCloud.loadMonthBackup(key,m,mode),fingerprint=await archiveFingerprint(data);
        await document.fonts?.ready;
        const stamp=new Date().toISOString().replace(/[:.]/g,'-'),base=`DFAB-${label.replace(/[^A-Za-z0-9]+/g,'-')}-${m}-backup-${stamp}`;
        const pdf=downloadPdf(base,{label,key,month:m,exportedAt:new Date().toLocaleString('en-IN'),records:data});
        const json=downloadJson(base,data,{department:key,month:m,exportedAt:new Date().toISOString(),count:data.length,sha256:fingerprint});
        await window.rndCloud.saveBackupHistory(key,m,{filename:pdf.filename,count:data.length,bytes:pdf.bytes,jsonFilename:json.filename,fingerprint});
        status.textContent=`PDF and complete JSON archive prepared for ${data.length} records. Keep both files safely; use the separate Delete button only after checking your downloads.`;
        await refresh();
      }catch(error){status.textContent=error.message||'Backup failed. No deletion is permitted.'}
      finally{btn.disabled=false}
    };
    '''+s[end:]
s=s.replace('Download PDF backup</button>','Download PDF + Full JSON</button>')
s=s.replace('then delete that month from Firebase. Dates','then optionally delete that month from Firebase after verifying both files. Dates')
p.write_text(s)

p=Path('firebase-cloud.js');s=p.read_text()
old="b:Number(meta.bytes)||0,t:now};"
new="b:Number(meta.bytes)||0,j:String(meta.jsonFilename||'').slice(0,220),h:String(meta.fingerprint||'').slice(0,64),t:now};"
assert old in s;s=s.replace(old,new,1)
old="bytes:x.b,downloaded_at:x.t,deleted_at:x.x||0}"
new="bytes:x.b,jsonFilename:x.j||'',fingerprint:x.h||'',downloaded_at:x.t,deleted_at:x.x||0}"
assert old in s;s=s.replace(old,new,1)
# Explicit preflight tied to archive hash is supplied by backup-tools; compute in this same module as an independent guard.
old="async function deleteMonthData(key,month,mode='department'){if(!/^\\d{4}-\\d{2}$/.test(String(month)))throw new Error('Choose a valid month.');const store=await productionDatabase(),refs=[];"
new="""async function deleteMonthData(key,month,mode='department',verification={}){
    if(!/^\\d{4}-\\d{2}$/.test(String(month)))throw new Error('Choose a valid month.');
    if(!verification.expectedFingerprint||!Number.isInteger(verification.expectedCount)||verification.expectedCount<0)throw new Error('Verified archive is required before monthly cleanup.');
    const preflight=await loadMonthBackup(key,month,mode);
    const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
    const repr=JSON.stringify(preflight.map(row=>JSON.stringify(stable(row))).sort());
    if(!globalThis.crypto?.subtle)throw new Error('Secure context required for archive verification.');
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(repr))),b=>b.toString(16).padStart(2,'0')).join('');
    if(preflight.length!==verification.expectedCount||hash!==verification.expectedFingerprint)throw new Error('Archive mismatch: Firebase data changed. No records deleted.');
    const store=await productionDatabase(),refs=[];"""
assert old in s;s=s.replace(old,new,1)
p.write_text(s)
print('patched backup verification and safe delete')
