const fs=require('fs');const assert=require('assert');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const css=fs.readFileSync(__dirname+'/mobile-optimization-v285.css','utf8');
const responsive=fs.readFileSync(__dirname+'/responsive.css','utf8');
const stylesheetTags=[...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m=>m[1]);
assert(stylesheetTags.includes('responsive.css?v=285.0.0'),'Base mobile layout stylesheet must load');
assert(stylesheetTags.at(-1)==='mobile-optimization-v285.css?v=285.0.0','Mobile corrections must take precedence');
assert(html.includes('responsive.js?v=285.0.0'),'Mobile navigation controller missing');
for(const width of ['980px','600px','380px'])assert(css.includes(`max-width: ${width}`),`Missing ${width} breakpoint`);
for(const path of ['#appShell','#qualityWorkspace','#departmentWorkspace','#leaderCenter','#assignedTaskAdminCenter'])assert(css.includes(path),`Missing ${path} layout coverage`);
assert(css.includes('overflow-x:hidden!important'),'Mobile Kaizen overflow guard missing');
assert(responsive.includes('.mobile-nav-backdrop'),'Mobile sidebar backdrop styles missing');
for(const asset of stylesheetTags){const f=asset.split('?')[0];assert(fs.existsSync(__dirname+'/'+f),`Missing ${f}`)}
console.log('PASS v285: responsive styles actually loaded, three width breakpoints, all major workspaces, non-scrolling mobile Kaizen and navigation');
