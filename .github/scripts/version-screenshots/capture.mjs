// Usage: node capture.mjs <cdp-port> <out-dir> <tag> <expected.json>
// Clicks only the welcome-page dismissal and sidebar navigation; never acts on a resource.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
const [port, out, tag, expectedFile] = process.argv.slice(2);
const expected = JSON.parse(readFileSync(expectedFile, 'utf8'));
mkdirSync(out, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 90 && !target; i++) {
  try {
    const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    target = l.find(t => t.type === 'page' && !t.url.startsWith('devtools://') && t.url !== 'about:blank');
  } catch {}
  if (!target) await sleep(1000);
}
if (!target) { console.log(JSON.stringify({ ok: false, reason: 'no-cdp-target' })); process.exit(3); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pend = new Map();
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
const size = h => send('Emulation.setDeviceMetricsOverride', { width: 1400, height: h, deviceScaleFactor: 1, mobile: false });
await size(900);
const shot = async name => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${out}/${name}.png`, Buffer.from(r.result.data, 'base64')); };
const text = async () => (await ev(`document.body ? document.body.innerText : ''`)) || '';
const nav = label => ev(`(()=>{const l=${JSON.stringify(label)};const h={Dashboard:'/',Containers:'/containers',Images:'/images'}[l];
 const e=document.querySelector('a[aria-label="'+l+'"]')||document.querySelector('a[href="'+h+'"]')||document.querySelector('a[href="#'+h+'"]');
 if(e){e.click();return true}return false})()`);
const res = { tag, url: target.url, ok: false };
// App shell, dismissing the welcome page when shown
const t0 = Date.now(); let ready = false;
while (Date.now() - t0 < 120000) {
  await ev(`(()=>{const b=[...document.querySelectorAll('button')].find(e=>/Go to Podman Desktop/i.test(e.innerText||''));if(b)b.click()})()`);
  ready = await ev(`!!document.querySelector('a[aria-label="Containers"],a[href="/containers"],a[href="#/containers"]')`);
  if (ready && !/Go to Podman Desktop/i.test(await text())) break;
  ready = false; await sleep(1000);
}
if (!ready) { await shot('no-shell'); res.reason = 'no-shell'; res.bodyText = (await text()).slice(0, 400); console.log(JSON.stringify(res)); process.exit(4); }
const noEngine = /No Container Engine/i;
const has = list => t => list.some(n => t.includes(n));
const checks = {
  containers: async () => { const t = await text(); return !noEngine.test(t) && has(expected.containers)(t); },
  images: async () => { const t = await text(); return !noEngine.test(t) && has(expected.images)(t); },
  // A standalone state line, as rendered in the provider card; banner sentences mentioning "running" cannot match.
  dashboard: async () => { const t = await text(); return /podman/i.test(t) && /^\s*(RUNNING|Running)\s*$/m.test(t); },
};
const pages = [['Containers', 'containers'], ['Images', 'images'], ['Dashboard', 'dashboard']];
let all = true;
for (const [label, name] of pages) {
  const r = (res[name] = { nav: await nav(label), data: false, stable: false });
  const start = Date.now();
  while (Date.now() - start < 180000) { if (await checks[name]()) { r.data = true; break; } await sleep(1000); if (!r.nav) r.nav = await nav(label); }
  r.waitSeconds = Math.round((Date.now() - start) / 1000);
  // Same text for 5 seconds, so rows have finished loading
  let last = await text(), since = Date.now(); const s2 = Date.now();
  while (Date.now() - s2 < 30000) { await sleep(500); const t = await text(); if (t !== last) { last = t; since = Date.now(); } else if (Date.now() - since >= 5000) { r.stable = true; break; } }
  // Remote banner images load slowly on a poor network; give them time, then record what is still missing
  const s3 = Date.now(); let pending = 0;
  while (Date.now() - s3 < 45000) { pending = await ev(`[...document.images].filter(i=>!i.complete).length`); if (!pending) break; await sleep(1000); }
  r.imagesPending = pending;
  await ev(`document.activeElement && document.activeElement.blur()`);
  await sleep(300);
  await shot(name);
  if (!r.data) { r.text = last.slice(0, 300); all = false; }
}
let v = await ev(`(async()=>{try{return await window.getPodmanDesktopVersion?.()}catch{return null}})()`);
if (!v) v = ((await text()).match(/v(\d+\.\d+\.\d+\S*)/) || [])[1];
res.version = v || null;
const want = tag.replace(/^v/, '');
res.versionMatch = res.version === want;
res.ok = all && res.versionMatch;
if (!res.ok) res.reason = !all ? 'data-check-failed' : 'version-mismatch';
console.log(JSON.stringify(res));
process.exit(res.ok ? 0 : 5);
