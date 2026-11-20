# Produk Simpanan: alternatif desain high-tech motion (AEM)

Grid 7 kartu simpanan (Tabungan NOW, Next-G, Investor, e-Deposito, Giro Perorangan, Multicurrency, Tabungan Rencana) dengan motion:
ring neon berputar saat hover, spotlight ikut kursor, tilt 3D, scan line, ikon produk, reveal bertahap saat discroll.

| File | Dipasang di AEM |
|---|---|
| `produk-simpanan.html` | Komponen **HTML / Embed** (bukan `custom-css-js`) |
| `produk-simpanan.css` | Clientlib CSS / `custom-css-js` |
| `produk-simpanan.js` | Clientlib JS (footer) / `custom-css-js`. ES5 |
| `review-produk-simpanan.md` | Hasil QA + yang wajib dibereskan (URL kartu!) |
| `preview-produk-simpanan.html` | Preview satu file, toolbar Auto/Light/Dark/Half |

**Scope:** root `#appProdukSimpanan` / `.ps-app`, class `ps-*`, variabel `--ps-*`, keyframes `ps*`.

**Color mode:** ikut atribut `data-theme` di tag html. Light = tanpa class; Dark = `ps-theme-dark`; Half = `ps-theme-dark ps-theme-half`.
Paksa mode: tambah `ps-mode-light|dark|half` di root.

**Cara tes:** Inspect root, class mode harus benar; console `[ProdukSimpanan] build 2026-11-20 - OK`; `?static` mematikan animasi.

Jangan hapus `&#8203;` dan class cadangan (`ps-id--*`, `ps-x-*`, `ps-r-*`): itu penahan filter AEM. Hapus isi lama sebelum tempel, lalu hard reload / rebuild clientlib.
