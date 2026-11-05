// Read-only structural check. Does not touch Firebase or department logic.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = __dirname;
const must = ['index.html', 'app.js', 'firebase-cloud.js', 'firebase-config.js',
  'leader-center.js', 'admin-navigation-v275.css', 'vercel.json',
  'firebase.json', 'firestore.rules', 'assets/dfab-logo.png'];
for (const name of must) assert(fs.existsSync(path.join(root, name)), `Missing ${name}`);
assert(!fs.existsSync(path.join(root, 'v227_work')), 'Old v227_work duplicate is still present');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m => m[1]);
for (const ref of refs) {
  if (/^(https?:|#|data:|mailto:|tel:)/.test(ref)) continue;
  const rel = decodeURIComponent(ref.split('?')[0].split('#')[0]);
  assert(fs.existsSync(path.join(root, rel)), `Missing referenced asset: ${rel}`);
}
assert(html.includes('admin-navigation-v275.css'), 'Admin stylesheet not loaded');
const css = fs.readFileSync(path.join(root, 'admin-navigation-v275.css'), 'utf8');
assert(css.includes('body.leader-center-active #sidebar'), 'Admin sidebar scoped selector missing');
console.log(`PASS: one website root, ${refs.length} HTML assets checked, admin CSS linked, Firebase files present.`);
