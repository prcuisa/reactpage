# Livin' Landing: paket AEM (skill aem-html-split)

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
