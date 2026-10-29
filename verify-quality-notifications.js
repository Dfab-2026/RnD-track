const fs=require('fs');
const s=fs.readFileSync('quality.js','utf8');
const need=[
  'id="qBellBadge" class="notification-badge hidden"',
  'function qualityPendingSummary()',
  'MY PENDING','TEAM PENDING','function showQualityPendingPopup()',"dialog.id='qPendingDialog'",
  "notifyUser('Quality Track · My Pending'",'data-q-notice=','data-q-popup=','updateQualityNotificationBadge()','maybeTriggerQualityNotification()'
];
for(const x of need){if(!s.includes(x)){console.error('FAIL missing:',x);process.exit(1)}}
if(!s.includes('function qualityExpectedDailyPending()'))(console.error('FAIL: missing daily pending synthesis'),process.exit(1));
if(!s.includes("missing_idea_${date}_navarasu"))(console.error('FAIL: Navarasu idea pending notification missing'),process.exit(1));
if(!s.includes("missing_${task.kind}_${date}_navarasu"))(console.error('FAIL: shared Navarasu daily task pending notification missing'),process.exit(1));
if(!s.includes('mohan_daily_task_update_'))(console.error('FAIL: Mohan Daily Task Update pending notification missing'),process.exit(1));
console.log('PASS: Quality notification badge/popup follows Navarasu-owned work and Mohan Daily Task Update responsibility');
