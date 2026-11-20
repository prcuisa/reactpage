import { __lvRoot } from './dom.js';
/**
 * main.js — bootstraps the page.
 *  1. Render data-driven content (works without GSAP).
 *  2. Build the seven-feature phone experience.
 *  3. Install the motion system via gsap.matchMedia so every trigger, tween
 *     and listener is cleaned up automatically on breakpoint / preference change.
 */
import { gsap as GSAP } from 'gsap';
import { ScrollTrigger as ST } from 'gsap/ScrollTrigger';
import { createIcons } from 'lucide';
import { ICONS } from './icons.js';
import { initEnv, initTheme, state } from './env.js';
import { ROOT_ID, __lvSetRoot, restoreData, restoreIds, findRoot } from './dom.js';
import { LINKS } from './data.js';
import { renderAll } from './render.js';
import { renderScreen } from './screens.js';
import { buildExperience, initExperienceDesktop, initExperienceFallback } from './phone-experience.js';
import { initNavigation } from './navigation.js';
import { splitHeadings, heroIntro, initReveals, initCounters, pauseOffscreen, revealAll } from './scroll.js';
import { initScrollParallax, initMouseParallax } from './parallax.js';
import { initMagnetic, initCursor, initCardHover, initPromoParallax, renderQR } from './interactions.js';

const DESKTOP = '(min-width: 1024px)';
const MOBILE = '(max-width: 1023.98px)';
// `?static` (set in index.html) forces the reduced-motion path for QA screenshots
let REDUCE = '(prefers-reduced-motion: reduce)';
const FINE = '(hover: hover) and (pointer: fine)';

function boot() {
  const root = findRoot();
  if (!root) { console.error('Element #' + ROOT_ID + ' / .lv-app tidak ditemukan. Tempel livin-landing.html di komponen HTML (bukan custom-css-js) dan pastikan id root persis "' + ROOT_ID + '".'); return; }
  if (root.getAttribute('data-lv-ready') === '1') return; // cegah double init (author mode / script dobel)
  root.setAttribute('data-lv-ready', '1');
  if (!root.id) { root.id = ROOT_ID; console.warn('[Livin] id="' + ROOT_ID + '" dibuang oleh AEM; root ditemukan lewat class .lv-app (fallback aktif).'); }
  __lvSetRoot(root);
  const fixed = restoreIds(root);
  if (fixed) console.warn('[Livin] ' + fixed + ' id di dalam komponen dipulihkan dari class cadangan lv-id--*.');
  restoreData(root);
  initTheme(root);
  initEnv(root);
  if (state.static) REDUCE = 'all';

  const reduced = window.matchMedia(REDUCE).matches;

  renderAll();
  __lvRoot().querySelectorAll('[data-render-screen]').forEach((el) => renderScreen(el, el.dataset.renderScreen));
  const refs = buildExperience();
  createIcons({ icons: ICONS, root: root });
  renderQR(LINKS.qrTarget);

  const globalCleanups = [initNavigation({ reduced }), pauseOffscreen()];
  const gsap = GSAP, ScrollTrigger = ST;

  /* ---- No GSAP: fully functional static page ---- */
  if (!gsap || !ScrollTrigger) {
    revealAll();
    if (refs && window.matchMedia(DESKTOP).matches) globalCleanups.push(initExperienceFallback(refs));
    state.ready = true;
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  state.ready = true;

  if (reduced) {
    revealAll();
  } else {
    splitHeadings();
    heroIntro(gsap, { mobile: window.matchMedia(MOBILE).matches });
  }
  initCounters(gsap, ScrollTrigger, reduced);

  /* ---- Responsive motion contexts (auto-reverted) ---- */
  const mm = gsap.matchMedia();
  mm.add({ desktop: DESKTOP, mobile: MOBILE, reduce: REDUCE, fine: FINE }, (ctx) => {
    const { desktop, mobile, reduce, fine } = ctx.conditions;
    const local = [];

    // Signature sticky phone (desktop only; mobile uses stacked stories)
    if (desktop && refs) local.push(initExperienceDesktop(refs, { gsap, ScrollTrigger, reduced: reduce }));

    if (!reduce) {
      local.push(initReveals(gsap, ScrollTrigger, { mobile }));
      // Rich parallax on desktop, a lighter pass on mobile
      local.push(initScrollParallax(gsap, { factor: desktop ? 1 : 0.35 }));
      local.push(initPromoParallax(gsap, desktop ? 1 : 0.5));

      // Pointer-driven effects: desktop + mouse only
      if (desktop && fine) {
        local.push(initMouseParallax(gsap));
        local.push(initMagnetic(gsap));
        local.push(initCursor(gsap));
        local.push(initCardHover(gsap));
      }
    }

    return () => local.forEach((fn) => typeof fn === 'function' && fn());
  });

  // Recalculate once fonts & images settle
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

  // Full teardown (e.g. bfcache / SPA embedding)
  window.addEventListener('pagehide', (e) => {
    if (e.persisted) return;
    mm.revert();
    globalCleanups.forEach((fn) => fn && fn());
  }, { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
