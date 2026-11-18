/**
 * data.js — Single source of truth for all configurable content.
 *
 * CONTENT ACCURACY RULES
 * - `null` values render as clearly-marked placeholders ("Menunggu data resmi").
 * - Never enter statistics, awards, promo terms, rates or service terms here
 *   unless they come from an official, verified Bank Mandiri source.
 * - `verified: false` renders a small "Draf konten" badge so unreviewed copy is
 *   visible to reviewers. Flip to `true` after legal / brand review.
 */

/* ------------------------------------------------------------------ */
/* Official links                                                      */
/* ------------------------------------------------------------------ */
export const LINKS = {
  // Verified: Google Play package id.bmri.livin (developer PT Bank Mandiri (Persero) Tbk)
  playStore: 'https://play.google.com/store/apps/details?id=id.bmri.livin',
  // Verified: App Store id1555414743
  appStore: 'https://apps.apple.com/id/app/livin-by-mandiri/id1555414743',
  // TODO(verify): replace with the official AppGallery app URL. Search URL used until then.
  appGallery: 'https://appgallery.huawei.com/search/Livin%20by%20Mandiri',
  // Official product page
  official: 'https://www.bankmandiri.co.id/livin',
  // URL encoded into the download QR code (ideally an OS-detecting smart link)
  qrTarget: 'https://www.bankmandiri.co.id/livin',
  // Mandiri Call — verified on bankmandiri.co.id
  callCenter: 'tel:14000',
  callCenterLabel: '14000',
  // TODO(verify): replace with the official Bank Mandiri YouTube channel URL
  youtube: 'https://www.youtube.com/results?search_query=Livin%27+by+Mandiri',
};

/* ------------------------------------------------------------------ */
/* 02 — Statistics & awards (NEVER fabricate)                          */
/* value: number | null. When null the tile renders a placeholder.     */
/* ------------------------------------------------------------------ */
export const STATS = [
  { id: 'users', label: 'Pengguna aktif', value: null, decimals: 0, prefix: '', suffix: '', unit: 'juta', source: '' },
  { id: 'trx-volume', label: 'Transaksi per tahun', value: null, decimals: 0, prefix: '', suffix: '', unit: 'miliar', source: '' },
  { id: 'trx-value', label: 'Nilai transaksi', value: null, decimals: 0, prefix: 'Rp', suffix: '', unit: 'triliun', source: '' },
  { id: 'ecosystem', label: 'Mitra ekosistem', value: null, decimals: 0, prefix: '', suffix: '+', unit: 'mitra', source: '' },
];

export const AWARDS = [
  { title: null, issuer: null, year: null },
  { title: null, issuer: null, year: null },
  { title: null, issuer: null, year: null },
];

/* ------------------------------------------------------------------ */
/* 04 — The Livin' Experience: seven feature states                    */
/* objects[].type: coin | card | chart | qr | receipt | tile | house | */
/*                 ticket | bag | gift | points | headset | portfolio  */
/* objects[].slot: tl | tr | ml | mr | bl | br                         */
/* screenshot: optional path to an official screenshot. If set, it     */
/* replaces the illustrative HTML screen.                              */
/* ------------------------------------------------------------------ */
export const FEATURES = [
  {
    id: 'savings',
    label: 'Savings',
    title: 'Kelola Keuangan dengan Lebih Mudah.',
    description:
      'Pantau saldo, rekening, dan tabungan Anda dalam satu tampilan yang rapi, sehingga setiap keputusan finansial terasa lebih jelas.',
    points: ['Ringkasan rekening', 'Saldo', 'Tabungan'],
    accent: '#FFCC00',
    screenshot: null,
    objects: [
      { type: 'coin', slot: 'tl', depth: 0.9 },
      { type: 'widget', slot: 'mr', depth: 0.6, src: 'assets/images/widgets/widget-produk-tabungan.png', w: 230, alt: 'Widget produk tabungan dan giro' },
      { type: 'widget', slot: 'bl', depth: 1.1, src: 'assets/images/widgets/widget-rekening.png', w: 210, alt: 'Widget rekening' },
    ],
  },
  {
    id: 'transaction',
    label: 'Transaction',
    title: 'Transaksi Lebih Praktis dalam Keseharian.',
    description:
      'Transfer, bayar dengan QRIS, hingga cek riwayat transaksi — semua bisa diselesaikan langsung dari genggaman.',
    points: ['Transfer', 'QRIS', 'Pembayaran', 'Riwayat transaksi'],
    accent: '#5BC0EB',
    // Official QRIS cross-border screen (from the supplied design file)
    screenshot: 'assets/screenshots/screen-qris-crossborder.jpg',
    objects: [
      { type: 'widget', slot: 'tr', depth: 0.8, src: 'assets/images/widgets/widget-bayar-topup.png', w: 190, alt: 'Widget Bayar dan Top-up' },
      { type: 'card', slot: 'ml', depth: 0.6, label: 'Debit' },
      { type: 'widget', slot: 'br', depth: 1.1, src: 'assets/images/widgets/widget-ewallet.png', w: 230, alt: 'Widget e-Wallet' },
    ],
  },
  {
    id: 'loans',
    label: 'Loans',
    title: 'Solusi Finansial untuk Berbagai Kebutuhan.',
    description:
      'Lihat pilihan pembiayaan dan pantau informasi cicilan Anda dengan lebih transparan, langsung di aplikasi.',
    points: ['Pembiayaan', 'Ringkasan pinjaman', 'Informasi cicilan'],
    accent: '#F4A259',
    screenshot: null,
    objects: [
      { type: 'house', slot: 'tl', depth: 1.0 },
      { type: 'tile', slot: 'mr', depth: 0.7, icon: 'calendar-check', label: 'Jadwal cicilan' },
      { type: 'widget', slot: 'bl', depth: 0.9, src: 'assets/images/widgets/widget-produk-pinjaman.png', w: 230, alt: 'Widget produk pinjaman' },
    ],
  },
  {
    id: 'investment',
    label: 'Investment',
    title: 'Mulai Langkah Menuju Masa Depan Finansial.',
    description:
      'Lihat ringkasan portofolio dan jelajahi beragam produk investasi yang sesuai dengan tujuan finansial Anda.',
    points: ['Ringkasan investasi', 'Portofolio', 'Jelajahi produk'],
    accent: '#7BD389',
    screenshot: null,
    objects: [
      { type: 'portfolio', slot: 'tr', depth: 0.9, label: 'Portofolio' },
      { type: 'chart', slot: 'ml', depth: 0.7 },
      { type: 'widget', slot: 'br', depth: 1.1, src: 'assets/images/widgets/widget-produk-emas.png', w: 230, alt: 'Widget pilihan produk emas' },
    ],
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    title: 'Lebih Banyak Pengalaman dalam Satu Aplikasi.',
    description:
      "Lewat Livin' Sukha, rencanakan perjalanan, temukan hiburan, dan penuhi kebutuhan belanja tanpa berpindah aplikasi.",
    points: ["Livin' Sukha", 'Travel', 'Hiburan', 'Belanja'],
    accent: '#FF8FAB',
    screenshot: null,
    objects: [
      { type: 'ticket', slot: 'tl', depth: 1.0 },
      { type: 'bag', slot: 'mr', depth: 0.8 },
      { type: 'widget', slot: 'bl', depth: 0.7, src: 'assets/images/widgets/widget-livin-food.png', w: 250, alt: "Widget Livin' Food" },
    ],
  },
  {
    id: 'loyalty',
    label: 'Loyalty',
    title: 'Setiap Pengalaman Lebih Berarti.',
    description:
      "Kumpulkan Livin'poin dan temukan beragam reward yang membuat setiap pengalaman bersama Livin' terasa lebih berarti.",
    points: ["Livin'poin", 'Rewards', 'Informasi loyalitas'],
    accent: '#FFCC00',
    screenshot: null,
    objects: [
      { type: 'gift', slot: 'tr', depth: 1.0 },
      { type: 'points', slot: 'ml', depth: 0.7 },
      { type: 'tile', slot: 'br', depth: 0.9, icon: 'sparkles', label: 'Reward' },
    ],
  },
  {
    id: 'livin-call',
    label: "Livin' Call",
    title: 'Selalu Ada Bantuan Saat Dibutuhkan.',
    description:
      "Terhubung dengan layanan bantuan resmi Bank Mandiri melalui Livin' Call, langsung dari aplikasi saat Anda membutuhkannya.",
    points: ['Layanan nasabah', 'Bantuan resmi'],
    accent: '#9FA8FF',
    screenshot: null,
    objects: [
      { type: 'headset', slot: 'tl', depth: 1.0 },
      { type: 'tile', slot: 'mr', depth: 0.7, icon: 'shield-check', label: 'Kanal resmi' },
      { type: 'tile', slot: 'bl', depth: 0.9, icon: 'message-circle', label: 'Bantuan' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 05 — Featured solutions                                             */
/* ------------------------------------------------------------------ */
export const SOLUTIONS = [
  {
    id: 'billion',
    name: 'Billion', // exact product label — do not change
    kicker: 'C.1',
    tagline: 'Deskripsi resmi Billion akan ditampilkan di sini.',
    description: 'Konten resmi untuk Billion sedang disiapkan. Bagian ini dapat dikonfigurasi melalui data.js.',
    capabilities: [],
    icon: 'gem',
    url: LINKS.official,
    verified: false,
  },
  {
    id: 'valas',
    name: 'Solusi Valas',
    kicker: 'C.2',
    tagline: 'Kebutuhan valuta asing, lebih dekat.',
    description: 'Kelola kebutuhan valuta asing Anda melalui Livin\'. Rincian kapabilitas resmi akan diperbarui setelah verifikasi.',
    capabilities: ['Rekening valas', 'Transaksi valuta asing', 'Informasi kurs'],
    icon: 'globe',
    image: 'assets/images/widgets/widget-fitur-transfer.png',
    url: LINKS.official,
    verified: false,
  },
  {
    id: 'payments',
    name: 'Solusi Pembayaran',
    kicker: 'C.3',
    tagline: 'Bayar apa saja, dari satu tempat.',
    description: 'Dari scan QRIS hingga transfer dan pembayaran tagihan, semua bisa diselesaikan dalam beberapa ketukan.',
    capabilities: ['QRIS', 'Transfer', 'Tagihan & pembelian', 'Top-up'],
    icon: 'scan-line',
    image: 'assets/images/widgets/widget-bayar-topup.png',
    url: LINKS.official,
    verified: false,
  },
  {
    id: 'food',
    name: "Livin' Food",
    kicker: 'C.4',
    tagline: 'Pengalaman kuliner dalam aplikasi.',
    description: "Konten resmi pengalaman Livin' Food akan ditampilkan di sini setelah materi produk tersedia.",
    capabilities: [],
    icon: 'utensils',
    image: 'assets/images/widgets/widget-livin-food.png',
    url: LINKS.official,
    verified: false,
  },
  {
    id: 'next-g',
    name: 'Next-G', // exact product label — do not change
    kicker: 'C.5',
    tagline: 'Deskripsi resmi Next-G akan ditampilkan di sini.',
    description: 'Konten resmi untuk Next-G sedang disiapkan. Bagian ini dapat dikonfigurasi melalui data.js.',
    capabilities: [],
    icon: 'rocket',
    url: LINKS.official,
    verified: false,
  },
];

/* ------------------------------------------------------------------ */
/* 06 — Promotions (exactly three slots)                               */
/* image: path or null (null renders branded artwork)                  */
/* ------------------------------------------------------------------ */
export const PROMOS = [
  {
    image: null,
    art: 'yellow',
    title: 'Slot Promo 01',
    description: 'Judul dan deskripsi promo resmi akan ditampilkan di sini.',
    validity: 'Periode: menunggu konten resmi',
    cta: 'Lihat Detail',
    url: LINKS.official,
  },
  {
    image: null,
    art: 'navy',
    title: 'Slot Promo 02',
    description: 'Judul dan deskripsi promo resmi akan ditampilkan di sini.',
    validity: 'Periode: menunggu konten resmi',
    cta: 'Lihat Detail',
    url: LINKS.official,
  },
  {
    image: null,
    art: 'sky',
    title: 'Slot Promo 03',
    description: 'Judul dan deskripsi promo resmi akan ditampilkan di sini.',
    validity: 'Periode: menunggu konten resmi',
    cta: 'Lihat Detail',
    url: LINKS.official,
  },
];

/* ------------------------------------------------------------------ */
/* 07 — Educational videos (three slots)                               */
/* ------------------------------------------------------------------ */
export const VIDEOS = [
  {
    thumbnail: null,
    title: "Mulai Menggunakan Livin'",
    description: 'Slot video edukasi. Tautan video YouTube resmi akan ditambahkan.',
    duration: '—:—',
    url: LINKS.youtube,
  },
  {
    thumbnail: null,
    title: 'Transaksi Aman Setiap Hari',
    description: 'Slot video edukasi. Tautan video YouTube resmi akan ditambahkan.',
    duration: '—:—',
    url: LINKS.youtube,
  },
  {
    thumbnail: null,
    title: "Jelajahi Livin' Sukha",
    description: 'Slot video edukasi. Tautan video YouTube resmi akan ditambahkan.',
    duration: '—:—',
    url: LINKS.youtube,
  },
];
