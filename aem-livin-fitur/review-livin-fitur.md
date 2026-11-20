# Review: Komponen "Fitur Terbaru Livin' (High-Tech Motion)" (AEM)

File yang direview: `livin-fitur.html`, `livin-fitur.css`, `livin-fitur.js`
Acuan: checklist skill **aem-html-split** v2
Tanggal review: 2026-11-20

## Ringkasan
Revamp section "Fitur terbaru, semua di satu aplikasi" ke gaya high-tech motion. Konten, 6 kartu, 4 filter, dan path logo DAM sama dengan sumber.
Logo fitur sekarang **diukur otomatis oleh JS** lalu disamakan ukuran visual dan titik tengahnya, jadi tidak ada lagi logo yang kegedean atau kekecilan.
Secara teknis siap pasang. Yang wajib dibereskan: semua link kartu masih `#` (dari sumber).

| Prioritas | Jumlah | Area |
|---|---|---|
| Tinggi | 1 | Link kartu masih `#` |
| Sedang | 3 | Logo dari domain lain, warna biru filter, warna latar Light |
| Rendah | 3 | Logo wordmark sangat lebar, browser lama, isolasi |

## Yang berubah dari sumber
| Sumber | Hasil |
|---|---|
| `section`, `h2` + Google Fonts Plus Jakarta Sans | `div.lf-el-section` + `role=region` (dipulihkan JS); font ikut CMS |
| Kartu = `a` berisi `div`/`h3`/`p` | Kartu = `div`; link "Lihat selengkapnya" menutupi seluruh kartu (`::after`), lebih aman dari filter HTML AEM |
| `svg` panah inline | Ikon CSS mask |
| `data-filter`, `data-cat`, `aria-pressed`, `style="--i"` | Class cadangan `lf-x-*`, `lf-r-*`; `--lf-i` diisi JS |
| Logo `img` 100% di tile 60px (ukuran visual 20 sampai 60px, ikut padding file SVG) | Tile 64px; JS mengukur isi logo dan menyamakan ukuran visualnya |
| Reveal sederhana `rise` (fill `both`) | Reveal blur ke tajam bertahap (fill `backwards`), scan line, nomor berkedip |
| Hover: naik 3px + spotlight | Ring neon berputar, spotlight hangat + biru, tilt 3D, kilau di logo, garis bawah CTA, panah berputar |
| Filter: tombol ganti warna | Indikator pill meluncur ke tombol aktif; kartu yang tampil diputar ulang animasinya |

## Revisi 2 (penyesuaian dengan komponen Livin existing)
- Glow warna di pojok section dan pola titik dihapus: latar section polos mengikuti token CMS.
- Eyebrow tanpa pill/titik/penghitung: 12.48px, bold, uppercase, spasi 0.14em, warna `#007596` (= `#00799F` existing, sedikit digelapkan supaya 4.67:1 di latar `#F3F1EC`; `#00799F` hanya 4.39:1).
- Judul: `clamp(32px, 20.8px + 2.8vw, 57.6px)`, weight 800, line-height 1.04, letter-spacing -0.035em, warna `#141414`, max 18ch (sama dengan judul komponen Livin).
- Subjudul: `clamp(16.32px, 15.2px + 0.35vw, 20px)`, warna `#5F6368`, jarak 24px dari judul, max 46ch.
- Lebar konten section: `--lf-max-width: 1500px`.

## Logo fitur: cara penyamaan ukuran
1. Setelah logo dimuat, JS menggambar logo ke canvas 160px lalu mencari kotak isi (piksel tidak transparan).
2. Logo di-skala supaya **akar luas** kotak isinya = 56% tile (sekitar 36px di tile 64px), dengan batas lebar 84% dan tinggi 74% tile. Lalu dipusatkan secara optis.
3. Logo berlatar **putih penuh**: latar putihnya dibuang (`mix-blend-mode: multiply`), isinya diukur ulang.
4. Logo berlatar **warna penuh** (gaya ikon aplikasi): ditampilkan memenuhi tile 64px.
5. Gagal ukur (mis. logo dari domain lain tanpa CORS): fallback CSS, logo di-contain dalam kotak 44px. Logo 404: tampil ikon cadangan.

Hasil uji dengan 6 logo dummy yang sengaja dibuat beda (kecil, besar, lebar, off-center, latar putih, tile ungu):

| Logo dummy | Sebelum (lebar x tinggi) | Sesudah |
|---|---|---|
| Kecil di tengah | 20x20 | 36x36 |
| Besar penuh | 58x51 | 38x34 |
| Wordmark lebar | 58x12 | 54x10 |
| Latar putih | 24x24 (di dalam kotak putih 60px) | 36x36, latar putih dibuang |
| Off-center | 26x26, geser 14px | 36x36, di tengah |
| Tile warna penuh | 60x60 | 64x64 (tile utuh) |

## Checklist skill
| # | Item | Status |
|---|---|---|
| 1 | Semua selector diawali `:is(#appLivinFitur, .lf-app)` | ✅ (postcss: 0 pelanggaran) |
| 2 | Tanpa font-family khusus / Google Fonts | ✅ |
| 3 | 0 tag HTML5, 0 svg, 0 style inline, 0 elemen kosong, 0 non-ASCII | ✅ (`&rsquo;` untuk Livin&rsquo;) |
| 4 | JS ES5 (acorn), query lewat root | ✅ |
| 5 | Prefix `lf-`, variabel `--lf-*`, keyframes `lf*`, id `lfTitle` unik | ✅ |
| 6 | 6 kartu, 6 link, 6 logo, 4 filter | ✅ |
| 7 | Animasi `backwards` | ✅ |
| 8 | Light/Dark/Half + kontras | ✅ semua teks 4.85:1 ke atas |
| 9 | Class cadangan id/data/aria | ✅ |
| 10 | Verifikasi render | ✅ lihat bawah |

### Hasil uji render (Playwright, halaman tiruan AEM)
| Uji | Hasil |
|---|---|
| Hostile CSS (`div{line-height:3}`, `button{background:red;min-width:200px}`, `img{width:100%}`, `span{display:block}`, `.card,.grid,.filters{display:none}`, dll) | Posisi 6 kartu identik (1440px & 390px) |
| Simulasi filter AEM (buang id, data-*, aria-*, role) | Identik; filter tetap jalan (data-filter, data-cat, aria-pressed dipulihkan) |
| Klik filter "Pinjaman" | Tampil KA-Deposito & KA-SBN, aria-pressed benar, indikator meluncur |
| Script dobel | Init sekali |
| Light / Dark / Half | Class tema benar; tile logo tetap terang di Dark supaya warna logo asli terbaca |
| `?static` / iframe editor | Tanpa animasi masuk, semua tampil |

## Temuan: Prioritas TINGGI
### T-1. Semua link kartu `href="#"`
Dari sumber. Klik kartu hanya lompat ke atas halaman.
**Perbaikan:** isi URL halaman tiap fitur (`/content/....html`).

## Temuan: Prioritas SEDANG
### S-1. Logo harus satu domain dengan halaman
Penyamaan ukuran membaca piksel logo lewat canvas. Kalau DAM dilayani dari domain/CDN lain tanpa header CORS, browser memblokir pembacaan piksel dan logo jatuh ke fallback contain 44px (tetap rapi, tapi belum presisi).
**Cek:** di halaman live, Inspect `.lf-logo`: harus punya class `lf-is-fit` atau `lf-is-tile`. Kalau tidak ada, beri tahu saya domain gambarnya.

### S-2. Biru tombol filter aktif digelapkan (Light)
Teks putih di atas `#1BA3E0` (sumber) hanya 2.85:1, gagal AA. Pill aktif dan panah hover memakai `#0B78AD` (4.88:1), masih satu keluarga biru Livin. Aksen lain tetap `#1BA3E0`. Kalau brand wajib `#1BA3E0`, ganti teks pill aktif ke `#06233A`.

### S-3. Latar Light pakai token CMS `#F3F1EC`
Sumber memakai gradasi `#f7f4ef` ke `#f1ede6`. Selisihnya tipis; ubah `--lf-cms-light-bg` bila ingin persis sumber.

## Temuan: Prioritas RENDAH
- **R-1.** Logo wordmark yang sangat lebar (rasio 5:1 ke atas) tetap terlihat lebih "ringan" karena dibatasi lebar 84% tile. Ini wajar secara optis.
- **R-2.** `:is()`, `mask`, `aspect-ratio`, `mix-blend-mode` butuh browser modern (Chrome 88+, Safari 15+).
- **R-3.** Rule template dengan `!important` atau selector id masih bisa menembus isolasi `all: revert`.

## Catatan versi English
Belum dibuat. Bila perlu: CSS & JS sama; terjemahkan judul, lede, filter, tag, deskripsi; nama produk tetap. Jangan pasang ID & EN di satu halaman.

## Urutan perbaikan yang disarankan
1. Isi URL kartu (T-1).
2. Pasang, hard reload, cek console `[LivinFitur] build 2026-11-20 - OK` dan class `lf-is-fit` di logo (S-1).
3. Konfirmasi biru filter aktif (S-2).

## Revisi: hover tertahan setelah klik
**Masalah:** kartu terakhir yang diklik tetap dalam efek hover (naik, ring berputar), karena CSS memakai `:focus-within` dan link tetap fokus setelah diklik. Di HP, `:hover` juga tertahan setelah tap.
**Perbaikan:** efek hover kartu sekarang lewat class yang diatur JS:
- `*-is-hover`: ditambah saat kursor masuk (hanya perangkat dengan mouse), dicabut saat kursor keluar.
- `*-is-kbd`: hanya saat fokus dari keyboard (`:focus-visible`), dicabut saat blur atau klik.
- Saat kembali lewat tombol Back (bfcache), semua state direset.
**Diuji:** hover, klik, kursor keluar, Tab keyboard, klik di luar, dan tap di HP. Tidak ada kartu yang tertahan.
