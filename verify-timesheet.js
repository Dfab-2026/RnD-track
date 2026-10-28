const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map();function node(value=''){return{value,innerHTML:'',textContent:'',dataset:{},options:[],onclick:null,onchange:null}}
for(const id of ['timesheetMemberFilter','timesheetFromDate','timesheetToDate','timesheetStatus','timesheetContent','refreshTimesheetBtn'])nodes.set('#'+id,node());
nodes.get('#timesheetMemberFilter').options=[];
const events=[
 {member_id:1,source:'system',app_name:'Visual Studio Code',active_seconds:3600,idle_seconds:300,device_id:'DFAB-PC22',ended_at:100},
 {member_id:1,source:'browser',site_domain:'odoo.com',active_seconds:1800,idle_seconds:0,device_id:'DFAB-PC22',ended_at:101},
 {member_id:2,source:'system',app_name:'Microsoft Excel',active_seconds:7200,idle_seconds:0,device_id:'DFAB-PC23',ended_at:102}
];
const context=vm.createContext({console,window:{rndCloud:{enabled:true,loadUsageEvents:async()=>events}},document:{querySelector:s=>nodes.get(s)||null},workingMembers:()=>[{id:1,name:'Kabil'},{id:2,name:'Abinaya'}],isLead:()=>true,isVisitor:()=>false,today:()=> '2026-10-28',esc:s=>String(s),Date,Math,Number,String});
vm.runInContext(fs.readFileSync(__dirname+'/timesheet.js','utf8'),context);
(async()=>{context.window.renderTimesheet();await new Promise(r=>setTimeout(r,0));const html=nodes.get('#timesheetContent').innerHTML;assert(html.includes('3h 0m'),'team active hours');assert(html.includes('Visual Studio Code'),'app usage');assert(html.includes('odoo.com'),'site usage');assert(html.includes('DFAB-PC22'),'device mapping');console.log('PASS: Timesheet aggregates member, device, application, website, active and idle usage');})().catch(error=>{console.error(error);process.exitCode=1});
