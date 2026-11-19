import { __lvRoot, __lvById } from './dom.js';
/**
 * render.js — renders data-driven sections from data.js into the DOM.
 * No framework: plain template strings with escaping.
 */
import { LINKS, STATS, AWARDS, SOLUTIONS, PROMOS, VIDEOS } from './data.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
const pad = (n) => String(n).padStart(2, '0');

function renderStats() {
  const el = __lvById('stats-grid');
  if (!el) return;
  el.innerHTML = STATS.map((s) => {
    const pending = s.value === null || s.value === undefined;
    return `
      <li class="lv-stat">
        <div class="lv-stat__value ${pending ? "lv-stat__value--pending" : ''}">
          ${pending
            ? '<span aria-label="Data belum tersedia">—</span>'
            : `${esc(s.prefix)}<span data-count="${s.value}" data-decimals="${s.decimals || 0}">${s.value}</span>`}
          <small>${esc(s.unit)}${esc(s.suffix)}</small>
        </div>
        <p class="lv-stat__label">${esc(s.label)}</p>
        ${s.source ? `<p class="lv-stat__src">Sumber: ${esc(s.source)}</p>` : ''}
        ${pending ? "<span class=\"lv-pending-badge\">Menunggu data resmi</span>" : ''}
      </li>`;
  }).join('');
}

function renderAwards() {
  const el = __lvById('awards-list');
  if (!el) return;
  el.innerHTML = AWARDS.map((a, i) => {
    const pending = !a.title;
    return `
      <li class="lv-award">
        <span class="lv-award__ic">${ic('award')}</span>
        <span>
          <b>${pending ? `Slot penghargaan ${pad(i + 1)}` : esc(a.title)}</b>
          <small>${pending ? 'Menunggu verifikasi resmi' : `${esc(a.issuer)}${a.year ? ` · ${esc(a.year)}` : ''}`}</small>
        </span>
      </li>`;
  }).join('');
}

function renderSolutions() {
  const el = __lvById('solutions-grid');
  if (!el) return;
  el.innerHTML = SOLUTIONS.map((s) => {
    const extra = s.id === 'payments' && !s.image
      ? `<div class="lv-sol__mini" aria-hidden="true"><span>${ic('scan-line')}</span><span>${ic('send')}</span><span>${ic('receipt')}</span></div>`
      : '';
    return `
      <article class="lv-sol lv-sol--${esc(s.id)}${s.image ? " lv-sol--has-media" : ''}" aria-labelledby="lv-sol-${esc(s.id)}">
        <span class="lv-sol__glyph" aria-hidden="true">${ic(s.icon)}</span>
        <span class="lv-sol__kicker">${esc(s.kicker)}</span>
        <h3 class="lv-sol__name" id="lv-sol-${esc(s.id)}">${esc(s.name)}</h3>
        <p class="lv-sol__tag">${esc(s.tagline)}</p>
        <p class="lv-sol__desc">${esc(s.description)}</p>
        ${s.capabilities.length ? `<ul class="lv-sol__caps">${s.capabilities.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
        ${extra}
        ${s.image ? `<img class="lv-sol__media" src="${esc(s.image)}" alt="" loading="lazy" decoding="async" />` : ''}
        <div class="lv-sol__foot">
          ${s.verified ? '<span></span>' : "<span class=\"lv-pending-badge\">Draf konten — menunggu verifikasi</span>"}
          <a class="lv-sol__link" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="Pelajari ${esc(s.name)} (tab baru)">Pelajari ${ic('arrow-up-right')}</a>
        </div>
      </article>`;
  }).join('');
}

function renderPromos() {
  const el = __lvById('promo-grid');
  if (!el) return;
  const icons = ['gift', 'ticket-percent', 'sparkles'];
  el.innerHTML = PROMOS.slice(0, 3).map((p, i) => `
    <article class="lv-promo-card">
      <div class="lv-promo-card__media">
        <div class="lv-promo-card__img">
          ${p.image
            ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" decoding="async" />`
            : `<div class="lv-promo-art lv-promo-art--${esc(p.art || 'yellow')}" role="img" aria-label="Ilustrasi slot promo"><span class="lv-promo-art__ic">${ic(icons[i])}</span></div>`}
        </div>
        <span class="lv-promo-art__label">PROMO ${pad(i + 1)}</span>
      </div>
      <div class="lv-promo-card__body">
        <span class="lv-promo-card__validity">${ic('calendar')} ${esc(p.validity)}</span>
        <h3 class="lv-promo-card__title">${esc(p.title)}</h3>
        <p class="lv-promo-card__desc">${esc(p.description)}</p>
        <div class="lv-promo-card__cta">
          <a href="${esc(p.url)}" class="lv-btn lv-btn--ghost lv-btn--sm" target="_blank" rel="noopener" aria-label="${esc(p.cta)}: ${esc(p.title)} (tab baru)">${esc(p.cta)} ${ic('arrow-up-right')}</a>
        </div>
      </div>
    </article>`).join('');
}

function renderVideos() {
  const el = __lvById('edu-grid');
  if (!el) return;
  el.innerHTML = VIDEOS.slice(0, 3).map((v, i) => `
    <a class="lv-vcard" href="${esc(v.url)}" target="_blank" rel="noopener" aria-label="Tonton di YouTube: ${esc(v.title)} (tab baru)">
      <div class="lv-vcard__thumb">
        ${v.thumbnail
          ? `<img src="${esc(v.thumbnail)}" alt="" loading="lazy" decoding="async" />`
          : `<div class="lv-vcard__art" aria-hidden="true"><span>Edukasi ${pad(i + 1)}</span></div>`}
        <span class="lv-vcard__play" aria-hidden="true">${ic('play')}</span>
        <span class="lv-vcard__dur">${esc(v.duration)}</span>
      </div>
      <div class="lv-vcard__body">
        <h3 class="lv-vcard__title">${esc(v.title)}</h3>
        <p class="lv-vcard__desc">${esc(v.description)}</p>
        <span class="lv-vcard__yt">${ic('youtube')} Tonton di YouTube</span>
      </div>
    </a>`).join('');
}

function bindLinks() {
  const set = (id, url) => { const a = __lvById(id); if (a) a.href = url; };
  set('store-play', LINKS.playStore);
  set('store-apple', LINKS.appStore);
  set('store-huawei', LINKS.appGallery);
  __lvRoot().querySelectorAll('[data-link]').forEach((a) => {
    const url = LINKS[a.dataset.link];
    if (url) a.href = url;
  });
  const y = __lvById('year');
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
