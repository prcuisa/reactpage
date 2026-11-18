import QRCode from './vendor/qrcode.js';
/**
 * interactions.js — micro-interactions: magnetic buttons, desktop cursor,
 * promo image parallax-on-hover, QR code generation.
 * Desktop-only effects are installed inside gsap.matchMedia and reverted
 * automatically on breakpoint change.
 */

/** Magnetic hover for [data-magnetic] (desktop, fine pointer). */
export function initMagnetic(gsap) {
  const els = [...document.querySelectorAll('[data-magnetic]')];
  const handlers = els.map((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.set(el, { x: 0, y: 0 });
    };
  });
  return () => handlers.forEach((fn) => fn());
}

/** Custom cursor follower (desktop only). */
export function initCursor(gsap) {
  const cursor = document.querySelector('.cursor');
  if (!cursor) return () => {};
  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  document.querySelector('.livin')?.classList.add('livin--has-cursor');

  const dx = gsap.quickTo(dot, 'x', { duration: 0.12 });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

  const move = (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); };
  const over = (e) => cursor.classList.toggle('is-hover', !!e.target.closest('a, button, [data-magnetic]'));
  const leave = () => cursor.classList.add('is-hidden');
  const enter = () => cursor.classList.remove('is-hidden');

  window.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerover', over);
  document.documentElement.addEventListener('pointerleave', leave);
  document.documentElement.addEventListener('pointerenter', enter);

  return () => {
    window.removeEventListener('pointermove', move);
    document.removeEventListener('pointerover', over);
    document.documentElement.removeEventListener('pointerleave', leave);
    document.documentElement.removeEventListener('pointerenter', enter);
    document.querySelector('.livin')?.classList.remove('livin--has-cursor');
  };
}

/** Promo cards: image drifts with pointer for a parallax-on-hover feel. */
export function initCardHover(gsap) {
  const cards = [...document.querySelectorAll('.promo-card')];
  const fns = cards.map((card) => {
    const img = card.querySelector('.promo-card__img');
    if (!img) return () => {};
    // x only — yPercent is owned by the scroll parallax
    const xTo = gsap.quickTo(img, 'x', { duration: 0.8, ease: 'power3.out' });
    const move = (e) => {
      const r = card.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - 0.5) * -18);
    };
    const leave = () => { xTo(0); };
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    return () => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave); };
  });
  return () => fns.forEach((fn) => fn());
}

/** Scroll-linked promo image parallax (all sizes, subtle). */
export function initPromoParallax(gsap, factor = 1) {
  const tweens = [...document.querySelectorAll('.promo-card__img')].map((img) =>
    gsap.fromTo(img, { yPercent: -5 * factor }, { yPercent: 5 * factor, ease: 'none', scrollTrigger: { trigger: img.closest('.promo-card'), start: 'top bottom', end: 'bottom top', scrub: true } })
  );
  return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
}

/** Download QR code (uses qrcodejs if loaded; otherwise shows a link). */
export function renderQR(url) {
  const el = document.getElementById('qr-code');
  if (!el) return;
  if (typeof QRCode === 'function') {
    el.innerHTML = '';
    // eslint-disable-next-line no-new
    new QRCode(el, { text: url, width: 192, height: 192, colorDark: '#001A33', colorLight: '#FFFFFF', correctLevel: QRCode.CorrectLevel.M });
    el.removeAttribute('title');
  } else {
    el.innerHTML = `<a href="${url}" target="_blank" rel="noopener" style="font-size:.7rem;font-weight:700;color:#003B70;text-align:center">Buka tautan download</a>`;
  }
}
