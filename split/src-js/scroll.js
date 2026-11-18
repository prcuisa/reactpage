/**
 * scroll.js — hero entrance timeline, scroll reveals, split headlines,
 * number counters and off-screen animation pausing.
 */

/** Wrap each word of [data-split] headings for staggered reveals (keeps <em>/<br>). */
export function splitHeadings() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (el.dataset.splitDone) return;
    const wrapNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const line = document.createElement('span');
          line.className = 'split-line';
          const word = document.createElement('span');
          word.className = 'split-word';
          word.textContent = part;
          line.appendChild(word);
          frag.appendChild(line);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
        [...node.childNodes].forEach(wrapNode);
      }
    };
    // Screen readers get the original sentence
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    [...el.childNodes].forEach(wrapNode);
    el.querySelectorAll('.split-line').forEach((l) => l.setAttribute('aria-hidden', 'true'));
    el.dataset.splitDone = '1';
  });
}

/** Hero entrance — one GSAP timeline. */
export function heroIntro(gsap, { mobile = false } = {}) {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero__title .split-word', { yPercent: 110, rotate: 4, duration: 1.2, stagger: 0.07 }, 0.1)
    .to('.hero [data-hero-item]', { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.35)
    .fromTo('.hero__phone .phone',
      { opacity: 0, y: mobile ? 60 : 140, rotateY: -40, rotateX: 18, scale: 0.86 },
      { opacity: 1, y: 0, rotateY: mobile ? -8 : -14, rotateX: mobile ? 0 : 4, scale: 1, duration: mobile ? 1.2 : 1.6 }, 0.2)
    .fromTo('[data-hero-float]',
      { opacity: 0, scale: 0.4, z: -200 },
      { opacity: 1, scale: 1, z: 0, duration: 1.2, stagger: 0.09, ease: 'back.out(1.6)' }, 0.75)
    .to('.hero__title em', { '--underline': 1, duration: 0.9, ease: 'power3.inOut' }, 1.0);
  return tl;
}

/** Scroll reveals for single elements, stagger groups and split headings. */
export function initReveals(gsap, ScrollTrigger, { mobile = false } = {}) {
  const y = mobile ? 20 : 32;
  const dur = mobile ? 0.7 : 1;
  const kill = [];

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    kill.push(gsap.to(el, { opacity: 1, y: 0, duration: dur, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
  });

  document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
    const items = group.children;
    if (!items.length) return;
    kill.push(gsap.to(items, { opacity: 1, y: 0, duration: dur, ease: 'expo.out', stagger: mobile ? 0.06 : 0.1, scrollTrigger: { trigger: group, start: 'top 85%', once: true } }));
  });

  document.querySelectorAll('[data-split]:not(.hero__title)').forEach((h) => {
    kill.push(gsap.from(h.querySelectorAll('.split-word'), { yPercent: 105, duration: dur + 0.1, ease: 'expo.out', stagger: 0.045, scrollTrigger: { trigger: h, start: 'top 88%', once: true } }));
  });

  // Story numbers draw their rule
  document.querySelectorAll('.story__num i').forEach((line) => {
    kill.push(gsap.from(line, { scaleX: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: line, start: 'top 85%', once: true } }));
  });

  // Mobile story devices rise in
  if (mobile) {
    document.querySelectorAll('.story__device').forEach((d) => {
      kill.push(gsap.from(d.querySelector('.phone'), { y: 60, rotate: -4, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: d, start: 'top 85%', once: true } }));
      kill.push(gsap.from(d.querySelectorAll('.mobj > *'), { scale: 0.4, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.6)', scrollTrigger: { trigger: d, start: 'top 75%', once: true } }));
    });
  }

  // Section transition: solutions cards lift in
  document.querySelectorAll('.sol').forEach((card, i) => {
    kill.push(gsap.from(card, { y: mobile ? 30 : 70, opacity: 0, duration: 1.1, ease: 'expo.out', delay: (i % 2) * 0.08, scrollTrigger: { trigger: card, start: 'top 90%', once: true } }));
  });

  return () => kill.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
}

/** Number counters (only for official, non-null values). */
export function initCounters(gsap, ScrollTrigger, reduced) {
  const fmt = (v, d) => v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const d = parseInt(el.dataset.decimals || '0', 10);
    if (Number.isNaN(target)) return;
    if (reduced || !gsap) { el.textContent = fmt(target, d); return; }
    const obj = { v: 0 };
    el.textContent = fmt(0, d);
    gsap.to(obj, {
      v: target, duration: 2, ease: 'power2.out',
      onUpdate: () => { el.textContent = fmt(obj.v, d); },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

/** Pause CSS loops when sections are off-screen (saves battery). */
export function pauseOffscreen() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => en.target.classList.toggle('is-offscreen', !en.isIntersecting));
  }, { rootMargin: '100px' });
  document.querySelectorAll('main > section').forEach((s) => io.observe(s));
  return () => io.disconnect();
}

/** Reveal everything immediately (reduced motion / no GSAP). */
export function revealAll() {
  document.querySelector('.livin')?.classList.remove('livin--motion');
}
