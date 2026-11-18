# Livin' by Mandiri — paket untuk AEM

Tiga file, masing-masing satu:

| File | Isi | Cara pasang di AEM |
|---|---|---|
| `livin.html` | Markup halaman (isi `<body>` saja, dibungkus `<div id="livin-root">`). Tanpa `<html>`, `<head>`, `<script>`, `<link>`. | Tempel ke komponen **Embed / HTML** |
| `livin.css` | Google Font (Plus Jakarta Sans) + Tailwind 3.4.16 yang sudah dikompilasi + style.css, theme-corp.css, app-ui.css, animations.css, responsive.css (urutan sama seperti aslinya) | Client library CSS (dimuat di `<head>`) |
| `livin.js` | Skrip flag `no-js/motion` (dulu inline di `<head>`) + qrcodejs + GSAP 3.12.5 + ScrollTrigger + ikon Lucide yang dipakai + semua modul `js/*.js` | Client library JS (boleh di `<head>` atau akhir `<body>`) |

Tidak ada lagi ketergantungan CDN (Tailwind Play CDN, cdnjs, unpkg) kecuali Google Fonts.

## Aset gambar
Semua path gambar sudah diarahkan ke **`/content/dam/livin/assets/...`**.
Upload folder `assets/` ke DAM di `/content/dam/livin/` dengan struktur yang sama.
Jika lokasi DAM berbeda, cari-ganti `/content/dam/livin/` di ketiga file.

## Catatan
- **Markup cadangan di `livin.js`:** sanitizer HTML AEM bisa membuang sebagian isi `livin.html` (kasus nyata: hanya navbar
  yang tersisa, `#hero` hilang). JS membawa salinan markup lengkap dan memasangnya ulang ke `#livin-root` bila konten
  hilang (atau membuat `#livin-root` sendiri di `.cmp-embed`/`body` bila wrapper ikut hilang).
- **Isolasi dari CSS situs:** `#livin-root :where(:not(svg, svg *, img)) { all: revert }` membatalkan semua rule class/tag
  situs AEM (mis. `.hero{}`, `.footer{}`, `.display{}`) di dalam halaman Livin'. Rule tanpa `!important` dari situs tidak bisa masuk.
- **GSAP privat:** halaman memakai GSAP dari bundle sendiri (`window.__lvGsap`), tidak terganggu GSAP/library lain di situs.
- **Failsafe:** jika 4 detik setelah DOM siap hero masih tak terlihat, animasi dimatikan dan konten dipaksa tampil.
- **Diagnosa:** tambahkan `?livindebug` di URL → panel hijau di kiri bawah berisi status (CSS, JS, tinggi tiap section, error).
- **Editor/Preview AEM (iframe):** editor AEM memuat halaman dalam iframe yang tingginya mengikuti konten, sehingga
  `100vh` membengkak tanpa batas (dulu: hanya navbar yang terlihat, sisanya putih). Semua `vh/svh` kini memakai
  `var(--lv-vh)`; di dalam iframe JS menguncinya ke tinggi layar asli dan menonaktifkan animasi scroll (class `lv-framed`).
  Animasi penuh tetap jalan di halaman publish / `?wcmmode=disabled`.
- **CSS ter-scope penuh ke `#livin-root`.** Setiap rule diawali `#livin-root`; aturan `html`/`:root`/`body` dipindah ke
  `#livin-root`, dan state class (`motion`, `has-cursor`, `data-tone`) dipasang JS di `#livin-root`, bukan di `<html>`.
  Keyframes diberi prefix `lv-`, semua `rem` diubah ke `px` (kebal terhadap `html{font-size:62.5%}` dari tema AEM),
  dan ada lapisan pelindung agar CSS tag global AEM (`div{}`, `ul{}`, `h1{}`) tidak masuk ke halaman.
  Jangan ubah/hapus `id="livin-root"` pada `<div>` pembungkus.
- **Aman untuk filter XSS AEM (AntiSamy):** tag HTML5 (`main`, `section`, `article`, `header`, `nav`, `footer`) sudah diganti `<div>`
  dengan class `lv-<tag>` + atribut `role`, `<noscript>` dibuang, dan ikon `<svg>` inline (Google Play / App Store) dipindah ke CSS.
  Sebelumnya filter AEM membuang `<main>` beserta seluruh isinya, sehingga yang tampil hanya navbar.
- Jika terjadi error JS, konten tetap ditampilkan (animasi dimatikan) agar halaman tidak blank.
- Navbar Livin' memakai `position: fixed` di atas halaman; jika template AEM punya header sendiri, keduanya akan bertumpuk.
- Parameter URL `?tone=classic` dan `?static` tetap berfungsi.
- Folder sumber desain (`assets/screenshots/frame*`, `tabungan/`) tidak disertakan karena tidak dipakai halaman.
