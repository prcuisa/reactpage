# Review: Komponen "Fitur Transaksi Livin' (High-Tech Motion)" (AEM)

File yang direview: `fitur-transaksi.html`, `fitur-transaksi.css`, `fitur-transaksi.js`
Acuan: checklist skill **aem-html-split** v2
Tanggal review: 2026-11-20

## Ringkasan
Dua komponen `cta-card` lama (8 + 6 kartu, tanpa deskripsi) digabung jadi satu komponen 14 kartu dengan desain Produk Simpanan: ikon fitur, label kategori, nomor urut, deskripsi, dan tombol "Lihat selengkapnya".
Sudah membawa revisi terakhir: tanpa glow pojok/titik, header gaya Livin existing, max-width 1500px, dan hover tidak tertahan setelah klik.
Yang **wajib** dicek: deskripsi baru (ditulis dari nama fitur, perlu diverifikasi tim produk, terutama Travoy GO dan Quick Pick).

| Prioritas | Jumlah | Area |
|---|---|---|
| Tinggi | 1 | Verifikasi isi deskripsi |
| Sedang | 2 | Header baru, label kategori |
| Rendah | 3 | Baris terakhir 2 kartu, browser lama, isolasi |

## Isi kartu (urutan sama dengan dua komponen lama)
| # | Fitur | Label | URL (dari component-config) |
|---|---|---|---|
| 01 | Transfer Valas | Transfer | `/content/corpweb/main/id/produk-digital/livin/fitur-transaksi/transfer-valas.html` |
| 02 | Transfer Rupiah | Transfer | `.../transfer-rupiah.html` |
| 03 | QR Bayar | QRIS | `.../qr-bayar.html` |
| 04 | QR Terima Transfer | QRIS | `.../qr-terima-transfer.html` |
| 05 | QRIS Tap | Nirsentuh | `.../qris-tap.html` |
| 06 | Top-up | Isi saldo | `.../top-up.html` |
| 07 | e-money | Isi saldo | `.../e-money.html` |
| 08 | Tap to Pay | Nirsentuh | `.../tap-to-pay.html` |
| 09 | Tagih Uang | Transfer | `.../tagih-uang.html` |
| 10 | Setor Tarik | Tunai | `.../setor-tarik.html` |
| 11 | Travoy GO | Perjalanan | `.../travoy-go.html` |
| 12 | Quick Pick | Akses cepat | `.../quick-pick.html` |
| 13 | Token Online | Keamanan | `.../token-online.html` |
| 14 | Virtual Card | Kartu | `.../virtual-card.html` |

Link memakai path AEM dari `component-config` (bukan `https://10.243.209.78:443/...` yang ada di href hasil render lama, karena itu alamat server internal).
"Quick PIck" di sumber dirapikan jadi "Quick Pick".

## Checklist skill
| # | Item | Status |
|---|---|---|
| 1 | Semua selector diawali `:is(#appFiturTransaksi, .ft-app)` | ✅ (postcss: 0 pelanggaran) |
| 2 | Tanpa font-family khusus / Google Fonts | ✅ |
| 3 | 0 tag HTML5, 0 svg, 0 style inline, 0 elemen kosong, 0 non-ASCII | ✅ ikon = CSS mask |
| 4 | JS ES5 (acorn), query lewat root | ✅ |
| 5 | Prefix `ft-`, variabel `--ft-*`, keyframes `ft*`, id `ftTitle` unik | ✅ |
| 6 | 14 kartu, 14 link (sumber: 8 + 6) | ✅ |
| 7 | Animasi `backwards` | ✅ |
| 8 | Light/Dark/Half + kontras | ✅ semua teks 4.6:1 ke atas |
| 9 | Class cadangan id/data/aria | ✅ |
| 10 | Verifikasi render | ✅ lihat bawah |

### Hasil uji (Playwright, halaman tiruan AEM)
| Uji | Hasil |
|---|---|
| Hostile CSS + simulasi filter AEM (buang id, data-*, aria-*, role) | Posisi 14 kartu identik (1440px & 390px) |
| Light / Dark / Half | Class tema benar |
| Hover, klik, kursor keluar, Tab, klik di luar, tap di HP | Tidak ada kartu yang tertahan dalam efek hover |
| Lebar konten di layar 1920px | 1500px |
| `?static` / iframe editor | Tanpa animasi masuk, semua tampil |

## Temuan: Prioritas TINGGI
### T-1. Deskripsi baru perlu diverifikasi
Komponen lama tidak punya deskripsi; semua deskripsi ditulis berdasarkan nama fitur. Mohon dicek tim produk/legal, terutama:
- **Travoy GO**: deskripsi dibuat umum ("layanan perjalanan tol Travoy GO yang terhubung dengan rekening"). Lengkapi dengan manfaat yang benar.
- **Quick Pick**: diasumsikan sebagai pintasan transaksi favorit. Ganti bila fungsinya berbeda.
- **Transfer Valas, QRIS Tap, Tap to Pay, e-money**: pastikan syarat (NFC, merchant yang mendukung, kurs) sesuai halaman detail.

## Temuan: Prioritas SEDANG
### S-1. Header section baru
Komponen lama tanpa header (`hasHeader: false`). Ditambahkan eyebrow "Fitur Transaksi Livin&rsquo;", judul "Semua transaksi, dalam satu genggaman", dan subjudul. Kalau halaman sudah punya judul sendiri, hapus blok `ft-head` dan class `ft-r-region` di root.

### S-2. Label kategori
Transfer, QRIS, Nirsentuh, Isi saldo, Tunai, Perjalanan, Akses cepat, Keamanan, Kartu: tambahan desain. Sesuaikan dengan istilah resmi bila ada.

## Temuan: Prioritas RENDAH
- **R-1.** 14 kartu di 4 kolom menyisakan 2 kartu di baris terakhir (komponen lama juga tidak penuh).
- **R-2.** `:is()`, `mask`, `aspect-ratio` butuh browser modern (Chrome 88+, Safari 15+).
- **R-3.** Rule template dengan `!important` atau selector id masih bisa menembus isolasi `all: revert`.

## Catatan versi English
Belum dibuat. Bila perlu: CSS & JS sama; terjemahkan header, label, deskripsi; nama fitur tetap; link `/id/` diganti `/en/`.

## Urutan perbaikan yang disarankan
1. Verifikasi deskripsi (T-1).
2. Putuskan header dipakai atau tidak (S-1).
3. Hapus dua komponen `cta-card` lama, tempel komponen ini, hard reload, cek console `[FiturTransaksi] build 2026-11-20 - OK`.
