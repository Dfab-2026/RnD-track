/* Scoped offline/static regression: does not connect to or modify Firebase. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const cloud=fs.readFileSync('firebase-cloud.js','utf8');
const html=fs.readFileSync('index.html','utf8');
for(const f of ['app.js','firebase-cloud.js','department-workspace.js','leader-center.js','assigned-tasks.js'])new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});
const boot=app.slice(app.indexOf('async function bootCloud(){'),app.indexOf('\nasync function load(){'));
assert(boot.indexOf('window.rndCloud.watch(')<boot.indexOf('flushPendingCloudOps()'),'R&D must subscribe before flushing pending writes');
assert(!boot.includes('deleteMany('),'R&D startup must not automatically delete historical member records');
assert(boot.includes("setCloudRuntimeStatus('syncing')"),'R&D must distinguish connected reads from pending writes');
assert(cloud.includes('Legacy records can be decoded without rewriting them at login'),'R&D startup must not block on migration');
assert(cloud.includes('serverCollections.size===COLLECTIONS.length'),'R&D live state must wait for server confirmation');
assert(html.includes('firebase-cloud.js?v=280.0.0')&&html.includes('app.js?v=280.0.0'),'New files must bypass cached scripts');
console.log('PASS v280 R&D-only Firebase connection path and existing app syntax');
