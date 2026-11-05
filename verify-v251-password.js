/* Verifies the non-R&D member credential save path with a deterministic Firestore mock.
 * Does not connect to, write to, or modify a live Firebase project. */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/firebase-cloud.js','utf8');
const start=src.indexOf('  const accessMemberId='),end=src.indexOf('  async function deleteDepartmentMember(',start);
assert.ok(start>=0&&end>start,'member save implementation found');
let writes=[],flushes=0,remembered=[],failWrite=false;
const fakeDoc=id=>({id,set:async(payload)=>{if(failWrite){const e=new Error('Missing or insufficient permissions');e.code='permission-denied';throw e}writes.push({id,payload})}});
const store={collection:()=>({where:()=>({get:async()=>({docs:[]})}),doc:fakeDoc})};
const ctx={window:{memberPasswordSession:{remember:(...args)=>remembered.push(args)}},console,
 productionDatabase:async()=>store,departmentKey:k=>String(k).toLowerCase(),
 withWriteRetry:async(fn)=>fn(),flushPendingWrites:async()=>{flushes++},
 createPasswordCredential:async()=>({password_hash:'hashed-not-plaintext',password_salt:'random-salt'}),
};
vm.runInNewContext(src.slice(start,end)+'\nthis.saveDepartmentMember=saveDepartmentMember;',ctx);
(async()=>{
 const saved=await ctx.saveDepartmentMember('purchase',{name:'Test Operator',role:'lead',password:'ExamplePassword@765'});
 assert.equal(saved.department,'purchase');assert.equal(saved.name,'Test Operator');assert.equal(saved.role,'lead');
 assert.equal(saved.has_password,true);assert.equal(writes.length,1);assert.equal(flushes,1);
 assert.equal(writes[0].payload.h,'hashed-not-plaintext');assert.equal(writes[0].payload.s,'random-salt');
 assert.ok(!JSON.stringify(writes[0]).includes('ExamplePassword@765'),'plaintext password never written');
 assert.equal(remembered.length,1);
 failWrite=true;
 await assert.rejects(()=>ctx.saveDepartmentMember('purchase',{name:'Another User',role:'member',password:'ExamplePassword@123'}),/permission/i);
 assert.equal(writes.length,1,'failed write is not treated as saved');
 console.log('PASS: Non-R&D password save awaits Firebase write, flushes pending writes, hashes password, and surfaces denied writes');
})().catch(e=>{console.error(e);process.exitCode=1});
