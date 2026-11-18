/**
 * diagnostics.js — self-check for embedding (AEM). Explains in the console WHY the page
 * does not show, instead of failing silently. Never changes layout, except the motion
 * failsafe (content hidden by a stuck animation is revealed).
 *   - always: console summary  "[Livin'] OK" or a list of problems with the fix
 *   - ?livindebug: the same report as an on-page panel
 */
const TAG = "[Livin']";
export const BUILD = '2026-11-18 07:28';

// IDs the scripts depend on, with the block they belong to (for readable messages)
const REQUIRED_IDS = {
  nav: 'header', burger: 'header', 'mobile-menu': 'header',
  'stats-grid': 'stats', 'awards-list': 'stats',
  experience: 'experience', 'exp-stories': 'experience', 'exp-screens': 'experience', 'exp-objects': 'experience',
  'exp-progress': 'experience', 'exp-count': 'experience', 'exp-dots': 'experience', 'exp-bar': 'experience', 'exp-chip': 'experience',
  'solutions-grid': 'solutions', 'promo-grid': 'promo', 'edu-grid': 'edukasi', 'qr-code': 'download', year: 'footer',
};
// Containers filled from data.js — empty after render means missing data or a render error
const DATA_CONTAINERS = ['stats-grid', 'awards-list', 'exp-stories', 'solutions-grid', 'promo-grid', 'edu-grid'];

const problems = [];
const info = [];
const problem = (msg, fix) => problems.push({ msg, fix });

/** Called when no .livin root exists at all. */
export function reportMissingRoot() {
  console.error(`${TAG} Elemen root <div class="livin"> tidak ditemukan — script.js tidak melakukan apa-apa.\n` +
    '  Kemungkinan: (1) markup belum ditempel di halaman / komponen yang dipakai salah,\n' +
    '  (2) filter HTML (XSS/AntiSamy) AEM membuang markup — cek di Inspect apakah class "livin" ada,\n' +
    '  (3) typo pada class root (harus persis "livin").');
}

function label(el) {
  const c = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
  return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + c;
}

/** Synchronous checks — run right after the page has been rendered. */
export function checkStructure(root) {
  const roots = document.querySelectorAll('.livin');
  if (roots.length > 1) problem(`Ada ${roots.length} elemen .livin di halaman; hanya yang pertama yang dijalankan.`, 'Pakai satu instance halaman Livin\' per page.');

  // CSS loaded?  .livin__container has max-width 1320px only when style.css is applied
  const probe = root.querySelector('.livin__container');
  if (probe && getComputedStyle(probe).maxWidth !== '1320px') problem('style.css tidak termuat (404, salah path, atau cache).', 'Cek tab Network: style.css harus status 200; cek path <link> / clientlib CSS.');

  for (const [id, block] of Object.entries(REQUIRED_IDS)) {
    const n = document.querySelectorAll(`[id="${id}"]`).length;
    if (!n) problem(`ID #${id} (blok ${block}) tidak ada di HTML.`, `Pastikan markup blok ${block} utuh dan ID ditulis persis "${id}" (huruf kecil, pakai tanda -).`);
    else if (n > 1) problem(`ID #${id} dipakai ${n}x di halaman.`, 'ID harus unik; komponen lain di halaman AEM mungkin memakai ID yang sama.');
  }
  for (const id of DATA_CONTAINERS) {
    const el = document.getElementById(id);
    if (el && !el.children.length) problem(`#${id} kosong setelah render.`, 'Cek data di data.js (array kosong?) dan error JS sebelumnya di console.');
  }
  let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  if (framed) info.push('Berjalan di dalam iframe (mis. editor AEM). Animasi scroll & tinggi 100vh tidak akurat di sini — cek juga dengan ?wcmmode=disabled.');
}

/** Checks that need layout/animation to settle. */
export function checkVisibility(root) {
  // A wrapper (e.g. AEM "custom-css-js") hiding the page
  const hidden = [];
  for (let e = root; e && e !== document.documentElement; e = e.parentElement) {
    const c = getComputedStyle(e);
    const why = [c.display === 'none' && 'display:none', c.visibility !== 'visible' && 'visibility:' + c.visibility,
      parseFloat(c.opacity) === 0 && 'opacity:0', e !== root && e !== document.body && e.offsetHeight === 0 && 'tinggi 0'].filter(Boolean);
    if (why.length) hidden.push(`${label(e)} (${why.join(', ')})`);
  }
  if (hidden.length) problem(`Halaman tersembunyi oleh elemen induk: ${hidden.join(' > ')}.`,
    'Taruh markup di komponen yang tampil (Embed/HTML), bukan di komponen yang menyembunyikan isinya seperti custom-css-js.');

  // Motion failsafe: hero still hidden by the pre-animation state
  const item = root.querySelector('[data-hero-item]');
  if (root.classList.contains('livin--motion') && item && parseFloat(getComputedStyle(item).opacity) < 0.1) {
    root.classList.remove('livin--motion');
    problem('Animasi pembuka tidak berjalan; konten ditampilkan tanpa animasi (failsafe).', 'Cek error JS di console dan apakah ada library lain yang bentrok.');
  }
}

/** Print the report (and the panel with ?livindebug). */
export function report(root) {
  const head = `${TAG} build ${BUILD}`;
  if (!problems.length) console.info(`${head} — OK`);
  else {
    console.groupCollapsed?.(`${head} — ${problems.length} masalah`);
    problems.forEach((p, i) => console.warn(`${i + 1}. ${p.msg}\n   → ${p.fix}`));
    console.groupEnd?.();
  }
  info.forEach((m) => console.info(`${TAG} ${m}`));

  if (!/[?&]livindebug\b/.test(location.search)) return;
  const sections = [...root.querySelectorAll('main > section')].map((s) => `${s.id}: ${s.offsetHeight}px`).join(', ');
  const lines = [head, problems.length ? `${problems.length} masalah:` : 'Tidak ada masalah.',
    ...problems.map((p, i) => `${i + 1}. ${p.msg}\n   → ${p.fix}`), ...info.map((m) => 'i ' + m), 'Section: ' + sections];
  const pre = document.createElement('pre');
  pre.className = 'livin-debug';
  pre.textContent = lines.join('\n');
  pre.setAttribute('style', 'position:fixed;z-index:2147483647;left:8px;bottom:8px;max-width:min(720px,92vw);max-height:60vh;overflow:auto;margin:0;padding:12px;border-radius:8px;background:#111;color:#7CFC9A;font:12px/1.5 ui-monospace,monospace;white-space:pre-wrap;');
  document.body.appendChild(pre);
}
