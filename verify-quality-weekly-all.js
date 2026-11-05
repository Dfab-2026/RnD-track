const fs=require("fs");
const src=fs.readFileSync("quality-review.js","utf8");
const css=fs.readFileSync("quality-review.css","utf8");
const checks=[];
checks.push(["department ALL controls", src.includes('data-qw-all="${kind}"') && !src.includes('data-qw-all="training_status"')]);
checks.push(["bulk handler", src.includes("completeAllDepartments") && src.includes("status:'completed'")]);
checks.push(["all departments iteration", src.includes("for(const dept of depts())")]);
checks.push(["Navarasu owner", src.includes("person:reportOwner")]);
checks.push(["editable individual status", src.includes("form.elements.status.onchange=sync") && src.includes('value="pending"')]);
checks.push(["pending remarks required", src.includes("form.elements.remarks.required=!done")]);
checks.push(["training dedicated record card", src.includes('q-training-record-card') && !src.includes("departmentBoard('training_status',span)" )]);
checks.push(["Firebase bulk save", src.includes("await save(row,id)" )]);
checks.push(["bulk UI styling", css.includes(".q-all-complete") && css.includes(".q-weekly-head-actions")]);
const failed=checks.filter(x=>!x[1]);
if(failed.length){console.error("FAIL:",failed.map(x=>x[0]).join(", "));process.exit(1)}
console.log("PASS: Audit/KPI ALL COMPLETE controls remain; Training uses its own saved-record card");
