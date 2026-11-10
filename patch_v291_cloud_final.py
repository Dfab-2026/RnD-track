from pathlib import Path
p=Path('firebase-cloud.js');s=p.read_text()
# Store all department R&D records, including those saved via shared app_meta route, in the archive.
old="rows=rows.concat(time,reportMonthRows)}else rows="
new="""const shared=await loadDepartmentRecordsOnce('rnd');
    rows=rows.concat(time,reportMonthRows,shared.filter(row=>rowInMonth(row,month)).map(row=>({source:'rnd_shared_records',...row})))}else rows="""
assert old in s;s=s.replace(old,new,1)
# Include R&D KPI (app_meta) and shared R&D records in the same scoped deletion.
old="const projectSnap=await store.collection('projects').get({source:'server'});for(const doc of projectSnap.docs)"
new="""const reportSnap=await store.collection('app_meta').where('kind','==','kpi_entry').get({source:'server'});
      reportSnap.docs.forEach(doc=>{const row={id:doc.id,...doc.data()},timestamp=Number(row.updated_at),updated=timestamp?new Date(timestamp).toISOString().slice(0,7):String(row.updated_at||'').slice(0,7);if(updated===month||String(row.key||'').includes(month))refs.push(doc.ref)});
      const sharedSnap=await store.collection('app_meta').where('kind','==','department_rnd_record').get({source:'server'});
      sharedSnap.docs.forEach(doc=>{if(rowInMonth(decodeDepartmentRecord(doc),month))refs.push(doc.ref)});
      const projectSnap=await store.collection('projects').get({source:'server'});for(const doc of projectSnap.docs)"""
assert old in s;s=s.replace(old,new,1)
# Restrict destructive operation to completed historical work; keep unfinished assigned tasks.
old="const store=await productionDatabase(),refs=[];if(mode==='quality')"
new="""if(preflight.some(row=>row.source==='assigned_tasks'&&row.status!=='completed'))throw new Error('Unfinished tasks exist in this month. Resolve or move them before archiving/deleting; nothing has been deleted.');
    const store=await productionDatabase(),refs=[];if(mode==='quality')"""
assert old in s;s=s.replace(old,new,1)
# Validate R&D projects have no cross-month embedded time entries before any writes or deletions.
old="const projectSnap=await store.collection('projects').get({source:'server'});for(const doc of projectSnap.docs){const row=decode('projects',doc.data()||{},doc.id);"
new="""const projectSnap=await store.collection('projects').get({source:'server'});
      for(const doc of projectSnap.docs){const row=decode('projects',doc.data()||{},doc.id);if(rndRowInMonth(row,month)&&(row.time_entries||[]).some(t=>String(t?.date||'').slice(0,7)!==month))throw new Error('Cross-month project time entries detected. No month records deleted; export remains available.');}
      for(const doc of projectSnap.docs){const row=decode('projects',doc.data()||{},doc.id);"""
assert old in s;s=s.replace(old,new,1)
p.write_text(s)
print('R&D report+shared archive/delete scope and safety preflight updated')
