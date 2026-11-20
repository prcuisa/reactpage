import { IMG_BASE } from './dom.js';
/**
 * screens.js — Phone screen templates.
 *
 * `home` uses the official home-screen design (assets/screenshots/livin-home.svg,
 * from the supplied Frame.svg). The seven feature screens are rebuilt in the same
 * visual language (css/app-ui.css). Amounts are illustrative UI values only.
 * When `feature.screenshot` is set in data.js, that image replaces the template.
 */

const ic = (name) => `<i data-lucide="${name}"></i>`;
const A = IMG_BASE + 'assets/images';

const status = () => `
  <div class="lv-a-status"><span>12:22</span><span class="lv-a-status__icons">${ic('signal')}${ic('wifi')}${ic('battery-full')}</span></div>`;

const nav = (active = 'home') => `
  <div class="lv-a-nav">
    <span class="${active === 'home' ? "lv-on" : ''}">${ic('house')}Beranda</span>
    <span><em class="lv-baru">BARU</em><b class="lv-food">fo<i>o</i>d</b>Livin' Food</span>
    <span><b class="lv-qris">${ic('scan-line')}</b><b class="lv-qris-label">QRIS</b></span>
    <span class="lv-sukha ${active === 'sukha' ? "lv-on" : ''}">${ic('shopping-bag')}Sukha</span>
    <span class="lv-loyal ${active === 'loyalty' ? "lv-on" : ''}">${ic('award')}Loyalty</span>
  </div>`;

const titled = (title, action = 'sliders-horizontal') => `
  ${status()}
  <div class="lv-a-top">
    <span class="lv-a-top__back">${ic('arrow-left')}</span>
    <span class="lv-a-top__title">${title}</span>
    <span class="lv-a-top__act">${ic(action)}</span>
  </div>`;

const profile = () => `
  ${status()}
  <div class="lv-a-top">
    <div class="lv-a-profile">
      <img class="lv-a-avatar" src="${A}/avatar.png" alt="" />
      <div><b>Livia Octaviana</b><small>2.305 livin'poin ›</small></div>
    </div>
    <span class="lv-a-top__act">${ic('mail')}</span>
  </div>`;

const ico = (icon, label, dot = false) => `<div class="lv-a-ico"><span>${ic(icon)}${dot ? '<em></em>' : ''}</span>${label}</div>`;

const spark = `
  <svg class="lv-a-spark" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="lv-a-sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B93FE" stop-opacity=".28"/><stop offset="1" stop-color="#2B93FE" stop-opacity="0"/></linearGradient></defs>
    <path d="M0 48 L20 44 L40 46 L60 36 L80 38 L100 28 L120 30 L140 20 L160 22 L180 12 L200 8 L200 60 L0 60Z" fill="url(#lv-a-sg)"/>
    <path d="M0 48 L20 44 L40 46 L60 36 L80 38 L100 28 L120 30 L140 20 L160 22 L180 12 L200 8" fill="none" stroke="#2B93FE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

export const SCREENS = {
  /* Official home screen (from the supplied design) */
  home: () => `<img class="lv-screen__shot" src="${IMG_BASE}assets/screenshots/livin-home.svg" alt="Tampilan beranda aplikasi Livin' by Mandiri" decoding="async" />`,

  /* Beranda with Tabungan widgets (from "Entry Point - Tabungan - Widget" design) */
  beranda: () => `<img class="lv-screen__shot" src="${IMG_BASE}assets/screenshots/screen-beranda-tabungan.jpg" alt="Tampilan beranda Livin' dengan widget rekening dan transaksi favorit" loading="lazy" decoding="async" />`,

  /* Splash (spare) */
  splash: () => `
    <div class="lv-a-splash">
      <span class="lv-a-splash__logo">livin'</span>
      <span class="lv-a-splash__by">by mandiri</span>
    </div>`,

  /* 01 Savings — Rekening */
  savings: () => `
    ${profile()}
    <div class="lv-a-body">
      <div class="lv-a-card lv-a-card--flush">
        <div style="padding:1.35em 1.4em 0">
          <div class="lv-a-card__head"><span class="lv-a-card__title">Rekening</span><span class="lv-a-link">Saldo ${ic('eye-off')}</span></div>
          <div class="lv-a-tabs">
            <div class="lv-a-tab lv-on"><span>${ic('wallet')}</span>Tabungan</div>
            <div class="lv-a-tab"><span>${ic('landmark')}</span>Deposito</div>
            <div class="lv-a-tab"><span>${ic('credit-card')}</span>Kartu Kredit</div>
            <div class="lv-a-tab"><span>${ic('hand-coins')}</span>Pinjaman</div>
            <div class="lv-a-tab"><span>${ic('chart-column')}</span>Investasi</div>
          </div>
          <div class="lv-a-product"><div><b>Tabungan Now IDR</b><span>Rp *****</span></div><img src="${A}/card-debit-gold.jpg" alt="" /></div>
        </div>
        <div class="lv-a-foot" style="margin-top:1.2em"><span>Lihat Semua Produk</span>${ic('arrow-right')}</div>
      </div>
      <div class="lv-a-card">
        <div class="lv-a-row"><span class="lv-a-label">${ic('piggy-bank')} Tabungan impian</span><span class="lv-a-link">64%</span></div>
        <div class="lv-a-progress"><i style="width:64%"></i></div>
        <div class="lv-a-bars" style="margin-top:1.1em"><i style="height:45%"></i><i class="lv-p" style="height:70%"></i><i style="height:55%"></i><i class="lv-p" style="height:82%"></i><i style="height:62%"></i><i class="lv-y" style="height:96%"></i></div>
      </div>
    </div>
    ${nav('home')}`,

  /* 02 Transaction — Transaksi Favorit + riwayat */
  transaction: () => `
    ${profile()}
    <div class="lv-a-body">
      <div class="lv-a-card">
        <div class="lv-a-card__head"><span class="lv-a-card__title">Transaksi Favorit</span><span class="lv-a-link">Atur ${ic('sliders-horizontal')}</span></div>
        <div class="lv-a-grid">
          ${ico('send', 'Transfer Rupiah')}${ico('receipt-text', 'Bayar/VA', true)}${ico('wallet', 'Top-up')}${ico('credit-card', 'e-money')}${ico('qr-code', 'QR Terima')}
          ${ico('banknote', 'Setor Tarik')}${ico('repeat', 'Transfer Valas')}${ico('chart-column', 'Investasi')}${ico('hand-coins', 'Tagih Uang', true)}${ico('layout-grid', 'Lihat Semua')}
        </div>
      </div>
      <div class="lv-a-card">
        <div class="lv-a-card__head"><span class="lv-a-card__title">Riwayat</span><span class="lv-a-link">Semua</span></div>
        <div class="lv-a-li"><span class="lv-a-li__ic">${ic('send')}</span><span class="lv-a-li__t"><b>Transfer ke Rina</b><small>Hari ini</small></span><span class="lv-a-li__v">-Rp250.000</span></div>
        <div class="lv-a-li"><span class="lv-a-li__ic">${ic('scan-line')}</span><span class="lv-a-li__t"><b>QRIS · Kopi Pagi</b><small>Hari ini</small></span><span class="lv-a-li__v">-Rp32.000</span></div>
      </div>
    </div>
    ${nav('home')}`,

  /* 03 Loans — Pinjaman */
  loans: () => `
    ${titled('Pinjaman')}
    <div class="lv-a-body">
      <div class="lv-a-card">
        <span class="lv-a-label">${ic('house')} Ringkasan pinjaman</span>
        <div class="lv-a-amount">Rp *******</div>
        <div class="lv-a-row" style="margin-top:.4em"><span class="lv-a-muted">Progres pembayaran</span><span class="lv-a-link">8 / 24</span></div>
        <div class="lv-a-progress"><i style="width:33%"></i></div>
      </div>
      <div class="lv-a-card">
        <div class="lv-a-card__head"><span class="lv-a-card__title">Informasi Cicilan</span><span class="lv-a-link">Detail</span></div>
        <div class="lv-a-li"><span class="lv-a-li__ic">${ic('calendar-check')}</span><span class="lv-a-li__t"><b>Cicilan berikutnya</b><small>Jatuh tempo bulan ini</small></span>${ic('chevron-right')}</div>
        <div class="lv-a-steps"><i class="lv-on"></i><i class="lv-on"></i><i class="lv-on"></i><i></i><i></i><i></i></div>
      </div>
      <div class="lv-a-card">
        <div class="lv-a-card__head" style="margin-bottom:.8em"><span class="lv-a-card__title">Jelajahi</span></div>
        <div class="lv-a-chips"><span class="lv-on">Rumah</span><span>Kendaraan</span><span>Multiguna</span></div>
        <div class="lv-a-btn">Lihat pilihan pembiayaan</div>
      </div>
    </div>
    ${nav('home')}`,

  /* 04 Investment — Investasi */
  investment: () => `
    ${titled('Investasi', 'chart-pie')}
    <div class="lv-a-body">
      <div class="lv-a-card">
        <span class="lv-a-label">${ic('chart-pie')} Total portofolio</span>
        <div class="lv-a-amount">Rp *******</div>
        ${spark}
        <div class="lv-a-alloc"><i style="width:45%;background:#2B93FE"></i><i style="width:30%;background:#FFC32B"></i><i style="width:25%;background:#96CAFF"></i></div>
        <div class="lv-a-legend"><span><i style="background:#2B93FE"></i>Reksa dana</span><span><i style="background:#FFC32B"></i>Obligasi</span><span><i style="background:#96CAFF"></i>Lainnya</span></div>
      </div>
      <div class="lv-a-card">
        <div class="lv-a-card__head"><span class="lv-a-card__title">Jelajahi Produk</span><span class="lv-a-link">Semua</span></div>
        <div class="lv-a-grid lv-a-grid--4">${ico('chart-pie', 'Reksa Dana')}${ico('landmark', 'Obligasi')}${ico('coins', 'Emas', true)}${ico('layout-grid', 'Lainnya')}</div>
      </div>
    </div>
    ${nav('home')}`,

  /* 05 Lifestyle — Sukha */
  lifestyle: () => `
    ${titled("Livin' Sukha", 'search')}
    <div class="lv-a-body">
      <div class="lv-a-banner lv-a-banner--pink"><small>Inspirasi perjalanan</small><b>Rencanakan liburan berikutnya</b></div>
      <div class="lv-a-card">
        <div class="lv-a-grid lv-a-grid--4">${ico('plane', 'Pesawat')}${ico('bed-double', 'Hotel')}${ico('clapperboard', 'Hiburan')}${ico('shopping-bag', 'Belanja')}</div>
      </div>
      <div class="lv-a-card">
        <div class="lv-a-li"><span class="lv-a-li__ic">${ic('ticket')}</span><span class="lv-a-li__t"><b>Tiket hiburan</b><small>Film, konser &amp; acara</small></span>${ic('chevron-right')}</div>
        <div class="lv-a-li"><span class="lv-a-li__ic">${ic('shopping-cart')}</span><span class="lv-a-li__t"><b>Belanja kebutuhan</b><small>Pilihan merchant</small></span>${ic('chevron-right')}</div>
      </div>
    </div>
    ${nav('sukha')}`,

  /* 06 Loyalty — Livin'poin */
  loyalty: () => `
    ${profile()}
    <div class="lv-a-body">
      <div class="lv-a-points">
        <span class="lv-a-points__brand">livin'poin</span>
        <div class="lv-a-points__val">2.305</div>
        <small>Tukarkan dengan reward pilihan</small>
      </div>
      <div class="lv-a-card">
        <div class="lv-a-card__head"><span class="lv-a-card__title">Reward Pilihan</span><span class="lv-a-link">Semua</span></div>
        <div class="lv-a-li"><span class="lv-a-li__ic">${ic('gift')}</span><span class="lv-a-li__t"><b>Voucher belanja</b><small>Tukar poin</small></span>${ic('chevron-right')}</div>
        <div class="lv-a-li"><span class="lv-a-li__ic">${ic('coffee')}</span><span class="lv-a-li__t"><b>Voucher kuliner</b><small>Tukar poin</small></span>${ic('chevron-right')}</div>
        <div class="lv-a-li"><span class="lv-a-li__ic">${ic('plane')}</span><span class="lv-a-li__t"><b>Perjalanan</b><small>Tukar poin</small></span>${ic('chevron-right')}</div>
      </div>
    </div>
    ${nav('loyalty')}`,

  /* 07 Livin' Call */
  'livin-call': () => `
    ${titled("Livin' Call", 'circle-help')}
    <div class="lv-a-body">
      <div class="lv-a-support">
        <div class="lv-a-support__avatar">${ic('headset')}</div>
        <b>Butuh bantuan?</b>
        <p>Terhubung dengan layanan resmi Bank Mandiri</p>
      </div>
      <div class="lv-a-card">
        <div class="lv-a-btn" style="margin-top:0">${ic('phone-call')} Mulai panggilan</div>
        <div class="lv-a-li" style="margin-top:.9em;padding-top:.8em;border-top:1px solid #eef0f4"><span class="lv-a-li__ic">${ic('message-circle')}</span><span class="lv-a-li__t"><b>Pusat bantuan</b><small>Pertanyaan umum</small></span>${ic('chevron-right')}</div>
        <div class="lv-a-li"><span class="lv-a-li__ic">${ic('phone')}</span><span class="lv-a-li__t"><b>Mandiri Call 14000</b><small>Kanal resmi</small></span>${ic('chevron-right')}</div>
      </div>
    </div>
    ${nav('home')}`,
};

/** Render a screen into an element. Uses an official screenshot when provided. */
export function renderScreen(el, key, screenshot = null, alt = '') {
  if (screenshot) {
    el.classList.add("lv-screen--shot");
    // eager: hidden screen layers must be ready before they crossfade in
    el.innerHTML = `<img class="lv-screen__shot" src="${screenshot}" alt="${alt}" decoding="async" />`;
    return;
  }
  if (key === 'home' || key === 'beranda') el.classList.add("lv-screen--shot");
  const tpl = SCREENS[key];
  el.innerHTML = tpl ? tpl() : '';
}
