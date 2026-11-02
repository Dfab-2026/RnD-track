const fs=require('fs');
const read=f=>fs.readFileSync(f,'utf8');
const app=read('app.js'), dept=read('department-workspace.js'), leader=read('leader-center.js'), cloud=read('firebase-cloud.js'), assigned=read('assigned-tasks.js'), html=read('index.html'), css=read('leader-center.css');
const tests=[
 ['Production added without replacing Welding Qualification',app.includes("'Welding Qualification','Production','NPD'")&&dept.includes("productiondept:{name:'Production'")&&dept.includes("production:{name:'Welding Qualification'")],
 ['Production has no predefined Time Sheet task list',dept.includes('productiondept:[]')],
 ['Production uses separate internal key',dept.includes("if(n==='production')return'productiondept'")],
 ['Assign Task admin card added',leader.includes("eyebrow:'ASSIGN TASK'")&&leader.includes('assignedTasks?.openAdmin')&&css.includes('.leader-tool-assign')],
 ['Assigned task Firebase save/status/watch implemented',cloud.includes('saveAssignedTask')&&cloud.includes('updateAssignedTaskStatus')&&cloud.includes('watchAssignedTasks')&&cloud.includes("assignedTaskKind='assigned_task'")],
 ['Employee assigned-task icon and numeric badge implemented',assigned.includes('assigned-task-header-btn')&&assigned.includes('assigned-task-badge')&&assigned.includes('pending().length')],
 ['Employee can mark task completed',assigned.includes('data-complete')&&assigned.includes("updateAssignedTaskStatus(b.dataset.complete,'completed')")],
 ['Admin sees live task status',assigned.includes('assigned-task-admin-list')&&assigned.includes("t.status==='completed'?'COMPLETED':'PENDING'")],
 ['Admin chooses department and person and task text',assigned.includes('name="department"')&&assigned.includes('name="person"')&&assigned.includes('name="task"')],
 ['Assigned task icon placed by notification area',assigned.includes("container.querySelector('.notification-center-wrap')")],
 ['Changed assets cache-bumped',html.includes('assigned-tasks.js?v=226.0.0')&&html.includes('app.js?v=226.0.0')&&html.includes('department-workspace.js?v=226.0.0')&&html.includes('firebase-cloud.js?v=226.0.0')]
];
let bad=0;for(const [n,ok] of tests){console.log((ok?'PASS':'FAIL')+': '+n);if(!ok)bad++}process.exitCode=bad?1:0;
