// Livin' landing -> 3 AEM files per skill "aem-html-split".
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module'; import * as esbuild from 'esbuild';
import { makeRenamer } from './jsrename.mjs';
const require = createRequire(import.meta.url); const postcss = require('postcss');
const babel = require('@babel/core'); const terser = require('terser');

const SRC = process.argv[2], OUT = process.argv[3];
const ROOT = 'appLivinLanding', R = '#' + ROOT, P = 'lv-', NAME = 'livin-landing';
const DAM = process.env.DAM || '/content/dam/livin/';
fs.mkdirSync(OUT, { recursive: true });
const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');
const pascal = (s) => s.replace(/(^|[-_])([a-z0-9])/g, (_, __, c) => c.toUpperCase());

/* ============================ 1. HTML: utilities -> BEM ============================ */
const MAP = [
  ['mx-auto max-w-site', 'wrap'],
  ['bg-mandiri text-navy', 'glass-pill__icon--mandiri'], ['bg-pink-400 text-white', 'glass-pill__icon--pink'],
  ['bg-navy text-white', 'glass-pill__icon--navy'], ['bg-emerald-400', 'glass-pill__icon--emerald'],
  ['p-6 bg-soft rounded-2xl', 'exp__noscript'], ['text-white/70', 'section-head__aside--light'],
  ['underline', 'mmenu__tel'], ['text-white', 'h2--light'], ['ring', 'ring'],
];
const html0 = read('index.html');
const bodyM = html0.match(/<body([^>]*)>([\s\S]*)<\/body>/);
const bodyUtils = bodyM[1].match(/class="([^"]*)"/)[1].split(' ');
const twAll = new Set(MAP.flatMap(([u]) => u.split(' ')));
let body = bodyM[2].replace(/class="([^"]*)"/g, (m, c) => {
  const t = c.split(/\s+/).filter(Boolean), keep = t.filter((x) => !twAll.has(x) || x === 'ring'), u = t.filter((x) => twAll.has(x) && x !== 'ring');
  if (!u.length) return m; const hit = MAP.find(([k]) => k === u.join(' ')); if (!hit) throw new Error('unmapped ' + u);
  return `class="${[...keep, hit[1]].join(' ')}"`;
});

/* ============================ 2. Class & id inventory ============================ */
const NOPREFIX = (c) => c === 'lucide' || c.startsWith('lucide-');
const ROOT_STATE = new Set(['motion', 'has-cursor', 'js', 'no-js']);
const classes = new Set();
const addTok = (s) => s.split(/\s+/).forEach((t) => { if (/^[A-Za-z_][\w-]*$/.test(t) && !NOPREFIX(t)) classes.add(t); });
for (const m of body.matchAll(/class="([^"]*)"/g)) addTok(m[1]);
const CSS_FILES = ['style.css', 'theme-corp.css', 'app-ui.css', 'animations.css', 'responsive.css'];
for (const f of CSS_FILES) postcss.parse(read('css/' + f)).walkRules((r) => { for (const m of r.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) if (!NOPREFIX(m[1])) classes.add(m[1]); });
const jsFiles = fs.readdirSync(path.join(SRC, 'js')).filter((f) => f.endsWith('.js'));
for (const f of jsFiles) { const s = read('js/' + f);
  for (const m of s.matchAll(/class="([^"]*)"/g)) addTok(m[1].replace(/\$\{[^}]*\}/g, ' '));
  for (const m of s.matchAll(/classList\.(?:add|remove|toggle|contains)\(\s*'([^']+)'/g)) addTok(m[1]);
  for (const m of s.matchAll(/className\s*=\s*([^;]+)/g)) for (const q of m[1].matchAll(/'([^']*)'/g)) addTok(q[1]);
  for (const m of s.matchAll(/(?:querySelector(?:All)?|closest)\('([^']+)'/g)) for (const c of m[1].matchAll(/\.([A-Za-z_][\w-]*)/g)) classes.add(c[1]);
}
MAP.forEach(([, b]) => classes.add(b)); ['app', 'store__ic', 'store__ic--play', 'store__ic--apple', 'pv__bar-fill--68'].forEach((c) => classes.add(c));
for (const s of ROOT_STATE) classes.add(s);
const ids = new Set([...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const f of jsFiles) for (const m of read('js/' + f).matchAll(/getElementById\('([^']+)'\)|'#([a-z][\w-]*)'/g)) ids.add(m[1] || m[2]);
const idMap = Object.fromEntries([...ids].map((i) => [i, 'lv' + pascal(i)]));
const cls = (t) => (classes.has(t) ? P + t : t);

/* ============================ 3. HTML fragment ============================ */
// data-* fallback classes (AEM may strip data-*): lv-x-<attr>[--<value>]
const DATA = { bool: ['reveal', 'reveal-stagger', 'hero-item', 'hero-float', 'split', 'magnetic', 'mouse-scope'], num: ['speed', 'mouse-depth'], name: ['lucide', 'render-screen', 'link'] };
const encNum = (v) => v.replace(/^-/, 'm').replace('.', 'p');
const encName = (v) => v.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
body = body.replace(/<([a-z][a-z0-9]*)(\s[^>]*?)?(\/?)>/g, (m, tag, attrs = '', sl) => {
  if (!attrs) return m;
  const extra = [];
  attrs = attrs.replace(/\sdata-([a-z-]+)(?:="([^"]*)")?/g, (a, n, v) => {
    if (DATA.bool.includes(n)) extra.push(`${P}x-${n}`);
    else if (DATA.num.includes(n)) extra.push(`${P}x-${n}--${encNum(v)}`);
    else if (DATA.name.includes(n)) extra.push(`${P}x-${n}--${encName(v)}`);
    else throw new Error('unknown data attr ' + n);
    return a;
  });
  attrs = attrs.replace(/\sclass="([^"]*)"/, (a, c) => ` class="${c.split(/\s+/).filter(Boolean).map(cls).concat(extra).join(' ')}"`);
  if (extra.length && !/\sclass="/.test(attrs)) attrs = ` class="${extra.join(' ')}"` + attrs;
  attrs = attrs.replace(/\s(id|for|aria-labelledby|aria-controls|aria-describedby)="([^"]*)"/g, (a, n, v) => ` ${n}="${v.split(/\s+/).map((x) => idMap[x] || x).join(' ')}"`);
  attrs = attrs.replace(/\shref="#([^"]+)"/g, (a, v) => ` href="#${idMap[v] || v}"`);
  attrs = attrs.replace(/\s(src|href)="assets\//g, ` $1="${DAM}assets/`);
  return `<${tag}${attrs}${sl}>`;
});
// inline style -> class ; inline <svg> -> CSS mask icon ; noscript removed
body = body.replace(/<i style="width:68%"><\/i>/, `<i class="${P}pv__bar-fill--68"></i>`);
const SVG = {};
body = body.replace(/<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="([^"]+)"\/><\/svg>/g, (m, d) => {
  const k = Object.keys(SVG).length ? 'apple' : 'play'; SVG[k] = d; return `<span class="${P}store__ic ${P}store__ic--${k}" aria-hidden="true"></span>`; });
body = body.replace(/\s*<noscript>[\s\S]*?<\/noscript>/g, '');
if (/<svg|style="|<script|<style|<noscript/.test(body)) throw new Error('forbidden markup left');
// typographic characters -> entities
const ENT = { '’': '&rsquo;', '‘': '&lsquo;', '“': '&ldquo;', '”': '&rdquo;', '—': '&mdash;', '–': '&ndash;', '•': '&bull;', '©': '&copy;', '…': '&hellip;', '·': '&middot;', '→': '&rarr;' };
body = body.replace(/[^\x00-\x7f]/g, (c) => ENT[c] || `&#x${c.codePointAt(0).toString(16).toUpperCase()};`);
body = body.replace(/\s+$/, '').replace(/^\n+/, '');
const ind = (s, n) => s.replace(/^(?=.)/gm, ' '.repeat(n));
const outHtml = `<!-- ============================================================
     LIVIN LANDING - HTML Structure
     Copy-paste ke komponen HTML di halaman AEM
     (tanpa <html>, <head>, <body>; font mengikuti CMS)
     CSS: ${NAME}.css (clientlib CSS) | JS: ${NAME}.js (clientlib JS, footer)
     Color mode Light/Dark/Half otomatis ikut <html data-theme>.
     Paksa mode: tambahkan class lv-mode-light | lv-mode-dark | lv-mode-half di root.
     Gambar: ${DAM}assets/... (upload folder assets/ ke DAM)
     ============================================================ -->
<div id="${ROOT}" class="${P}app ${P}no-js ${P}tone-corp">
${ind(body.replace(/^ {2}/gm, ''), 2)}
</div>
`;
fs.writeFileSync(path.join(OUT, NAME + '.html'), outHtml);
export const meta = { classes, idMap };
fs.writeFileSync('conv-meta.json', JSON.stringify({ classes: [...classes], idMap }, null, 1));
console.log('classes', classes.size, 'ids', Object.keys(idMap).length);

/* ============================ 4. CSS ============================ */
const twCfg = html0.match(/tailwind\.config = (\{[\s\S]*?\});\s*<\/script>/)[1];
const twContent = [path.join(SRC, 'index.html'), path.join(SRC, 'js') + '/**/*.js'];
const tw = (input, out) => { fs.writeFileSync('tw.conv.cjs', `module.exports = { content: ${JSON.stringify(twContent)}, theme: ${twCfg}.theme };`);
  fs.writeFileSync('tw.conv.in.css', input); execFileSync('npx', ['tailwindcss', '-c', 'tw.conv.cjs', '-i', 'tw.conv.in.css', '-o', out], { stdio: 'pipe' }); return fs.readFileSync(out, 'utf8'); };
const baseCss = tw('@tailwind base;\n', 'tw.conv.base.css'), utilCss = tw('@tailwind utilities;\n', 'tw.conv.util.css');

const splitTop = (sel) => { const o = []; let d = 0, c = ''; for (const ch of sel) { if ('(['.includes(ch)) d++; if (')]'.includes(ch)) d--; if (ch === ',' && !d) { o.push(c.trim()); c = ''; } else c += ch; } if (c.trim()) o.push(c.trim()); return o; };
const renameSel = (s) => s
  .replace(/\[data-tone="corp"\]/g, '.lv-tone-corp')
  .replace(/\.([A-Za-z_][\w-]*)/g, (m, c) => (c.startsWith('lv-') ? m : NOPREFIX(c) ? m : classes.has(c) ? '.' + P + c : m))
  .replace(/#([A-Za-z_][\w-]*)/g, (m, i) => (idMap[i] ? '#' + idMap[i] : m));
const ROOTISH = /^(:root|html|body|:host|\.lv-tone-corp|\.lv-motion|\.lv-has-cursor|\.lv-js|\.lv-no-js)((?:\.[\w-]+|\[[^\]]+\]|:{1,2}[\w-]+(?:\([^)]*\))?)*)/;
function scopeSel(s0) {
  const s = renameSel(s0);
  if (s === '*') return `${R}, ${R} *`;
  const m = s.match(ROOTISH);
  if (m) {
    const head = m[1].startsWith('.') ? m[1] : '';
    let rest = s.slice(m[0].length);
    rest = rest.replace(/^\s+body(?=$|[\s.:#\[>+~])/, '');           // "[data-tone] body" -> root
    return R + head + m[2] + rest;
  }
  return `${R} ${s}`;
}
const KEYFRAMES = {};
function convertCss(css, { preflight = false } = {}) {
  const root = postcss.parse(css);
  root.walkAtRules(/keyframes$/, (a) => { const n = 'lv' + pascal(a.params); KEYFRAMES[a.params] = n; a.params = n; });
  root.walkRules((r) => {
    if (r.parent?.type === 'atrule' && /keyframes$/.test(r.parent.name)) return;
    const sels = splitTop(r.selector).filter((x) => !x.startsWith(':host'));
    r.selector = [...new Set(sels.map(scopeSel))].join(',\n');
    if (preflight && /^(body|html)$/.test(sels.join(''))) r.walkDecls('line-height', (d) => { if (d.value === 'inherit') d.remove(); });
  });
  root.walkDecls((d) => {
    if (d.prop === 'font-family' && d.value !== 'inherit') { d.remove(); return; }       // font follows the CMS
    if (d.prop.startsWith('--') && !d.prop.startsWith('--lv-')) d.prop = '--lv-' + d.prop.slice(2);
    d.value = d.value.replace(/var\(--(?!lv-)([\w-]+)/g, 'var(--lv-$1');
    d.value = d.value.replace(/url\("?\.\.\/assets\/([^")]+)"?\)/g, `url("${DAM}assets/$1")`);
    if (/(^|\s|\()-?\d*\.?\d+rem\b/.test(d.value) && !d.value.includes('data:')) d.value = d.value.replace(/(-?\d*\.?\d+)rem\b/g, (_, n) => `${+(parseFloat(n) * 16).toFixed(3)}px`);
    if (/\d(s|d|l)?vh\b/.test(d.value)) d.value = d.value.replace(/(-?\d*\.?\d+)((?:s|d|l)?vh)\b/g, (_, n, u) => `calc(var(--lv-vh, 1${u}) * ${n})`);
    if (d.important && d.parent.selector?.includes('qr__code')) d.important = false;  // qrcodejs sets no inline size
  });
  root.walkAtRules('media', (a) => { a.params = a.params.replace(/(\d*\.?\d+)rem\b/g, (_, n) => `${parseFloat(n) * 16}px`); });
  root.walkComments((c) => { if (/^!|tailwindcss|MIT License|^\s*\d+\.\s/.test(c.text) || c.text.trim().length < 3) c.remove(); });
  return root.toString().trim();
}
const fixKeyframeRefs = (css) => css.replace(/(animation(?:-name)?\s*:\s*)([^;}]+)/g, (m, p, v) => p + v.replace(/[\w-]+/g, (w) => KEYFRAMES[w] || w));

// utilities -> BEM rules
const utilDecls = {};
postcss.parse(utilCss).walkRules((r) => { for (const s of splitTop(r.selector)) utilDecls[s.replace(/^\./, '').replace(/\\/g, '')] = r.nodes.map((n) => n.toString() + ';').join(' '); });
const bem = (sel, utils) => `${sel} { ${utils.map((u) => utilDecls[u]).join(' ')} }`;

const style = read('css/style.css');
const cut = style.indexOf('/* ---', style.indexOf('[data-lucide]'));
const storeIc = Object.entries(SVG).map(([k, d]) => `${R} .${P}store__ic--${k} { --lv-store-ic: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='${d}'/></svg>`).replace(/'/g, '%27')}"); }`).join('\n');
const MODES = fs.readFileSync('modes.css', 'utf8').replaceAll('#appX', R);

const parts = [
  ['1. TOKEN & RESET — lebar section, token color mode CMS, reset elemen yang biasa di-style global oleh AEM', `
${R} {
  --lv-max-width: 1320px;      /* lebar konten (CMS: Full Width + Fixed width) */
  --lv-cms-light-bg: #ffffff;  /* Light: samakan dengan Color Picker section CMS (default skill: #F3F1EC) */
  --lv-cms-light-font: #141414;
  --lv-cms-dark-bg: #0a0a0a;
  --lv-cms-dark-font: #f3f1ec;
  --lv-cms-half-bg: #0a0a0a;
  --lv-cms-half-font: #f3f1ec;
  display: block;
  position: relative;
  margin: 0;
  padding: 0;
  font-size: 16px;
  line-height: 1.5;
  text-align: left;
  text-transform: none;
  letter-spacing: normal;
  visibility: visible;
}
${R} *, ${R} *::before, ${R} *::after { box-sizing: border-box; font-family: inherit; }
${R} :where(h1, h2, h3, h4, h5, h6) { font-family: inherit; text-transform: none; margin: 0; padding: 0; color: inherit; font-size: inherit; font-weight: inherit; letter-spacing: inherit; line-height: inherit; }
${R} :where(p) { margin: 0; padding: 0; font-size: inherit; line-height: inherit; }
${R} :where(a, a:hover, a:focus, a:visited, a:active) { color: inherit; text-decoration: inherit; }
${R} :where(button) { -webkit-appearance: none; appearance: none; box-shadow: none; min-width: 0; height: auto; margin: 0; line-height: inherit; letter-spacing: normal; text-transform: none; font-family: inherit; }
${R} :where(img) { margin: 0; border: 0; display: block; }
${R} :where(ul, ol, li) { margin: 0; padding: 0; list-style: none; }

/* Tailwind preflight (scoped) */
${convertCss(baseCss, { preflight: true })}`],
  ['2. BASE — design token & elemen dasar (css/style.css)', convertCss(style.slice(0, cut))],
  ['3. LAYOUT', `${R} .${P}wrap { width: 100%; max-width: var(--lv-max-width); margin-left: auto; margin-right: auto; }`],
  ['4. KOMPONEN (css/style.css)', convertCss(style.slice(cut)) + `\n\n/* ikon store (ganti <svg> inline yang distrip AEM) */\n${R} .${P}store__ic { display: inline-block; flex-shrink: 0; width: 26px; height: 26px; background-color: currentColor; -webkit-mask: var(--lv-store-ic) center / contain no-repeat; mask: var(--lv-store-ic) center / contain no-repeat; }\n${storeIc}\n${R} .${P}pv__bar-fill--68 { width: 68%; }`],
  ['5. TONE corporate (css/theme-corp.css)', convertCss(read('css/theme-corp.css'))],
  ['6. KOMPONEN — UI aplikasi di dalam ponsel (css/app-ui.css)', convertCss(read('css/app-ui.css'))],
  ['7. ANIMASI (css/animations.css)', convertCss(read('css/animations.css'))],
  ['8. RESPONSIVE (css/responsive.css)', convertCss(read('css/responsive.css'))],
  ['9. MODIFIER (pengganti utility Tailwind) — sengaja paling akhir seperti urutan aslinya', [
    `${R} { ${bodyUtils.filter((u) => u !== 'font-sans').map((u) => utilDecls[u]).join(' ')} }`,
    ...MAP.filter(([, b]) => b !== 'wrap').map(([u, b]) => bem(`${R} .${P}${b}`, u.split(' ')))].join('\n')
    .replace(/--tw-/g, '--lv-tw-').replace(/font-family:[^;]+;/g, '')],
  ['10. COLOR MODE — Light (default) / Dark / Half, ikut <html data-theme> (lihat livin-landing.js: initTheme)', MODES],
];
let css = `/* ============================================================
   LIVIN' LANDING - Styles
   Pasang di clientlib CSS. Semua selector di-scope ke ${R}.
   Prefix class: ${P} · variabel: --lv-* · keyframes: lv*
   Font mengikuti CMS (tidak ada font-family khusus).
   Color mode: ${R}.lv-theme-dark (Dark & Half), ${R}.lv-theme-half (override Half),
   diatur JS dari <html data-theme="light|dark|half">.
   ============================================================ */
${parts.map(([t, c]) => `\n/* ------------------------------------------------------------\n   ${t}\n   ------------------------------------------------------------ */\n${c.trim()}\n`).join('')}`;
css = fixKeyframeRefs(css).replace(/--tw-/g, '--lv-tw-').replace(/·/g, '|').replace(/[^\x00-\x7f]/g, (c) => ({ '—': '-', '–': '-', '≥': '>=', '→': '->', '…': '...' }[c] ?? c));
fs.writeFileSync(path.join(OUT, NAME + '.css'), css);
console.log('css bytes', css.length, 'keyframes', Object.values(KEYFRAMES).join(','));

/* ============================ 5. JS ============================ */
const WJ = path.resolve('work-conv'); fs.rmSync(WJ, { recursive: true, force: true }); fs.mkdirSync(path.join(WJ, 'vendor'), { recursive: true });
for (const f of jsFiles) fs.copyFileSync(path.join(SRC, 'js', f), path.join(WJ, f));
const wpatch = (f, pairs) => { const p = path.join(WJ, f); let s = fs.readFileSync(p, 'utf8');
  for (const [a, b] of pairs) { if (!s.includes(a)) throw new Error(`patch miss ${f}: ${a.slice(0, 60)}`); s = s.split(a).join(b); } fs.writeFileSync(p, s); };

// dom.js — root-scoped helpers + data-* restore (AEM may strip data-*)
fs.writeFileSync(path.join(WJ, 'dom.js'), `
export const ROOT_ID = '${ROOT}';
export const IMG_BASE = '${DAM}';
let rootEl = null;
export function __lvSetRoot(el) { rootEl = el; }
export function __lvRoot() { return rootEl || document.getElementById(ROOT_ID); }
const ID_MAP = ${JSON.stringify(idMap)};
export function __lvById(id) { return __lvRoot().querySelector('#' + (ID_MAP[id] || id)); }
export function __lvQ(sel) { return __lvRoot().querySelectorAll(sel); }
export function __lvQS(sel) { return __lvRoot().querySelector(sel); }

// Restore data-* from fallback classes "lv-x-<attr>[--<value>]"
export function restoreData(root) {
  Array.prototype.slice.call(root.querySelectorAll('[class*="lv-x-"]')).forEach(function (el) {
    el.className.split(/\\s+/).forEach(function (c) {
      const m = c.match(/^lv-x-([a-z-]+?)(?:--(.+))?$/);
      if (!m) return;
      const attr = 'data-' + m[1];
      if (el.hasAttribute(attr)) return;
      let v = m[2] || '';
      if (${JSON.stringify(DATA.num)}.indexOf(m[1]) > -1) v = v.replace(/^m/, '-').replace('p', '.');
      else v = v.replace(/_([a-z])/g, function (_, ch) { return ch.toUpperCase(); });
      el.setAttribute(attr, v);
    });
  });
}
`);
// env.js — flags + color mode (skill references/color-mode.md)
fs.writeFileSync(path.join(WJ, 'env.js'), `
export const state = { static: false, ready: false };

/* ---------- progressive enhancement flags (ex inline <head> script) ---------- */
export function initEnv(root) {
  root.classList.remove('lv-no-js');
  root.classList.add('lv-js');
  // ?tone=classic -> original yellow/navy tone
  if (/[?&]tone=classic\\b/.test(location.search)) root.classList.remove('lv-tone-corp');
  // ?static or reduced motion -> no motion. Inside an iframe (AEM editor) scroll-driven motion can't work either.
  let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  state.static = framed || /[?&]static\\b/.test(location.search) || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (framed) {
    // the editor iframe grows with its content: pin viewport units to the real screen height
    const setVh = function () { let h = 0; try { h = window.top.innerHeight; } catch (e) {} h = h || (window.screen && window.screen.availHeight) || 800;
      root.style.setProperty('--lv-vh', Math.min(Math.max(h, 500), 1200) / 100 + 'px'); };
    setVh(); try { window.top.addEventListener('resize', setVh); } catch (e) {}
    root.classList.add('lv-framed');
  }
  if (!state.static) root.classList.add('lv-motion');
  setTimeout(function () { if (!state.ready) root.classList.remove('lv-motion'); }, 3000);
}

/* ---------- color mode Light / Dark / Half ---------- */
function parseRgb(str) {
  const m = str && str.match(/rgba?\\(\\s*([\\d.]+)[,\\s]+([\\d.]+)[,\\s]+([\\d.]+)(?:[,\\s\\/]+([\\d.]+%?))?/);
  if (!m) return null;
  const a = m[4] === undefined ? 1 : (m[4].indexOf('%') > -1 ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
  return { r: +m[1], g: +m[2], b: +m[3], a: a };
}
function luminance(c) {
  function ch(v) { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
}
function isCmsDark(root) {
  let el = root.parentElement;
  while (el) {
    const c = parseRgb(window.getComputedStyle(el).backgroundColor);
    if (c && c.a >= 0.5) return luminance(c) < 0.35;
    el = el.parentElement;
  }
  return false;
}
function forcedMode(root) { const m = (' ' + root.className + ' ').match(/ lv-mode-(light|dark|half) /); return m ? m[1] : ''; }
function cmsTheme() {
  const t = (document.documentElement.getAttribute('data-theme') || '').toLowerCase();
  return (t === 'light' || t === 'dark' || t === 'half') ? t : '';
}
function setMode(root, mode) {
  root.classList.toggle('lv-theme-dark', mode === 'dark' || mode === 'half');
  root.classList.toggle('lv-theme-half', mode === 'half');
}
export function initTheme(root) {
  let timer = null;
  const forced = forcedMode(root);
  if (forced) { setMode(root, forced); return; }
  function apply() { setMode(root, cmsTheme() || (isCmsDark(root) ? 'dark' : 'light')); }
  function schedule() { apply(); clearTimeout(timer); timer = setTimeout(apply, 400); }
  apply();
  if ('MutationObserver' in window) {
    const mo = new MutationObserver(schedule);
    const opts = { attributes: true, attributeFilter: ['class', 'style', 'data-theme', 'data-mode', 'data-color-scheme', 'data-bs-theme'] };
    mo.observe(document.documentElement, opts);
    if (document.body) mo.observe(document.body, opts);
  }
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', schedule); else if (mq.addListener) mq.addListener(schedule);
  }
  window.addEventListener('load', schedule);
}
`);
const iconList = JSON.parse(fs.readFileSync('icon-list.json', 'utf8'));
fs.writeFileSync(path.join(WJ, 'icons.js'), `import { ${iconList.join(', ')} } from 'lucide';\nexport const ICONS = { ${iconList.join(', ')} };\n`);
fs.writeFileSync(path.join(WJ, 'vendor', 'qrcode.js'), fs.readFileSync('node_modules/qrcodejs/qrcode.js', 'utf8') + '\nexport default QRCode;\n');

// image paths -> IMG_BASE (DAM)
for (const f of jsFiles) { const p = path.join(WJ, f); let s = fs.readFileSync(p, 'utf8');
  if (/(['"])assets\//.test(s)) { s = s.replace(/src="assets\//g, 'src="${IMG_BASE}assets/').replace(/(['"])assets\//g, 'IMG_BASE + $1assets/'); s = `import { IMG_BASE } from './dom.js';\n` + s; fs.writeFileSync(p, s); } }

wpatch('main.js', [
  [`import { LINKS } from './data.js';`, `import { gsap as GSAP } from 'gsap';\nimport { ScrollTrigger as ST } from 'gsap/ScrollTrigger';\nimport { createIcons } from 'lucide';\nimport { ICONS } from './icons.js';\nimport { initEnv, initTheme, state } from './env.js';\nimport { ROOT_ID, __lvSetRoot, restoreData } from './dom.js';\nimport { LINKS } from './data.js';`],
  [`const REDUCE = window.__livinStatic ? 'all' : '(prefers-reduced-motion: reduce)';`, `let REDUCE = '(prefers-reduced-motion: reduce)';`],
  [`function boot() {\n`, `function boot() {
  const root = document.getElementById(ROOT_ID);
  if (!root) { console.error('Element #' + ROOT_ID + ' tidak ditemukan. Tempel livin-landing.html di komponen HTML (bukan custom-css-js) dan pastikan id root persis "' + ROOT_ID + '".'); return; }
  if (root.getAttribute('data-lv-ready') === '1') return; // cegah double init (author mode / script dobel)
  root.setAttribute('data-lv-ready', '1');
  __lvSetRoot(root);
  restoreData(root);
  initTheme(root);
  initEnv(root);
  if (state.static) REDUCE = 'all';

`],
  [`window.lucide?.createIcons();`, `createIcons({ icons: ICONS, root: root });`],
  [`const { gsap, ScrollTrigger } = window;`, `const gsap = GSAP, ScrollTrigger = ST;`],
  [`window.__livinReady = true;`, `state.ready = true;`],
]);
wpatch('interactions.js', [
  [`document.documentElement.classList`, `__lvRoot().classList`],
  [`typeof window.QRCode === 'function'`, `typeof QRCode === 'function'`], [`new window.QRCode(`, `new QRCode(`], [`window.QRCode.CorrectLevel`, `QRCode.CorrectLevel`],
]);
{ const p = path.join(WJ, 'interactions.js'); fs.writeFileSync(p, `import QRCode from './vendor/qrcode.js';\n` + fs.readFileSync(p, 'utf8')); }
wpatch('scroll.js', [[`document.documentElement.classList`, `__lvRoot().classList`]]);
// IntersectionObserver fallback: no observer -> nothing is hidden, just skip the optimisation
for (const f of ['scroll.js', 'navigation.js']) { const p = path.join(WJ, f); let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/(\n\s*)(const \w+ = new IntersectionObserver\()/g, `$1if (!('IntersectionObserver' in window)) return () => {};$1$2`); fs.writeFileSync(p, s); }

const rename = makeRenamer({ classes, idMap, P });
for (const f of fs.readdirSync(WJ)) if (f.endsWith('.js') && !['dom.js', 'env.js', 'icons.js'].includes(f)) {
  const p = path.join(WJ, f); fs.writeFileSync(p, rename(fs.readFileSync(p, 'utf8'), p)); }
for (const f of fs.readdirSync(WJ)) if (f.endsWith('.js')) { const s = fs.readFileSync(path.join(WJ, f), 'utf8');
  const bad = s.match(/document\.(querySelector|querySelectorAll|getElementById)\((?!ROOT_ID)/); if (bad && f !== 'dom.js') throw new Error('document query left in ' + f + ': ' + bad[0]); }

const bundle = await esbuild.build({ entryPoints: [path.join(WJ, 'main.js')], bundle: true, format: 'iife', target: 'es2019', write: false, nodePaths: [path.resolve('node_modules')], legalComments: 'none' });
const es5 = babel.transformSync(bundle.outputFiles[0].text, { babelrc: false, configFile: false, compact: true, sourceType: 'script',
  presets: [[require.resolve('@babel/preset-env'), { targets: { ie: '11' }, modules: false }]] }).code;
const min = await terser.minify(es5, { ecma: 5, compress: { passes: 2 }, mangle: true, format: { ascii_only: true, comments: false } });
const header = `/* ============================================================
   LIVIN' LANDING - Script (ES5, IIFE, tanpa global)
   Pasang di clientlib JS (footer). Semua query lewat root #${ROOT}.
   Isi: modul halaman + GSAP 3.12.5 & ScrollTrigger (GreenSock standard license),
   Lucide 0.460.0 (ISC, subset ikon), qrcodejs 1.0.0 (MIT).
   Color mode: baca <html data-theme> -> class lv-theme-dark / lv-theme-half di root;
   paksa dengan class lv-mode-light|dark|half di root.
   Gambar: IMG_BASE = '${DAM}'
   ============================================================ */
`;
fs.writeFileSync(path.join(OUT, NAME + '.js'), header + min.code.replace(/`/g, '\\x60') + '\n');
fs.cpSync(WJ, path.join(OUT, 'src-js'), { recursive: true });

/* ============================ 6. assets for DAM ============================ */
const allText = outHtml + css + fs.readdirSync(WJ).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(WJ, f), 'utf8')).join('\n');
const used = new Set([...allText.matchAll(/assets\/[\w./-]+\.(?:png|jpe?g|svg|webp)/g)].map((m) => m[0]));
['assets/images/avatar.png', 'assets/images/card-debit-gold.jpg'].forEach((a) => used.add(a));
fs.rmSync(path.join(OUT, 'assets'), { recursive: true, force: true });
for (const u of used) { fs.mkdirSync(path.dirname(path.join(OUT, u)), { recursive: true }); fs.copyFileSync(path.join(SRC, u), path.join(OUT, u)); }
console.log('js bytes', min.code.length, 'assets', used.size);
