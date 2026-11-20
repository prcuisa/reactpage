# Review: Komponen "Livin' Landing" (AEM)

File yang direview: `livin-landing.html`, `livin-landing.css`, `livin-landing.js`
Acuan: checklist skill **aem-html-split**
Tanggal review: 19 November 2026

## Ringkasan
Secara teknis siap pasang. Semua selector di-scope ke `#appLivinLanding`, JS ES5 murni (lolos parser ES5),
color mode Light/Dark/Half membaca `<html data-theme>`, dan tampilan Light identik dengan desain asli
(tinggi tiap section sama persis di 1440px & 390px, juga di halaman uji yang CSS global-nya sengaja bentrok).
Yang **wajib** dibereskan sebelum publish: navbar ganda dengan header corpweb, konten placeholder, dan lokasi gambar di DAM.

| Prioritas | Jumlah | Area |
|---|---|---|
| Tinggi | 3 | Navbar fixed vs header CMS, konten placeholder, path DAM gambar |
| Sedang | 5 | Warna Light vs token CMS, font CMS, bahasa campur, ukuran JS, mode di editor |
| Rendah | 4 | Efek `ring` warisan Tailwind, ID dinamis, data-theme di luar 3 nilai, lisensi GSAP |

## Checklist skill
| # | Item | Status |
|---|---|---|
| 1 | Semua selector diawali root, tanpa :root/body/html | ✅ 0 selector tanpa `#appLivinLanding` |
| 2 | Tanpa font-family khusus / Google Fonts | ✅ hanya `font-family: inherit` |
| 3 | Tanpa `<svg>` inline & `style="..."` | ✅ ikon store jadi CSS mask; bar 68% jadi class |
| 4 | JS lolos parse ES5, query lewat root | ✅ `acorn ecmaVersion:5` OK, grep `=>/let/const/backtick` = 0 |
| 5 | Root ID, prefix, variabel, keyframes unik | ✅ `#appLivinLanding`, class `lv-`, `--lv-*`, `lvFloatA…lvScanline`, ID dalam `lv…` |
| 6 | Jumlah kartu & link sesuai sumber | ✅ 21 link, 25 anchor, 31 gambar; story 7, solusi 5, promo 3, edukasi 3, stat 4, award 3 |
| 7 | Animasi fill-mode backwards | ✅ tidak ada `both` (animasi masuk dikelola GSAP) |
| 8 | Color mode Light/Dark/Half + kontras | ✅ semua pasangan teks ≥ 4.5:1 (lihat tabel) |

Kontras (scripts/contrast.py):

| Pasangan | Rasio |
|---|---|
| Light: teks #141414 / #FFFFFF | 18.42:1 |
| Light: muted #5F6368 / #FFFFFF | 6.05:1 |
| Light: aksen kecil #00799F / #FFFFFF | 4.96:1 |
| Dark/Half: teks #F3F1EC / #0A0A0A | 17.54:1 |
| Dark/Half: dim #B8B0A5 / #0A0A0A | 9.23:1 |
| Dark/Half: aksen kecil #3CC4EF / #0A0A0A | 9.74:1 |
| Dark/Half: tombol utama #0A0A0A / #F3F1EC | 17.54:1 |
| Dark/Half: dim di kartu #B8B0A5 / #161616 | 8.44:1 |
| Dark/Half: chip & store #F3F1EC / #202020 | 14.43:1 |

## Update: id dibuang AEM (style & konten tidak muncul)
Gejala di AEM: `id="appLivinLanding"` tidak sampai ke halaman, sehingga semua selector `#appLivinLanding …` tidak
kena (style mati) dan JS tidak menemukan root (konten render JS kosong).
**Perbaikan (sudah diterapkan):**
- Root selector CSS jadi `:is(#appLivinLanding, .lv-app)`.
- JS mencari root lewat class `.lv-app` bila id hilang.
- Setiap id di dalam komponen punya class cadangan `lv-id--<id>` yang dipulihkan JS sebelum render.

Diuji dengan semua `id` **dan** `data-*` dibuang: tinggi semua section identik dengan versi asli (1440 & 390px),
tanpa error JS, dan anchor menu, menu mobile, serta Dark mode jalan.

## Temuan: Prioritas TINGGI
### T-1. Navbar halaman ini `position: fixed`, bentrok dengan header corpweb
Halaman landing membawa navbar sendiri (`.lv-nav`). Di halaman corpweb yang sudah punya header, akan ada dua
header dan navbar Livin' menutupi bagian atas header CMS.
**Perbaikan:** kalau header CMS dipakai, sembunyikan navbar Livin':
```css
#appLivinLanding .lv-nav, #appLivinLanding .lv-mmenu { display: none; }
#appLivinLanding { --lv-nav-h: 0px; }
```
Atau, kalau navbar Livin' tetap dipakai, ubah jadi `position: sticky; top: 0` dan pastikan z-index di bawah header CMS.

### T-2. Konten masih placeholder
Angka statistik (`Menunggu data resmi`), slot penghargaan, 3 slot promo, 3 slot video edukasi, dan deskripsi
solusi Billion / Next-G / Livin' Food / Valas (`Draf konten, menunggu verifikasi`) belum berisi data resmi.
**Perbaikan:** isi `src-js/data.js` (STATS, AWARDS, SOLUTIONS, PROMOS, VIDEOS, LINKS), lalu build ulang `livin-landing.js`.

### T-3. Gambar mengarah ke `/content/dam/livin/assets/...`
Path ini asumsi. Pada uji sebelumnya di server corpweb gambar 404 karena belum ada di DAM.
**Perbaikan:** upload folder `assets/` (17 file) ke `/content/dam/livin/`, atau beri tahu path DAM yang sebenarnya
supaya `IMG_BASE` (JS) dan `url(...)` (CSS) dibuild ulang. Nama file tanpa spasi dan tanpa hash.

## Temuan: Prioritas SEDANG
### S-1. Light mode memakai #FFFFFF, bukan token default CMS #F3F1EC
Tampilan Light sengaja dibiarkan sama dengan desain (tidak mengubah warna brand). Kalau section harus mengikuti
Color Picker CMS, cukup ganti satu token: `--lv-cms-light-bg: #F3F1EC;` di blok 1 CSS.

### S-2. Font sekarang mengikuti CMS
Desain asli memakai Plus Jakarta Sans (weight sampai 800). Dengan font corpweb, judul besar bisa lebih lebar/sempit
dan patah baris berbeda. Cek hero (`Lebih dari Sekadar Perbankan.`) dan judul section di 1440px dan 390px.

### S-3. Bahasa campur di label & judul
Judul pilar berbahasa Inggris (`Everyday Banking & More.`, `Beyond Banking.`, `Next Level of Banking Experience.`),
eyebrow (`Livin' Positioning`, `The Livin' Experience`, `Featured Solutions`, `Promo & Rewards`) dan label fitur
(`Savings`, `Transaction`, `Loans`, `Investment`, …). Kalau bukan tagline resmi, terjemahkan untuk versi ID.

### S-4. Ukuran `livin-landing.js` ± 200 KB (minified)
Sebagian besar GSAP + ScrollTrigger dan ikon Lucide. Kalau corpweb sudah memuat GSAP di clientlib global,
bisa dipisah agar tidak dobel (perlu build ulang).

### S-5. Di mode Edit/Preview AEM (iframe) animasi scroll dimatikan
Disengaja: di iframe editor, scroll terjadi di halaman induk dan `100vh` ikut membesar. JS mengunci `--lv-vh` ke tinggi
layar dan menampilkan konten statis. Animasi penuh tampil di halaman publish / `?wcmmode=disabled`.

## Temuan: Prioritas RENDAH
- **R-1.** Lingkaran dekoratif `.lv-ring` membawa bayangan biru tipis dari utilitas Tailwind `ring` di desain asli (dipertahankan agar identik). Hapus `box-shadow` di rule `#appLivinLanding .lv-ring` bagian 9 bila tidak disengaja.
- **R-2.** ID yang dibuat JS untuk kartu fitur/solusi berprefix `lv-` (mis. `lv-feature-savings`). Unik, tapi bukan camelCase seperti ID statis.
- **R-3.** `initTheme` hanya mengenali `data-theme` `light|dark|half`. Nilai lain (mis. `default`) jatuh ke deteksi luminance background; tambahkan pemetaan di `cmsTheme()` bila perlu.
- **R-4.** GSAP berlisensi GreenSock Standard License (gratis untuk situs komersial sejak 2024), dicantumkan di header JS.

## Catatan versi English
Belum dibuat (tidak diminta). Bila dibuat: pakai CSS & JS yang sama, jangan pasang versi ID & EN di satu halaman
(ID bentrok), link tetap `/id/` dengan TODO ke `/en/`, nama produk tidak diterjemahkan. Teks yang dirender JS
(fitur, solusi, promo) ada di `data.js`, jadi versi EN juga butuh `data.js` EN.

## Urutan perbaikan yang disarankan
1. Putuskan navbar (T-1): sembunyikan atau ubah jadi sticky.
2. Upload gambar ke DAM / konfirmasi path (T-3).
3. Isi konten resmi di `data.js` (T-2) lalu build ulang JS.
4. Cek tampilan dengan font CMS dan putuskan token Light (S-1, S-2).
5. Rapikan bahasa (S-3).
