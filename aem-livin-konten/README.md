# Livin' Landing (konten saja): paket AEM tanpa navbar & footer

Versi ini **tanpa navbar, menu mobile, skip-link, dan footer**, karena header dan footer CMS corpweb yang dipakai.
Isinya 8 section: hero, angka, positioning, experience, solusi, promo, edukasi, download.
Tombol anchor di hero (Download, Jelajahi Fitur, Scroll) tetap scroll halus ke section tujuannya.

Kalau header CMS **sticky** dan menutupi judul section saat anchor diklik, isi tinggi header di CSS:
```css
:is(#appLivinLanding, .lv-app) { --lv-anchor-offset: 80px; }
```
Versi dengan navbar & footer ada di folder `aem-livin/`.

---


| File | Dipasang di AEM |
|---|---|
| `livin-landing.html` | Komponen **HTML / Embed** (bukan `custom-css-js`, karena komponen itu menyembunyikan isinya) |
| `livin-landing.css` | Clientlib CSS |
| `livin-landing.js` | Clientlib JS (footer). ES5, aman untuk minifier YUI |
| `assets/` | Upload ke DAM `/content/dam/livin/` (struktur folder sama) |
| `review-livin-landing.md` | Hasil review/QA + daftar yang wajib dibereskan |
| `src-js/` | Sumber modul JS yang terbaca (hasil konversi), untuk edit lalu build ulang |

**Scope:** root `#appLivinLanding`, class `lv-*`, variabel `--lv-*`, keyframes `lv*`, ID dalam `lv…`.

**Color mode:** otomatis dari `<html data-theme="light|dark|half">`.
- Light: root tanpa class tambahan.
- Dark: root punya `lv-theme-dark`.
- Half: root punya `lv-theme-dark lv-theme-half`.

Paksa mode dengan menambah class `lv-mode-light`, `lv-mode-dark`, atau `lv-mode-half` di root.

**Cara tes:**
1. Inspect `#appLivinLanding`: class-nya harus sesuai mode.
2. Console tanpa error.
3. Tanpa animasi: `?static`. Tone kuning/navy: `?tone=classic`.

**Tahan filter AEM:**
- CSS memakai `:is(#appLivinLanding, .lv-app)`, jadi tetap jalan walau AEM membuang `id`. Specificity tetap setara id.
- JS mencari root lewat id atau `.lv-app`.
- 40 id di dalam komponen dipulihkan dari class `lv-id--*`.
- `data-*` dipulihkan dari class `lv-x-*`.

Di Console akan muncul peringatan `[Livin] … fallback aktif` bila ini terjadi.
Juga `aria-*`/`role`/`inert` dipulihkan dari class `lv-r-*`.
Elemen yang tampak kosong berisi zero-width space (`&#8203;`) supaya AEM tidak mengubahnya jadi `<div/>`; jangan dihapus.

Jangan hapus class `lv-app`, `lv-id--*`, `lv-x-*`, dan `lv-r-*` dari HTML.
