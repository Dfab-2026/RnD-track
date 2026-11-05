const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const expected="const DEPARTMENT_ADMIN_NAMES=['Kabil','Suresh Kumar','Pramod Kumar','Jithendra Babu'];";
if(!app.includes(expected))throw new Error('Admin allowlist does not include Jithendra Babu exactly once in the expected list.');
console.log('verify-v224-admin-jithendra: PASS');
