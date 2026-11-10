from pathlib import Path
p=Path('firebase-cloud.js');s=p.read_text()
old="b:Number(meta.bytes)||0,t:now});"
new="b:Number(meta.bytes)||0,j:String(meta.jsonFilename||'').slice(0,220),h:String(meta.fingerprint||'').slice(0,64),t:now});"
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
