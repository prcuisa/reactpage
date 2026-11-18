/**
 * render.js — renders data-driven sections from data.js into the DOM.
 * No framework: plain template strings with escaping.
 */
import { LINKS, STATS, AWARDS, SOLUTIONS, PROMOS, VIDEOS } from './data.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
const pad = (n) => String(n).padStart(2, '0');

function renderStats() {
  const el = document.getElementById('stats-grid');
  if (!el) return;
  el.innerHTML = STATS.map((s) => {
    const pending = s.value === null || s.value === undefined;
    return `
      <li class="stat">
        <div class="stat__value ${pending ? 'stat__value--pending' : ''}">
          ${pending
            ? '<span aria-label="Data belum tersedia">—</span>'
            : `${esc(s.prefix)}<span data-count="${s.value}" data-decimals="${s.decimals || 0}">${s.value}</span>`}
          <small>${esc(s.unit)}${esc(s.suffix)}</small>
        </div>
        <p class="stat__label">${esc(s.label)}</p>
        ${s.source ? `<p class="stat__src">Sumber: ${esc(s.source)}</p>` : ''}
        ${pending ? '<span class="pending-badge">Menunggu data resmi</span>' : ''}
      </li>`;
  }).join('');
}

function renderAwards() {
  const el = document.getElementById('awards-list');
  if (!el) return;
  el.innerHTML = AWARDS.map((a, i) => {
    const pending = !a.title;
    return `
      <li class="award">
        <span class="award__ic">${ic('award')}</span>
        <span>
          <b>${pending ? `Slot penghargaan ${pad(i + 1)}` : esc(a.title)}</b>
          <small>${pending ? 'Menunggu verifikasi resmi' : `${esc(a.issuer)}${a.year ? ` · ${esc(a.year)}` : ''}`}</small>
        </span>
      </li>`;
  }).join('');
}

function renderSolutions() {
  const el = document.getElementById('solutions-grid');
  if (!el) return;
  el.innerHTML = SOLUTIONS.map((s) => {
    const extra = s.id === 'payments' && !s.image
      ? `<div class="sol__mini" aria-hidden="true"><span>${ic('scan-line')}</span><span>${ic('send')}</span><span>${ic('receipt')}</span></div>`
      : '';
    return `
      <article class="sol sol--${esc(s.id)}${s.image ? ' sol--has-media' : ''}" aria-labelledby="sol-${esc(s.id)}">
        <span class="sol__glyph" aria-hidden="true">${ic(s.icon)}</span>
        <span class="sol__kicker">${esc(s.kicker)}</span>
        <h3 class="sol__name" id="sol-${esc(s.id)}">${esc(s.name)}</h3>
        <p class="sol__tag">${esc(s.tagline)}</p>
        <p class="sol__desc">${esc(s.description)}</p>
        ${s.capabilities.length ? `<ul class="sol__caps">${s.capabilities.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
        ${extra}
        ${s.image ? `<img class="sol__media" src="${esc(s.image)}" alt="" loading="lazy" decoding="async" />` : ''}
        <div class="sol__foot">
          ${s.verified ? '<span></span>' : '<span class="pending-badge">Draf konten — menunggu verifikasi</span>'}
          <a class="sol__link" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="Pelajari ${esc(s.name)} (tab baru)">Pelajari ${ic('arrow-up-right')}</a>
        </div>
      </article>`;
  }).join('');
}

function renderPromos() {
  const el = document.getElementById('promo-grid');
  if (!el) return;
  const icons = ['gift', 'ticket-percent', 'sparkles'];
  el.innerHTML = PROMOS.slice(0, 3).map((p, i) => `
    <article class="promo-card">
      <div class="promo-card__media">
        <div class="promo-card__img">
          ${p.image
            ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" decoding="async" />`
            : `<div class="promo-art promo-art--${esc(p.art || 'yellow')}" role="img" aria-label="Ilustrasi slot promo"><span class="promo-art__ic">${ic(icons[i])}</span></div>`}
        </div>
        <span class="promo-art__label">PROMO ${pad(i + 1)}</span>
      </div>
      <div class="promo-card__body">
        <span class="promo-card__validity">${ic('calendar')} ${esc(p.validity)}</span>
        <h3 class="promo-card__title">${esc(p.title)}</h3>
        <p class="promo-card__desc">${esc(p.description)}</p>
        <div class="promo-card__cta">
          <a href="${esc(p.url)}" class="btn btn--ghost btn--sm" target="_blank" rel="noopener" aria-label="${esc(p.cta)}: ${esc(p.title)} (tab baru)">${esc(p.cta)} ${ic('arrow-up-right')}</a>
        </div>
      </div>
    </article>`).join('');
}

function renderVideos() {
  const el = document.getElementById('edu-grid');
  if (!el) return;
  el.innerHTML = VIDEOS.slice(0, 3).map((v, i) => `
    <a class="vcard" href="${esc(v.url)}" target="_blank" rel="noopener" aria-label="Tonton di YouTube: ${esc(v.title)} (tab baru)">
      <div class="vcard__thumb">
        ${v.thumbnail
          ? `<img src="${esc(v.thumbnail)}" alt="" loading="lazy" decoding="async" />`
          : `<div class="vcard__art" aria-hidden="true"><span>Edukasi ${pad(i + 1)}</span></div>`}
        <span class="vcard__play" aria-hidden="true">${ic('play')}</span>
        <span class="vcard__dur">${esc(v.duration)}</span>
      </div>
      <div class="vcard__body">
        <h3 class="vcard__title">${esc(v.title)}</h3>
        <p class="vcard__desc">${esc(v.description)}</p>
        <span class="vcard__yt">${ic('youtube')} Tonton di YouTube</span>
      </div>
    </a>`).join('');
}

function bindLinks() {
  const set = (id, url) => { const a = document.getElementById(id); if (a) a.href = url; };
  set('store-play', LINKS.playStore);
  set('store-apple', LINKS.appStore);
  set('store-huawei', LINKS.appGallery);
  document.querySelectorAll('[data-link]').forEach((a) => {
    const url = LINKS[a.dataset.link];
    if (url) a.href = url;
  });
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

export function renderAll() {
  renderStats();
  renderAwards();
  renderSolutions();
  renderPromos();
  renderVideos();
  bindLinks();
}
