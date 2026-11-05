const fs=require('fs'),assert=require('assert');
const leader=fs.readFileSync('leader-center.js','utf8'),cloud=fs.readFileSync('firebase-cloud.js','utf8'),help=fs.readFileSync('support-help.js','utf8'),backup=fs.readFileSync('backup-tools.js','utf8'),html=fs.readFileSync('index.html','utf8');
for(const frag of ['key:`month:${month}`','key:`week:${month}:W${w}`','member:String(person||cfg.name',"id=`kpi_${range.key.replace",'loadRndTimeOnce','leaderKpiOwner','watchDepartmentRecords','memberAccess'])assert(leader.includes(frag),'Missing admin KPI synchronization/data element: '+frag);
assert(cloud.includes('loadRndTimeOnce')&&cloud.includes('rnd_kpi_report'),'Missing R&D Time Sheet/KPI monthly backup source');
for(const frag of ['quality_records','quality_entries','quality_projects','loadMonthBackup'])assert(cloud.includes(frag));
assert(backup.includes('MONTHLY OVERVIEW')&&backup.includes('FULL MONTHLY RECORD DETAIL'));
assert(help.includes('https://wa.me/')&&help.includes('918428866121')&&help.includes('reportValidity'));
assert(html.includes('support-help.js')&&html.includes('data-dfab-help'));
console.log('v263 PASS: department KPI record parity/owner, admin current time source, monthly backup inclusion, Settings WhatsApp help');
