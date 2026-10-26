const fs=require('fs'),assert=require('assert');
const css=fs.readFileSync(__dirname+'/responsive.css','utf8');
assert(!css.includes('/* v112:'));
assert(!css.includes('@media(max-width:1279px),(max-height:760px)'));
assert(!css.includes('#settingsPage .settings-master-row{align-items:start!important}'));
assert(css.includes('@media(max-width:980px){'));
const original=fs.readFileSync(__dirname+'/styles.css','utf8');
assert(original.includes('align-items:stretch!important'));
console.log('PASS: broad v112 layout changes reverted; only mobile scroll breakpoint and conflicting Settings height override corrected');
