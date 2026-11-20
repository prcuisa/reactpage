# Template file review

```markdown
# Review — Komponen "<Nama Section>" (AEM)

File yang direview: `<nama>.html`, `<nama>.css`, `<nama>.js`
Acuan: checklist skill **aem-html-split**
Tanggal review: <tanggal>

## Ringkasan
<2–3 kalimat: siap pasang atau tidak, apa yang wajib dibereskan>

| Prioritas | Jumlah | Area |
|---|---|---|
| Tinggi | n | ... |
| Sedang | n | ... |
| Rendah | n | ... |

## Checklist skill
| # | Item | Status |
|---|---|---|
| 1 | Semua selector diawali root, tanpa :root/body/html | ✅/⚠️/❌ |
| 2 | Tanpa font-family khusus / Google Fonts | |
| 3 | Tanpa <svg> inline & style="..." | |
| 4 | JS lolos parse ES5, query lewat root | |
| 5 | Root ID, prefix, variabel, keyframes unik | |
| 6 | Jumlah kartu & link sesuai sumber | |
| 7 | Animasi fill-mode backwards | |
| 8 | Color mode Light/Dark/Half + kontras | |

## Temuan — Prioritas TINGGI
### T-1. <judul singkat>
<masalah + dampak ke user>
**Perbaikan:** <langkah + snippet kode>

## Temuan — Prioritas SEDANG
### S-1. ...

## Temuan — Prioritas RENDAH
- **R-1. ...**

## Catatan versi English
- Pakai CSS & JS yang sama; jangan pasang ID & EN di satu halaman.
- Link masih /id/ → ganti /en/ bila tersedia.
- Nama produk tidak diterjemahkan; temuan mana yang berlaku/sudah beres di EN.

## Urutan perbaikan yang disarankan
1. ...
```

Panduan prioritas:
- **Tinggi**: fitur tidak jalan (hover, filter, mode), kontras < 3:1 pada teks interaktif, konten salah kategori/link salah.
- **Sedang**: kontras 3–4.5:1, encoding entity, bahasa campur, path/aset perlu diverifikasi.
- **Rendah**: aksesibilitas tambahan, performa kecil, redundansi CSS, browser lama.
