/* ==========================================================================
   WebLuxe template engine
   Builds the whole site from config.js (window.SITE). You should not need to
   edit this file to set up a new client: change config.js instead.
   ========================================================================== */
(() => {
'use strict';

/* Changes saved from the admin panel live in data/site.js (window.SITE_EDITS) and are laid over config.js.
   While the owner previews unsaved changes (?preview), the admin's draft is laid over too. */
const mergeIn = (a, b) => { if (b === undefined) return a; if (b === null || typeof b !== 'object' || Array.isArray(b)) return b; const o = { ...(a && typeof a === 'object' && !Array.isArray(a) ? a : {}) }; for (const k of Object.keys(b)) o[k] = mergeIn(o[k], b[k]); return o; };
const C = (() => {
  let c = mergeIn(window.SITE || {}, window.SITE_EDITS || {});
  try {
    const key = 'wl-preview:' + ((c.admin && c.admin.repo) || c.name);
    if (/[?&]preview\b/.test(location.search)) sessionStorage.setItem('wl-preview-on', '1');
    if (sessionStorage.getItem('wl-preview-on') === '1') { const d = JSON.parse(localStorage.getItem(key) || 'null'); if (d) c = mergeIn(c, d); }
  } catch { /* private mode */ }
  return (window.SITE = c);
})();
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const enc = encodeURIComponent;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const langs = (C.languages && C.languages.length) ? C.languages : ['en'];
let lang = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  const pick = [q, store.get('wl-lang'), C.defaultLanguage, (navigator.language || 'en').slice(0, 2)].find((l) => l && langs.includes(l));
  return pick || langs[0];
})();
let T = {};
/** Dates and numbers in the visitor's language: it-IT, fr-FR, en-GB... */
const LOCALE = () => ({ fr: 'fr-FR', it: 'it-IT', de: 'de-DE', es: 'es-ES' }[lang] || 'en-GB');
/** 8.4 in English, 8,4 in Italian or French. */
const decimal = (n) => Number(n).toLocaleString(LOCALE(), { maximumFractionDigits: 1 });

/* ---------- text helpers ---------- */
/** A config value can be plain text or { en: '...', fr: '...' }. */
const tx = (v) => (v == null ? '' : (typeof v === 'object' && !Array.isArray(v) && ('en' in v || 'fr' in v)) ? (v[lang] ?? v.en ?? '') : v);
const L = () => (C.text && (C.text[lang] || C.text.en)) || {};
/** Interface wording from config.text.<lang>, with {placeholders}. */
const ui = (k, vars = {}) => String(L()[k] ?? (C.text && C.text.en && C.text.en[k]) ?? '').replace(/\{(\w+)\}/g, (_, x) => (vars[x] ?? ''));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
/** True when a config value is worth showing (not empty, not an empty list, not { en: '', fr: '' }). */
const has = (v) => {
  if (v == null || v === '' || v === false) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object' && ('en' in v || 'fr' in v)) return tx(v) !== '';
  return true;
};
const digits = (s) => String(s || '').replace(/\D/g, '');

/* ---------- icons (inline SVG, no icon font to download) ---------- */
const P = {
  truck: '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/>',
  ship: '<path d="M2 20c2 1.3 4 1.3 6 0s4-1.3 6 0 4 1.3 6 0"/><path d="M4 17 3 12h18l-2 5"/><path d="M6 12V7h8v5M10 7V3h2"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  warehouse: '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12M6 14h12M6 22V10h12v12"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  star: '<path fill="currentColor" stroke="none" d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
  sparkle: '<path d="m12 3 1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/><path d="M19 17v4M17 19h4"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
  paint: '<path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>',
  quote: '<path fill="currentColor" stroke="none" d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h6.83v-6.83H5.41A1.76 1.76 0 0 1 7.17 9.4zm10 0A5.17 5.17 0 0 0 12 11.17V18h6.83v-6.83h-3.42A1.76 1.76 0 0 1 17.17 9.4z"/>',
  bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  snow: '<path d="M2 12h20M12 2v20M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/>',
  wave: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
  coffee: '<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/>',
  pool: '<path d="M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 16c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M8 14V5a2 2 0 0 1 4 0M16 14V5a2 2 0 0 0-4 0M8 9h8"/>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  gear: '<circle cx="6" cy="6" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8v8M12 8v8M18 8v4H6"/>',
  fuel: '<path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>',
  anchor: '<circle cx="12" cy="5" r="3"/><path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
  fish: '<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 3.37 7 6-.94 2.65-3.44 6-7 6s-7.56-2.54-8.5-6Z"/><path d="M18 12v.5M16 17.93a9.77 9.77 0 0 1 0-11.86M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  tag: '<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  zoom: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  wa: '<path fill="currentColor" stroke="none" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.2 4.24-9.44 9.45-9.44a9.4 9.4 0 0 1 6.68 2.77 9.37 9.37 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44zm8.04-17.48A11.3 11.3 0 0 0 12.04.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.6 23.62l6.03-1.58a11.33 11.33 0 0 0 5.42 1.38h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.04-1.18-5.89-3.33-8.04z"/>',
  facebook: '<path fill="currentColor" stroke="none" d="M14 8h3V4h-3c-2.8 0-4 1.8-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  linkedin: '<path fill="currentColor" stroke="none" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/>',
  tiktok: '<path fill="currentColor" stroke="none" d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/>',
  youtube: '<path fill="currentColor" stroke="none" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9l5.7 3.1z"/>',
  tripadvisor: '<circle cx="7" cy="13.5" r="3.5"/><circle cx="17" cy="13.5" r="3.5"/><path d="M2 9h3.5C7.3 7.7 9.5 7 12 7s4.7.7 6.5 2H22l-1.5 2M3.5 11 2 9M12 7v10l-1.5-1.5M12 17l1.5-1.5"/>',
  google: '<path fill="currentColor" stroke="none" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2zM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.8 9.4 6 12 6z"/>',
};
const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[n] || P.check}</svg>`;

/* ---------- images: Unsplash links get sizes for every screen; your own files are used as they are ---------- */
const isUns = (s) => /images\.unsplash\.com/.test(s || '');
const sized = (s, w) => (isUns(s) ? s.replace(/([?&])w=\d+/, '$1').replace(/[?&]$/, '') + (s.includes('?') ? '&' : '?') + 'w=' + w : s);
const imgOf = (x) => (typeof x === 'string' ? { src: x } : (x || {}));
function pic(x, { sizes = '100vw', eager = false, cls = '', w = 1200 } = {}) {
  const i = imgOf(x);
  if (!i.src) return '';
  const set = isUns(i.src) ? [360, 560, 800, 1100, 1500, 2000].filter((n) => n <= Math.max(w * 1.7, 560)).map((n) => `${sized(i.src, n)} ${n}w`).join(', ') : '';
  return `<img class="${cls}" src="${esc(sized(i.src, w))}"${set ? ` srcset="${esc(set)}" sizes="${sizes}"` : ''} alt="${esc(tx(i.alt))}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

/** Photos after the first in a slideshow load once the page has finished loading. */
const later = (html, i) => (i ? html.replace(' src=', ' data-src=').replace(' srcset=', ' data-srcset=') : html);
function loadLater() {
  const go = () => $$('img[data-src]').forEach((im) => { if (im.dataset.srcset) im.srcset = im.dataset.srcset; im.src = im.dataset.src; im.removeAttribute('data-src'); });
  if (document.readyState === 'complete') setTimeout(go, 600); else addEventListener('load', () => setTimeout(go, 600), { once: true });
}

/* ---------- brand: colours and fonts from config become CSS variables ---------- */
function readable(hex) {
  const h = digits(hex) ? String(hex).replace('#', '') : '';
  if (h.length !== 6) return '#ffffff';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (L + 0.05) / 0.057 >= 1.05 / (L + 0.05) ? '#10141a' : '#ffffff';
}
function applyBrand() {
  const st = document.documentElement.style, c = C.colors || {};
  for (const k of ['primary', 'accent', 'dark', 'light']) if (c[k]) st.setProperty('--' + k, c[k]);
  st.setProperty('--on-primary', readable(c.primary));
  st.setProperty('--on-accent', readable(c.accent));
  const f = C.fonts || {};
  const fam = [[f.heading, f.headingWeights || '500;600;700'], [f.body, f.bodyWeights || '400;500;600;700'], [f.script, f.scriptWeights || '500']].filter(([n]) => n);
  if (fam.length) {
    const uniq = [...new Map(fam.map(([n, w]) => [n, w])).entries()];
    const href = 'https://fonts.googleapis.com/css2?' + uniq.map(([n, w]) => `family=${enc(n).replace(/%20/g, '+')}:wght@${w}`).join('&') + '&display=swap';
    const have = $('#wl-fonts');
    if (!have) document.head.append(Object.assign(document.createElement('link'), { id: 'wl-fonts', rel: 'stylesheet', href }));
    else { if (have.href !== href) have.href = href; if (have.rel === 'preload') { have.onload = null; have.addEventListener('load', () => { have.rel = 'stylesheet'; }, { once: true }); } }
  }
  if (f.heading) st.setProperty('--font-head', `"${f.heading}", ${f.headingFallback || 'system-ui, sans-serif'}`);
  if (f.script) st.setProperty('--font-script', `"${f.script}", cursive`);
  if (f.body) st.setProperty('--font-body', `"${f.body}", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`);
}

/* ---------- opening hours ---------- */
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const toMin = (s) => { const [h, m] = String(s).trim().split(':'); return (+h) * 60 + (+m || 0); };
function nowThere() {
  try {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: C.timeZone || undefined, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const g = (t) => (p.find((x) => x.type === t) || {}).value;
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), min: (+g('hour')) * 60 + (+g('minute')) };
  } catch { const d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
}
const hoursFor = (d) => { const v = (C.hours || {})[DAY_KEYS[d]]; return v && String(v).includes('-') ? String(v).split('-').map((s) => s.trim()) : null; };
function openNow() {
  if (!C.hours) return null;
  const n = nowThere(), h = hoursFor(n.day);
  if (h && n.min >= toMin(h[0]) && n.min < toMin(h[1])) return { open: true, until: h[1] };
  for (let k = 0; k < 7; k++) {
    const d = (n.day + k) % 7, x = hoursFor(d);
    if (x && (k > 0 || n.min < toMin(x[0]))) return { open: false, day: k === 0 ? ui('today') : k === 1 ? ui('tomorrow') : (L().days || [])[d], at: x[0] };
  }
  return { open: false };
}
/** Monday to Sunday, with days that share the same hours grouped: "Mon – Fri 08:00 – 17:00". */
function hoursGroups() {
  const order = [1, 2, 3, 4, 5, 6, 0], out = [];
  for (const d of order) {
    const h = hoursFor(d), val = h ? `${h[0]} – ${h[1]}` : ui('closed');
    const last = out[out.length - 1];
    if (last && last.val === val) { last.to = d; } else out.push({ from: d, to: d, val, closed: !h });
  }
  const short = L().daysShort || L().days || DAY_KEYS;
  return out.map((g) => ({ label: g.from === g.to ? short[g.from] : `${short[g.from]} – ${short[g.to]}`, val: g.val, closed: g.closed, today: (() => { const t = nowThere().day; const a = order.indexOf(g.from), b = order.indexOf(g.to), x = order.indexOf(t); return x >= a && x <= b; })() }));
}
function hoursTable(cls = 'hours') {
  if (!C.hours) return '';
  return `<table class="${cls}"><tbody>${hoursGroups().map((g) => `<tr${g.today ? ' class="is-today"' : ''}><th scope="row">${esc(g.label)}</th><td>${esc(g.val)}</td></tr>`).join('')}</tbody></table>`;
}
function openBadge() {
  const s = openNow();
  if (!s) return '';
  const msg = s.open ? ui('openUntil', { time: s.until }) : s.at ? ui('closedOpens', { day: s.day, time: s.at }) : ui('closed');
  return `<p class="open-badge${s.open ? ' is-open' : ''}"><span></span>${esc(msg)}</p>`;
}

/* ---------- contact links ---------- */
const K = () => C.contact || {};
const telHref = (p) => 'tel:' + (String(p).trim().startsWith('+') ? '+' : '') + digits(p);
const waHref = (text) => (digits(K().whatsapp) ? `https://wa.me/${digits(K().whatsapp)}${text ? '?text=' + enc(text) : ''}` : '');
const mailHref = (subject = '', body = '') => (K().email ? `mailto:${K().email}${subject || body ? '?' + [subject && 'subject=' + enc(subject), body && 'body=' + enc(body)].filter(Boolean).join('&') : ''}` : '');
const addressLines = () => [K().street, [K().city, K().region].filter(Boolean).join(', '), K().country].filter(has).map(tx);
const mapsLink = () => (K().mapsLink || K().googleBusiness || `https://www.google.com/maps/search/?api=1&query=${enc(addressLines().join(', ') || C.name)}`);
/** "Review us on Google": shown when contact.googleReview is set (the write-a-review link from the Google Business profile). */
const gReview = (cls = 'btn btn-line') => (has(K().googleReview) ? `<a class="${cls} g-review" href="${esc(K().googleReview)}" target="_blank" rel="noopener">${icon('google')}${esc(ui('reviewOnGoogle'))}</a>` : '');

/* ---------- header, footer, demo strip, WhatsApp button ---------- */
function logo(cls = '') {
  const lg = C.logo || {};
  const inner = lg.image
    ? `<img src="${esc(lg.image)}" alt="${esc(C.name)}" class="logo-img"${lg.height ? ` style="height:${+lg.height}px"` : ''}>`
    : `<span class="logo-mark" aria-hidden="true">${esc(lg.mark || (C.name || 'W').trim()[0])}</span><span class="logo-name">${esc(lg.text || C.name)}</span>`;
  return `<a class="logo ${cls}" href="${T.homeHref || './'}" >${inner}</a>`;
}
function demoStrip() {
  const d = C.demo;
  if (!d || !d.enabled) return '';
  const tiers = (d.tiers || []).map((x) => `<a href="${esc(x.url)}"${x.current ? ' aria-current="true"' : ''}><b>${esc(tx(x.label))}</b>${x.price ? `<span>${esc(x.price)}</span>` : ''}</a>`).join('');
  return `<aside class="demo-strip" aria-label="${esc(ui('demoLabel'))}"><p><b>${esc(ui('demoBadge'))}</b><span>${esc(tx(d.note) || ui('demoNote'))}</span></p>${tiers ? `<nav>${tiers}</nav>` : ''}</aside>`;
}
function header(page) {
  const items = T.nav();
  const links = items.map((n) => `<a href="${esc(n.href)}"${n.key === page ? ' aria-current="page"' : ''} data-key="${esc(n.key)}">${esc(n.label)}</a>`).join('');
  const other = langs[(langs.indexOf(lang) + 1) % langs.length];
  const langBtn = langs.length > 1 ? `<button class="hd-btn hd-lang" type="button" data-lang="${other}" aria-label="${other.toUpperCase()}: ${esc(ui('switchLang'))}">${other.toUpperCase()}</button>` : '';
  const themeBtn = C.darkMode !== false ? `<button class="hd-btn hd-theme" type="button" data-theme-toggle aria-label="${esc(ui('toggleTheme'))}">${icon('moon', 'i-moon')}${icon('sun', 'i-sun')}</button>` : '';
  const cta = T.headerCta ? T.headerCta() : '';
  return `<a class="skip" href="#main">${esc(ui('skip'))}</a>
${demoStrip()}
<header class="hd${T.overlayHeader ? ' hd-over' : ''}" data-hd>
  <div class="hd-in">
    ${logo()}
    <nav class="hd-nav" aria-label="${esc(ui('menu'))}">${links}</nav>
    <div class="hd-tools">${langBtn}${themeBtn}${cta}
      <button class="hd-btn hd-burger" type="button" aria-expanded="false" aria-controls="menu" data-burger><span></span><span></span><span></span><b class="sr">${esc(ui('menu'))}</b></button>
    </div>
  </div>
  <div class="menu" id="menu" data-menu><nav aria-label="${esc(ui('menu'))}">${links}</nav>${T.menuExtra ? T.menuExtra() : ''}</div>
</header>`;
}
const SOCIAL = ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'tripadvisor', 'google'];
function socialLinks(cls = 'social') {
  const s = C.social || {};
  const a = SOCIAL.filter((k) => has(s[k])).map((k) => `<a href="${esc(s[k])}" target="_blank" rel="noopener" aria-label="${k[0].toUpperCase() + k.slice(1)}">${icon(k)}</a>`).join('');
  return a ? `<p class="${cls}">${a}</p>` : '';
}
function footer() {
  const k = K(), cr = C.credit || { name: 'WebLuxe', url: 'https://webluxe.github.io/WebLuxe/' };
  const contact = [
    has(k.phone) && `<a href="${telHref(k.phone)}">${icon('phone')}${esc(k.phone)}</a>`,
    has(k.email) && `<a href="${mailHref()}">${icon('mail')}${esc(k.email)}</a>`,
    waHref() && `<a href="${waHref(tx(k.whatsappMessage))}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>`,
  ].filter(Boolean).join('');
  const addr = addressLines();
  return `<footer class="ft">
  <div class="wrap ft-in">
    <div class="ft-brand">${logo('logo-ft')}${has(C.tagline) ? `<p>${esc(tx(C.tagline))}</p>` : ''}${socialLinks()}</div>
    ${T.footerLinks ? `<nav class="ft-col" aria-label="${esc(ui('footerNav'))}"><h2>${esc(ui('explore'))}</h2>${T.footerLinks()}</nav>` : ''}
    ${contact || addr.length ? `<div class="ft-col"><h2>${esc(ui('contactTitle'))}</h2>${addr.length ? `<address><a href="${esc(mapsLink())}" target="_blank" rel="noopener">${icon('pin')}<span>${addr.map(esc).join('<br>')}</span></a></address>` : ''}${contact}</div>` : ''}
    ${C.hours ? `<div class="ft-col"><h2>${esc(ui('hoursTitle'))}</h2>${hoursTable('hours hours-ft')}</div>` : ''}
  </div>
  <div class="wrap ft-base">
    <p>© <span data-year>${new Date().getFullYear()}</span> ${esc(C.legalName || C.name)}. ${esc(ui('rights'))}</p>
    <p><a class="credit" href="${esc(cr.url)}" target="_blank" rel="noopener">${esc(ui('websiteBy'))} <b>${esc(cr.name)}</b></a></p>
  </div>
</footer>`;
}
function fab() {
  const h = waHref(tx(K().whatsappMessage));
  return h ? `<a class="fab" href="${h}" target="_blank" rel="noopener" aria-label="${esc(ui('whatsappUs'))}">${icon('wa')}<span class="fab-tip">${esc(ui('whatsappUs'))}</span></a>` : '';
}

/* ---------- SEO: title, description, Open Graph and schema.org data from config ---------- */
function setMeta(page) {
  const s = C.seo || {};
  const pageTitle = page === '404' ? ui('nfTitle') : T.pageTitle ? T.pageTitle(page) : '';
  const title = pageTitle ? `${pageTitle} | ${C.name}` : (tx(s.title) || C.name);
  const desc = (T.pageDescription && T.pageDescription(page)) || tx(s.description) || tx(C.tagline);
  document.title = title;
  const meta = (attr, key, val) => {
    if (!val) return;
    let m = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!m) { m = document.createElement('meta'); m.setAttribute(attr, key); document.head.append(m); }
    m.setAttribute('content', val);
  };
  meta('name', 'description', desc);
  meta('property', 'og:title', title);
  meta('property', 'og:description', desc);
  meta('property', 'og:site_name', C.name);
  meta('property', 'og:locale', LOCALE().replace('-', '_'));
  if (s.image) meta('property', 'og:image', sized(imgOf(s.image).src, 1200));
  meta('name', 'theme-color', (C.colors || {}).primary);
  if (s.favicon && !$('link[rel="icon"][data-wl]')) document.head.append(Object.assign(document.createElement('link'), { rel: 'icon', href: s.favicon }));
  if (s.favicon) { const f = $('link[rel="icon"]'); if (f) f.href = s.favicon; }
  if ((C.demo && C.demo.enabled) || page === '404') meta('name', 'robots', 'noindex');
  // the address Google should list for this page, and the same page in the other languages
  if (s.siteUrl && page !== '404') {
    const link = (rel, href, hl) => { let l = document.head.querySelector(`link[rel="${rel}"]${hl ? `[hreflang="${hl}"]` : ':not([hreflang])'}`); if (!l) { l = document.createElement('link'); l.rel = rel; if (hl) l.hreflang = hl; document.head.append(l); } l.href = href; };
    const u = new URL((location.pathname.split('/').pop() || '').replace(/^index\.html$/, ''), String(s.siteUrl).replace(/\/?$/, '/'));
    const q = new URLSearchParams(location.search); q.delete('lang'); q.delete('demo'); u.search = q.toString();
    const inLang = (l) => { const x = new URL(u.href); if (l !== langs[0]) x.searchParams.set('lang', l); return x.href; };
    link('canonical', inLang(lang));
    if (langs.length > 1) { langs.forEach((l) => link('alternate', inLang(l), l)); link('alternate', inLang(langs[0]), 'x-default'); }
  }
  document.documentElement.lang = lang;
}
function businessSchema() {
  const k = K(), s = C.social || {};
  const spec = C.hours ? [1, 2, 3, 4, 5, 6, 0].map((d) => { const h = hoursFor(d); return h && { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d], opens: h[0], closes: h[1] }; }).filter(Boolean) : undefined;
  const o = {
    '@context': 'https://schema.org', '@type': (C.seo && C.seo.schemaType) || 'LocalBusiness', name: C.name,
    description: tx((C.seo || {}).description) || tx(C.tagline) || undefined,
    url: (C.seo && C.seo.siteUrl) || location.origin + location.pathname.replace(/[^/]*$/, ''),
    image: (C.seo && C.seo.image) ? sized(imgOf(C.seo.image).src, 1200) : undefined,
    logo: (C.logo && C.logo.image) ? new URL(C.logo.image, location.href).href : undefined,
    telephone: k.phone || undefined, email: k.email || undefined,
    address: addressLines().length ? { '@type': 'PostalAddress', streetAddress: tx(k.street) || undefined, addressLocality: tx(k.city) || undefined, addressRegion: tx(k.region) || undefined, postalCode: k.postalCode || undefined, addressCountry: k.countryCode || tx(k.country) || undefined } : undefined,
    geo: k.lat ? { '@type': 'GeoCoordinates', latitude: k.lat, longitude: k.lng } : undefined,
    openingHoursSpecification: spec && spec.length ? spec : undefined,
    sameAs: [...SOCIAL.map((x) => s[x]), k.googleBusiness].filter(has),
    hasMap: k.googleBusiness || undefined,
    priceRange: (C.seo && C.seo.priceRange) || undefined,
  };
  return o;
}
function setSchema() {
  let el = $('#wl-schema');
  if (!el) { el = Object.assign(document.createElement('script'), { id: 'wl-schema', type: 'application/ld+json' }); document.head.append(el); }
  const base = businessSchema();
  el.textContent = JSON.stringify(T.schema ? T.schema(base) : base);
}

/* ---------- the pop-up used by the demo, forms and confirmations ---------- */
function dialog(title, body, actions = '') {
  let d = $('#wl-dialog');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'wl-dialog'; d.className = 'dlg';
    document.body.append(d);
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  }
  d.innerHTML = `<div class="dlg-in"><button class="dlg-x" type="button" data-close aria-label="${esc(ui('close'))}">${icon('close')}</button><h2>${esc(title)}</h2>${body}<div class="dlg-actions">${actions}<button class="btn btn-primary" type="button" data-close>${esc(ui('ok'))}</button></div></div>`;
  d.showModal();
}
const demoOn = () => !!(C.demo && C.demo.enabled);
function demoShow(kind, text) {
  const what = { wa: ui('demoWa'), tel: ui('demoTel'), mail: ui('demoMail'), form: ui('demoForm') }[kind] || '';
  const studio = C.demo && digits(C.demo.studioWhatsapp) ? `<a class="btn btn-wa" href="https://wa.me/${digits(C.demo.studioWhatsapp)}?text=${enc(ui('demoStudioMsg', { site: C.name }))}" target="_blank" rel="noopener" data-real>${icon('wa')}${esc(ui('demoStudio'))}</a>` : '';
  dialog(ui('demoTitle'), `<p>${esc(what)}</p>${text ? `<pre class="dlg-msg">${esc(text)}</pre>` : ''}`, studio);
}

/* ---------- forms: send to the endpoint in config, or fall back to email ---------- */
function formSummary(form) {
  const lines = [];
  for (const el of form.elements) {
    if (!el.name || el.type === 'file' || el.type === 'submit' || el.type === 'hidden' || el.name.startsWith('_')) continue;
    if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) continue;
    const v = el.tagName === 'SELECT' ? el.options[el.selectedIndex]?.text : el.value;
    if (!v) continue;
    const lab = el.closest('label')?.querySelector('.lbl')?.textContent || el.dataset.label || el.name;
    lines.push(`${lab}: ${v}`);
  }
  return lines.join('\n');
}
/** The form's main fields, for the inbox. */
/** The deposit payment link from config (payments.link), with {amount}, {currency} and {ref} filled in. */
const payHref = (amount, currency, ref) => String((C.payments || {}).link || '').replace(/\{amount\}/g, amount).replace(/\{currency\}/g, currency).replace(/\{ref\}/g, enc(ref));
const formFields = (form) => Object.fromEntries(['name', 'email', 'phone', 'country', 'message'].map((k) => [k, form.elements[k] ? form.elements[k].value : '']));
/** Every request is also written to the owner's inbox (a Google Sheet, see admin/inbox.gs) when inbox.url is set. */
function inboxSend(record) {
  const url = (C.inbox || {}).url;
  if (!url || demoOn()) return;
  try { fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ site: C.name, lang, page: location.pathname.split('/').pop() || 'index.html', ...record }) }); } catch { /* never block the visitor */ }
}
async function sendForm(form, { subject = '', summary = '', record = null } = {}) {
  if (!form.reportValidity()) return false;
  const status = $('[data-status]', form), btn = $('[type="submit"]', form);
  const body = summary || formSummary(form);
  const show = (cls, msg) => { if (status) { status.className = 'form-status ' + cls; status.textContent = msg; status.hidden = false; } };
  if (demoOn()) { demoShow('form', body); show('ok', ui('formDemoDone')); return true; }
  inboxSend(record || { type: 'message', ...formFields(form) });
  const endpoint = (C.form || {}).endpoint;
  if (endpoint) {
    btn && (btn.disabled = true); show('wait', ui('formSending'));
    try {
      const fd = new FormData(form);
      if (subject) fd.append('_subject', subject);
      const r = await fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(r.status);
      form.reset(); show('ok', ui('formSent')); return true;
    } catch {
      show('err', ui('formError', { phone: K().phone || K().email || '' })); return false;
    } finally { btn && (btn.disabled = false); }
  }
  const m = mailHref(subject, body);
  if (m) { location.href = m; show('ok', ui('formMailto')); return true; }
  show('err', ui('formError', { phone: K().phone || '' }));
  return false;
}

/* ---------- motion: things arrive as you scroll, numbers count up ---------- */
let io;
function reveal() {
  const els = $$('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  io && io.disconnect();
  io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((e) => { if (!e.classList.contains('in')) io.observe(e); });
}
function countUp() {
  const els = $$('[data-count]');
  const run = (el) => {
    const end = parseFloat(el.dataset.count), dec = (String(el.dataset.count).split('.')[1] || '').length;
    if (reduced) { el.textContent = end.toLocaleString('en-US', { minimumFractionDigits: dec }); return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 3)); el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
  const o = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { run(e.target); o.unobserve(e.target); } }), { threshold: 0.5 });
  els.forEach((e) => o.observe(e));
}

/* ---------- full-screen photos: swipe on phones, arrow keys on computers ---------- */
function lightbox(items, start = 0) {
  let i = start, d = $('#wl-lb');
  if (!d) {
    d = document.createElement('dialog'); d.id = 'wl-lb'; d.className = 'lb';
    d.innerHTML = `<button class="lb-x" type="button" data-lb-x aria-label="${esc(ui('close'))}">${icon('close')}</button><button class="lb-nav lb-prev" type="button" data-lb-prev aria-label="${esc(ui('prev'))}">${icon('chevL')}</button><figure class="lb-fig"><img alt=""><figcaption></figcaption></figure><button class="lb-nav lb-next" type="button" data-lb-next aria-label="${esc(ui('next'))}">${icon('chevR')}</button><p class="lb-n" aria-live="polite"></p>`;
    document.body.append(d);
  }
  const img = $('img', d), cap = $('figcaption', d), n = $('.lb-n', d);
  const show = (k, dir = 0) => {
    i = (k + items.length) % items.length;
    const it = items[i];
    img.classList.remove('lb-in'); void img.offsetWidth;
    img.style.setProperty('--dx', dir * 40 + 'px');
    img.src = sized(imgOf(it.src || it).src, 1600); img.alt = tx(it.alt) || '';
    img.classList.add('lb-in');
    cap.textContent = tx(it.caption) || ''; n.textContent = `${i + 1} / ${items.length}`;
    [i + 1, i - 1].forEach((x) => { const p = items[(x + items.length) % items.length]; if (p) new Image().src = sized(imgOf(p.src || p).src, 1600); });
  };
  d.onclick = (e) => { if (e.target.closest('[data-lb-x]') || e.target === d) d.close(); else if (e.target.closest('[data-lb-prev]')) show(i - 1, -1); else if (e.target.closest('[data-lb-next]')) show(i + 1, 1); };
  d.onkeydown = (e) => { if (e.key === 'ArrowRight') show(i + 1, 1); if (e.key === 'ArrowLeft') show(i - 1, -1); };
  let x0 = null;
  d.onpointerdown = (e) => { x0 = e.clientX; };
  d.onpointerup = (e) => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 45) show(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); };
  $$('.lb-nav', d).forEach((b) => (b.hidden = items.length < 2));
  show(start);
  d.showModal();
}

/* ---------- a row of slides you can swipe, that also moves on its own ---------- */
function carousel(root, { auto = 5500 } = {}) {
  const track = $('[data-track]', root), slides = $$('[data-slide]', root), dots = $('[data-dots]', root);
  if (!track || slides.length < 2) return;
  let i = 0, timer, paused = false;
  if (dots) {
    dots.innerHTML = slides.map((_, k) => `<button type="button" aria-label="${esc(ui('slide', { n: k + 1 }))}"${k === 0 ? ' aria-current="true"' : ''}></button>`).join('');
    dots.onclick = (e) => { const b = e.target.closest('button'); if (b) go([...dots.children].indexOf(b)); };
  }
  const go = (k) => { i = (k + slides.length) % slides.length; track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: reduced ? 'auto' : 'smooth' }); };
  const mark = () => { const x = track.scrollLeft; let best = 0; slides.forEach((s, k) => { if (Math.abs(s.offsetLeft - track.offsetLeft - x) < Math.abs(slides[best].offsetLeft - track.offsetLeft - x)) best = k; }); i = best; if (dots) [...dots.children].forEach((b, k) => b.toggleAttribute('aria-current', k === i)); };
  track.addEventListener('scroll', () => { clearTimeout(track._t); track._t = setTimeout(mark, 80); }, { passive: true });
  $('[data-prev]', root)?.addEventListener('click', () => go(i - 1));
  $('[data-next]', root)?.addEventListener('click', () => go(i + 1));
  if (auto && !reduced) {
    ['pointerdown', 'focusin', 'mouseenter'].forEach((ev) => root.addEventListener(ev, () => { paused = true; }));
    root.addEventListener('mouseleave', () => { paused = false; });
    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);
    timer = setInterval(() => { if (!paused && visible && !document.hidden) go(i + 1); }, auto);
  }
}

/* ---------- wiring that every page needs ---------- */
function wireCore() {
  const hd = $('[data-hd]'), burger = $('[data-burger]'), menu = $('[data-menu]');
  const onScroll = () => hd && hd.classList.toggle('is-scrolled', scrollY > 24);
  onScroll();
  window.onscroll = null;
  addEventListener('scroll', onScroll, { passive: true });
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
    document.documentElement.classList.toggle('menu-open', open);
  };
  burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu?.classList.contains('open')) { setMenu(false); burger.focus(); } });
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    lang = b.dataset.lang; store.set('wl-lang', lang);
    const y = scrollY; render(); scrollTo(0, y);
  }));
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    store.set('wl-theme', dark ? 'dark' : 'light');
  }));
  $$('[data-year]').forEach((e) => { e.textContent = new Date().getFullYear(); });
  $$('[data-map]').forEach((m) => m.addEventListener('click', () => {
    m.outerHTML = `<div class="${esc(m.className)}"><iframe src="${esc(m.dataset.map)}" title="${esc(ui('mapTitle'))}" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>`;
  }, { once: true }));
}
let demoWired = false;
function wireDemo() {
  if (demoWired || !demoOn()) return;
  demoWired = true;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-real')) return;
    const h = a.getAttribute('href');
    if (/^https:\/\/wa\.me\//.test(h)) { e.preventDefault(); demoShow('wa', new URL(h).searchParams.get('text') || ''); }
    else if (h.startsWith('tel:')) { e.preventDefault(); demoShow('tel', h.slice(4)); }
    else if (h.startsWith('mailto:')) { e.preventDefault(); demoShow('mail', decodeURIComponent((h.split('body=')[1] || '').split('&')[0])); }
  }, true);
}

/** A section heading block used by every tier. */
const head = (eyebrow, title, lead = '', cls = '') => `<header class="sec-head ${cls}" data-reveal>${has(eyebrow) ? `<p class="eyebrow">${esc(tx(eyebrow))}</p>` : ''}<h2 class="h2">${esc(tx(title))}</h2>${has(lead) ? `<p class="lead">${esc(tx(lead))}</p>` : ''}</header>`;
/** A map that only loads when tapped (keeps the page fast). */
const mapBox = (cls = 'map') => (has(K().mapEmbed) ? `<button type="button" class="${cls}" data-map="${esc(K().mapEmbed)}" aria-label="${esc(ui('showMap'))}"><span class="map-btn">${icon('pin')}${esc(ui('showMap'))}</span></button>` : '');

/* ---------- page changes: a cover sweeps in with the next page's name, the page opens under it, the cover leaves ---------- */
const TX_KEY = 'wl-tx';
const txOn = () => !!T.transitions && !reduced && (C.transitions !== false);
function txEl() {
  let el = $('#wl-tx');
  if (!el) {
    el = document.createElement('div'); el.id = 'wl-tx'; el.className = 'tx'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="tx-body"><span class="tx-mark">${esc((C.logo || {}).mark || (C.name || 'W')[0])}</span><span class="tx-label"></span></div>`;
    document.body.append(el);
  }
  return el;
}
function txWire() {
  if (!txOn()) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-real')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // a link within this page
    e.preventDefault();
    const label = (a.dataset.tx || a.getAttribute('aria-label') || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    const el = txEl();
    $('.tx-label', el).textContent = label;
    try { sessionStorage.setItem(TX_KEY, label); } catch { /* fine */ }
    el.classList.remove('is-out'); void el.offsetWidth; el.classList.add('is-in');
    setTimeout(() => { location.href = url.href; }, T.txIn || 650);
  });
  // coming back with the Back button: the page is restored as it was, so take the cover away
  addEventListener('pageshow', (e) => { if (e.persisted) { const el = $('#wl-tx'); el && el.classList.remove('is-in', 'is-out'); } });
}
function txArrive() {
  let label = null;
  try { label = sessionStorage.getItem(TX_KEY); sessionStorage.removeItem(TX_KEY); } catch { /* fine */ }
  document.documentElement.classList.remove('tx-wait');
  if (label == null || !txOn()) return;
  const el = txEl();
  $('.tx-label', el).textContent = label;
  el.classList.add('is-in', 'tx-hold');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.classList.remove('tx-hold', 'is-in'); el.classList.add('is-out');
    setTimeout(() => el.classList.remove('is-out'), T.txOut || 1000);
  }));
}

/* ---------- the opening: once per visit, on the home page, skippable ---------- */
function introPlay(page) {
  const root = document.documentElement, ic = C.intro || {};
  let seen = false;
  try { seen = sessionStorage.getItem('wl-intro') === '1'; } catch { /* fine */ }
  if (!T.intro || ic.enabled === false || page !== 'home' || reduced || (seen && ic.every !== 'visit') || root.classList.contains('tx-came')) { root.classList.remove('intro-on'); root.classList.add('intro-done'); return; }
  try { sessionStorage.setItem('wl-intro', '1'); } catch { /* fine */ }
  const el = document.createElement('div');
  el.className = 'opening'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = T.intro() + `<button class="opening-skip" type="button" tabindex="-1">${esc(ui('introSkip'))}</button>`;
  document.body.append(el);
  root.classList.add('intro-on');
  let over = false;
  const end = () => {
    if (over) return; over = true;
    el.classList.add('leave');
    setTimeout(() => { root.classList.remove('intro-on'); root.classList.add('intro-done'); }, T.introReveal || 250);
    setTimeout(() => el.remove(), T.introLeave || 1300);
  };
  setTimeout(end, T.introLength || 3400);
  el.addEventListener('click', end);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') end(); });
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('run')));
}

/** The page shown for an address that does not exist (404.html). */
function notFound() {
  return `<section class="sec nf"><div class="wrap nf-in"><p class="eyebrow">404</p><h1 class="h1">${esc(ui('nfTitle'))}</h1><p class="lead">${esc(ui('nfText'))}</p>
    <p class="btns"><a class="btn btn-primary btn-lg" href="./">${esc(ui('nfHome'))}</a>${waHref() ? `<a class="btn btn-wa btn-lg" href="${waHref(tx(K().whatsappMessage))}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>` : ''}</p></div></section>`;
}
/* ---------- one swipe, one section (home page) ----------
   The browser snaps a whole screen at a time. Each section is sized to the screen below the header;
   a thin strip (a band, a ticker) joins the section above it, and a list of rooms snaps room by room.
   A section that ends up taller than the screen simply scrolls inside before moving on. */
let snapRO = null;
const docTop = (el) => { let y = 0; for (; el; el = el.offsetParent) y += el.offsetTop; return y; };
function snapPages() {
  const root = document.documentElement;
  const on = document.body.dataset.page === 'home' && !reduced && (C.effects || {}).snap !== false;
  root.classList.toggle('snap', on);
  if (snapRO) { snapRO.disconnect(); snapRO = null; }
  if (!on) return;
  const HD = 61;   // the header once the page has scrolled (60px + its line)
  const fit = () => {
    const port = innerHeight - HD;
    $$('main .snap-pt').forEach((e) => { e.classList.remove('snap-pt'); e.style.removeProperty('scroll-margin-top'); });
    const ft = $('.ft'); if (ft) ft.classList.add('snap-end');
    $$('main > *').forEach((e) => { e.style.removeProperty('--strip'); e.classList.remove('snap-strip', 'snap-hide'); });
    const kids = $$('main > *').filter((el) => el.offsetHeight > 0);
    const hero = kids[0];
    if (hero && hero.classList.contains('hero')) {
      const top = Math.max(0, Math.round(docTop(hero)));
      hero.style.setProperty('--hero-top', top + 'px'); hero.style.scrollMarginTop = top + 'px';
    }
    for (const el of kids) {
      if (el.offsetHeight >= port * 0.45 || el === hero) continue;
      el.classList.add('snap-strip');
      const prev = el.previousElementSibling;
      if (!prev) continue;
      prev.style.setProperty('--strip', el.offsetHeight + 'px');
      const room = prev === hero ? innerHeight - (parseFloat(hero.style.getPropertyValue('--hero-top')) || 0) : port;
      if (prev.offsetHeight + el.offsetHeight > room + 3) { prev.style.removeProperty('--strip'); el.classList.add('snap-hide'); }
    }
    for (const el of kids) {
      if (el.classList.contains('snap-strip') || el.classList.contains('pin-spacer')) continue;   // a pinned scene brings its own snap points
      const rows = $$('.rows > .row', el);
      if (rows.length > 1 && el.offsetHeight > port * 1.4) {
        const top = docTop(el);
        const head = $('.sec-head', el);
        el.style.setProperty('--fh', Math.round(docTop(rows[0]) - top) + 'px');
        if (head) { head.classList.add('snap-pt'); head.style.scrollMarginTop = Math.round(docTop(head) - top + HD) + 'px'; }
        rows.forEach((r, i) => { if (i > 0 || !head || docTop(r) + r.offsetHeight - top > port + 4) r.classList.add('snap-pt'); });
      } else {
        el.classList.add('snap-pt');
        // a few pixels too tall: take them from the top padding so the section is exactly one screen
        el.style.removeProperty('padding-top');
        const over = el.offsetHeight - port;
        if (el !== hero && over > 0 && over < 40) { const pt = parseFloat(getComputedStyle(el).paddingTop); if (pt - over >= 8) el.style.paddingTop = (pt - over) + 'px'; }
      }
    }
  };
  let t = 0;
  const later = () => { clearTimeout(t); t = setTimeout(() => { fit(); snapPages.realign && snapPages.realign(); }, 120); };
  fit();
  if (!root.classList.contains('snap-on')) {
    const settleOn = () => setTimeout(() => { const y = scrollY; root.classList.add('snap-on'); scrollTo({ top: y, behavior: 'instant' }); }, 700);
    if (document.readyState === 'complete') settleOn(); else addEventListener('load', settleOn, { once: true });
  }
  snapRO = new ResizeObserver(later);
  snapRO.observe($('main'));
  if (!snapPages.bound) { snapPages.bound = true; snapWheel(); addEventListener('resize', () => document.documentElement.classList.contains('snap') && later()); addEventListener('load', () => document.documentElement.classList.contains('snap') && later()); }
}

/* computers: one wheel step, one trackpad swipe or one key press glides exactly one section (the trackpad's
   leftover momentum is ignored); inside a section taller than the screen, or anything that scrolls by itself,
   the page scrolls normally. Touch screens use the browser's own snapping (core.css). */
function snapWheel() {
  const root = document.documentElement;
  let busy = false, lastT = 0, lastAbs = 0, settle = false;
  const points = () => { const max = root.scrollHeight - innerHeight; return $$('.snap-pt, .snap-mark, .snap-end').map((el) => { if (el.classList.contains('snap-end')) return { y: Math.max(0, Math.round(max)), h: innerHeight }; const m = parseFloat(getComputedStyle(el).scrollMarginTop) || 0; return { y: Math.min(Math.round(max), Math.max(0, Math.round(docTop(el) - m))), h: el.offsetHeight + m }; }).sort((a, b) => a.y - b.y); };
  const innerScroll = (el, dir) => { for (; el && el !== document.body; el = el.parentElement) { const o = getComputedStyle(el).overflowY; if ((o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight + 1 && (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0)) return true; } return false; };
  const active = () => root.classList.contains('snap') && innerWidth >= 760 && !matchMedia('(pointer: coarse)').matches && !root.classList.contains('menu-open') && !$('dialog[open]');
  // is the page inside a section taller than the screen, with more of it to read in this direction?
  const reading = (dir) => { const y = scrollY, vh = innerHeight, cur = points().filter((p) => p.y <= y + 2).pop(); return !!(cur && cur.h > vh + 2 && (dir > 0 ? y + vh < cur.y + cur.h - 2 : y > cur.y + 2)); };
  const go = (dir, to) => {
    const y = scrollY, P = points();
    const next = to != null ? to : dir > 0 ? P.find((p) => p.y > y + 2) : P.filter((p) => p.y < y - 2).pop();
    if (!next) return;
    busy = true;
    scrollTo({ top: next.y, behavior: reduced ? 'auto' : 'smooth' });
    let k = 0;
    const check = () => { if (Math.abs(scrollY - next.y) < 2 || ++k > 100) { busy = false; settle = true; } else requestAnimationFrame(check); };
    requestAnimationFrame(check);
  };
  // after the layout moves (fonts, photos, a re-measure), a page resting a little off a section settles back onto it
  snapPages.realign = () => { if (!active() || busy) return; const y = scrollY; let best = null; for (const p of points()) if (!best || Math.abs(p.y - y) < Math.abs(best.y - y)) best = p; if (best && Math.abs(best.y - y) > 1 && Math.abs(best.y - y) < 80 && !reading(1)) scrollTo({ top: best.y, behavior: 'instant' }); };
  addEventListener('wheel', (e) => {
    if (!active() || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const dir = Math.sign(e.deltaY);
    if (!dir || innerScroll(e.target, dir) || reading(dir)) return;
    e.preventDefault();
    const now = performance.now(), gap = now - lastT, abs = Math.abs(e.deltaY);
    lastT = now;
    const fresh = gap > 220 || abs > lastAbs * 1.6 + 8;   // a new gesture, not the tail of the last one
    lastAbs = abs;
    if (busy || (settle && !fresh)) return;
    settle = false;
    go(dir);
  }, { passive: false });
  addEventListener('keydown', (e) => {
    if (!active() || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, textarea, select, button, [contenteditable], .cal')) return;
    const k = e.key;
    const dir = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey) ? 1 : k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey) ? -1 : 0;
    if (k === 'Home' || k === 'End') { e.preventDefault(); const P = points(); if (P.length) go(0, k === 'Home' ? { y: 0 } : P[P.length - 1]); return; }
    if (!dir || reading(dir)) return;
    e.preventDefault();
    if (!busy) go(dir);
  });
}

/* ---------- phones: a list shown one at a time with buttons, never a sideways swipe ---------- */
function pager(list) {
  if (!list || list.dataset.pg) return;
  const items = [...list.children];
  if (items.length < 2) return;
  list.dataset.pg = '1';
  const nav = document.createElement('div');
  nav.className = 'pg-nav';
  nav.innerHTML = `<button type="button" class="pg-b" data-pgo="-1" aria-label="${esc(ui('prev'))}">${icon('chevL')}</button><span class="pg-n" aria-live="polite"></span><button type="button" class="pg-b" data-pgo="1" aria-label="${esc(ui('next'))}">${icon('chevR')}</button>`;
  list.after(nav);
  let i = 0;
  const show = (k) => {
    i = (k + items.length) % items.length;
    items.forEach((el, j) => { el.classList.toggle('pg-on', j === i); if (j === i) el.classList.add('in'); });
    $('.pg-n', nav).textContent = `${i + 1} / ${items.length}`;
  };
  nav.addEventListener('click', (e) => { const b = e.target.closest('[data-pgo]'); if (b) show(i + Number(b.dataset.pgo)); });
  show(0);
}

function render() {
  const page = document.body.dataset.page || 'home';
  const app = $('#app');
  const main = (T.pages[page] || (page === '404' ? notFound : T.pages.home))();
  app.innerHTML = `${header(page)}<main id="main" tabindex="-1">${main}</main>${footer()}${fab()}${T.after ? T.after(page) : ''}`;
  document.documentElement.classList.remove('menu-open');
  setMeta(page); setSchema(); wireCore();
  T.wire && T.wire(page);
  snapPages();
  reveal(); countUp(); loadLater();
  document.documentElement.classList.add('ready');
}
function boot(tier) {
  T = tier;
  applyBrand(); wireDemo(); render();
  txArrive(); txWire(); introPlay(document.body.dataset.page || 'home');
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); t && setTimeout(() => t.scrollIntoView(), 60); }
}
/* ---------- availability calendar (tiers add it with  @uses cal  at the top of src/tier.js) ----------
   Shows months of days. Booked nights are crossed out. A guest taps a check-in day, then a check-out
   day; the calendar refuses ranges that are too short or that run through a booked night.
   booked: [["2026-12-20", "2027-01-03"], ...]  = check-in day to check-out day (that morning is free). */
const CD = {
  iso: (d) => d.toISOString().slice(0, 10),
  add: (s, n) => CD.iso(new Date(new Date(s + 'T00:00:00Z').getTime() + n * 864e5)),
  today: () => CD.iso(new Date(Date.now() - new Date().getTimezoneOffset() * 6e4)),
  nights: (a, b) => (a && b ? Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 864e5) : 0),
  month: (ym, k) => { const [y, m] = ym.split('-').map(Number); return new Date(Date.UTC(y, m - 1 + k, 1)).toISOString().slice(0, 7); },
  fmt: (s, o) => new Intl.DateTimeFormat(LOCALE(), { timeZone: 'UTC', ...o }).format(new Date(s.length === 7 ? s + '-01T00:00:00Z' : s + 'T00:00:00Z')),
};
CD.nice = (s) => (s ? CD.fmt(s, { weekday: 'short', day: 'numeric', month: 'short' }) : '');
/** True when the night that starts on day d is already booked. */
const nightTaken = (booked, d) => (booked || []).some((r) => r && d >= r[0] && d < r[1]);
/** First free night on or after day d (looks a year ahead). */
const nextFree = (booked, d) => { for (let k = 0; k < 366; k++) { const x = CD.add(d, k); if (!nightTaken(booked, x)) return x; } return ''; };

/**
 * calendar(root, { months, booked: () => [], minFor: (d) => n, price: (d) => 'short text', in, out, onChange(in, out) })
 * Returns { set(in, out), get(), redraw() }.
 */
function calendar(root, o) {
  let a = o.in || '', b = o.out || '', msg = '';
  let view = (a || CD.today()).slice(0, 7);
  const t0 = CD.today();
  const booked = () => (o.booked ? o.booked() : []);
  const free = (d) => !nightTaken(booked(), d);
  const rangeFree = (x, y) => { for (let d = x; d < y; d = CD.add(d, 1)) if (!free(d)) return false; return true; };
  const minFor = (d) => (o.minFor ? o.minFor(d) : 1);
  const week = Array.from({ length: 7 }, (_, i) => CD.fmt(CD.add('2024-01-01', i), { weekday: 'short' }).replace('.', '').slice(0, 2));
  const hint = () => (a && b ? `${CD.nice(a)} → ${CD.nice(b)} · ${ui('nNights', { n: CD.nights(a, b) })}` : a ? ui('calPickOut', { n: minFor(a) }) : ui('calPickIn'));
  const month = (ym) => {
    const first = new Date(ym + '-01T00:00:00Z'), lead = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    let h = '<span class="cal-x" aria-hidden="true"></span>'.repeat(lead);
    for (let n = 1; n <= days; n++) {
      const d = `${ym}-${String(n).padStart(2, '0')}`, past = d < t0, taken = free(d) === false;
      const choosingOut = a && !b && d > a;
      const ok = !past && (choosingOut ? rangeFree(a, d) || !taken : !taken); // past a booked night, a free day starts a new stay
      const cls = ['cal-d', past && 'is-past', taken && 'is-taken', d === t0 && 'is-today', d === a && 'is-a', d === b && 'is-b', a && b && d > a && d < b && 'is-in',
        choosingOut && ok && CD.nights(a, d) < minFor(a) && 'is-short'].filter(Boolean).join(' ');
      const p = o.price && !past && !taken ? o.price(d) : '';
      h += `<button type="button" class="${cls}" data-d="${d}"${ok ? '' : ' disabled'} aria-pressed="${d === a || d === b}" aria-label="${esc(CD.nice(d))}${taken ? ', ' + esc(ui('calBooked')) : ''}"><span>${n}</span>${p ? `<small>${esc(p)}</small>` : ''}</button>`;
    }
    return h;
  };
  const draw = () => {
    const n = o.months || 2;
    root.innerHTML = `<div class="cal-top">
      <button type="button" class="cal-nav" data-cal="-1" aria-label="${esc(ui('prev'))}"${view <= t0.slice(0, 7) ? ' disabled' : ''}>${icon('chevL')}</button>
      <p class="cal-msg${msg ? ' is-err' : ''}" aria-live="polite">${esc(msg || hint())}</p>
      <button type="button" class="cal-nav" data-cal="1" aria-label="${esc(ui('next'))}">${icon('chevR')}</button></div>
      <div class="cal-ms">${Array.from({ length: n }, (_, k) => { const ym = CD.month(view, k); return `<div class="cal-m${k ? ' cal-more' : ''}"><p class="cal-t">${esc(CD.fmt(ym, { month: 'long', year: 'numeric' }))}</p><div class="cal-g">${week.map((w) => `<span class="cal-w">${esc(w)}</span>`).join('')}${month(ym)}</div></div>`; }).join('')}</div>
      <div class="cal-foot"><span><i class="k-free"></i>${esc(ui('calFree'))}</span><span><i class="k-taken"></i>${esc(ui('calBooked'))}</span>${o.priceNote ? `<span class="cal-note">${esc(o.priceNote)}</span>` : ''}${a ? `<button type="button" class="cal-clear" data-cal-clear>${esc(ui('calClear'))}</button>` : ''}</div>`;
  };
  root.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-cal]');
    if (nav) { view = CD.month(view, +nav.dataset.cal); draw(); return; }
    if (e.target.closest('[data-cal-clear]')) { a = b = msg = ''; draw(); o.onChange && o.onChange('', ''); return; }
    const btn = e.target.closest('[data-d]');
    if (!btn || btn.disabled) return;
    const d = btn.dataset.d;
    msg = '';
    if (!a || b || d <= a || !rangeFree(a, d)) { a = d; b = ''; }
    else if (CD.nights(a, d) < minFor(a)) msg = ui('calMin', { n: minFor(a) });
    else b = d;
    draw();
    o.onChange && o.onChange(a, b);
  });
  draw();
  return {
    set(x, y) { a = x || ''; b = y || ''; msg = ''; if (a) view = a.slice(0, 7); draw(); },
    get: () => ({ in: a, out: b }),
    redraw() { if (a && b && !rangeFree(a, b)) { b = ''; msg = ui('calClash'); } draw(); },
  };
}

/** The same calendar in a pop-up (a sheet from the bottom on phones). Calls done(in, out) when the guest confirms. */
function pickDates(o, done) {
  let d = $('#wl-pick');
  if (!d) { d = document.createElement('dialog'); d.id = 'wl-pick'; d.className = 'pick'; document.body.append(d); }
  d.innerHTML = `<div class="pick-in"><div class="pick-head"><h2>${esc(ui('calTitle'))}</h2><button type="button" class="dlg-x" data-pick-x aria-label="${esc(ui('close'))}">${icon('close')}</button></div><div class="cal" data-pick-cal></div><div class="pick-foot"><button type="button" class="btn btn-accent btn-lg" data-pick-ok>${esc(ui('calDone'))}</button></div></div>`;
  const ok = $('[data-pick-ok]', d);
  const c = calendar($('[data-pick-cal]', d), { ...o, months: innerWidth < 760 ? 1 : 2, onChange: (x, y) => { ok.disabled = !(x && y); } });
  ok.disabled = !(o.in && o.out);
  d.onclick = (e) => { if (e.target === d || e.target.closest('[data-pick-x]')) d.close(); };
  ok.onclick = () => { const v = c.get(); d.close(); done(v.in, v.out); };
  d.showModal();
}

/* ==========================================================================
   MID TIER: "Villa Stays". A few villas (or suites) on one property:
   home, all the villas with their prices, gallery, a one-page booking
   request with a live price, and contact. Rupees with a EUR / USD switch.
   ========================================================================== */
/* @uses cal */
const S = () => C.sections || {};
const sec = (k) => { const s = S()[k]; return s && s.enabled !== false ? s : null; };
const LIST = () => (C.villas || []).filter((x) => has(x.name));
const byId = (id) => LIST().find((x) => x.id === id);
const Q = new URLSearchParams(location.search);
const B = () => C.booking || {};

/* ---------- money: prices are written in rupees; visitors can view them in euros or dollars ---------- */
const CUR = () => C.currency || {};
/** Prices in config are written in the base currency (currency.base, rupees if not set); rates turn them into the others. */
const BASE = () => CUR().base || 'MUR';
const curList = () => [BASE(), ...Object.keys(CUR().rates || {}).filter((c) => c !== BASE())];
let cur = (() => { const c = store.get('wl-cur'); return curList().includes(c) ? c : (CUR().default || BASE()); })();
const SYM = { MUR: 'Rs ', EUR: '€', USD: '$', GBP: '£', ZAR: 'R ', INR: '₹' };
const fmtIn = (v0, c) => { const v = c === BASE() ? v0 : v0 * ((CUR().rates || {})[c] || 0); return (SYM[c] || c + ' ') + Math.round(v).toLocaleString(LOCALE()); };
const money = (mur) => fmtIn(mur, cur);
const moneyAlt = (v) => { const alt = CUR().secondary; return cur === BASE() && alt && alt !== BASE() && CUR().rates && CUR().rates[alt] ? `≈ ${fmtIn(v, alt)}` : ''; };
const curLabel = (c) => (c === 'MUR' ? 'Rs' : (SYM[c] || c).trim());

/* ---------- dates ---------- */
const iso = (d) => d.toISOString().slice(0, 10);
const day = (s) => new Date(s + 'T00:00:00Z');
const addDays = (s, n) => iso(new Date(day(s).getTime() + n * 864e5));
const today = () => iso(new Date(Date.now() - new Date().getTimezoneOffset() * 6e4));
const between = (a, b) => (a && b ? Math.round((day(b) - day(a)) / 864e5) : 0);
const nice = (s) => (s ? new Intl.DateTimeFormat(LOCALE(), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(day(s)) : '');
const md = (s) => new Intl.DateTimeFormat(LOCALE(), { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(day('2001-' + s));

/* ---------- the price maths: seasons by the night, minimum stays, guests, extras ---------- */
const inSeason = (s, date) => { const d = date.slice(5); return s.from <= s.to ? d >= s.from && d <= s.to : d >= s.from || d <= s.to; };
const rateOn = (v, date) => { const s = (v.seasons || []).find((x) => inSeason(x, date)); return s ? s.price : v.price; };
const minFor = (v, date) => { const s = date && (v.seasons || []).find((x) => inSeason(x, date)); return (s && s.minNights) || v.minNights || 1; };
const fromPrice = (v) => Math.min(v.price, ...(v.seasons || []).map((s) => s.price));
/** A short price for a calendar day: "15.5k", "€304". */
const shortMoney = (v0) => { const v = cur === BASE() ? v0 : v0 * ((CUR().rates || {})[cur] || 0); const n = v >= 1000 ? decimal(Math.round(v / 100) / 10) + 'k' : String(Math.round(v)); return (cur === 'MUR' ? '' : (SYM[cur] || '').trim()) + n; };
const signed = (n) => (n < 0 ? '− ' + money(-n) : money(n));
/** The first stretch of free nights long enough for this villa, starting the search at day `from`. */
function freeRange(v, from) {
  for (let k = 0; k < 150; k++) {
    const a = addDays(from, k), n = Math.max(minFor(v, a), B().defaultNights || 5);
    let ok = true;
    for (let j = 0; j < n && ok; j++) if (nightTaken(v.booked, addDays(a, j))) ok = false;
    if (ok) return [a, addDays(a, n)];
  }
  return ['', ''];
}
const longStay = (n) => (B().longStay || []).filter((t) => n >= t.nights).sort((x, y) => y.pct - x.pct)[0];
const perLabel = (x) => ui('per_' + (x.per || 'booking'));
function estimate(v, st) {
  const out = { lines: [], total: 0, nights: 0, error: '' };
  if (!v) return out;
  const n = Math.max(1, +st.n || 1);
  out.nights = between(st.in, st.out);
  if (!st.in || !st.out) { out.error = ui('pickDates'); return out; }
  if (out.nights < 1) { out.error = ui('outAfterIn'); return out; }
  const min = minFor(v, st.in);
  if (out.nights < min) out.error = ui('minNights', { n: min });
  if (v.capacity && n > v.capacity) out.error = ui('tooMany', { n: v.capacity });
  let sum = 0; const rates = new Set();
  for (let k = 0; k < out.nights; k++) { const r = rateOn(v, addDays(st.in, k)); sum += r; rates.add(r); }
  out.lines.push({ label: rates.size === 1 ? `${ui('nNights', { n: out.nights })} × ${money([...rates][0])}` : `${ui('nNights', { n: out.nights })} (${ui('seasonalRates')})`, amount: sum });
  out.total = sum;
  const ls = longStay(out.nights);
  if (ls) { const off = Math.round(sum * ls.pct / 100); out.lines.push({ label: ui('longStayLine', { pct: ls.pct, n: ls.nights }), amount: -off, save: true }); out.total -= off; }
  for (const id of st.extras || []) {
    const x = (C.extras || []).find((e) => e.id === id);
    if (!x) continue;
    const amt = { booking: 1, night: out.nights, person: n, personNight: n * out.nights }[x.per || 'booking'] * x.price;
    out.lines.push({ label: tx(x.label), amount: amt });
    out.total += amt;
  }
  return out;
}

/* ---------- pages ---------- */
const PG = { home: './', villas: 'villas.html', gallery: 'gallery.html', contact: 'contact.html', book: 'book.html' };
const bookHref = (id, extra = '') => `${PG.book}?${id ? 'id=' + enc(id) : ''}${extra}`;
const villaHref = (id) => `${PG.villas}#${enc(id)}`;

const TIER = {
  get overlayHeader() { return !['book', '404'].includes(document.body.dataset.page); },
  homeHref: './',
  nav() {
    return [
      { key: 'villas', href: PG.villas, label: ui('navVillas') },
      sec('gallery') && { key: 'gallery', href: PG.gallery, label: ui('navGallery') },
      { key: 'contact', href: PG.contact, label: ui('navContact') },
    ].filter(Boolean);
  },
  headerCta: () => `${curList().length > 1 ? `<button class="hd-btn hd-cur" type="button" data-cur aria-label="${esc(curLabel(cur))}: ${esc(ui('currency'))}">${esc(curLabel(cur))}</button>` : ''}<a class="btn btn-accent hd-cta" href="${bookHref()}">${esc(ui('bookNow'))}</a>`,
  menuExtra: () => `<a class="btn btn-accent btn-lg" href="${bookHref()}">${esc(ui('bookNow'))}${icon('arrow', 'i-go')}</a>${curList().length > 1 ? `<div class="cur-seg" role="group" aria-label="${esc(ui('currency'))}">${curList().map((c) => `<button type="button" data-set-cur="${c}" aria-pressed="${c === cur}">${esc(curLabel(c))} ${c}</button>`).join('')}</div>` : ''}`,
  footerLinks: () => [{ href: './', label: ui('home') }, ...TIER.nav(), { href: bookHref(), label: ui('bookNow') }].map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join(''),
  pageTitle(p) { return { villas: ui('navVillas'), gallery: ui('navGallery'), contact: ui('navContact'), book: ui('bookNow') }[p] || ''; },
  pages: {
    home: () => [hero(), whyDirect(), welcome(), villaCards(), amenities(), reviewsBlock(), nearby(), findUs(), faq(), finalCta()].join(''),
    villas: () => [pageHead('villas'), villaDetails(), policies(), finalCta()].join(''),
    gallery: () => [pageHead('gallery'), galleryPage(), finalCta()].join(''),
    contact: () => [pageHead('contact'), contactPage(), findUs(true), faq()].join(''),
    book: () => bookPage(),
  },
  after(page) {
    if (page === 'book' || !LIST().length) return '';
    const p = Math.min(...LIST().map(fromPrice));
    return `<div class="book-bar"><p><span>${esc(ui('from'))}</span><b>${esc(money(p))}</b><small>${esc(ui('perNight'))}</small></p><div class="bar-go">${waHref() ? `<a class="bar-wa" href="${waHref(tx(K().whatsappMessage))}" target="_blank" rel="noopener" aria-label="${esc(ui('whatsappUs'))}">${icon('wa')}</a>` : ''}<a class="btn btn-accent" href="${bookHref()}">${esc(ui('bookNow'))}</a></div></div>`;
  },
  schema(base) {
    const o = { ...base, '@type': (C.seo && C.seo.schemaType) || 'LodgingBusiness', currenciesAccepted: BASE() };
    const r = (sec('reviews') || {}).summary;
    if (r && r.rating && r.count) o.aggregateRating = { '@type': 'AggregateRating', ratingValue: r.rating, reviewCount: r.count, bestRating: r.best || 5 };
    if (C.policies && C.policies.checkIn) { o.checkinTime = C.policies.checkIn; o.checkoutTime = C.policies.checkOut; }
    o.makesOffer = LIST().map((v) => ({ '@type': 'Offer', price: fromPrice(v), priceCurrency: BASE(), url: new URL(villaHref(v.id), location.href).href, itemOffered: { '@type': 'Accommodation', name: tx(v.name), occupancy: v.capacity ? { '@type': 'QuantitativeValue', maxValue: v.capacity } : undefined } }));
    return o;
  },
  wire(page) {
    if (matchMedia('(max-width: 759px)').matches) pager($('.near-grid'));
    document.documentElement.classList.toggle('has-book-bar', page !== 'book');
    $$('[data-cur]').forEach((b) => b.addEventListener('click', () => setCur(curList()[(curList().indexOf(cur) + 1) % curList().length])));
    $$('[data-set-cur]').forEach((b) => b.addEventListener('click', () => setCur(b.dataset.setCur)));
    $$('[data-carousel]').forEach((c) => carousel(c, { auto: 0 }));
    if (!window.__pastTop) { window.__pastTop = 1; const past = () => document.documentElement.classList.toggle('past-top', scrollY > innerHeight * 0.6); past(); addEventListener('scroll', past, { passive: true }); }
    wireHero(); wireSearch(); wirePhotos(); wireVillaCals(); wireBook();
    const cf = $('[data-contact-form]');
    cf && cf.addEventListener('submit', (e) => { e.preventDefault(); sendForm(cf, { subject: ui('formSubject', { name: C.name }) }); });
  },
};
function setCur(c) { cur = c; store.set('wl-cur', c); const y = scrollY; const st = bookState && bookState(); render(); if (st) restoreBook(st); scrollTo(0, y); }

/* ---------- shared bits ---------- */
const stars = (n = 5) => `<span class="stars" role="img" aria-label="${esc(ui('ratingOf', { n }))}">${icon('star').repeat(Math.round(n))}</span>`;
const featureRow = (v, max = 4) => (v.features || []).slice(0, max).map((f) => `<li>${icon(f.icon || 'check')}<span>${esc(tx(f.label))}</span></li>`).join('');
function pageHead(key) {
  const h = (S().pageHeads || {})[key] || {};
  const title = tx(h.title) || TIER.pageTitle(key);
  return `<section class="phead hero-under">
    <div class="phead-bg">${pic(h.image || ((sec('hero') || {}).images || [])[0], { eager: true, w: 1600 })}</div>
    <div class="wrap phead-in"><p class="eyebrow">${esc(C.name)}</p><h1 class="h1">${esc(title)}</h1>${has(h.text) ? `<p class="lead">${esc(tx(h.text))}</p>` : ''}</div>
  </section>`;
}
function guestOptions(max = 8, sel = 2) { return Array.from({ length: max }, (_, i) => `<option value="${i + 1}"${i + 1 === sel ? ' selected' : ''}>${i + 1} ${esc(i === 0 ? ui('guest') : ui('guestsLower'))}</option>`).join(''); }

/* ---------- home ---------- */
function hero() {
  const h = sec('hero') || {};
  const imgs = (h.images || []).filter(Boolean);
  const t = today(), max = Math.max(2, ...LIST().map((x) => x.capacity || 2));
  return `<section class="hero hero-under" data-hero>
  <div class="hero-media">${imgs.map((im, i) => `<figure class="hero-slide${i === 0 ? ' on' : ''}" data-hero-slide>${later(pic(im, { eager: i === 0, w: 1800 }), i)}</figure>`).join('')}</div>
  <div class="wrap hero-in">
    ${has(h.eyebrow) ? `<p class="eyebrow hero-rise">${esc(tx(h.eyebrow))}</p>` : ''}
    <h1 class="h1 hero-rise">${esc(tx(h.title) || C.name)}</h1>
    ${has(h.text) ? `<p class="lead hero-rise">${esc(tx(h.text))}</p>` : ''}
    <form class="search hero-rise" data-search action="${PG.book}" method="get">
      <input type="hidden" name="in" value="${addDays(t, 21)}"><input type="hidden" name="out" value="${addDays(t, 21 + (B().defaultNights || 5))}">
      <button type="button" class="sf sf-btn" data-search-dates><span>${esc(ui('checkIn'))}</span><b data-s-in></b></button>
      <button type="button" class="sf sf-btn" data-search-dates><span>${esc(ui('checkOut'))}</span><b data-s-out></b></button>
      <label class="sf"><span>${esc(ui('guests'))}</span><select name="n">${guestOptions(max, 2)}</select></label>
      <button class="btn btn-accent btn-lg" type="submit">${esc(ui('checkAvailability'))}${icon('arrow', 'i-go')}</button>
    </form>
  </div>
  ${imgs.length > 1 ? `<div class="hero-dots" aria-hidden="true">${imgs.map((_, i) => `<span${i === 0 ? ' class="on"' : ''}></span>`).join('')}</div>` : ''}
</section>`;
}
function wireSearch() {
  const f = $('[data-search]');
  if (!f) return;
  const a = f.elements.in, b = f.elements.out;
  const show = () => { $('[data-s-in]', f).textContent = a.value ? CD.nice(a.value) : ui('addDate'); $('[data-s-out]', f).textContent = b.value ? CD.nice(b.value) : ui('addDate'); };
  const minAll = Math.min(...LIST().map((v) => v.minNights || 1));
  $$('[data-search-dates]', f).forEach((btn) => btn.addEventListener('click', () => pickDates({ in: a.value, out: b.value, minFor: () => minAll }, (x, y) => { a.value = x; b.value = y; show(); })));
  show();
}
function wireHero() {
  const slides = $$('[data-hero-slide]'), dots = $$('.hero-dots span');
  if (slides.length > 1 && !reduced) {
    let i = 0;
    clearInterval(window.__heroT);
    window.__heroT = setInterval(() => { if (document.hidden) return; slides[i].classList.remove('on'); dots[i] && dots[i].classList.remove('on'); i = (i + 1) % slides.length; slides[i].classList.add('on'); dots[i] && dots[i].classList.add('on'); }, 6000);
  }
  const media = $('.hero-media, .phead-bg');
  if (media && !reduced) {
    let raf;
    addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (scrollY < innerHeight * 1.2) media.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`; }); }, { passive: true });
  }
}

function whyDirect() {
  const w = sec('whyDirect');
  if (!w || !has(w.items)) return '';
  return `<section class="direct"><div class="wrap direct-in">
    <div class="direct-copy" data-reveal>${has(w.eyebrow) ? `<p class="eyebrow">${esc(tx(w.eyebrow))}</p>` : ''}<h2 class="h2">${esc(tx(w.title))}</h2>${has(w.text) ? `<p>${esc(tx(w.text))}</p>` : ''}</div>
    <ul class="direct-list">${w.items.map((x, i) => `<li data-reveal style="--d:${0.07 * i}s"><span>${icon(x.icon || 'check')}</span><div><h3>${esc(tx(x.title))}</h3>${has(x.text) ? `<p>${esc(tx(x.text))}</p>` : ''}</div></li>`).join('')}</ul>
  </div></section>`;
}

function welcome() {
  const w = sec('intro');
  if (!w) return '';
  const imgs = (w.images || []).filter(Boolean).slice(0, 2);
  const paras = (Array.isArray(w.text) ? w.text : [w.text]).filter(has);
  return `<section class="sec welcome"><div class="wrap welcome-in">
    <div class="welcome-pics">${imgs.map((im, i) => `<figure class="wp wp${i + 1}" data-reveal="${i ? 'right' : 'zoom'}">${pic(im, { w: 900, sizes: '(min-width: 960px) 40vw, 90vw' })}</figure>`).join('')}</div>
    <div class="welcome-copy">${head(w.eyebrow, w.title)}${paras.map((p, i) => `<p data-reveal style="--d:${0.08 * i}s">${esc(tx(p))}</p>`).join('')}${has(w.signature) ? `<p class="sign" data-reveal>${esc(tx(w.signature))}</p>` : ''}
      <p class="btns" data-reveal><a class="btn btn-primary" href="${PG.villas}">${esc(ui('seeVillas'))}${icon('arrow', 'i-go')}</a></p></div>
  </div></section>`;
}

function villaCards() {
  const v = sec('villasIntro') || {};
  if (!LIST().length) return '';
  return `<section class="sec sec-alt"><div class="wrap">
    ${head(v.eyebrow, v.title || ui('navVillas'), v.lead)}
    <ul class="vc-grid">${LIST().map((x, i) => `<li class="vc" data-reveal style="--d:${0.08 * i}s">
      <a class="vc-pic" href="${villaHref(x.id)}" aria-label="${esc(tx(x.name))}">${pic((x.images || [])[0], { w: 800, sizes: '(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw' })}${has(x.badge) ? `<span class="badge">${esc(tx(x.badge))}</span>` : ''}</a>
      <div class="vc-body">
        <h3 class="h3"><a href="${villaHref(x.id)}">${esc(tx(x.name))}</a></h3>
        ${has(x.short) ? `<p>${esc(tx(x.short))}</p>` : ''}
        <ul class="feat">${featureRow(x)}</ul>
        <div class="vc-foot"><p class="price"><span>${esc(ui('from'))}</span> <b>${esc(money(fromPrice(x)))}</b> <small>${esc(ui('perNight'))}</small></p><a class="btn btn-primary" href="${bookHref(x.id)}">${esc(ui('bookNow'))}</a></div>
      </div>
    </li>`).join('')}</ul>
  </div></section>`;
}

function amenities() {
  const a = sec('amenities');
  if (!a || !has(a.items)) return '';
  return `<section class="sec amen"><div class="wrap">
    ${head(a.eyebrow, a.title, a.lead, 'center')}
    <ul class="amen-row">${a.items.filter((x) => has(x.label)).map((x, i) => `<li data-reveal style="--d:${(i % 6) * 0.05}s"><span>${icon(x.icon || 'check')}</span>${esc(tx(x.label))}</li>`).join('')}</ul>
  </div></section>`;
}

function reviewsBlock() {
  const r = sec('reviews');
  const items = ((r || {}).items || []).filter((x) => has(x.text));
  if (!r || !items.length) return '';
  const sum = r.summary || {};
  return `<section class="sec sec-alt rev" data-carousel><div class="wrap">
    <div class="rev-top">${head(r.eyebrow, r.title)}
      <div class="rev-side" data-reveal>${sum.rating ? `<p class="rev-score"><b>${esc(decimal(sum.rating))}${sum.best && sum.best !== 5 ? `<i>/${sum.best}</i>` : ''}</b><span>${stars(sum.rating * 5 / (sum.best || 5))}<small>${esc([sum.count && ui('basedOn', { n: sum.count }), tx(sum.source)].filter(Boolean).join(' · '))}</small></span></p>` : ''}
      ${(r.links || []).filter((l) => l.url).map((l) => `<a class="rev-link" href="${esc(l.url)}" target="_blank" rel="noopener">${icon(l.icon || 'star')}${esc(ui('seeUsOn', { site: l.name }))}</a>`).join('')}${gReview('btn btn-line rev-g')}</div>
    </div>
    <ul class="rev-track" data-track>${items.map((x) => `<li class="rev-card" data-slide>${x.rating ? stars(x.rating) : ''}<blockquote><p>${esc(tx(x.text))}</p></blockquote><p class="rev-by"><b>${esc(x.name)}</b><span>${esc([tx(x.from), tx(x.date), x.source].filter(Boolean).join(' · '))}</span></p></li>`).join('')}</ul>
    <div class="rev-nav"><button type="button" class="rn" data-prev aria-label="${esc(ui('prev'))}">${icon('chevL')}</button><div class="dots" data-dots></div><button type="button" class="rn" data-next aria-label="${esc(ui('next'))}">${icon('chevR')}</button></div>
  </div></section>`;
}

function nearby() {
  const n = sec('nearby');
  const items = ((n || {}).items || []).filter((x) => has(x.title));
  if (!n || !items.length) return '';
  return `<section class="sec near"><div class="wrap">
    ${head(n.eyebrow, n.title, n.lead)}
    <ul class="near-grid">${items.map((x, i) => `<li class="near-card" data-reveal style="--d:${0.07 * i}s"><figure>${pic(x.image, { w: 700, sizes: '(min-width: 1000px) 25vw, (min-width: 600px) 50vw, 85vw' })}${has(x.distance) ? `<span class="near-d">${icon(x.icon || 'car')}${esc(tx(x.distance))}</span>` : ''}</figure><div><h3 class="h3">${esc(tx(x.title))}</h3>${has(x.text) ? `<p>${esc(tx(x.text))}</p>` : ''}</div></li>`).join('')}</ul>
  </div></section>`;
}

function findUs(full = false) {
  const l = sec('location');
  if (!l) return '';
  const facts = (l.facts || []).filter((f) => has(f.label));
  const how = (l.howToGetHere || []).filter((x) => has(x.text));
  return `<section class="sec loc${full ? ' sec-alt' : ''}"><div class="wrap loc-in">
    <div class="loc-copy">${head(l.eyebrow, l.title, l.text)}
      ${facts.length ? `<ul class="loc-facts">${facts.map((f, i) => `<li data-reveal style="--d:${0.06 * i}s">${icon(f.icon || 'pin')}<b>${esc(tx(f.value))}</b><span>${esc(tx(f.label))}</span></li>`).join('')}</ul>` : ''}
      ${full && how.length ? `<h3 class="h3 how-t">${esc(ui('howToGetHere'))}</h3><ul class="how">${how.map((x) => `<li>${icon(x.icon || 'compass')}<p><b>${esc(tx(x.title))}</b> ${esc(tx(x.text))}</p></li>`).join('')}</ul>` : ''}
      <p class="btns"><a class="btn btn-line" href="${esc(mapsLink())}" target="_blank" rel="noopener">${icon('pin')}${esc(ui('directions'))}</a></p>
    </div>
    ${mapBox('map loc-map')}
  </div></section>`;
}

function faq() {
  const f = sec('faq');
  const items = ((f || {}).items || []).filter((x) => has(x.q));
  if (!f || !items.length) return '';
  return `<section class="sec faq"><div class="wrap narrow">${head(f.eyebrow, f.title, '', 'center')}
    <div class="faq-list">${items.map((x, i) => `<details data-reveal style="--d:${0.05 * i}s"${i === 0 ? ' open' : ''}><summary>${esc(tx(x.q))}${icon('plus')}</summary><p>${esc(tx(x.a))}</p></details>`).join('')}</div>
  </div></section>`;
}

function finalCta() {
  const c = sec('finalCta');
  if (!c || !has(c.title)) return '';
  return `<section class="last">${c.image ? `<div class="last-bg">${pic(c.image, { w: 1600 })}</div>` : ''}<div class="wrap last-in" data-reveal>
    <h2 class="h2">${esc(tx(c.title))}</h2>${has(c.text) ? `<p class="lead">${esc(tx(c.text))}</p>` : ''}
    <p class="btns"><a class="btn btn-accent btn-lg" href="${bookHref()}">${esc(ui('checkAvailability'))}${icon('arrow', 'i-go')}</a>${waHref() ? `<a class="btn btn-ghost btn-lg" href="${waHref(tx(K().whatsappMessage))}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>` : ''}</p>
  </div></section>`;
}

/* ---------- the villas page: every villa with photos, details and its price table ---------- */
function priceTable(v) {
  const rows = [{ name: ui('standardRate'), dates: ui('allOtherDates'), price: v.price, min: v.minNights }, ...(v.seasons || []).map((s) => ({ name: tx(s.name), dates: `${md(s.from)} – ${md(s.to)}`, price: s.price, min: s.minNights || v.minNights }))];
  return `<p class="pt-cap" id="pt-${esc(v.id)}">${esc(ui('prices'))} · ${esc(ui('perNight'))}</p><table class="pt" aria-labelledby="pt-${esc(v.id)}"><tbody>${rows.map((r) => `<tr><th scope="row">${esc(r.name)}<small>${esc(r.dates)}</small></th><td><b>${esc(money(r.price))}</b>${r.min ? `<small>${esc(ui('minShort', { n: r.min }))}</small>` : ''}</td></tr>`).join('')}</tbody></table>`;
}
function villaDetails() {
  return LIST().map((v, i) => {
    const imgs = (v.images || []).filter(Boolean);
    const desc = (Array.isArray(v.description) ? v.description : [v.description]).filter(has);
    return `<section class="sec vd${i % 2 ? ' sec-alt vd-flip' : ''}" id="${esc(v.id)}"><div class="wrap vd-in">
      <div class="vd-pics" data-photos="${esc(v.id)}">${imgs.slice(0, 3).map((im, k) => `<button type="button" class="vd-pic${k === 0 ? ' vd-main' : ''}" data-pi="${k}" aria-label="${esc(ui('viewFull'))}: ${esc(tx(imgOf(im).alt))}">${pic(im, { w: k === 0 ? 1100 : 600, sizes: k === 0 ? '(min-width: 960px) 50vw, 100vw' : '(min-width: 960px) 25vw, 50vw' })}${k === 2 && imgs.length > 3 ? `<span class="vd-more">+${imgs.length - 3}</span>` : ''}</button>`).join('')}</div>
      <div class="vd-copy">
        ${has(v.badge) ? `<p class="badge badge-inline">${esc(tx(v.badge))}</p>` : ''}
        <h2 class="h2">${esc(tx(v.name))}</h2>
        ${has(v.short) ? `<p class="lead">${esc(tx(v.short))}</p>` : ''}
        <ul class="feat">${featureRow(v, 6)}</ul>
        ${desc.map((p) => `<p class="vd-p">${esc(tx(p))}</p>`).join('')}
        ${has(v.amenities) ? `<h3 class="h3 vd-h">${esc(ui('inTheVilla'))}</h3><ul class="ticks">${v.amenities.map((a) => `<li>${icon('check')}${esc(tx(a))}</li>`).join('')}</ul>` : ''}
        ${priceTable(v)}
        ${has(B().longStay) ? `<p class="ls-note">${icon('tag')}<span>${B().longStay.map((t) => esc(ui('longStayShort', { n: t.nights, pct: t.pct }))).join(' · ')}</span></p>` : ''}
        <div class="vd-cal"><h3 class="h3 vd-h">${esc(ui('availability'))}</h3><div class="cal" data-vcal="${esc(v.id)}"></div></div>
        <p class="btns"><a class="btn btn-accent btn-lg" data-vcal-go="${esc(v.id)}" href="${bookHref(v.id)}">${esc(ui('bookThis'))}${icon('arrow', 'i-go')}</a>${waHref() ? `<a class="btn btn-line btn-lg" href="${waHref(ui('waAsk', { name: C.name, villa: tx(v.name) }))}" target="_blank" rel="noopener">${icon('wa')}${esc(ui('askQuestion'))}</a>` : ''}</p>
      </div>
    </div></section>`;
  }).join('');
}
function policies() {
  const p = C.policies || {};
  const items = (p.items || []).filter((x) => has(x.title));
  if (!items.length) return '';
  return `<section class="sec pol"><div class="wrap">${head(p.eyebrow || '', p.title || ui('policies'), '', 'center')}
    <ul class="pol-grid">${items.map((x, i) => `<li data-reveal style="--d:${0.06 * i}s"><span>${icon(x.icon || 'info')}</span><h3 class="h3">${esc(tx(x.title))}</h3><p>${esc(tx(x.text))}</p></li>`).join('')}</ul>
  </div></section>`;
}

function wireVillaCals() {
  $$('[data-vcal]').forEach((box) => {
    const v = byId(box.dataset.vcal), go = $(`[data-vcal-go="${v.id}"]`);
    calendar(box, {
      months: 1, booked: () => v.booked || [], minFor: (d) => minFor(v, d), price: (d) => shortMoney(rateOn(v, d)),
      priceNote: ui('calPriceNote', { cur: curLabel(cur) }),
      onChange: (a, b) => { if (go) { go.href = bookHref(v.id, a && b ? `&in=${a}&out=${b}` : ''); go.classList.toggle('is-ready', !!(a && b)); } },
    });
  });
}

/* ---------- gallery ---------- */
const galleryImgs = () => ((sec('gallery') || {}).images || []).filter(Boolean);
function galleryPage() {
  const imgs = galleryImgs();
  if (!imgs.length) return '';
  return `<section class="sec"><div class="wrap"><div class="masonry" data-photos="gallery">${imgs.map((im, i) => `<button type="button" class="m-it" data-pi="${i}" data-reveal style="--d:${(i % 3) * 0.06}s" aria-label="${esc(ui('viewFull'))}: ${esc(tx(imgOf(im).alt))}">${pic(im, { w: 800, sizes: '(min-width: 1000px) 33vw, (min-width: 600px) 50vw, 100vw' })}</button>`).join('')}</div></div></section>`;
}
function wirePhotos() {
  $$('[data-photos]').forEach((box) => box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pi]');
    if (!b) return;
    const id = box.dataset.photos, list = id === 'gallery' ? galleryImgs() : ((byId(id) || {}).images || []);
    lightbox(list.map((im) => ({ src: im, alt: tx(imgOf(im).alt), caption: tx(imgOf(im).alt) })), +b.dataset.pi);
  }));
}

/* ---------- contact ---------- */
function contactPage() {
  const k = K(), addr = addressLines();
  const rows = [
    waHref() && `<li><span class="ci-ic ci-wa">${icon('wa')}</span><div><b>WhatsApp</b><a href="${waHref(tx(k.whatsappMessage))}" target="_blank" rel="noopener">${esc(ui('chatNow'))}</a></div></li>`,
    has(k.phone) && `<li><span class="ci-ic">${icon('phone')}</span><div><b>${esc(ui('phone'))}</b><a href="${telHref(k.phone)}">${esc(k.phone)}</a></div></li>`,
    has(k.email) && `<li><span class="ci-ic">${icon('mail')}</span><div><b>${esc(ui('email'))}</b><a href="${mailHref()}">${esc(k.email)}</a></div></li>`,
    addr.length && `<li><span class="ci-ic">${icon('pin')}</span><div><b>${esc(ui('address'))}</b><a href="${esc(mapsLink())}" target="_blank" rel="noopener">${addr.map(esc).join(', ')}</a></div></li>`,
    has(k.googleBusiness) && `<li><span class="ci-ic">${icon('google')}</span><div><b>Google</b><a href="${esc(k.googleBusiness)}" target="_blank" rel="noopener">${esc(ui('seeOnGoogle'))}</a></div></li>`,
  ].filter(Boolean).join('');
  return `<section class="sec"><div class="wrap contact-in">
    <div class="ci-card" data-reveal="left">
      ${has(k.responseTime) ? `<p class="ci-fast">${icon('clock')}<span>${esc(tx(k.responseTime))}</span></p>` : ''}
      <ul class="ci-list">${rows}</ul>
      ${gReview('btn btn-line ci-review')}
      ${C.hours ? `<div><h3 class="h3">${esc(ui('hoursTitle'))}</h3>${hoursTable()}</div>` : ''}
      ${socialLinks('social social-dark')}
    </div>
    <form class="form ci-form" data-contact-form novalidate data-reveal="right">
      <h2 class="h3">${esc(ui('formTitle'))}</h2>
      <div class="row-2"><label class="fld"><span class="lbl">${esc(ui('fName'))}</span><input name="name" autocomplete="name" required></label><label class="fld"><span class="lbl">${esc(ui('fPhone'))}</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel"></label></div>
      <label class="fld"><span class="lbl">${esc(ui('fEmail'))}</span><input name="email" type="email" autocomplete="email" required></label>
      <label class="fld"><span class="lbl">${esc(ui('fMessageContact'))}</span><textarea name="message" required></textarea></label>
      <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="sr" aria-hidden="true">
      <p class="form-status" data-status role="status" hidden></p>
      <button class="btn btn-primary btn-lg" type="submit">${icon('send')}${esc(ui('fSend'))}</button>
      <p class="form-note">${esc(ui('formPrivacy'))}</p>
    </form>
  </div></section>`;
}

/* ---------- the booking request: one page, live price, form or WhatsApp ---------- */
let bookState = null, bookCal = null;
function bookPage() {
  const it = byId(Q.get('id')) || LIST()[0];
  if (!it) return '';
  const extras = (C.extras || []).filter((x) => has(x.label));
  const countries = L().countries || [];
  const n0 = Math.min(+(Q.get('n') || 2), it.capacity || 8);
  return `<section class="book-head"><div class="wrap"><a class="crumb-back" href="${PG.villas}">${icon('chevL')}${esc(ui('navVillas'))}</a><h1 class="h2">${esc(ui('bookTitle'))}</h1><p class="lead">${esc(ui('bookLead'))}</p></div></section>
  <section class="sec book"><div class="wrap book-in">
    <form class="bk" data-book novalidate>
      <fieldset class="bk-block"><legend class="h3"><span>1</span>${esc(ui('stepStay'))}</legend>
        <div class="vpick">${LIST().map((x) => `<label class="vp"><input type="radio" name="villa" value="${esc(x.id)}"${x.id === it.id ? ' checked' : ''} data-label="${esc(ui('villa'))}"><span class="vp-box">${pic((x.images || [])[0], { w: 300, sizes: '120px' })}<span><b>${esc(tx(x.name))}</b><small>${esc(ui('upTo', { n: x.capacity }))} · ${esc(ui('from').toLowerCase())} ${esc(money(fromPrice(x)))}</small></span><i>${icon('check')}</i></span></label>`).join('')}</div>
        <input type="hidden" name="in" value="${esc(Q.get('in') || '')}"><input type="hidden" name="out" value="${esc(Q.get('out') || '')}">
        <div class="fld"><span class="lbl">${esc(ui('dates'))}</span><div class="cal bk-cal" data-bcal></div></div>
        <div class="fld"><span class="lbl">${esc(ui('guests'))}</span><div class="step"><button type="button" data-step="-1" aria-label="${esc(ui('less'))}">${icon('minus')}</button><input type="number" name="n" min="1" max="${it.capacity || 8}" value="${n0}" inputmode="numeric" aria-label="${esc(ui('guests'))}" data-label="${esc(ui('guests'))}"><button type="button" data-step="1" aria-label="${esc(ui('more'))}">${icon('plus')}</button></div></div>
      </fieldset>
      ${extras.length ? `<fieldset class="bk-block"><legend class="h3"><span>2</span>${esc(ui('stepExtras'))}</legend><div class="extras">${extras.map((x) => `<label class="xopt"><input type="checkbox" name="extras" value="${esc(x.id)}"><span class="xo-box">${icon(x.icon || 'plus')}<span><b>${esc(tx(x.label))}</b>${has(x.text) ? `<small>${esc(tx(x.text))}</small>` : ''}</span><em>${x.price ? `${esc(money(x.price))} <small>${esc(perLabel(x))}</small>` : esc(ui('free'))}</em></span></label>`).join('')}</div></fieldset>` : ''}
      <fieldset class="bk-block"><legend class="h3"><span>${extras.length ? 3 : 2}</span>${esc(ui('stepDetails'))}</legend>
        <label class="fld"><span class="lbl">${esc(ui('fName'))}</span><input name="name" autocomplete="name" required data-label="${esc(ui('fName'))}"></label>
        <div class="row-2">
          <label class="fld"><span class="lbl">${esc(ui('fEmail'))}</span><input name="email" type="email" autocomplete="email" required data-label="${esc(ui('fEmail'))}"></label>
          <label class="fld"><span class="lbl">${esc(ui('fPhone'))} <small>${esc(ui('withCode'))}</small></span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required data-label="${esc(ui('fPhone'))}"></label>
        </div>
        <label class="fld"><span class="lbl">${esc(ui('fCountry'))}</span><input name="country" list="wl-countries" autocomplete="country-name" data-label="${esc(ui('fCountry'))}"><datalist id="wl-countries">${countries.map((c) => `<option value="${esc(c)}">`).join('')}</datalist></label>
        <label class="fld"><span class="lbl">${esc(ui('fMessage'))} <small>${esc(ui('optional'))}</small></span><textarea name="message" placeholder="${esc(ui('messageHint'))}" data-label="${esc(ui('fMessage'))}"></textarea></label>
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="sr" aria-hidden="true">
      </fieldset>
      <p class="form-status" data-status role="status" hidden></p>
      <div class="btns bk-btns">
        ${B().sendVia !== 'whatsapp' ? `<button type="submit" class="btn btn-primary btn-lg">${icon('send')}${esc(ui('sendRequest'))}</button>` : ''}
        ${B().sendVia !== 'endpoint' && waHref() ? `<button type="button" class="btn btn-wa btn-lg" data-bwa>${icon('wa')}${esc(ui('confirmWa'))}</button>` : ''}
      </div>
      <p class="form-note">${icon('lock')}${esc(ui('noPayNow'))}</p>
    </form>
    <aside class="bk-sum" data-sum aria-live="polite"></aside>
  </div></section>
  <div class="bk-done" data-bdone hidden></div>`;
}
function readBook(f) {
  const v = (n) => (f.elements[n] ? f.elements[n].value : '');
  return { id: ($('[name="villa"]:checked', f) || {}).value, in: v('in'), out: v('out'), n: v('n'), extras: $$('[name="extras"]:checked', f).map((x) => x.value) };
}
function restoreBook(st) {
  const f = $('[data-book]');
  if (!f) return;
  for (const k of ['in', 'out', 'n']) if (f.elements[k] && st[k] != null) f.elements[k].value = st[k];
  $$('[name="villa"]', f).forEach((x) => { x.checked = x.value === st.id; });
  bookCal && bookCal.set(st.in, st.out);
  $$('[name="extras"]', f).forEach((x) => { x.checked = (st.extras || []).includes(x.value); });
  f.dispatchEvent(new Event('change'));
}
function bookText(st, e, v) {
  const lines = [ui('waIntro', { name: C.name }), '', `${ui('villa')}: ${tx(v.name)}`, `${ui('dates')}: ${nice(st.in)} → ${nice(st.out)} (${ui('nNights', { n: e.nights })})`, `${ui('guests')}: ${st.n}`];
  const ex = (st.extras || []).map((id) => tx(((C.extras || []).find((x) => x.id === id) || {}).label)).filter(Boolean);
  if (ex.length) lines.push(`${ui('stepExtras')}: ${ex.join(', ')}`);
  lines.push(`${ui('estTotal')}: ${fmtIn(e.total, BASE())}${cur !== BASE() ? ` (≈ ${money(e.total)})` : ''}`);
  const f = $('[data-book]');
  for (const n of ['name', 'email', 'phone', 'country', 'message']) { const el = f.elements[n]; if (el && el.value) lines.push(`${el.dataset.label}: ${el.value}`); }
  return lines.join('\n');
}
const bookRecord = (st, e, v, f) => ({ type: 'booking', item: tx(v.name), itemId: v.id, in: st.in, out: st.out, guests: st.n, total: Math.round(e.total), currency: BASE(), extras: (st.extras || []).join(', '), ...formFields(f) });
function wireBook() {
  const f = $('[data-book]');
  if (!f) return;
  bookState = () => readBook(f);
  const sum = $('[data-sum]'), status = $('[data-status]', f);
  const draw = () => {
    const st = readBook(f), v = byId(st.id) || LIST()[0], e = estimate(v, st);
    const dep = B().depositPct ? Math.round(e.total * B().depositPct / 100) : 0;
    const cap = v.capacity || 8; f.elements.n.max = cap; if (+f.elements.n.value > cap) f.elements.n.value = cap;
    sum.innerHTML = `<div class="sum-card">
      <figure>${pic((v.images || [])[0], { w: 700, sizes: '(min-width: 1000px) 380px, 100vw' })}</figure>
      <div class="sum-body">
        <p class="eyebrow">${esc(ui('yourStay'))}</p><h2 class="h3">${esc(tx(v.name))}</h2>
        <p class="sum-meta">${icon('calendar')}${esc(st.in && st.out ? `${nice(st.in)} → ${nice(st.out)}` : ui('pickDates'))}</p>
        <p class="sum-meta">${icon('users')}${esc(st.n)} ${esc(+st.n === 1 ? ui('guest') : ui('guestsLower'))}</p>
        ${e.error ? `<p class="qe-err">${icon('info')}${esc(e.error)}</p>` : ''}
        <div class="sum-lines">${e.lines.map((l) => `<p${l.save ? ' class="is-save"' : ''}><span>${esc(l.label)}</span><span>${esc(signed(l.amount))}</span></p>`).join('')}</div>
        ${!e.error && e.nights && !longStay(e.nights) && has(B().longStay) ? `<p class="sum-tip">${icon('tag')}${esc(ui('longStayTip', { n: B().longStay[0].nights, pct: B().longStay[0].pct }))}</p>` : ''}
        <p class="sum-total"><span>${esc(ui('estTotal'))}</span><b>${esc(money(e.total))}</b></p>
        ${moneyAlt(e.total) ? `<p class="sum-alt">${esc(moneyAlt(e.total))}</p>` : ''}
        ${dep ? `<p class="sum-dep">${esc(ui('depositLine', { pct: B().depositPct, amount: money(dep) }))}</p>` : ''}
      </div></div>`;
    const bar = $('[data-bk-total]');
    bar && (bar.textContent = money(e.total));
    return e;
  };
  const ok = () => {
    const e = draw();
    if (e.error) { status.hidden = false; status.className = 'form-status err'; status.textContent = e.error; $('[data-bcal]').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); return false; }
    status.hidden = true;
    return f.reportValidity();
  };
  f.addEventListener('input', draw);
  const villa = () => byId(readBook(f).id) || LIST()[0];
  bookCal = calendar($('[data-bcal]'), {
    months: innerWidth < 760 ? 1 : 2, in: f.elements.in.value, out: f.elements.out.value,
    booked: () => villa().booked || [], minFor: (d) => minFor(villa(), d), price: (d) => shortMoney(rateOn(villa(), d)),
    priceNote: ui('calPriceNote', { cur: curLabel(cur) }),
    onChange: (a, b) => { f.elements.in.value = a; f.elements.out.value = b; draw(); },
  });
  f.addEventListener('change', (e) => {
    if (e.target.name === 'villa') { bookCal.redraw(); const g = bookCal.get(); f.elements.in.value = g.in; f.elements.out.value = g.out; }
    draw();
  });
  f.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (!b) return;
    const inp = $('input', b.parentElement);
    inp.value = Math.max(+inp.min || 1, Math.min(+inp.max || 99, (+inp.value || 0) + (+b.dataset.step))); draw();
  });
  const finish = (via) => {
    const st = readBook(f), v = byId(st.id), e = estimate(v, st);
    const ref = (B().refPrefix || 'BK') + '-' + Date.now().toString(36).slice(-5).toUpperCase();
    $('.book').hidden = true; $('.book-head').hidden = true;
    const bar = $('.bk-mbar'); bar && bar.remove();
    const done = $('[data-bdone]');
    done.hidden = false;
    done.innerHTML = `<div class="wrap narrow done-in">${icon('check', 'done-tick')}<p class="eyebrow">${esc(ui('ref', { ref }))}</p><h1 class="h2">${esc(ui('doneTitle'))}</h1><p class="lead">${esc(via === 'wa' ? ui('doneWa') : ui('doneSent'))}</p>
      <div class="done-card"><h2 class="h3">${esc(tx(v.name))}</h2><p>${esc(`${nice(st.in)} → ${nice(st.out)}`)} · ${esc(st.n)} ${esc(ui('guestsLower'))}</p><p class="sum-total"><span>${esc(ui('estTotal'))}</span><b>${esc(money(e.total))}</b></p></div>
      <ol class="next-steps"><li>${esc(ui('next1'))}</li><li>${esc(ui('next2', { pct: B().depositPct }))}</li><li>${esc(ui('next3'))}</li></ol>
      <p class="btns"><a class="btn btn-primary btn-lg" href="./">${esc(ui('backHome'))}</a>${waHref() ? `<a class="btn btn-line btn-lg" href="${waHref(ui('waFollow', { ref }))}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>` : ''}</p></div>`;
    scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!ok()) return;
    const st = readBook(f), v = byId(st.id);
    const sent = await sendForm(f, { subject: ui('bookSubject', { name: C.name }), summary: bookText(st, estimate(v, st), v), record: bookRecord(st, estimate(v, st), v, f) });
    if (sent && (demoOn() || (C.form || {}).endpoint)) finish('form');
  });
  const wa = $('[data-bwa]', f);
  wa && wa.addEventListener('click', () => {
    if (!ok()) return;
    const st = readBook(f), v = byId(st.id), text = bookText(st, estimate(v, st), v);
    if (demoOn()) demoShow('wa', text); else { inboxSend({ ...bookRecord(st, estimate(v, st), v, f), via: 'whatsapp' }); window.open(waHref(text), '_blank', 'noopener'); }
    finish('wa');
  });
  // dates arrive from the search bar or a villa's calendar; otherwise suggest the first free stretch three weeks out
  if (!f.elements.in.value || !f.elements.out.value) { const [a, b] = freeRange(villa(), addDays(today(), 21)); f.elements.in.value = a; f.elements.out.value = b; bookCal.set(a, b); }
  else bookCal.redraw();
  { const g = bookCal.get(); f.elements.in.value = g.in; f.elements.out.value = g.out; }
  $('.bk-mbar') || $('#app').insertAdjacentHTML('beforeend', `<div class="bk-mbar"><p><span>${esc(ui('estTotal'))}</span><b data-bk-total></b></p><button type="button" class="btn btn-accent" data-to-sum>${esc(ui('details'))}</button></div>`);
  $('[data-to-sum]').onclick = () => sum.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  draw();
}

boot(TIER);
})();
