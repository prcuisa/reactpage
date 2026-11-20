import { __lvRoot, __lvById } from './dom.js';
/**
 * navigation.js — sticky state, hide-on-scroll, mobile menu (accessible),
 * smooth anchor scrolling and active-section highlighting.
 */

export function initNavigation({ reduced = false } = {}) {
  const nav = __lvById('nav');
  const burger = __lvById('burger');
  const menu = __lvById('mobile-menu');
  const cleanups = [];

  /* ---- Sticky + hide on scroll down / show on scroll up ---- */
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle("lv-is-scrolled", y > 24);
      const goingDown = y > lastY && y > 400;
      nav.classList.toggle("lv-is-hidden", goingDown && !menu.classList.contains("lv-is-open"));
      lastY = y;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  cleanups.push(() => window.removeEventListener('scroll', onScroll));

  /* ---- Mobile menu ---- */
  const focusables = () => [burger, ...menu.querySelectorAll('a, button')];
  const setOpen = (open) => {
    menu.classList.toggle("lv-is-open", open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
    document.body.style.overflow = open ? 'hidden' : '';
    nav.classList.remove("lv-is-hidden");
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
  };
  const toggle = () => setOpen(!menu.classList.contains("lv-is-open"));
  const onKey = (e) => {
    if (!menu.classList.contains("lv-is-open")) return;
    if (e.key === 'Escape') { setOpen(false); burger.focus(); }
    if (e.key === 'Tab') {
      const f = focusables();
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  const onMenuClick = (e) => {
    if (e.target.closest('a') || e.target.classList.contains("lv-mmenu__bg")) setOpen(false);
  };
  const mq = window.matchMedia('(min-width: 1024px)');
  const onMq = () => { if (mq.matches) setOpen(false); };

  burger.addEventListener('click', toggle);
  document.addEventListener('keydown', onKey);
  menu.addEventListener('click', onMenuClick);
  mq.addEventListener('change', onMq);
  cleanups.push(() => {
    burger.removeEventListener('click', toggle);
    document.removeEventListener('keydown', onKey);
    menu.removeEventListener('click', onMenuClick);
    mq.removeEventListener('change', onMq);
  });

  /* ---- Smooth anchor scrolling (respects reduced motion) ---- */
  const onAnchor = (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = __lvRoot().querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', id);
    // Move focus for keyboard & screen-reader users without jumping
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };
  document.addEventListener('click', onAnchor);
  cleanups.push(() => document.removeEventListener('click', onAnchor));

  /* ---- Active link highlighting ---- */
  const links = [...__lvRoot().querySelectorAll(".lv-nav__link")];
  const map = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]));
  if (!('IntersectionObserver' in window)) return () => {};
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => { l.classList.remove("lv-is-active"); l.removeAttribute('aria-current'); });
      const link = map.get(en.target.id);
      if (link) { link.classList.add("lv-is-active"); link.setAttribute('aria-current', 'true'); }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  __lvRoot().querySelectorAll(".lv-el-main > .lv-el-section[id]").forEach((s) => io.observe(s));
  cleanups.push(() => io.disconnect());

  return () => cleanups.forEach((fn) => fn());
}
