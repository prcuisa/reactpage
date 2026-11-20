
export const state = { static: false, ready: false };

/* ---------- progressive enhancement flags (ex inline <head> script) ---------- */
export function initEnv(root) {
  root.classList.remove('lv-no-js');
  root.classList.add('lv-js');
  // ?tone=classic -> original yellow/navy tone
  if (/[?&]tone=classic\b/.test(location.search)) root.classList.remove('lv-tone-corp');
  // ?static or reduced motion -> no motion. Inside an iframe (AEM editor) scroll-driven motion can't work either.
  let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  state.static = framed || /[?&]static\b/.test(location.search) || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  const m = str && str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.]+%?))?/);
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
