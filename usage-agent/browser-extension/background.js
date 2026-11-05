importScripts('config.js');
const endpoint=()=>String(USAGE_CONFIG.localEndpoint||'http://127.0.0.1:8765/browser');
async function record(){
  const state=await chrome.idle.queryState(300);if(state!=='active')return;
  const window=await chrome.windows.getLastFocused({populate:true});if(!window?.focused)return;
  const tab=(window.tabs||[]).find(item=>item.active);if(!tab?.url||!/^https?:/i.test(tab.url))return;
  const url=new URL(tab.url),now=Date.now(),app=navigator.userAgent.includes('Edg/')?'Microsoft Edge':'Google Chrome';
  const payload={member_id:Number(USAGE_CONFIG.memberId)||1,member_name:String(USAGE_CONFIG.memberName||'Kabil'),device_id:String(USAGE_CONFIG.deviceId||''),site_domain:url.hostname.replace(/^www\./,''),app_name:app,active_seconds:30,started_at:now-30000,ended_at:now};
  const response=await fetch(endpoint(),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  if(!response.ok)throw Error(`Local usage agent unavailable: ${response.status}`);
}
function ensureAlarm(){chrome.alarms.create('usage-tick',{periodInMinutes:.5});}
chrome.runtime.onInstalled.addListener(ensureAlarm);chrome.runtime.onStartup.addListener(ensureAlarm);chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name==='usage-tick')record().catch(console.error)});ensureAlarm();
