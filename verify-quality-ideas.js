const fs=require('fs'),vm=require('vm');
const context={window:{},console};
vm.createContext(context);
vm.runInContext(fs.readFileSync('quality-ideas.js','utf8'),context);
const validate=context.window.qualityIdeas.validate;
let failed=false;
function expectPass(row,label){try{validate(row);console.log('PASS:',label)}catch(error){failed=true;console.error('FAIL:',label,error.message)}}
function expectFail(row,label){try{validate(row);failed=true;console.error('FAIL:',label,'was accepted')}catch{console.log('PASS:',label)}}
const base={person:'Navarasu',problem:'Observed a recurring inspection delay',idea:'Use a pre-check list',priority:'Medium'};
expectPass(base,'R&D-style required fields accept a Quality idea without an optional benefit');
expectPass({...base,person:'Mohan',priority:'Critical'},'both Quality members and R&D priorities are accepted');
expectFail({...base,problem:''},'blank problem is blocked');
expectFail({...base,person:'Other'},'non-Quality member is blocked');
expectFail({...base,priority:'Urgent'},'unknown priority is blocked');
console.log(failed?'VERIFY FAILED':'VERIFY PASSED');
process.exit(failed?1:0);
