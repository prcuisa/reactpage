import { __lvRoot } from './dom.js';
/**
 * parallax.js — multi-layer parallax.
 *  Layer 1 (background)   : [data-speed] low values  (blobs, rings, panels)
 *  Layer 2 (floating UI)  : [data-speed] mid values  (cards, coins, tiles)
 *  Layer 3 (foreground)   : phone stages, negative speeds
 * Scroll parallax is coordinated by ScrollTrigger; mouse parallax is desktop
 * only ([data-mouse-scope] > [data-mouse-depth]).
 */

/** Scroll parallax. `factor` lets mobile run a lighter version. */
export function initScrollParallax(gsap, { factor = 1 } = {}) {
  const tweens = [];
  __lvRoot().querySelectorAll('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed) || 0;
    if (!speed) return;
    const trigger = el.closest(".lv-el-section") || el;
    const distance = speed * 260 * factor;
    tweens.push(
      gsap.fromTo(el,
        { y: -distance / 2 },
        { y: distance / 2, ease: 'none', scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true } })
    );
  });
  return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
}

/** Mouse-responsive depth parallax (desktop, fine pointer only). */
export function initMouseParallax(gsap) {
  const scopes = [...__lvRoot().querySelectorAll('[data-mouse-scope]')];
  const cleanups = [];

  scopes.forEach((scope) => {
    // Only direct-ish layers that belong to this scope (not nested scopes)
    const layers = [...scope.querySelectorAll('[data-mouse-depth]')].filter((el) => el.closest('[data-mouse-scope]') === scope);
    const movers = layers.map((el) => {
      const depth = parseFloat(el.dataset.mouseDepth) || 0;
      return {
        depth,
        x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' }),
      };
    });

    let rect = scope.getBoundingClientRect();
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        movers.forEach((m) => { m.x(nx * 36 * m.depth); m.y(ny * 28 * m.depth); });
      });
    };
    const onEnter = () => { rect = scope.getBoundingClientRect(); };
    const onLeave = () => movers.forEach((m) => { m.x(0); m.y(0); });

    scope.addEventListener('pointerenter', onEnter);
    scope.addEventListener('pointermove', onMove, { passive: true });
    scope.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      cancelAnimationFrame(raf);
      scope.removeEventListener('pointerenter', onEnter);
      scope.removeEventListener('pointermove', onMove);
      scope.removeEventListener('pointerleave', onLeave);
      layers.forEach((el) => gsap.set(el, { x: 0, y: 0 }));
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
