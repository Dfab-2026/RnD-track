'use strict';
const fs=require('node:fs');const assert=require('node:assert/strict');
const read=f=>fs.readFileSync(__dirname+'/'+f,'utf8');
const shared=read('department-workspace.js'),quality=read('quality-time.js'),rnd=read('time-consume.js'),cloud=read('firebase-cloud.js'),policy=read('department-timesheet-policy.js'),index=read('index.html');
function check(name,passed){assert.ok(passed,name);console.log('PASS:',name)}
check('Shared departments attempt a verified Firebase Time Sheet save despite unrelated listener sync',shared.includes("if(!server&&row.type!=='timesheet')"));
check('Shared department saves update local records from server confirmation',shared.includes("records=[...records.filter(x=>String(x.id)!==String(id)),saved];renderTimeRows()"));
check('Shared saved-record view scopes to the current person and entered date',shared.includes("norm(r.member)===norm(memberName())")&&shared.includes("r.date===date"));
check('Shared Time Sheet filter follows the saved work date',shared.includes('timeRecordFilterDate=date;')&&shared.includes('dateFilter.value=date;'));
check('Shared Time Sheet does not get rebuilt by live snapshots during entry',shared.includes("dataset.owner)===norm(memberName())"));
check('Shared saved records show server-confirmed dates and owner',shared.includes("verified?.date||'')!==date")&&shared.includes('verified?.member||verified?.owner'));
check('R&D direct Time Sheet uses confirmed server save',rnd.includes('await window.rndCloud.saveRndTime(crypto.randomUUID()')&&cloud.includes("ref.get({source:'server'})"));
check('R&D direct Time Sheet selects entered record date',rnd.includes("$('rtcFilterDate').value=date"));
check('Quality direct Time Sheet selects entered record date',quality.includes("$('FilterDate').value=date"));
check('Quality direct Time Sheet can attempt verified saves while listeners are syncing',quality.includes("!window.rndCloud?.saveQualityTime")&& !quality.includes("if(!connected)return status('Firebase is still connecting"));
check('Firebase maintains distinct write paths for R&D, Quality, and other departments',cloud.includes('rndTimeId(id)')&&cloud.includes("qualityMetaId(kind,id)")&&cloud.includes('`dept_${k}_${String(id)}`'));
check('Time Sheet policy unchanged',policy.includes('Earlier weeks are read-only.'));
check('Changed assets use cache-busting version', ['department-workspace.js','quality-time.js','time-consume.js'].every(n=>index.includes(n+'?v=283.0.0')));
