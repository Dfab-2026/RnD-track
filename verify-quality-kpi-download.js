const fs=require('fs');
const q=fs.readFileSync('quality-review.js','utf8');
const pdf=fs.readFileSync('kpi-pdf.js','utf8');
function ok(v,m){if(!v)throw Error('FAIL: '+m)}
ok(q.includes("const members=['Navarasu','Mohan'],reportOwner='Navarasu'"),'Quality report owner is Navarasu');
ok(q.includes("people=[reportOwner]"),'KPI individual calculations use only reportOwner');
ok(q.includes("title:'Daily task completion',owner:name"),'Daily Task Completion is an individual owner KPI');
ok(q.includes("['daily_inspection','daily_documents','daily_coordination']"),'Daily Task Completion uses all three Quality daily task types');
ok(q.includes('id="downloadQualityKpiPdfBtn"'),'Quality KPI has Download PDF button');
ok(q.includes("window.downloadQualityKpiPdf?.()"),'Download button is wired');
ok(pdf.includes('function qualitySnapshot()'),'Quality snapshot uses KPI card DOM');
ok(pdf.includes("department:'QUALITY',reportTitle:'KPI Performance Report'"),'Quality PDF uses KPI report heading');
ok(pdf.includes('const model=qualitySnapshot(),pages=render(model),bytes=build(pages)'),'Quality download reuses R&D PDF render/build');
ok(pdf.includes("window.rndKpiPdf={snapshot,qualitySnapshot,render,build}"),'Shared R&D renderer remains exported');
console.log('PASS: Navarasu-only Daily Task Completion KPI and R&D-format Quality PDF download are wired');
