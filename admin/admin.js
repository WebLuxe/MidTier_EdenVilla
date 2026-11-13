/* ==========================================================================
   WebLuxe admin panel. Runs on the same GitHub Pages site as the website.
   - Sign in with a GitHub key for this site's repository (each staff member
     can have their own), or try it in demo mode (changes stay on this device).
   - Edits are saved to data/site.js in the repository and laid over config.js,
     so the website changes about a minute after "Publish".
   - "Preview" opens the website with the unpublished changes on this device.
   - Inbox (Mid and High): booking requests and messages, kept in a Google
     Sheet (see inbox.gs). The read key never leaves this device.
   Which screens appear is set by ADMIN (the tier's own part, below this file).
   ========================================================================== */
(() => {
'use strict';
const BASE = window.SITE || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clone = (o) => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
const LANGS = (BASE.languages && BASE.languages.length ? BASE.languages : ['en']);
const LNAME = { en: 'English', it: 'Italiano', fr: 'Français', de: 'Deutsch', es: 'Español' };
const REPO = (BASE.admin && BASE.admin.repo) || '';
const BRANCH = (BASE.admin && BASE.admin.branch) || 'main';
const PREVIEW_KEY = 'wl-preview:' + (REPO || BASE.name);
const store = { get: (k, s) => { try { return (s ? sessionStorage : localStorage).getItem(k); } catch { return null; } }, set: (k, v, s) => { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch { /* full or private */ } }, del: (k) => { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch { /* fine */ } } };
const merge = (a, b) => { if (b === undefined) return a; if (b === null || typeof b !== 'object' || Array.isArray(b)) return b; const o = { ...(a && typeof a === 'object' && !Array.isArray(a) ? a : {}) }; for (const k of Object.keys(b)) o[k] = merge(o[k], b[k]); return o; };

const A = { mode: null, token: '', user: null, edits: clone(window.SITE_EDITS || {}) || {}, sha: null, dirty: false, tab: null, inbox: null };
const view = () => merge(BASE, A.edits);
const getIn = (o, p) => p.reduce((v, k) => (v == null ? undefined : v[k]), o);
const get = (p) => getIn(view(), p);
/** Arrays are saved whole: the first time anything inside a list changes, the current list is copied into the edits. */
function set(p, value) {
  for (let i = 1; i < p.length; i++) if (Array.isArray(get(p.slice(0, i))) && !Array.isArray(getIn(A.edits, p.slice(0, i)))) put(A.edits, p.slice(0, i), clone(get(p.slice(0, i))));
  put(A.edits, p, value);
  changed();
}
function put(o, p, v) {
  let cur = o;
  for (let i = 0; i < p.length - 1; i++) {
    const k = p[i], nextIsIndex = typeof p[i + 1] === 'number';
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = typeof cur[k] === 'string' && !nextIsIndex ? { [LANGS[0]]: cur[k] } : (nextIsIndex ? [] : {});
    cur = cur[k];
  }
  cur[p[p.length - 1]] = v;
}
let saveT;
function changed() {
  A.dirty = true; status();
  clearTimeout(saveT);
  saveT = setTimeout(() => { store.set(PREVIEW_KEY, JSON.stringify(A.edits)); store.set(PREVIEW_KEY + ':draft', JSON.stringify({ edits: A.edits, at: Date.now() })); }, 300);
}

/* ---------- GitHub ---------- */
async function gh(method, url, body) {
  const r = await fetch('https://api.github.com' + url, { method, headers: { Authorization: 'Bearer ' + A.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  if (!r.ok) { let m = ''; try { m = (await r.json()).message; } catch { /* fine */ } const e = new Error(m || 'GitHub error ' + r.status); e.status = r.status; throw e; }
  return r.status === 204 ? null : r.json();
}
const b64 = (str) => { const bytes = new TextEncoder().encode(str); let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (b) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g, '')), (c) => c.charCodeAt(0)));
const parseData = (txt) => { const m = String(txt).match(/SITE_EDITS\s*=\s*([\s\S]*?);?\s*$/); return m ? JSON.parse(m[1]) : {}; };
async function loadFromRepo() {
  try {
    const f = await gh('GET', `/repos/${REPO}/contents/data/site.js?ref=${encodeURIComponent(BRANCH)}`);
    A.sha = f.sha; A.edits = parseData(unb64(f.content));
  } catch (e) { if (e.status === 404) { A.sha = null; A.edits = {}; } else throw e; }
  A.dirty = false;
}
async function putFile(path, contentB64, message, sha) {
  return gh('PUT', `/repos/${REPO}/contents/${path}`, { message, content: contentB64, branch: BRANCH, ...(sha ? { sha } : {}) });
}
async function publish() {
  if (A.mode === 'demo') { toast('Demo mode: nothing is published. Your changes stay on this device; use Preview to see them on the site.', 'info'); return; }
  const btn = $('[data-publish]'); btn.disabled = true; btn.textContent = 'Publishing…';
  try {
    // photos added on this device are uploaded first, then the edits point at them
    const uploads = [];
    const walk = (o) => { if (!o || typeof o !== 'object') return; for (const k of Object.keys(o)) { const v = o[k]; if (k === 'src' && typeof v === 'string' && v.startsWith('data:image/')) uploads.push(o); else walk(v); } };
    walk(A.edits);
    let n = 0;
    for (const o of uploads) {
      const name = `assets/photos/upload-${Date.now().toString(36)}-${++n}.jpg`;
      btn.textContent = `Uploading photo ${n} of ${uploads.length}…`;
      await putFile(name, o.src.split(',')[1], `Admin: add photo ${name.split('/').pop()}`);
      o.src = name;
    }
    const body = `/* Saved from the admin panel${A.user ? ' by ' + A.user.login : ''} on ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC.\n   These values are laid over config.js. Edit them in /admin/, or delete this file to go back to config.js. */\nwindow.SITE_EDITS = ${JSON.stringify(A.edits, null, 2)};\n`;
    let r;
    try { r = await putFile('data/site.js', b64(body), `Admin: update website content${A.user ? ' (' + A.user.login + ')' : ''}`, A.sha); }
    catch (e) { if (e.status !== 409 && e.status !== 422) throw e; const f = await gh('GET', `/repos/${REPO}/contents/data/site.js?ref=${encodeURIComponent(BRANCH)}`); r = await putFile('data/site.js', b64(body), 'Admin: update website content', f.sha); }
    A.sha = r.content.sha; A.dirty = false;
    store.set(PREVIEW_KEY, JSON.stringify(A.edits)); store.del(PREVIEW_KEY + ':draft');
    status(); render();
    toast('Published. The website shows the changes in about a minute.', 'ok');
  } catch (e) { toast('Could not publish: ' + e.message, 'err'); }
  finally { btn.disabled = false; btn.textContent = 'Publish'; }
}

/* ---------- photos: made smaller on this device before upload ---------- */
function readPhoto(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = rej;
    fr.onload = () => { const im = new Image(); im.onerror = rej; im.onload = () => { const k = Math.min(1, 1800 / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.82)); }; im.src = fr.result; };
    fr.readAsDataURL(file);
  });
}
const srcOf = (src) => { src = (src && src.src) || src || ''; if (/^(https?:|data:)/.test(src)) return /images\.unsplash\.com/.test(src) ? src.replace(/([?&])w=\d+/, '$1') + (src.includes('?') ? '&' : '?') + 'w=400' : src; return '../' + src; };
const tx = (v) => (v && typeof v === 'object' ? (v[LANGS[0]] ?? v.en ?? Object.values(v)[0] ?? '') : (v ?? ''));

/* ---------- fields ---------- */
const P = (p) => esc(JSON.stringify(p));
const ICONS = ['bed', 'users', 'home', 'pool', 'wave', 'wifi', 'coffee', 'snow', 'lock', 'leaf', 'sun', 'heart', 'car', 'plane', 'anchor', 'compass', 'tag', 'check', 'calendar', 'clock', 'sparkle', 'fish', 'bag', 'globe', 'ruler', 'star', 'wa', 'info', 'shield', 'camera'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function field(f, base = []) {
  const p = [...base, ...(Array.isArray(f.path) ? f.path : String(f.path ?? f.key).split('.').map((k) => (/^\d+$/.test(k) ? +k : k)))];
  const v = get(p);
  const lab = f.label ? `<span class="lb">${esc(f.label)}${f.help ? `<small>${esc(f.help)}</small>` : ''}</span>` : '';
  const area = f.type === 'area' || f.type === 'areaPlain';
  switch (f.type) {
    case 'text': case 'area': {
      if (f.plain) return `<label class="fl">${lab}${area ? `<textarea data-p="${P(p)}" rows="3">${esc(v)}</textarea>` : `<input data-p="${P(p)}" value="${esc(v)}">`}</label>`;
      return `<div class="fl">${lab}<div class="langs">${LANGS.map((l) => { const val = v && typeof v === 'object' ? v[l] : (l === LANGS[0] ? v : ''); return `<label class="lg"><i>${l.toUpperCase()}</i>${area ? `<textarea data-p="${P([...p, l])}" rows="3" lang="${l}" aria-label="${esc(f.label)} (${LNAME[l] || l})">${esc(val)}</textarea>` : `<input data-p="${P([...p, l])}" lang="${l}" value="${esc(val)}" aria-label="${esc(f.label)} (${LNAME[l] || l})">`}</label>`; }).join('')}</div></div>`;
    }
    case 'string': return `<label class="fl">${lab}<input data-p="${P(p)}" value="${esc(v)}"${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}${f.inputmode ? ` inputmode="${f.inputmode}"` : ''}></label>`;
    case 'number': return `<label class="fl fl-n">${lab}<span class="num">${f.prefix ? `<em>${esc(f.prefix)}</em>` : ''}<input type="number" data-p="${P(p)}" data-num value="${esc(v ?? '')}" step="${f.step || 1}" min="${f.min ?? 0}"${f.max != null ? ` max="${f.max}"` : ''}>${f.suffix ? `<em>${esc(f.suffix)}</em>` : ''}</span></label>`;
    case 'select': return `<label class="fl">${lab}<select data-p="${P(p)}">${f.options.map((o) => { const [val, txt] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}"${String(v) === String(val) ? ' selected' : ''}>${esc(txt)}</option>`; }).join('')}</select></label>`;
    case 'icon': return `<label class="fl fl-ic">${lab}<select data-p="${P(p)}">${ICONS.map((o) => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select></label>`;
    case 'toggle': return `<label class="tg"><input type="checkbox" data-p="${P(p)}" data-bool${f.invert ? ' data-invert' : ''}${(f.invert ? v === false : v !== false) ? ' checked' : ''}><span></span>${esc(f.label)}</label>`;
    case 'md': {
      const [m, d] = String(v || '01-01').split('-').map(Number);
      return `<div class="fl fl-md">${lab}<span><select data-p="${P(p)}" data-md="d" aria-label="Day">${Array.from({ length: 31 }, (_, i) => `<option${i + 1 === d ? ' selected' : ''}>${i + 1}</option>`).join('')}</select><select data-p="${P(p)}" data-md="m" aria-label="Month">${MONTHS.map((x, i) => `<option value="${i + 1}"${i + 1 === m ? ' selected' : ''}>${x}</option>`).join('')}</select></span></div>`;
    }
    case 'image': {
      const im = v && typeof v === 'object' ? v : { src: v || '' };
      return `<div class="fl">${lab}<div class="img1">${im.src ? `<img src="${esc(srcOf(im.src))}" alt="">` : '<span class="noimg">No photo</span>'}<div><label class="btn btn-s">Change photo<input type="file" accept="image/*" data-img="${P(p)}" hidden></label>${field({ type: 'text', label: 'Description (for Google and blind visitors)' }, [...p, 'alt'])}</div></div></div>`;
    }
    case 'images': {
      const list = Array.isArray(v) ? v : [];
      return `<div class="fl">${lab}<ul class="imgs">${list.map((im, i) => `<li><img src="${esc(srcOf(im))}" alt="" loading="lazy"><div class="ia">${i ? `<button type="button" class="ib" data-act="up" data-p="${P(p)}" data-i="${i}" aria-label="Move earlier">↑</button>` : ''}${i < list.length - 1 ? `<button type="button" class="ib" data-act="down" data-p="${P(p)}" data-i="${i}" aria-label="Move later">↓</button>` : ''}<button type="button" class="ib ib-del" data-act="del" data-p="${P(p)}" data-i="${i}" aria-label="Remove photo">✕</button></div><details><summary>Details</summary>${field({ type: 'text', label: 'Description' }, [...p, i, 'alt'])}${(f.extra || []).map((x) => field(x, [...p, i])).join('')}</details></li>`).join('')}
        <li class="add"><label>＋ Add photos<input type="file" accept="image/*" multiple data-imgs="${P(p)}" hidden></label></li></ul></div>`;
    }
    case 'dates': {
      const list = (Array.isArray(v) ? v : []).map((r, i) => ({ r, i })).sort((a, b) => String(a.r[0]).localeCompare(String(b.r[0])));
      const today = new Date().toISOString().slice(0, 10);
      const nights = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 864e5));
      return `<div class="fl">${lab}<p class="hint">Each line is a stay: the first night and the day the guests leave (that morning is free again). These nights are crossed out in the website's calendar.</p>
        <ul class="dates">${list.map(({ r, i }) => `<li class="${r[1] && r[1] <= today ? 'past' : ''}"><label><span>From</span><input type="date" data-p="${P([...p, i, 0])}" value="${esc(r[0])}"></label><label><span>To</span><input type="date" data-p="${P([...p, i, 1])}" value="${esc(r[1])}"></label><label class="dn"><span>Note (not shown on the site)</span><input data-p="${P([...p, i, 2])}" value="${esc(r[2] || '')}" placeholder="Guest name, booking ref…"></label><em>${nights(r[0], r[1])} nights</em><button type="button" class="ib ib-del" data-act="del" data-p="${P(p)}" data-i="${i}" aria-label="Remove">✕</button></li>`).join('') || '<li class="empty">No nights blocked yet.</li>'}</ul>
        <p class="row"><button type="button" class="btn btn-s" data-act="addDates" data-p="${P(p)}">＋ Block dates</button>${list.some(({ r }) => r[1] && r[1] <= today) ? `<button type="button" class="btn btn-s btn-q" data-act="clearPast" data-p="${P(p)}">Remove past stays</button>` : ''}</p></div>`;
    }
    case 'list': {
      const list = Array.isArray(v) ? v : [];
      const itemHead = (it, i) => esc((f.title && f.title(it, i)) || `${f.itemLabel || 'Item'} ${i + 1}`);
      return `<div class="fl fl-list">${lab}<ol class="items">${list.map((it, i) => `<li><details${f.open || list.length === 1 ? ' open' : ''}><summary><b>${itemHead(it, i)}</b><span class="ia">${i ? `<button type="button" class="ib" data-act="up" data-p="${P(p)}" data-i="${i}" aria-label="Move up">↑</button>` : ''}${i < list.length - 1 ? `<button type="button" class="ib" data-act="down" data-p="${P(p)}" data-i="${i}" aria-label="Move down">↓</button>` : ''}<button type="button" class="ib ib-del" data-act="del" data-p="${P(p)}" data-i="${i}" aria-label="Remove">✕</button></span></summary>
        <div class="sub">${f.item ? field({ ...f.item, path: [] }, [...p, i]) : f.fields.map((x) => field(x, [...p, i])).join('')}</div></details></li>`).join('')}</ol>
        <button type="button" class="btn btn-s" data-act="add" data-p="${P(p)}" data-new="${esc(JSON.stringify(f.blank ?? {}))}">＋ ${esc(f.addLabel || 'Add')}</button></div>`;
    }
    case 'note': return `<p class="note">${f.html || esc(f.text)}</p>`;
    case 'group': return `<fieldset class="grp"><legend>${esc(f.label)}</legend>${f.help ? `<p class="hint">${esc(f.help)}</p>` : ''}${f.fields.map((x) => field(x, base)).join('')}</fieldset>`;
    default: return '';
  }
}

/* ---------- screens ---------- */
const TABS = () => (window.ADMIN && window.ADMIN.tabs) || [];
function shell() {
  const v = view();
  document.documentElement.style.setProperty('--p', (v.colors && v.colors.primary) || '#1e3f31');
  document.documentElement.style.setProperty('--a', (v.colors && v.colors.accent) || '#c98a4b');
  $('#adm').innerHTML = `<header class="top">
      <a class="brand" href="../" target="_blank" rel="noopener"><span>${esc((v.logo && v.logo.mark) || (v.name || 'W')[0])}</span><b>${esc(v.name)}</b><small>Admin</small></a>
      <p class="st" data-status></p>
      <div class="tools"><a class="btn btn-q" href="../index.html?preview" target="_blank" rel="noopener" data-preview>Preview</a><button class="btn btn-p" type="button" data-publish>Publish</button>
      <details class="me"><summary>${A.user ? `<img src="${esc(A.user.avatar_url)}" alt="">` : '<i>D</i>'}</summary><div><p>${A.user ? `Signed in as <b>${esc(A.user.login)}</b>` : '<b>Demo mode</b>: changes stay on this device'}</p>${A.mode === 'github' ? '<button type="button" class="btn btn-s btn-q" data-discard>Discard unpublished changes</button>' : '<button type="button" class="btn btn-s btn-q" data-discard>Reset the demo</button>'}<button type="button" class="btn btn-s" data-signout>Sign out</button></div></details></div>
    </header>
    <div class="body"><nav class="nav" aria-label="Sections">${TABS().map((t) => `<button type="button" data-tab="${t.id}"${t.id === A.tab ? ' aria-current="page"' : ''}><span>${t.emoji || ''}</span>${esc(t.label)}</button>`).join('')}</nav><main class="pane" data-pane></main></div>
    <div class="toast" data-toast role="status" hidden></div>`;
  status(); render();
}
function status() {
  const s = $('[data-status]');
  if (!s) return;
  s.className = 'st' + (A.dirty ? ' st-dirty' : '');
  s.textContent = A.mode === 'demo' ? (A.dirty ? 'Demo: changes on this device' : 'Demo mode') : (A.dirty ? 'Unpublished changes' : 'Everything published');
}
function render() {
  const pane = $('[data-pane]');
  if (!pane) return;
  const t = TABS().find((x) => x.id === A.tab) || TABS()[0];
  A.tab = t.id;
  $$('[data-tab]').forEach((b) => b.toggleAttribute('aria-current', b.dataset.tab === t.id));
  const y = pane.scrollTop;
  pane.innerHTML = `<h1>${esc(t.label)}</h1>${t.intro ? `<p class="intro">${esc(t.intro)}</p>` : ''}${t.custom ? t.custom() : (typeof t.fields === 'function' ? t.fields() : t.fields).map((f) => field(f)).join('')}`;
  pane.scrollTop = y;
  if (t.after) t.after(pane);
}
let toastT;
function toast(msg, kind = 'info') { const t = $('[data-toast]'); if (!t) return alert(msg); t.textContent = msg; t.className = 'toast t-' + kind; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, kind === 'err' ? 9000 : 5000); }

/* ---------- inbox (Mid and High) ---------- */
const INBOX_KEY = 'wl-inbox-key:' + REPO;
const STATUSES = [['new', 'New'], ['replied', 'Replied'], ['confirmed', 'Confirmed'], ['declined', 'Declined']];
function demoInbox() {
  const v = view(), items = v.villas || v.listings || [], it = (i) => items[i % Math.max(items.length, 1)] || {};
  const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const mk = (i, k, x) => ({ id: 'demo' + i, at: new Date(Date.now() - k * 36e5).toISOString(), status: x.status || 'new', data: { type: 'booking', item: tx(it(i).name) || 'Room', itemId: it(i).id, currency: (v.currency && v.currency.base) || 'EUR', ...x } });
  return [
    mk(0, 2, { name: 'Giulia Ferri', email: 'giulia@example.it', phone: '+39 333 000 0000', in: d(30), out: d(37), guests: 2, total: 595, extras: 'halfboard, airport', message: 'Arriviamo alle 7 di mattina.', via: 'whatsapp' }),
    mk(1, 20, { name: 'Tom Becker', email: 'tom@example.de', phone: '+49 151 000000', in: d(45), out: d(52), guests: 2, total: 490, extras: '', message: 'Is the room quiet at night?' }),
    { id: 'demo9', at: new Date(Date.now() - 50 * 36e5).toISOString(), status: 'replied', data: { type: 'message', name: 'Sarah Lee', email: 'sarah@example.com', message: 'Do you organise a catamaran day for 6 people?' } },
    mk(2, 80, { name: 'Marco Rinaldi', email: 'marco@example.it', in: d(60), out: d(70), guests: 3, total: 1150, status: 'confirmed' }),
  ];
}
async function inboxCall(params) {
  const url = (view().inbox || {}).url, key = store.get(INBOX_KEY);
  if (!url || !key) throw new Error('Add the inbox address and key first.');
  const r = await fetch(url + (url.includes('?') ? '&' : '?') + new URLSearchParams({ key, ...params }), { cache: 'no-store' });
  const j = await r.json();
  if (j.error) throw new Error(j.error === 'key' ? 'The inbox key is not right.' : j.error);
  return j;
}
async function loadInbox() {
  if (A.mode === 'demo' || !(view().inbox || {}).url) { A.inbox = A.inbox && A.inbox.demo ? A.inbox : Object.assign(demoInbox(), { demo: true }); render(); return; }
  try { A.inbox = (await inboxCall({ action: 'list' })).rows || []; } catch (e) { A.inbox = []; toast(e.message, 'err'); }
  render();
}
function inboxScreen() {
  const v = view(), demo = !A.inbox || A.inbox.demo;
  const rows = (A.inbox || []).slice().sort((a, b) => String(b.at).localeCompare(String(a.at)));
  const items = v.villas || v.listings || [];
  const n = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 864e5));
  const money = (x, c) => (x ? ({ EUR: '€', USD: '$', MUR: 'Rs ' }[c] || (c ? c + ' ' : '')) + Number(x).toLocaleString('en-GB') : '');
  const wa = (p) => String(p || '').replace(/\D/g, '');
  return `${demo ? `<p class="note">${(v.inbox || {}).url ? 'Showing sample requests until the inbox is loaded.' : 'These are sample requests. Connect the Google Sheet inbox below and real requests from the website appear here.'}</p>` : ''}
    <p class="row"><button type="button" class="btn btn-s" data-inbox-load>${A.inbox && !A.inbox.demo ? 'Refresh' : 'Load requests'}</button><span class="hint">${rows.filter((r) => r.status === 'new').length} new</span></p>
    <ul class="inbox">${rows.map((r) => { const d = r.data || {}, room = items.find((x) => x.id === d.itemId); return `<li class="ib-${esc(r.status)}">
      <div class="ib-top"><b>${esc(d.name || 'No name')}</b><span class="badge">${esc(d.type === 'message' ? 'Message' : d.type === 'availability' ? 'Availability' : 'Booking')}${d.via === 'whatsapp' ? ' · WhatsApp' : ''}</span><time>${esc(new Date(r.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))}</time></div>
      ${d.in ? `<p class="ib-stay"><b>${esc(d.item || '')}</b> ${esc(d.in)} → ${esc(d.out)} · ${n(d.in, d.out)} nights · ${esc(d.guests || '')} guests${d.total ? ` · <b>${esc(money(d.total, d.currency))}</b>` : ''}</p>` : ''}
      ${d.extras ? `<p class="hint">Extras: ${esc(d.extras)}</p>` : ''}${d.message ? `<p class="ib-msg">${esc(d.message)}</p>` : ''}
      <p class="ib-act">${d.email ? `<a class="btn btn-s btn-q" href="mailto:${esc(d.email)}">Email</a>` : ''}${wa(d.phone) ? `<a class="btn btn-s btn-q" href="https://wa.me/${wa(d.phone)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
        <select data-inbox-status="${esc(r.id)}" aria-label="Status">${STATUSES.map(([k, l]) => `<option value="${k}"${r.status === k ? ' selected' : ''}>${l}</option>`).join('')}</select>
        ${d.in && r.status !== 'confirmed' ? `<button type="button" class="btn btn-s btn-p" data-inbox-confirm="${esc(r.id)}">Confirm & block dates${room || !items.length ? '' : ''}</button>` : ''}</p></li>`; }).join('') || '<li class="empty">No requests yet.</li>'}</ul>
    <fieldset class="grp"><legend>Connect the inbox</legend><p class="hint">The inbox is a free Google Sheet. Set it up once with <a href="inbox.gs" target="_blank" rel="noopener">inbox.gs</a> (steps in the README), then paste its address here and publish. The key stays on this device only.</p>
      ${field({ type: 'string', path: 'inbox.url', label: 'Inbox address (web app URL)', placeholder: 'https://script.google.com/macros/s/…/exec' })}
      <label class="fl"><span class="lb">Inbox key<small>The secret you chose in inbox.gs. Saved on this device only.</small></span><input type="password" data-inbox-key value="${esc(store.get(INBOX_KEY) || '')}" autocomplete="off"></label></fieldset>`;
}
async function inboxStatus(id, st, block) {
  const row = (A.inbox || []).find((r) => r.id === id);
  if (!row) return;
  row.status = st;
  if (block) {
    const d = row.data, v = view(), listKey = v.villas ? 'villas' : v.listings ? 'listings' : null;
    if (listKey) { const i = v[listKey].findIndex((x) => x.id === d.itemId); if (i >= 0) { const p = [listKey, i, 'booked']; set(p, [...(get(p) || []), [d.in, d.out, d.name || '']]); } else toast('Confirmed. The room was not found, so block the dates in Availability.', 'info'); }
    else if (v.villa) { const p = ['villa', 'booked']; set(p, [...(get(p) || []), [d.in, d.out, d.name || '']]); }
    toast('Confirmed. The dates are blocked; press Publish to update the website calendar.', 'ok');
  }
  if (!A.inbox.demo) { try { await inboxCall({ action: 'status', id, status: st }); } catch (e) { toast(e.message, 'err'); } }
  render();
}

/* ---------- staff logins (High) ---------- */
let staff = null;
async function loadStaff() {
  if (A.mode === 'demo') { staff = { list: [{ login: 'villa-owner', role: 'admin' }, { login: 'front-office', role: 'write' }], invites: [] }; render(); return; }
  try {
    const [list, invites] = await Promise.all([gh('GET', `/repos/${REPO}/collaborators?per_page=50`), gh('GET', `/repos/${REPO}/invitations`).catch(() => [])]);
    staff = { list: list.map((u) => ({ login: u.login, avatar: u.avatar_url, role: u.role_name })), invites: invites.map((i) => ({ id: i.id, login: i.invitee && i.invitee.login })) };
  } catch (e) { staff = { error: e.status === 403 ? 'Your key cannot see the staff list. The owner can manage staff, or give your key "Administration" access.' : e.message, list: [], invites: [] }; }
  render();
}
function staffScreen() {
  if (!staff) { setTimeout(loadStaff); return '<p class="hint">Loading…</p>'; }
  return `${staff.error ? `<p class="note">${esc(staff.error)}</p>` : ''}
    <ul class="staff">${staff.list.map((u) => `<li>${u.avatar ? `<img src="${esc(u.avatar)}" alt="">` : '<i></i>'}<b>${esc(u.login)}</b><span class="badge">${esc(u.role === 'admin' ? 'Owner' : 'Staff')}</span>${u.role !== 'admin' ? `<button type="button" class="btn btn-s btn-q" data-staff-del="${esc(u.login)}">Remove</button>` : ''}</li>`).join('')}
      ${staff.invites.map((i) => `<li><i></i><b>${esc(i.login)}</b><span class="badge">Invited</span></li>`).join('')}</ul>
    <fieldset class="grp"><legend>Add a staff member</legend><p class="hint">They need a free GitHub account. They accept the invitation by email, then sign in here with their own key, so each person has their own login and you can remove them at any time.</p>
      <p class="row"><input data-staff-new placeholder="Their GitHub username" aria-label="GitHub username"><button type="button" class="btn btn-s btn-p" data-staff-add>Invite</button></p></fieldset>`;
}
async function staffChange(login, add) {
  if (A.mode === 'demo') { if (add) staff.invites.push({ login }); else staff.list = staff.list.filter((u) => u.login !== login); render(); toast(add ? 'Demo: invitation shown, nothing was sent.' : 'Demo: removed on this screen only.'); return; }
  try { await gh(add ? 'PUT' : 'DELETE', `/repos/${REPO}/collaborators/${encodeURIComponent(login)}`, add ? { permission: 'push' } : undefined); toast(add ? `Invitation sent to ${login}.` : `${login} can no longer sign in.`, 'ok'); staff = null; render(); }
  catch (e) { toast('Could not change staff: ' + e.message, 'err'); }
}

/* ---------- sign in ---------- */
function signInScreen(msg = '') {
  document.documentElement.style.setProperty('--p', (BASE.colors && BASE.colors.primary) || '#1e3f31');
  $('#adm').innerHTML = `<main class="login"><div class="lcard">
    <p class="brand"><span>${esc((BASE.logo && BASE.logo.mark) || (BASE.name || 'W')[0])}</span><b>${esc(BASE.name)}</b><small>Admin</small></p>
    <h1>Sign in</h1><p class="intro">Change your website's text, photos, prices and dates${window.ADMIN && window.ADMIN.inbox ? ', and answer booking requests' : ''}.</p>
    ${msg ? `<p class="toast t-err">${esc(msg)}</p>` : ''}
    <form data-login><label class="fl"><span class="lb">Your access key<small>A GitHub key for ${esc(REPO || 'this website')}. It stays on this device.</small></span><input type="password" name="token" autocomplete="current-password" required placeholder="github_pat_…"></label>
      <label class="tg"><input type="checkbox" name="remember" checked><span></span>Remember me on this device</label>
      <button class="btn btn-p btn-l" type="submit">Sign in</button></form>
    <details class="how"><summary>How do I get a key?</summary><ol>
      <li>On github.com open <b>Settings → Developer settings → Personal access tokens → Fine-grained tokens</b> and press <b>Generate new token</b>.</li>
      <li>Under <b>Repository access</b> choose <b>Only select repositories</b> and pick <b>${esc(REPO.split('/')[1] || 'this website')}</b>.</li>
      <li>Under <b>Permissions → Repository</b> set <b>Contents</b> to <b>Read and write</b>${window.ADMIN && window.ADMIN.staff ? ' (the owner also sets <b>Administration</b> to <b>Read and write</b> to manage staff)' : ''}.</li>
      <li>Generate, copy the key and paste it above.</li></ol><p>Staff added to someone else's repository: GitHub only allows a <b>classic</b> token there. Create one under <b>Tokens (classic)</b> with only the <b>public_repo</b> box ticked.</p></details>
    <p class="demo-or"><span>or</span></p><button class="btn btn-q btn-l" type="button" data-demo>Try the admin without signing in</button>
  </div></main>`;
}
async function signIn(token, remember) {
  A.token = token.trim();
  try {
    const [repo, user] = await Promise.all([gh('GET', `/repos/${REPO}`), gh('GET', '/user')]);
    if (!repo.permissions || !repo.permissions.push) throw new Error('This key can read the website but not change it. Give it "Contents: Read and write".');
    A.user = user; A.mode = 'github';
    store.del('wl-admin:' + REPO); store.set('wl-admin:' + REPO, A.token, !remember);   // remembered: this device; otherwise: until the tab closes
    await loadFromRepo();
    const draft = JSON.parse(store.get(PREVIEW_KEY + ':draft') || 'null');
    if (draft && JSON.stringify(draft.edits) !== JSON.stringify(A.edits) && confirm('You have unpublished changes on this device from ' + new Date(draft.at).toLocaleString('en-GB') + '. Keep working on them?')) { A.edits = draft.edits; A.dirty = true; }
    store.set(PREVIEW_KEY, JSON.stringify(A.edits));
    A.tab = A.tab || (TABS()[0] || {}).id; shell();
  } catch (e) { A.token = ''; store.del('wl-admin:' + REPO); signInScreen(e.status === 401 ? 'That key was not accepted. Check it was copied in full and has not expired.' : e.status === 404 ? `The key cannot see ${REPO}. Choose this repository under "Repository access".` : e.message); }
}
function startDemo() {
  A.mode = 'demo'; A.user = null;
  const draft = JSON.parse(store.get(PREVIEW_KEY + ':draft') || 'null');
  if (draft) { A.edits = draft.edits; A.dirty = true; }
  A.tab = (TABS()[0] || {}).id; shell();
}

/* ---------- events ---------- */
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.matches('[data-inbox-key]')) { store.set(INBOX_KEY, el.value); return; }
  if (!el.dataset.p || el.type === 'file' || el.dataset.md || el.tagName === 'SELECT' || el.type === 'checkbox') return;
  const p = JSON.parse(el.dataset.p);
  set(p, el.hasAttribute('data-num') ? (el.value === '' ? null : +el.value) : el.value);
});
document.addEventListener('change', async (e) => {
  const el = e.target;
  if (el.matches('[data-inbox-status]')) return inboxStatus(el.dataset.inboxStatus, el.value);
  if (el.dataset.img || el.dataset.imgs) {
    const files = [...el.files]; if (!files.length) return;
    const p = JSON.parse(el.dataset.img || el.dataset.imgs);
    try {
      const urls = await Promise.all(files.map(readPhoto));
      if (el.dataset.img) { const cur = get(p); set(p, { ...(cur && typeof cur === 'object' ? cur : {}), src: urls[0] }); }
      else set(p, [...(get(p) || []), ...urls.map((src) => ({ src, alt: Object.fromEntries(LANGS.map((l) => [l, ''])) }))]);
      toast(files.length > 1 ? `${files.length} photos added. Add a description to each, then Publish.` : 'Photo added. Press Publish to put it on the website.', 'ok');
    } catch { toast('That file could not be read as a photo.', 'err'); }
    render(); return;
  }
  if (!el.dataset.p) return;
  const p = JSON.parse(el.dataset.p);
  if (el.dataset.md) { const sels = $$(`[data-p='${el.dataset.p.replace(/'/g, "\\'")}'][data-md]`, el.closest('.fl')); const d = +sels.find((s) => s.dataset.md === 'd').value, m = +sels.find((s) => s.dataset.md === 'm').value; set(p, `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`); return; }
  if (el.type === 'checkbox') { set(p, el.hasAttribute('data-invert') ? !el.checked : el.checked); return; }
  if (el.tagName === 'SELECT') set(p, el.value);
  if (el.type === 'date') render();
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('button, a');
  if (!b) return;
  if (b.dataset.tab) { A.tab = b.dataset.tab; render(); $('[data-pane]').scrollTop = 0; scrollTo(0, 0); return; }
  if (b.hasAttribute('data-publish')) return publish();
  if (b.hasAttribute('data-demo')) return startDemo();
  if (b.hasAttribute('data-signout')) { store.del('wl-admin:' + REPO); A.token = ''; A.mode = null; signInScreen(); return; }
  if (b.hasAttribute('data-discard')) { if (!confirm(A.mode === 'demo' ? 'Reset the demo to the original website?' : 'Throw away the changes that are not published yet?')) return; store.del(PREVIEW_KEY + ':draft'); if (A.mode === 'demo') { A.edits = clone(window.SITE_EDITS || {}) || {}; A.dirty = false; store.set(PREVIEW_KEY, JSON.stringify(A.edits)); shell(); } else loadFromRepo().then(() => { store.set(PREVIEW_KEY, JSON.stringify(A.edits)); shell(); }); return; }
  if (b.hasAttribute('data-preview')) store.set(PREVIEW_KEY, JSON.stringify(A.edits));
  if (b.hasAttribute('data-inbox-load')) return loadInbox();
  if (b.dataset.inboxConfirm) return inboxStatus(b.dataset.inboxConfirm, 'confirmed', true);
  if (b.hasAttribute('data-staff-add')) { const i = $('[data-staff-new]'); if (i.value.trim()) staffChange(i.value.trim(), true); return; }
  if (b.dataset.staffDel) { if (confirm(`Remove ${b.dataset.staffDel}? They will no longer be able to sign in.`)) staffChange(b.dataset.staffDel, false); return; }
  const act = b.dataset.act;
  if (!act) return;
  const p = JSON.parse(b.dataset.p), list = [...(get(p) || [])], i = +b.dataset.i;
  if (act === 'add') list.push(JSON.parse(b.dataset.new || '{}'));
  if (act === 'del') { if (!confirm('Remove this?')) return; list.splice(i, 1); }
  if (act === 'up' && i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
  if (act === 'down' && i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
  if (act === 'addDates') { const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10); list.push([d(7), d(14), '']); }
  if (act === 'clearPast') { const t = new Date().toISOString().slice(0, 10); set(p, list.filter((r) => !(r[1] && r[1] <= t))); render(); return; }
  set(p, list); render();
});
document.addEventListener('submit', (e) => { const f = e.target.closest('[data-login]'); if (!f) return; e.preventDefault(); const btn = $('button[type="submit"]', f); btn.disabled = true; btn.textContent = 'Checking…'; signIn(f.elements.token.value, f.elements.remember.checked); });
addEventListener('beforeunload', (e) => { if (A.dirty && A.mode === 'github') { e.preventDefault(); e.returnValue = ''; } });

/* the screens the tier adds (inbox, staff) */
window.ADMIN_SCREENS = { inbox: () => { if (!A.inbox) setTimeout(loadInbox); return inboxScreen(); }, staff: staffScreen };
window.ADMIN_TX = tx;
window.SITE_ADMIN_VIEW = view;

/* ---------- start ---------- */
function start() {
  const saved = store.get('wl-admin:' + REPO) || store.get('wl-admin:' + REPO, true);
  if (/[?&]demo\b/.test(location.search)) return startDemo();
  if (saved && REPO) { $('#adm').innerHTML = '<p class="loading">Signing in…</p>'; signIn(saved, !!store.get('wl-admin:' + REPO)); } else signInScreen();
}
window.ADMIN_START = start;
})();

/* MID TIER admin ("Content editor + bookings/enquiries"): everything in Low, plus rooms, extras, tours and the inbox. */
(() => {
const tx = window.ADMIN_TX, SITE = window.SITE || {};
const CUR = ({ EUR: '€', MUR: 'Rs', USD: '$', GBP: '£' })[(SITE.currency || {}).base || 'MUR'] || '';
const T = (path, label, o = {}) => ({ type: 'text', path, label, ...o });
const AR = (path, label, o = {}) => ({ type: 'area', path, label, ...o });
const S = (path, label, o = {}) => ({ type: 'string', path, label, ...o });
const N = (path, label, o = {}) => ({ type: 'number', path, label, ...o });
const L = (path, label, fields, o = {}) => ({ type: 'list', path, label, fields, ...o });
const ICON = (key = 'icon') => ({ type: 'icon', key, label: 'Icon' });
const SEASONS = L('seasons', 'Seasons (other prices between two dates)', [T('name', 'Name'), { type: 'md', key: 'from', label: 'From' }, { type: 'md', key: 'to', label: 'To' }, N('price', 'Price per night', { prefix: CUR }), N('minNights', 'Shortest stay', { suffix: 'nights', min: 1 })], { title: (x) => `${tx(x.name)} · ${CUR}${x.price || ''}`, addLabel: 'Add a season', blank: { from: '01-01', to: '01-31', price: 0 } });
const rooms = () => (window.SITE_ADMIN_VIEW ? window.SITE_ADMIN_VIEW().villas : SITE.villas) || [];

window.ADMIN = {
  inbox: true, staff: false,
  tabs: [
    { id: 'inbox', emoji: '📥', label: 'Inbox', intro: 'Booking requests and messages from the website.', custom: () => window.ADMIN_SCREENS.inbox() },
    { id: 'availability', emoji: '📅', label: 'Availability', intro: 'Block the nights each room is taken. Guests cannot pick them, and the calendars show the next free dates.',
      fields: () => rooms().map((r, i) => ({ type: 'group', label: tx(r.name) || `Room ${i + 1}`, fields: [{ type: 'dates', path: ['villas', i, 'booked'], label: '' }] })) },
    { id: 'rooms', emoji: '🛏️', label: 'Rooms & prices', intro: 'Each room, its photos and its prices. The live price in the booking calendar uses these numbers.', fields: [
      L('villas', 'Rooms', [
        T('name', 'Name'), T('badge', 'Badge on the photo', { help: 'Optional, e.g. "Most booked"' }), AR('short', 'One-line description'),
        N('price', 'Standard price per night', { prefix: CUR }), N('capacity', 'Most guests', { min: 1 }), N('minNights', 'Shortest stay', { suffix: 'nights', min: 1 }),
        SEASONS,
        { type: 'images', key: 'images', label: 'Photos', help: 'The first one is used on cards.' },
        L('features', 'Icons on the card', [ICON(), T('label', 'Text')], { title: (x) => tx(x.label), addLabel: 'Add', blank: { icon: 'check' } }),
        { type: 'list', key: 'description', label: 'Description', item: { type: 'area' }, title: (x) => tx(x).slice(0, 60), addLabel: 'Add a paragraph', blank: {} },
        { type: 'list', key: 'amenities', label: 'In the room', item: { type: 'text' }, title: (x) => tx(x), addLabel: 'Add', blank: {} },
      ], { title: (x) => `${tx(x.name)} · ${CUR}${x.price || ''}`, addLabel: 'Add a room', itemLabel: 'Room', blank: { id: 'room-' + Date.now().toString(36), price: 0, capacity: 2, minNights: 1, images: [], booked: [] } }),
      { type: 'group', label: 'Long stays', help: 'Discount on the nightly total for longer stays. The best one that applies is used.', fields: [L('booking.longStay', '', [N('nights', 'From', { suffix: 'nights', min: 1 }), N('pct', 'Discount', { suffix: '%' })], { title: (x) => `${x.nights || '?'}+ nights: ${x.pct || 0}% off`, addLabel: 'Add a discount', blank: { nights: 7, pct: 5 } })] },
    ] },
    { id: 'extras', emoji: '➕', label: 'Extras', intro: 'Things guests can add to a booking request.', fields: [
      L('extras', 'Extras', [ICON(), T('label', 'Name'), T('text', 'Details'), N('price', 'Price', { prefix: CUR }), { type: 'select', key: 'per', label: 'Charged', options: [['booking', 'Once'], ['night', 'Per night'], ['person', 'Per guest'], ['personNight', 'Per guest, per night']] }],
        { title: (x) => `${tx(x.label)} · ${CUR}${x.price || 0}`, addLabel: 'Add an extra', blank: { id: 'extra-' + Date.now().toString(36), icon: 'plus', price: 0, per: 'booking' } }),
    ] },
    { id: 'home', emoji: '✨', label: 'Home page', fields: [
      T('sections.hero.eyebrow', 'Small line above the title'), T('sections.hero.title', 'Title'), AR('sections.hero.text', 'Text under the title'),
      { type: 'images', path: 'sections.hero.images', label: 'Big photos (they take turns)' },
      { type: 'group', label: 'Why book with you', fields: [T('sections.whyDirect.title', 'Title'), AR('sections.whyDirect.text', 'Text'), L('sections.whyDirect.items', 'Reasons', [ICON(), T('title', 'Title'), T('text', 'Text')], { title: (x) => tx(x.title), addLabel: 'Add a reason', blank: { icon: 'check' } })] },
      { type: 'group', label: 'Welcome', fields: [T('sections.intro.title', 'Title'), { type: 'list', path: 'sections.intro.text', label: 'Paragraphs', item: { type: 'area' }, title: (x) => tx(x).slice(0, 60), addLabel: 'Add a paragraph', blank: {} }, T('sections.intro.signature', 'Signature'), { type: 'images', path: 'sections.intro.images', label: 'Two photos' }] },
    ] },
    { id: 'tours', emoji: '🧭', label: 'Tours', fields: [
      T('sections.nearby.title', 'Title'), AR('sections.nearby.lead', 'Text'),
      L('sections.nearby.items', 'Tours', [T('title', 'Name'), T('distance', 'Label on the photo', { help: 'e.g. "1 day · from €40"' }), AR('text', 'Description'), ICON(), { type: 'image', key: 'image', label: 'Photo' }], { title: (x) => tx(x.title), addLabel: 'Add a tour', blank: { icon: 'compass' } }),
    ] },
    { id: 'photos', emoji: '🖼️', label: 'Gallery', fields: [{ type: 'images', path: 'sections.gallery.images', label: 'Gallery page photos' }] },
    { id: 'reviews', emoji: '⭐', label: 'Reviews', fields: [
      N('sections.reviews.summary.rating', 'Your score', { step: 0.1 }), N('sections.reviews.summary.best', 'Out of', { help: '10 for Booking.com, 5 for Google or TripAdvisor' }), T('sections.reviews.summary.source', 'Where the score comes from'),
      L('sections.reviews.items', 'Reviews', [S('name', 'Guest name'), T('from', 'Country'), T('date', 'Month'), S('source', 'Source', { placeholder: 'Booking.com, Google…' }), AR('text', 'What they wrote')], { title: (x) => x.name, addLabel: 'Add a review', blank: {} }),
    ] },
    { id: 'faq', emoji: '❓', label: 'Questions', fields: [L('sections.faq.items', 'Questions and answers', [T('q', 'Question'), AR('a', 'Answer')], { title: (x) => tx(x.q), addLabel: 'Add a question', blank: {} })] },
    { id: 'business', emoji: '🏠', label: 'Business & contact', fields: [
      S('name', 'Business name'), AR('tagline', 'Short description'),
      { type: 'group', label: 'Contact', fields: [S('contact.phone', 'Phone'), S('contact.whatsapp', 'WhatsApp number', { help: 'Country code and number, digits only', inputmode: 'numeric' }), T('contact.whatsappMessage', 'WhatsApp message, ready to send'), S('contact.email', 'Email'), T('contact.responseTime', 'Reply note'), T('contact.street', 'Address'), S('contact.city', 'Town')] },
      { type: 'group', label: 'Links and Google', fields: [S('social.facebook', 'Facebook page'), S('social.instagram', 'Instagram'), S('social.tripadvisor', 'TripAdvisor'), S('contact.googleBusiness', 'Google Business profile'), S('contact.googleReview', '"Write a review" link')] },
    ] },
  ],
};
})();
