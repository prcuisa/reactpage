/**
 * phone-experience.js — "Satu Aplikasi. Banyak Pengalaman."
 *
 * One persistent phone frame whose screen, floating objects, accent colour,
 * chip label and progress indicator are driven by a single controller.
 *
 * Desktop (>= 1024px): sticky phone + ScrollTrigger per story.
 * Mobile  (<  1024px): stacked stories, each with its own compact device
 *                      (no pinning, no scroll-jacking).
 */
import { FEATURES } from './data.js';
import { renderScreen } from './screens.js';

const ic = (name) => `<i data-lucide="${name}"></i>`;
const pad = (n) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* 3D object templates                                                 */
/* ------------------------------------------------------------------ */
const QR_CELLS = (() => {
  const cells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const finder = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
      const finderHole = finder && (r % 6 === 1 || r === 7) && (c % 6 === 1 || c === 7);
      const on = finder ? !finderHole : (r * 7 + c * 13 + r * c) % 3 === 0;
      cells.push(`<i class="${on ? '' : 'o'}"></i>`);
    }
  }
  return cells.join('');
})();

const SPARK = `<svg class="spark" viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 34 L15 30 L30 32 L45 22 L60 24 L75 15 L90 17 L105 8 L120 5" fill="none" style="stroke:var(--navy)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="120" cy="5" r="4" fill="#FFCC00"/></svg>`;

export function objectHTML(o) {
  switch (o.type) {
    case 'widget':
      // Real Livin' widget cropped from the official design (assets/images/widgets)
      return `<img class="o-widget" src="${o.src}" style="--ww:${o.w || 220}px" alt="" loading="lazy" decoding="async" />`;
    case 'coin':
      return `<div class="o-coin"><span>Rp</span></div>`;
    case 'card':
      // Debit uses the real Mandiri debit gold card artwork from the design file
      if (o.label === 'Debit') return `<img class="o-cardimg" src="assets/images/card-debit-gold.jpg" width="254" height="160" alt="" loading="lazy" decoding="async" />`;
      return `<div class="o-card ${o.label === 'Tabungan' ? 'o-card--yellow' : ''}"><span class="o-card__chip"></span><span class="o-card__brand">mandiri</span><span class="o-card__num">•••• •••• 2024</span><span class="o-card__label">${o.label || 'Debit'}</span></div>`;
    case 'chart':
      return `<div class="o-chart"><small>Arus kas</small><div class="o-chart__bars"><i style="height:40%"></i><i style="height:62%"></i><i style="height:48%"></i><i style="height:78%"></i><i style="height:58%"></i><i style="height:96%"></i></div></div>`;
    case 'qr':
      return `<div class="o-qr"><div class="o-qr__grid">${QR_CELLS}</div><div class="o-qr__tag">QRIS</div></div>`;
    case 'receipt':
      return `<div class="o-receipt"><span class="o-receipt__ok">${ic('check')}</span><b>Pembayaran berhasil</b><hr /><div class="o-receipt__line" style="width:90%"></div><div class="o-receipt__line" style="width:70%"></div><div class="o-receipt__line" style="width:80%"></div></div>`;
    case 'tile':
      return `<div class="o-tile"><span class="o-tile__ic">${ic(o.icon || 'sparkles')}</span><b>${o.label || ''}</b></div>`;
    case 'house':
      return `<div class="o-house">${ic('house')}</div>`;
    case 'ticket':
      return `<div class="o-ticket"><div class="o-ticket__main"><small>Boarding</small><b>CGK ${ic('plane')} DPS</b></div><div class="o-ticket__stub"><b>12A</b></div></div>`;
    case 'bag':
      return `<div class="o-bag"><span class="o-bag__handle"></span><div class="o-bag__body">${ic('shopping-bag')}</div></div>`;
    case 'gift':
      return `<div class="o-gift"><span class="o-gift__bow"></span><div class="o-gift__lid"></div><div class="o-gift__box"></div></div>`;
    case 'points':
      return `<div class="o-points"><small>${ic('star')} Livin'poin</small><b>12.450</b><span>Tukar reward</span></div>`;
    case 'headset':
      return `<div class="o-headset">${ic('headset')}</div>`;
    case 'portfolio':
      return `<div class="o-portfolio"><small>${o.label || 'Portofolio'}</small>${SPARK}</div>`;
    default:
      return '';
  }
}

const phoneHTML = (screenAttrs = '') => `
  <div class="phone">
    <span class="phone__btn phone__btn--power"></span>
    <span class="phone__btn phone__btn--vol1"></span>
    <span class="phone__btn phone__btn--vol2"></span>
    <div class="phone__screen"><span class="phone__island"></span><div class="screen is-active" ${screenAttrs}></div></div>
    <span class="phone__glare"></span>
  </div>`;

/* ------------------------------------------------------------------ */
/* DOM build (runs once, framework-free)                               */
/* ------------------------------------------------------------------ */
export function buildExperience() {
  const storiesEl = document.getElementById('exp-stories');
  const screensEl = document.getElementById('exp-screens');
  const objectsEl = document.getElementById('exp-objects');
  const dotsEl = document.getElementById('exp-dots');
  if (!storiesEl || !screensEl) return null;

  storiesEl.innerHTML = FEATURES.map((f, i) => `
    <article class="story" id="feature-${f.id}" data-index="${i}" style="--story-accent:${f.accent}" aria-labelledby="feature-${f.id}-title">
      <div class="story__copy">
        <p class="story__num"><b>${pad(i + 1)}</b><i></i>${f.label}</p>
        <h3 class="story__title" id="feature-${f.id}-title">${f.title}</h3>
        <p class="story__desc">${f.description}</p>
        <ul class="story__points">${f.points.map((p) => `<li>${ic('check')}${p}</li>`).join('')}</ul>
      </div>
      <div class="story__device" aria-hidden="true">
        <div class="mobj mobj--a">${objectHTML(f.objects[0])}</div>
        <div class="phone-wrap">${phoneHTML(`data-mobile-screen="${f.id}"`)}</div>
        <div class="mobj mobj--b">${objectHTML(f.objects[2] || f.objects[1])}</div>
      </div>
    </article>`).join('');

  // Persistent phone: one stacked layer per feature
  FEATURES.forEach((f, i) => {
    const layer = document.createElement('div');
    layer.className = 'screen' + (i === 0 ? ' is-active' : '');
    layer.dataset.screen = f.id;
    renderScreen(layer, f.id, f.screenshot, `Tampilan ${f.label} di aplikasi Livin'`);
    screensEl.appendChild(layer);
  });

  // Mobile devices reuse the same screen templates
  storiesEl.querySelectorAll('[data-mobile-screen]').forEach((el) => {
    const f = FEATURES.find((x) => x.id === el.dataset.mobileScreen);
    renderScreen(el, f.id, f.screenshot, `Tampilan ${f.label} di aplikasi Livin'`);
  });

  // Object sets: one per feature, three layers each (slot > fx > float)
  objectsEl.innerHTML = FEATURES.map((f, i) => `
    <div class="objset" data-set="${i}" style="position:absolute;inset:0">
      ${f.objects.map((o) => `
        <div class="obj obj--${o.slot}" data-mouse-depth="${o.depth}">
          <div class="obj__fx" style="${i === 0 ? '' : 'opacity:0;visibility:hidden'}">
            <div class="obj__inner">${objectHTML(o)}</div>
          </div>
        </div>`).join('')}
    </div>`).join('');

  dotsEl.innerHTML = FEATURES.map((f, i) => `
    <li><button type="button" class="exp__dot${i === 0 ? ' is-active' : ''}" data-goto="${i}" aria-label="Pengalaman ${pad(i + 1)}: ${f.label}">
      <span></span><em class="exp__dot-label">${f.label}</em>
    </button></li>`).join('');

  return {
    section: document.getElementById('experience'),
    stories: [...storiesEl.querySelectorAll('.story')],
    screens: [...screensEl.querySelectorAll('.screen')],
    sets: [...objectsEl.querySelectorAll('.objset')],
    dots: [...dotsEl.querySelectorAll('.exp__dot')],
    chip: document.getElementById('exp-chip'),
    count: document.getElementById('exp-count'),
    bar: document.getElementById('exp-bar'),
    progress: document.getElementById('exp-progress'),
    phone: document.querySelector('.phone--exp'),
  };
}

/* ------------------------------------------------------------------ */
/* Controller — the single source of synchronisation                   */
/* ------------------------------------------------------------------ */
class ExperienceController {
  constructor(refs, { gsap, animate }) {
    this.r = refs;
    this.gsap = gsap;
    this.animate = animate && !!gsap;
    this.active = 0;
    this.r.stories[0]?.classList.add('is-active');
    this.r.section.style.setProperty('--accent', FEATURES[0].accent);
    if (this.gsap) {
      this.r.screens.forEach((s, i) => this.gsap.set(s, { autoAlpha: i === 0 ? 1 : 0 }));
    }
  }

  setActive(i) {
    if (i === this.active || i < 0 || i >= FEATURES.length) return;
    const prev = this.active;
    const dir = i > prev ? 1 : -1;
    const f = FEATURES[i];
    this.active = i;

    // Narrative, progress & accent
    this.r.stories.forEach((s, k) => s.classList.toggle('is-active', k === i));
    this.r.dots.forEach((d, k) => {
      d.classList.toggle('is-active', k === i);
      d.setAttribute('aria-current', k === i ? 'step' : 'false');
    });
    this.r.count.textContent = pad(i + 1);
    this.r.section.style.setProperty('--accent', f.accent);
    this.r.chip.querySelector('.exp__chip-num').textContent = pad(i + 1);
    this.r.chip.querySelector('.exp__chip-label').textContent = f.label;

    const inS = this.r.screens[i];
    const outS = this.r.screens[prev];
    const inFx = this.r.sets[i].querySelectorAll('.obj__fx');
    const outFx = this.r.sets[prev].querySelectorAll('.obj__fx');

    if (!this.animate) {
      outS.classList.remove('is-active');
      inS.classList.add('is-active');
      if (this.gsap) {
        this.gsap.set(outS, { autoAlpha: 0 });
        this.gsap.set(inS, { autoAlpha: 1 });
      }
      outFx.forEach((el) => { el.style.opacity = 0; el.style.visibility = 'hidden'; });
      inFx.forEach((el) => { el.style.opacity = 1; el.style.visibility = 'visible'; });
      return;
    }

    const g = this.gsap;
    g.killTweensOf([...this.r.screens, ...this.r.sets.flatMap((s) => [...s.querySelectorAll('.obj__fx')])]);

    // Hide every non-involved layer instantly (handles fast scrolling)
    this.r.screens.forEach((s, k) => { if (k !== i && k !== prev) g.set(s, { autoAlpha: 0 }); });
    this.r.sets.forEach((set, k) => {
      if (k !== i && k !== prev) g.set(set.querySelectorAll('.obj__fx'), { autoAlpha: 0 });
    });

    outS.classList.remove('is-active');
    inS.classList.add('is-active');

    // Screen: crossfade + subtle scale + directional slide
    g.to(outS, { autoAlpha: 0, scale: 0.94, yPercent: -7 * dir, duration: 0.45, ease: 'power2.in' });
    g.fromTo(inS,
      { autoAlpha: 0, scale: 1.05, yPercent: 9 * dir },
      { autoAlpha: 1, scale: 1, yPercent: 0, duration: 0.75, ease: 'power3.out', delay: 0.12 });

    // Objects: contextual exit (recede back), entrance (rise forward in 3D)
    g.to(outFx, {
      autoAlpha: 0, scale: 0.6, y: -70 * dir, rotateX: -30 * dir, z: -160,
      duration: 0.45, ease: 'power2.in', stagger: 0.04,
    });
    g.fromTo(inFx,
      { autoAlpha: 0, scale: 0.5, y: 90 * dir, rotateX: 40 * dir, rotateY: -18, z: -200 },
      { autoAlpha: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0, z: 0, duration: 0.95, ease: 'expo.out', stagger: 0.08, delay: 0.18 });

    // Chip micro-bounce
    g.fromTo(this.r.chip, { y: 8, scale: 0.96 }, { y: 0, scale: 1, duration: 0.5, ease: 'back.out(2)' });
  }
}

/* ------------------------------------------------------------------ */
/* Desktop init (called inside gsap.matchMedia — auto-reverted)         */
/* ------------------------------------------------------------------ */
export function initExperienceDesktop(refs, { gsap, ScrollTrigger, reduced }) {
  const ctrl = new ExperienceController(refs, { gsap, animate: !reduced });
  const triggers = [];

  refs.stories.forEach((story, i) => {
    triggers.push(ScrollTrigger.create({
      trigger: story,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => self.isActive && ctrl.setActive(i),
    }));
  });

  // Progress rail visibility + fill
  triggers.push(ScrollTrigger.create({
    trigger: '#exp-stories',
    start: 'top 60%',
    end: 'bottom 40%',
    onToggle: (self) => refs.progress.classList.toggle('is-visible', self.isActive),
    onUpdate: (self) => { refs.bar.style.transform = `scaleY(${self.progress})`; },
  }));

  // Phone: slow 3D turn across the whole story (layer 3 parallax)
  if (!reduced) {
    gsap.fromTo(refs.phone,
      { rotateY: -12, rotateX: 6 },
      { rotateY: 10, rotateX: -2, ease: 'none', scrollTrigger: { trigger: '#exp-stories', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  }

  // Dots → scroll to story
  const onDot = (e) => {
    const btn = e.target.closest('[data-goto]');
    if (!btn) return;
    const story = refs.stories[Number(btn.dataset.goto)];
    story.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  };
  refs.progress.addEventListener('click', onDot);

  return () => {
    refs.progress.removeEventListener('click', onDot);
    refs.progress.classList.remove('is-visible');
    triggers.forEach((t) => t.kill());
  };
}

/* Fallback when GSAP is unavailable: IntersectionObserver keeps it in sync */
export function initExperienceFallback(refs) {
  const ctrl = new ExperienceController(refs, { gsap: null, animate: false });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) ctrl.setActive(Number(en.target.dataset.index)); });
  }, { rootMargin: '-50% 0px -50% 0px' });
  refs.stories.forEach((s) => io.observe(s));
  return () => io.disconnect();
}
