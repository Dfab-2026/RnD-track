const assert=require('assert');
const fs=require('fs');

const rnd=fs.readFileSync(__dirname+'/time-consume.js','utf8');
const quality=fs.readFileSync(__dirname+'/quality-time.js','utf8');
const shared=fs.readFileSync(__dirname+'/department-workspace.js','utf8');
const review=fs.readFileSync(__dirname+'/quality-review.js','utf8');

for(const [name,source] of [['R&D',rnd],['Quality',quality],['Shared departments',shared]]){
  assert(source.includes('tc-clock-field'),`${name}: From/To clock controls should render`);
  assert(source.includes('data-rnd-clock')||source.includes('data-qt-clock')||source.includes('data-d-clock'),`${name}: time-picker buttons should render`);
  assert(source.includes('input.onclick')&&source.includes('b.onclick'),`${name}: both time field and picker button should open the clock`);
  assert(source.includes('From</b>')&&source.includes('To</b>'),`${name}: saved cards should show full From/To times`);
  assert(source.includes('type="submit"')||source.includes('button class="primary-btn">Save</button>'),`${name}: save control should submit the entry form`);
  assert(source.includes('onsubmit=save')||source.includes('onsubmit=saveTime'),`${name}: entry form should have a save handler`);
  assert(source.includes('FilterDate')||source.includes('dFilterDate'),`${name}: saved records should have a date filter`);
  assert(source.includes('ClearFilters')||source.includes('dClearFilters'),`${name}: saved-record filters should have a clear action`);
}

assert(rnd.includes("input.dispatchEvent(new Event('input',{bubbles:true}))")&&rnd.includes("input.dispatchEvent(new Event('change',{bubbles:true}))"),'R&D picker must commit selected times to the form');
assert(quality.includes('window.rndTimeConsume.minutes(to)-window.rndTimeConsume.minutes(from)'),'Quality duration must use selected From/To times');
assert(quality.includes("value.startsWith('qt')?value:'qt'+value")&&quality.includes('const input=$(b.dataset.qtClock)'),'Quality clock buttons must resolve their full qtFrom/qtTo element IDs');
assert(shared.includes('minutes=mins(to)-mins(from)'),'Shared department duration must use selected From/To times');
assert(rnd.includes('mins<=0')&&quality.includes('minutes<=0')&&shared.includes('minutes<=0'),'all Time Sheets must reject reverse or zero-length periods');
assert(rnd.includes('rtcClearFilters')&&quality.includes('ClearFilters')&&shared.includes('dClearFilters'),'all Time Sheet filter clear buttons must be wired');
assert(review.includes('id="qrPeriod"')&&review.includes('id="qrWeek"')&&review.includes("host.querySelector('#'+id).onchange=()=>")&&review.includes("period=host.querySelector('#qrPeriod').value"),'Quality KPI weekly/monthly period controls must refresh the report');
console.log('PASS: R&D, Quality and shared Time Sheet clock, save, period validation and filter controls are wired.');
