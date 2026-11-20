# Fitur Terbaru Livin': revamp high-tech motion (AEM)

6 kartu fitur Livin' + filter kategori. Motion: ring neon, spotlight, tilt 3D, scan line, reveal bertahap, indikator filter meluncur.
Logo fitur disamakan ukuran visualnya otomatis oleh JS (detail di review).

| File | Dipasang di AEM |
|---|---|
| `livin-fitur.html` | Komponen **HTML / Embed** (bukan `custom-css-js`) |
| `livin-fitur.css` | Clientlib CSS / `custom-css-js` |
| `livin-fitur.js` | Clientlib JS (footer) / `custom-css-js`. ES5 |
| `review-livin-fitur.md` | QA + yang wajib dibereskan |
| `preview-livin-fitur.html` | Preview satu file (logo DUMMY), toolbar Auto/Light/Dark/Half |

**Scope:** root `#appLivinFitur` / `.lf-app`, class `lf-*`, variabel `--lf-*`, keyframes `lf*`.
**Logo:** tetap dari `/content/dam/mandiri/drb/livin-asset/logo-produk/`. Ukuran tile: `--lf-logo-size` (64px, 56px di HP).
**Color mode:** ikut atribut `data-theme` di tag html; paksa dengan class `lf-mode-light|dark|half` di root.
**Cara tes:** console `[LivinFitur] build 2026-11-20 - OK`; logo punya class `lf-is-fit`/`lf-is-tile`; `?static` mematikan animasi.

Jangan hapus `&#8203;` dan class cadangan (`lf-id--*`, `lf-x-*`, `lf-r-*`). Hapus isi lama sebelum tempel, lalu hard reload / rebuild clientlib.
