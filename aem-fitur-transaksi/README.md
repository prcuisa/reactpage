# Fitur Transaksi Livin': 14 kartu, high-tech motion (AEM)

Gabungan dua komponen `cta-card` lama (8 + 6 fitur) dengan desain Produk Simpanan + deskripsi tiap fitur.

| File | Dipasang di AEM |
|---|---|
| `fitur-transaksi.html` | Komponen **HTML / Embed** (bukan `custom-css-js`) |
| `fitur-transaksi.css` | Clientlib CSS / `custom-css-js` |
| `fitur-transaksi.js` | Clientlib JS (footer) / `custom-css-js`. ES5 |
| `review-fitur-transaksi.md` | QA + yang wajib dicek (deskripsi!) |
| `preview-fitur-transaksi.html` | Preview satu file, toolbar Auto/Light/Dark/Half |

**Scope:** root `#appFiturTransaksi` / `.ft-app`, class `ft-*`, variabel `--ft-*`, keyframes `ft*`. Lebar konten `--ft-max-width: 1500px`.
**Color mode:** ikut atribut `data-theme` di tag html; paksa dengan class `ft-mode-light|dark|half` di root.
**Cara tes:** console `[FiturTransaksi] build 2026-11-20 - OK`; `?static` mematikan animasi.

Hapus dua komponen `cta-card` lama sebelum menempel. Jangan hapus `&#8203;` dan class cadangan (`ft-id--*`, `ft-x-*`, `ft-r-*`).
