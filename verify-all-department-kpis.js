const fs=require('fs'),vm=require('vm');
const app=fs.readFileSync('app.js','utf8'),cloud=fs.readFileSync('firebase-cloud.js','utf8'),generic=fs.readFileSync('generic-departments.js','utf8'),html=fs.readFileSync('index.html','utf8');
const need=['Production','NPD','R&D','Outsourcing','Purchase','Stores','HR & Admin','Accounts','Finance','Maintenance','Digital Marketing','Quality','RFQ'];
for(const n of need)if(!app.includes(n))throw Error('Missing department '+n);
for(const k of ['production','npd','outsourcing','purchase','stores','hr_admin','accounts','finance','maintenance','digital_marketing','rfq'])if(!generic.includes(k+':{name:'))throw Error('Missing generic KPI definition '+k);
for(const x of ['saveDepartmentRecord','watchDepartmentRecords','deleteDepartmentRecord'])if(!cloud.includes(x))throw Error('Missing Firebase helper '+x);
for(const x of ['generic-departments.js','generic-departments.css'])if(!html.includes(x))throw Error('Missing asset '+x);
new vm.Script(generic);new vm.Script(cloud);new vm.Script(app);
console.log('PASS: 13 department gate definitions, 11 shared department KPI dashboards, Firebase isolation helpers, and assets present');
