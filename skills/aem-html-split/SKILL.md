---
name: aem-html-split
description: Memecah satu halaman/section HTML (berisi tag style dan script, atau proyek HTML+CSS+JS) menjadi 3 file siap pakai untuk CMS AEM (Adobe Experience Manager) corpweb bankmandiri.co.id. Hasilnya HTML fragment, CSS, dan JS yang di-scope penuh, tahan filter HTML AEM (tag HTML5, div kosong, id/data-*/aria dibuang), terisolasi dari CSS template, JS ES5, dan color mode Light/Dark/Half yang mengikuti CMS (html data-theme). Ada juga file review/QA, preview, dan (bila diminta) versi English. Gunakan skill ini setiap kali user minta "pisah file HTML CSS JS", "buat 3 file CMS/AEM", "convert ke AEM", "biar tidak bentrok", "copy-paste ke AEM", "clientlib", "custom-css-js", "dark mode ikut CMS", "mode half", "versi EN", "file review", atau mengunggah HTML/CSS/JS/zip untuk website bankmandiri.co.id / corpweb. Juga saat merevisi hasil skill ini (konten blank, cuma navbar yang muncul, CSS tidak jalan, layout menumpuk/menyamping, hover tidak jalan, mode warna tidak jalan, gambar 404).
---

# AEM HTML Split v2: 3 file CMS yang benar-benar jalan di corpweb

Tujuan: dari satu HTML (halaman utuh dengan `<head>`, `<style>`, `<script>`, atau proyek multi-file), hasilkan:

| File | Isi | Dipasang di AEM |
|---|---|---|
| `<nama>.html` | Fragment saja, satu root `<div id="app…" class="xx-app">` | Komponen **HTML/Embed** (BUKAN `custom-css-js`) |
| `<nama>.css` | Semua style, di-scope ke root, termasuk token Light/Dark/Half | Clientlib CSS / `custom-css-js` |
| `<nama>.js` | IIFE **ES5**, semua query lewat root, sinkron color mode, pemulih atribut | Clientlib JS (footer) / `custom-css-js` |

Tambahan: `review-<nama>.md` (selalu), `assets/` untuk DAM (bila ada gambar), `<nama>-en.html` (bila diminta), dan preview satu halaman di Claude (bila diminta).
Nama file kebab-case dari nama section. Jawab user dalam Bahasa Indonesia santai dan singkat (user sering panggil "bro").

---

## 0. Fakta AEM corpweb (sudah terbukti di lapangan, WAJIB diantisipasi)

Semua poin ini pernah membuat halaman blank atau berantakan. Jangan menunggu user melapor; tangani sejak konversi pertama.

| # | Perilaku AEM | Gejala di halaman | Penanganan wajib |
|---|---|---|---|
| A1 | **Tag HTML5 dibuang** (`header, nav, main, section, article, aside, footer`), dan pohon DOM ikut rusak | Hanya navbar yang muncul, sisanya putih | Pakai `<div>` + class penanda `xx-el-<tag>` + `role`. Selector tag di CSS/JS diubah ke class |
| A2 | **`<div></div>` kosong ditulis ulang jadi `<div/>`**. Browser membacanya sebagai tag pembuka, sehingga semua elemen sesudahnya ikut bersarang di dalamnya | Konten masuk ke elemen dekoratif `position:absolute`, layout kacau/menumpuk | **Tidak boleh ada elemen blok kosong** (`div, ul, ol, li, p, h1–h6`). Isi dengan zero-width space `&#8203;` |
| A3 | **Atribut `id` bisa dibuang** | Style mati total (`#app …` tidak kena), JS tidak menemukan root | Root juga punya class `xx-app`. CSS memakai `:is(#appX, .xx-app)`. Setiap id dalam diberi class cadangan `xx-id--<id>` dan dipulihkan JS |
| A4 | **`data-*` bisa dibuang** | Ikon/animasi/filter tidak jalan | Class cadangan `xx-x-<attr>[--<nilai>]`, dipulihkan JS sebelum init |
| A5 | **`aria-*`, `role`, `inert` dibuang** | Aksesibilitas hilang, menu bisa difokus saat tertutup | Class cadangan `xx-r-<n>` + peta di JS, dipulihkan saat init |
| A6 | **`<svg>` inline & `style="…"` inline dibuang** | Ikon kosong, ukuran salah | SVG jadi CSS `mask`/`background` data URI; style inline jadi class (atau set dari JS) |
| A7 | **Komponen `custom-css-js` menyembunyikan isinya** (`visibility:hidden`, tinggi 0, absolute) | Elemen ada di DOM tapi tidak terlihat | HTML ditaruh di komponen HTML/Embed. `custom-css-js` hanya untuk CSS/JS |
| A8 | **CSS template corpweb men-style tag langsung** (`main{display:flex}`, `section{…}`, `nav{…}`, `div{…}`, `a:hover`, `h2{…}`, `li::before`) | Section berjejer menyamping, blur, warna/ukuran aneh | Lapisan isolasi `all: revert` (bagian 2) |
| A9 | **Editor AEM (mode Edit/Preview) = iframe yang tingginya mengikuti konten** | `100vh` membengkak tanpa batas, animasi scroll tidak pernah jalan | Unit `vh/svh/dvh` lewat `var(--xx-vh)`. Di iframe JS mengunci `--xx-vh` ke tinggi layar dan mematikan animasi scroll |
| A10 | Tema bisa set `html{font-size:62.5%}` | Semua ukuran `rem` mengecil | Konversi `rem` → `px` (1rem = 16px) |
| A11 | Minifier clientlib (YUI) gagal di ES6 | JS tidak jalan / error sintaks | Output **ES5 murni** (bagian 5) |
| A12 | Clientlib/dispatcher/browser **cache** | Perbaikan "tidak ngefek" | Cantumkan versi build di console (`[Nama] build <tanggal>`) dan minta hard reload / rebuild clientlib |
| A13 | Komentar di HTML/CSS/JS ikut ditempel inline | Teks `<html …>` di komentar bisa membingungkan filter | Jangan tulis tag ber-kurung-sudut di komentar; tulis "atribut data-theme di tag html" |

---

## 1. Penamaan & scope

- **Root**: `<div id="appNamaSection" class="xx-app …">`. ID camelCase berprefix `app`, unik; class `xx-app` wajib (cadangan A3).
- **Prefix 2–3 huruf** dari nama section (`fl-`, `ps-`, `lv-`). **Semua** class diberi prefix, termasuk state (`xx-is-active`, `xx-is-open`) dan class yang dibuat JS. Jangan ada class generik (`.card`, `.btn`, `.container`, `.hero`, `.is-active`).
- **Custom property** `--xx-*` (termasuk `--tw-*` dari Tailwind jadi `--xx-tw-*`). **@keyframes** `xxNamaAnimasi`.
- **ID dalam** komponen: camelCase berprefix (`xxHero`, `xxStatsGrid`), dan semua referensi ikut diubah: `href="#…"`, `aria-labelledby`, `aria-controls`, `for`, `url(#…)` di SVG, serta `getElementById` di JS.
- Class library pihak ketiga yang dibuat runtime (mis. `lucide`, `lucide-*`) tidak diberi prefix, tapi tetap di-scope lewat root.

## 2. Konversi CSS

### 2a. Scope root yang tahan id dibuang
Setiap selector diawali `:is(#appX, .xx-app)`. Selector ini cocok lewat id **atau** class dan specificity-nya tetap setara id:
```css
:is(#appX, .xx-app) .xx-card { … }
:is(#appX, .xx-app).xx-theme-dark .xx-card { … }   /* state di root: tanpa spasi */
```
- `:root`, `html`, `body` → root itu sendiri. State yang dulu ada di `<html>`/`<body>` (`.js`, `.motion`, `[data-tone]`, `.has-cursor`) jadi modifier di root (`xx-motion`, `xx-tone-corp`).
- Selector tag/atribut tanpa class → `:is(#appX, .xx-app) <selector>`. Selector `*` → `:is(...), :is(...) *`.
- Selector **tag HTML5** (`main > section`, `section[id]`, `nav a`) diubah ke class penanda `.xx-el-main > .xx-el-section`.
- Cek otomatis: 0 selector tanpa root, 0 class tanpa prefix, 0 variabel tanpa prefix (parse dengan postcss).

### 2b. Lapisan isolasi + reset (paling atas file, urutan ini)
```css
/* 1. batalkan semua rule tag/class milik template AEM untuk elemen di dalam komponen
      (specificity setara id; kalah dari semua rule komponen di bawahnya) */
:is(#appX, .xx-app) :where(:not(svg, svg *, img)) { all: revert; }
/* 2. reset dasar */
:is(#appX, .xx-app) *, :is(#appX, .xx-app) *::before, :is(#appX, .xx-app) *::after { box-sizing: border-box; font-family: inherit; }
:is(#appX, .xx-app) :where(h1,h2,h3,h4,h5,h6) { font-family: inherit; text-transform: none; margin: 0; padding: 0; color: inherit; font-size: inherit; font-weight: inherit; letter-spacing: inherit; line-height: inherit; }
:is(#appX, .xx-app) :where(p) { margin: 0; padding: 0; font-size: inherit; line-height: inherit; }
:is(#appX, .xx-app) :where(a, a:hover, a:focus, a:visited, a:active) { color: inherit; text-decoration: inherit; }
:is(#appX, .xx-app) :where(button) { -webkit-appearance: none; appearance: none; box-shadow: none; min-width: 0; height: auto; margin: 0; line-height: inherit; letter-spacing: normal; text-transform: none; font-family: inherit; }
:is(#appX, .xx-app) :where(img) { margin: 0; border: 0; display: block; }
:is(#appX, .xx-app) :where(ul, ol, li) { margin: 0; padding: 0; list-style: none; }
:is(#appX, .xx-app) :where(main, section, article, aside, header, footer, nav, div) { display: block; }
/* 3. root: nilai dasar tetap, tidak mewarisi dari halaman */
:is(#appX, .xx-app) { display: block; position: relative; margin: 0; padding: 0; font-size: 16px; line-height: 1.5; text-align: left; text-transform: none; letter-spacing: normal; visibility: visible; }
```
- Reset ditulis dengan `:where()` supaya **tidak** menimpa rule komponen (hover tombol, warna link).
- Yang masih bisa menembus hanya rule situs dengan `!important` atau selector id. Sebutkan ini di review.

### 2c. Aturan lain
- **Font ikut CMS**: hapus semua `font-family` selain `inherit`, dan jangan pakai Google Fonts, kecuali user minta.
- **`rem` → `px`**, **`vh/svh/dvh/lvh` → `calc(var(--xx-vh, 1vh) * N)`** (A9/A10).
- **Lebar konten** lewat variabel: `--xx-max-width` di root, `.xx-wrap { width:100%; max-width: var(--xx-max-width); margin: 0 auto; }`.
- **Animasi masuk** pakai `animation-fill-mode: backwards`, JANGAN `both`, karena frame akhir `transform:none` akan menimpa `:hover`.
- Pertahankan `@media` responsive dan `prefers-reduced-motion` (termasuk `:focus-visible`).
- Hapus `!important` yang tidak perlu. Yang di blok reduced-motion tetap.
- **Tailwind (CDN/Play)**: kompilasi dengan Tailwind CLI memakai config yang sama, lalu ganti class utilitas di HTML dengan class BEM ber-prefix. Ingat: Tailwind CDN menyuntikkan CSS di **akhir** `<head>`, jadi utilitas menang atas CSS komponen. Taruh hasil konversi utilitas di **akhir** file supaya urutan cascade sama.
- Path gambar di CSS → `url("/content/dam/…")`.

## 3. Color mode Light / Dark / Half (ikut CMS)

CMS corpweb menandai mode di `<html data-theme="light|dark|half">`. Half memakai dasar halaman putih, jadi **JS wajib membaca `data-theme` lebih dulu**; cadangannya luminance background ancestor.

| Mode | Background section | Font |
|---|---|---|
| Light | `#F3F1EC` (default CMS; boleh dipertahankan warna desain, flag di review) | `#1A1A1A` |
| Dark | `#0A0A0A` | `#F3F1EC` |
| Half | `#0A0A0A` | `#F3F1EC` |

Pola (kode lengkap: `references/color-mode.md`, ganti `#appX` dengan `:is(#appX, .xx-app)`):
- Token `--xx-cms-{light,dark,half}-{bg,font}` di root. Light = default. `.xx-theme-dark` untuk Dark & Half; `.xx-theme-half` hanya override bg/font.
- Untuk halaman multi-section: **section terang** membalik token tinta/permukaan di Dark. Section yang memang gelap tetap gelap. **Mockup produk/ponsel/kartu UI tetap terang** (kembalikan token terang di dalamnya).
- Tombol utama di Dark: latar terang (`--xx-text`) dengan teks gelap. Label di atas artwork: teks tetap gelap.
- Prioritas mode di JS: class paksa `xx-mode-light|dark|half` di root, lalu `data-theme`, lalu luminance. Pasang `MutationObserver` (`data-theme`, `class`, dll), listener `prefers-color-scheme`, dan cek ulang saat `load`.
- Cek kontras **semua** pasangan teks di 3 mode ≥ 4.5:1 dengan `scripts/contrast.py`.

## 4. HTML fragment

- Tanpa `<!DOCTYPE>`, `<html>`, `<head>`, `<body>`, `<style>`, `<script>`, `<link>`, `<noscript>`, Google Fonts.
- **Hanya tag HTML4**: `div, span, a, p, h1–h6, ul, ol, li, img, i, b, em, small, strong, br, button`. Tag HTML5 → `<div class="xx-el-<tag>" role="…">` (A1).
- **Tidak ada elemen blok kosong** (A2): `<div class="xx-deco">&#8203;</div>`. Cek: grep `<(div|ul|ol|li|p)( [^>]*)?></` harus 0.
- **Class cadangan** untuk atribut yang bisa dibuang:
  - `id="xxHero"` → tambah class `xx-id--xxHero` (A3)
  - `data-speed="0.25"` → class `xx-x-speed--0p25`; boolean `data-reveal` → `xx-x-reveal`; nama camelCase → `_x` (A4)
  - `aria-*`/`role`/`inert` → class `xx-r-<n>` + peta `ARIA_MAP` di JS (A5)
- `<svg>` inline → `<span class="xx-ic xx-ic--nama" aria-hidden="true">&#8203;</span>` + CSS mask (A6). `style="…"` → class.
- Karakter non-ASCII → entity (`&rsquo; &ldquo; &rdquo; &mdash; &ndash; &bull; &copy;`), termasuk di judul. Cek: grep `[^\x00-\x7F]` = 0.
- Gambar: path DAM `/content/dam/<folder>/…`, tanpa spasi atau hash di nama file. Sertakan folder `assets/` untuk diupload.
- Header komentar standar (tanpa tag ber-kurung-sudut, A13):
  ```html
  <!-- ============================================================
       <NAMA SECTION> - HTML Structure
       Copy-paste ke komponen HTML di halaman AEM (bukan custom-css-js)
       (tanpa tag html, head, body; font mengikuti CMS)
       ============================================================ -->
  ```
- Link internal: `/content/….html`. Pasangan kartu ↔ URL diverifikasi; kategori harus konsisten dengan URL.

## 5. Konversi JS

- **ES5 murni**: tulis atau transpile (esbuild bundle → Babel `@babel/preset-env` target `ie 11` → Terser `ecma:5, ascii_only`). Validasi:
  - `acorn.parse(code, {ecmaVersion: 5})` lolos
  - grep `=>|\b(let|const)\b|` + "`" = 0 (backtick di dalam string library ganti `\x60`)
- **Pola init wajib**:
  ```js
  (function () {
    'use strict';
    var ROOT_ID = 'appX';
    function findRoot() { return document.getElementById(ROOT_ID) || document.querySelector('.xx-app'); }
    function init() {
      var root = findRoot();
      if (!root) { console.error('Element #' + ROOT_ID + ' / .xx-app tidak ditemukan. Tempel HTML di komponen HTML (bukan custom-css-js).'); return; }
      if (root.getAttribute('data-xx-ready') === '1') return;       // cegah double init / script dobel
      root.setAttribute('data-xx-ready', '1');
      if (!root.id) { root.id = ROOT_ID; console.warn('[X] id root dibuang AEM; fallback .xx-app aktif'); }
      restoreIds(root); restoreData(root); restoreAria(root);        // A3–A5, SEBELUM apa pun
      initTheme(root); initEnv(root);                                // color mode + flag motion/iframe
      // SEMUA query lewat root.querySelector(All), bukan document
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  })();
  ```
- **Tanpa global**: library (GSAP, ScrollTrigger, ikon, QR) dibundel privat. Jangan baca/tulis `window.gsap`, karena situs bisa punya versi lain.
- Rename class di JS harus **sadar konteks** (AST, mis. acorn + magic-string). Prefix hanya string yang memang class: atribut `class="…"` di template, `classList.*`, `className =`, dan selector di `querySelector/closest/matches`. Literal pembanding data (`active === 'sukha'`) **jangan** diubah. Template class dinamis (`obj--${x}`) diberi prefix di bagian statisnya. String biasa yang berisi markup (`'<span class="x">'`) juga diproses.
- Target string GSAP (`gsap.from('.x')`, `trigger: '#x'`) diganti NodeList/elemen dari root.
- Kelas "sembunyi sebelum animasi" (`xx-motion`) ditambahkan JS, bukan di HTML. Ada **failsafe**: bila engine animasi gagal atau tidak start ≤ 3 detik, kelas dicabut sehingga konten tetap tampil.
- **Iframe editor** (A9): `window.self !== window.top` → mode statis + `--xx-vh` dikunci ke `top.innerHeight` (clamp 500–1200px).
- `IntersectionObserver` selalu dengan fallback (langsung tampil).
- Path gambar di JS lewat konstanta `IMG_BASE = '/content/dam/…/'`. Hati-hati: di template literal tulis `src="${IMG_BASE}…"`, bukan `IMG_BASE + "…"` sebagai teks.
- Hati-hati escape regex di dalam template literal generator: `\w`, `\s`, `\b` hilang menjadi huruf biasa. Tulis kelas karakter eksplisit (`[A-Za-z0-9_-]`) atau escape ganda.
- Log versi: `console.info('[Nama] build <tanggal> - OK')` untuk deteksi cache (A12).

## 6. Verifikasi wajib sebelum kirim (render sungguhan, bukan hanya grep)

Uji dengan Playwright di halaman tiruan AEM (`root container > cmp-container > aem-Grid > cmp-embed`, `<html data-theme>`):
1. **Referensi asli vs hasil**: tinggi tiap section identik di 1440px & 390px (`?static`). Bandingkan juga class per elemen DOM (setelah prefix dilepas) dan jumlah link, kartu, dan gambar.
2. **Hostile CSS**: `html{font-size:62.5%}`, `main{display:flex}`, `section{filter:blur(6px)}`, `nav{display:flex}`, `footer{display:none}`, `div{line-height:3}`, `h2{color:red;text-transform:uppercase}`, `a{color:red;text-decoration:underline}`, `button{min-width:200px}`, `li{padding-left:30px}`, `.hero,.nav,.btn,.card{display:none}`. Hasil harus identik.
3. **Simulasi filter AEM**: buang semua `id`, `data-*`, `aria-*`, `role`, `inert`; ubah `<div …></div>` menjadi `<div …/>`; buang tag HTML5. Hasil harus identik, tanpa error. Uji versi tanpa perbaikan juga harus rusak, sebagai bukti simulasi valid.
4. **Fungsi**: menu mobile buka/tutup, anchor scroll, render data, ikon, dan script dimuat 2x (tidak ada listener ganda).
5. **Mode**: Light/Dark/Half + ganti `data-theme` saat runtime + class paksa. Screenshot dark full page, lalu cek bagian yang tak terbaca.
6. **Iframe editor**: iframe yang tingginya mengikuti konten. Hero tidak boleh membengkak.

## 7. Debug saat user lapor "tidak jalan"

Urutan diagnosis (jangan menebak, minta bukti):
1. **Minta halaman tersimpan** (Ctrl+S → `test.html`) atau screenshot **Inspect › Elements** di dalam root. Ini bukti paling cepat untuk melihat apa yang diubah AEM: tag hilang, `<div/>`, atribut hilang, salah bersarang.
2. Cek root ada di dalam `custom-css-js` (A7) atau komponen HTML.
3. Snippet console:
   ```js
   (()=>{const r=document.getElementById('appX')||document.querySelector('.xx-app');if(!r)return'ROOT TIDAK ADA';const anc=[];for(let e=r;e&&e!==document.documentElement;e=e.parentElement){const c=getComputedStyle(e);if(c.display==='none'||c.visibility!=='visible'||e.offsetHeight===0)anc.push(e.className||e.tagName)}return{id:r.id,cls:r.className,children:r.children.length,sections:r.querySelectorAll('.xx-el-section').length,hiddenAnc:anc.join(' > ')||'-',dataTheme:document.documentElement.getAttribute('data-theme'),cssLoaded:getComputedStyle(r).position==='relative'}})()
   ```
4. Cocokkan dengan tabel bagian 0, lalu perbaiki **di generator** dan uji ulang dengan simulasi (bagian 6.3) yang meniru temuan baru.
5. "Mode X tidak jalan": minta atribut `<html>` + tab Styles root, atau snippet Debug di `references/color-mode.md`.

## 8. File review (`review-<nama>.md`)

Ikuti `references/review-template.md`: ringkasan + tabel prioritas, checklist (bagian 9), temuan Tinggi/Sedang/Rendah (masalah, dampak, perbaikan + snippet), catatan EN, urutan perbaikan. Wajib dicek:
- Konten placeholder, path DAM gambar (404?), navbar `position:fixed` vs header CMS.
- Kontras 3 mode, bahasa campur (judul ID berbahasa Inggris), entity tipografis.
- Kategori ↔ URL, path case-sensitive, aset ber-hash.
- Ukuran JS (library dibundel), lisensi library.

Jangan ubah warna brand di Light tanpa diminta; cukup flag.

## 9. Checklist sebelum kirim

1. 0 selector tanpa `:is(#appX, .xx-app)`; tidak ada `:root`/`html`/`body`.
2. Tidak ada `font-family` khusus / `fonts.googleapis.com` (kecuali diminta).
3. HTML: 0 tag HTML5, 0 `<svg>`, 0 `style=`, 0 elemen blok kosong, 0 non-ASCII, 0 tag ber-kurung-sudut di komentar.
4. Setiap `id` punya `xx-id--*`, setiap `data-*` punya `xx-x-*`, setiap `aria-*`/`role`/`inert` punya `xx-r-*`.
5. JS lolos `acorn ecmaVersion:5`; grep ES6 = 0; tidak ada `document.querySelector` di luar pencarian root.
6. Root ID, prefix, variabel, keyframes, id dalam: unik.
7. Jumlah kartu, link, dan gambar sama dengan sumber.
8. Animasi `backwards`, bukan `both`.
9. Color mode 3 mode + kontras ≥ 4.5:1.
10. Lolos verifikasi render bagian 6 (identik dengan referensi, termasuk saat simulasi filter AEM).

## 10. Penyampaian

- Simpan hasil di folder proyek (mis. `aem-<nama>/`) + `assets/`; kirim file (revisi kecil: hanya file yang berubah; sebutkan mana yang tidak perlu diganti).
- Bila diminta **preview di Claude**: satu HTML (CSS & JS inline, gambar sebagai file pendamping dengan path relatif) + toolbar Auto/Light/Dark/Half yang mengubah `<html data-theme>`.
- Ringkas 2–4 poin + tabel: apa yang diubah supaya tidak bentrok, supaya tahan filter AEM, cara pasang (HTML → komponen HTML; CSS/JS → clientlib atau custom-css-js), dan cara tes (Inspect root: class mode benar; console `[X] build … OK`; tanpa error).
- Ingatkan: hapus isi lama sebelum tempel, hard reload, dan jangan hapus `&#8203;` maupun class cadangan.
