
export const ROOT_ID = 'appLivinLanding';
export const IMG_BASE = '/content/dam/livin/';
let rootEl = null;
export function __lvSetRoot(el) { rootEl = el; }
export function findRoot() { return document.getElementById(ROOT_ID) || document.querySelector('.lv-app'); }
export function __lvRoot() { return rootEl || findRoot(); }
// Restore id from fallback class "lv-id--<id>" (AEM may strip id attributes)
export function restoreIds(root) {
  let n = 0;
  Array.prototype.slice.call(root.querySelectorAll('[class*="lv-id--"]')).forEach(function (el) {
    const m = (' ' + el.className + ' ').match(/ lv-id--([A-Za-z][A-Za-z0-9_-]*) /);
    if (m && !el.id) { el.id = m[1]; n++; }
  });
  return n;
}
const ID_MAP = {"main":"lvMain","hero":"lvHero","hero-title":"lvHeroTitle","stats":"lvStats","stats-title":"lvStatsTitle","stats-grid":"lvStatsGrid","awards-list":"lvAwardsList","positioning":"lvPositioning","pos-title":"lvPosTitle","experience":"lvExperience","exp-title":"lvExpTitle","exp-stories":"lvExpStories","exp-stage":"lvExpStage","exp-objects":"lvExpObjects","exp-screens":"lvExpScreens","exp-chip":"lvExpChip","exp-progress":"lvExpProgress","exp-count":"lvExpCount","exp-dots":"lvExpDots","exp-bar":"lvExpBar","solutions":"lvSolutions","sol-title":"lvSolTitle","solutions-grid":"lvSolutionsGrid","promo":"lvPromo","promo-title":"lvPromoTitle","promo-grid":"lvPromoGrid","edukasi":"lvEdukasi","edu-title":"lvEduTitle","edu-grid":"lvEduGrid","download":"lvDownload","cta-title":"lvCtaTitle","stores":"lvStores","store-play":"lvStorePlay","store-apple":"lvStoreApple","store-huawei":"lvStoreHuawei","qr-code":"lvQrCode","nav":"lvNav","burger":"lvBurger","mobile-menu":"lvMobileMenu","year":"lvYear"};
export function __lvById(id) { return __lvRoot().querySelector('#' + (ID_MAP[id] || id)); }
export function __lvQ(sel) { return __lvRoot().querySelectorAll(sel); }
export function __lvQS(sel) { return __lvRoot().querySelector(sel); }

const ARIA_MAP = [{"aria-hidden":"true"},{"role":"main"},{"aria-labelledby":"lvHeroTitle","role":"region"},{"aria-hidden":"true"},{"aria-hidden":"true"},{"aria-hidden":"true"},{"aria-hidden":"true"},{"aria-label":"Gulir ke bagian berikutnya"},{"aria-labelledby":"lvStatsTitle","role":"region"},{"aria-labelledby":"lvPosTitle","role":"region"},{"role":"article"},{"aria-hidden":"true"},{"role":"article"},{"aria-hidden":"true"},{"role":"article"},{"aria-hidden":"true"},{"aria-labelledby":"lvExpTitle","role":"region"},{"aria-hidden":"true"},{"aria-hidden":"true"},{"aria-label":"Navigasi pengalaman","role":"navigation"},{"aria-labelledby":"lvSolTitle","role":"region"},{"aria-labelledby":"lvPromoTitle","role":"region"},{"aria-labelledby":"lvEduTitle","role":"region"},{"aria-labelledby":"lvCtaTitle","role":"region"},{"aria-hidden":"true"},{"aria-hidden":"true"},{"aria-hidden":"true"},{"aria-hidden":"true"},{"role":"img","aria-label":"Kode QR untuk mengunduh Livin' by Mandiri"},{"aria-hidden":"true"}];
export function restoreAria(root) {
  let n = 0;
  Array.prototype.slice.call(root.querySelectorAll('[class*="lv-r-"]')).forEach(function (el) {
    const m = (' ' + el.className + ' ').match(/ lv-r-([0-9]+) /);
    const set = m && ARIA_MAP[+m[1]];
    if (!set) return;
    Object.keys(set).forEach(function (k) { if (!el.hasAttribute(k)) { el.setAttribute(k, set[k]); n++; } });
  });
  return n;
}
// Restore data-* from fallback classes "lv-x-<attr>[--<value>]"
export function restoreData(root) {
  Array.prototype.slice.call(root.querySelectorAll('[class*="lv-x-"]')).forEach(function (el) {
    el.className.split(/\s+/).forEach(function (c) {
      const m = c.match(/^lv-x-([a-z-]+?)(?:--(.+))?$/);
      if (!m) return;
      const attr = 'data-' + m[1];
      if (el.hasAttribute(attr)) return;
      let v = m[2] || '';
      if (["speed","mouse-depth"].indexOf(m[1]) > -1) v = v.replace(/^m/, '-').replace('p', '.');
      else v = v.replace(/_([a-z])/g, function (_, ch) { return ch.toUpperCase(); });
      el.setAttribute(attr, v);
    });
  });
}
