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
- **Aman untuk filter XSS AEM (AntiSamy):** tag HTML5 (`main`, `section`, `article`, `header`, `nav`, `footer`) sudah diganti `<div>`
  dengan class `lv-<tag>` + atribut `role`, `<noscript>` dibuang, dan ikon `<svg>` inline (Google Play / App Store) dipindah ke CSS.
  Sebelumnya filter AEM membuang `<main>` beserta seluruh isinya, sehingga yang tampil hanya navbar.
- Jika terjadi error JS, konten tetap ditampilkan (animasi dimatikan) agar halaman tidak blank.
- `livin.css` memuat *preflight* (reset dasar) Tailwind, sama seperti versi asli; reset ini berlaku global, jadi
  sebaiknya halaman memakai template kosong (tanpa header/footer AEM lain) agar tampilannya identik.
- Parameter URL `?tone=classic` dan `?static` tetap berfungsi.
- Folder sumber desain (`assets/screenshots/frame*`, `tabungan/`) tidak disertakan karena tidak dipakai halaman.
