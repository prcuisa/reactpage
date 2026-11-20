# Review: Komponen "Produk Simpanan (High-Tech Motion)" (AEM)

File yang direview: `produk-simpanan.html`, `produk-simpanan.css`, `produk-simpanan.js`
Acuan: checklist skill **aem-html-split** v2
Tanggal review: 2026-11-20

## Ringkasan
Desain alternatif untuk grid 7 kartu simpanan: kartu kaca dengan ring neon berputar saat hover, spotlight yang ikut kursor, tilt 3D, scan line, ikon produk, dan reveal bertahap saat discroll.
Secara teknis siap pasang (lolos hostile CSS, simulasi filter AEM, 3 mode warna, script dobel, iframe editor). Yang **wajib** dibereskan sebelum live: URL tiap kartu (masih tebakan) dan konfirmasi header section yang baru.

| Prioritas | Jumlah | Area |
|---|---|---|
| Tinggi | 1 | URL link kartu |
| Sedang | 3 | Header baru, label kategori, typo copy |
| Rendah | 3 | Slot kosong baris 2, performa animasi, browser lama |

## Checklist skill
| # | Item | Status |
|---|---|---|
| 1 | Semua selector diawali `:is(#appProdukSimpanan, .ps-app)`, tanpa :root/body/html | ✅ (dicek postcss: 0 pelanggaran) |
| 2 | Tanpa font-family khusus / Google Fonts | ✅ font ikut CMS |
| 3 | Tanpa svg inline, style inline, tag HTML5, elemen kosong, non-ASCII | ✅ ikon = CSS mask, elemen dekor diisi `&#8203;` |
| 4 | JS lolos parse ES5 (acorn), query lewat root | ✅ 0 token ES6, `document.querySelector` hanya di findRoot |
| 5 | Root ID, prefix `ps-`, variabel `--ps-*`, keyframes `ps*`, id dalam `psTitle` unik | ✅ |
| 6 | Jumlah kartu & link sesuai sumber | ✅ 7 kartu, 7 link |
| 7 | Animasi fill-mode backwards | ✅ tidak ada `both` |
| 8 | Color mode Light/Dark/Half + kontras | ✅ semua pasangan teks 7:1 ke atas |
| 9 | Class cadangan id/data/aria | ✅ `ps-id--psTitle`, `ps-x-i--N`, `ps-r-region/list/hide` |
| 10 | Verifikasi render | ✅ lihat tabel di bawah |

### Hasil uji render (Playwright, halaman tiruan AEM)
| Uji | Hasil |
|---|---|
| Hostile CSS (`html{font-size:62.5%}`, `div{line-height:3}`, `h2,h3{color:red}`, `a{underline}`, `li{padding-left}`, `span{display:block}`, `.card,.grid,.item{display:none}`, dll) | Posisi & ukuran 7 kartu identik dengan versi bersih (1440px & 390px) |
| Simulasi filter AEM (buang id, data-*, aria-*, role) | Identik; JS memulihkan id, data-i, role, aria-hidden; warning `id root dibuang` muncul sesuai rancangan |
| Light / Dark / Half + ganti `data-theme` saat runtime | Class `ps-theme-dark` / `ps-theme-half` ikut berubah |
| Script dimuat 2x | Init sekali (`data-ps-ready`) |
| `?static` dan iframe editor | Tanpa animasi masuk, semua kartu langsung tampil |
| Loncat scroll (anchor / tombol End) | 7/7 kartu tetap tampil |
| Hover | Kartu naik 6px + tilt, ring berputar, tombol terisi navy (Light) / terang (Dark) |

## Temuan: Prioritas TINGGI
### T-1. URL kartu masih tebakan
Semua link memakai pola `/content/bankmandiri/id/personal/simpanan/<slug>.html`. Path ini belum diverifikasi; kalau salah, klik kartu jadi 404.
**Perbaikan:** ganti `href` di 7 kartu dengan path halaman produk yang benar (case-sensitive). Pastikan kategori cocok: NOW = online, Next-G = keluarga, Investor = RDN, dst.

## Temuan: Prioritas SEDANG
### S-1. Header section baru (tidak ada di desain asli)
Ditambahkan eyebrow "Produk Simpanan / 07" + judul "Pilih Simpanan yang Sesuai Kebutuhan Anda".
**Perbaikan:** konfirmasi copy ke tim konten. Kalau tidak dipakai, hapus seluruh blok `ps-head` di HTML dan hapus class `ps-r-region` di root (supaya tidak ada `aria-labelledby` ke judul yang hilang).

### S-2. Label kategori di kartu (Online, Keluarga, Investasi, Digital, Transaksi, Valas, Berencana)
Label ini tambahan desain, bukan dari sumber. Cek kesesuaian dengan istilah resmi produk.

### S-3. Copy kartu Mandiri Tabungan Rencana
"...menabung rutin dengan **miliki** produk simpanan..." terbaca janggal (dari sumber, tidak diubah). Saran: "...menabung rutin dengan memiliki produk simpanan Mandiri Tabungan Rencana."

## Temuan: Prioritas RENDAH
- **R-1.** Baris kedua di desktop (4 kolom) menyisakan 1 slot kosong, sama seperti desain asli. Bisa diisi kartu "Bandingkan produk" bila ada halamannya.
- **R-2.** Ring berputar & scan line hanya berjalan saat hover (di perangkat sentuh ring berputar pelan terus). Grid titik dan orb latar beranimasi pelan; di iframe editor, `?static`, dan `prefers-reduced-motion` semua dimatikan.
- **R-3.** `:is()`, `aspect-ratio`, `mask`, `inset` butuh browser modern (Chrome 88+, Safari 15+). Di browser lama ring/ikon bisa tidak tampil, konten tetap terbaca.
- **Catatan isolasi:** rule template dengan `!important` atau selector id masih bisa menembus lapisan `all: revert`.

## Catatan versi English
Belum dibuat. Bila perlu: pakai CSS & JS yang sama, terjemahkan deskripsi + label kategori, nama produk tidak diterjemahkan, link `/id/` diganti `/en/`. Jangan pasang versi ID & EN di satu halaman (root id sama).

## Urutan perbaikan yang disarankan
1. Isi URL produk yang benar (T-1).
2. Putuskan header dipakai atau tidak (S-1), cek label kategori (S-2).
3. Perbaiki copy Tabungan Rencana (S-3).
4. Pasang, hard reload, cek console `[ProdukSimpanan] build 2026-11-20 - OK`.

## Revisi: hover tertahan setelah klik
**Masalah:** kartu terakhir yang diklik tetap dalam efek hover (naik, ring berputar), karena CSS memakai `:focus-within` dan link tetap fokus setelah diklik. Di HP, `:hover` juga tertahan setelah tap.
**Perbaikan:** efek hover kartu sekarang lewat class yang diatur JS:
- `*-is-hover`: ditambah saat kursor masuk (hanya perangkat dengan mouse), dicabut saat kursor keluar.
- `*-is-kbd`: hanya saat fokus dari keyboard (`:focus-visible`), dicabut saat blur atau klik.
- Saat kembali lewat tombol Back (bfcache), semua state direset.
**Diuji:** hover, klik, kursor keluar, Tab keyboard, klik di luar, dan tap di HP. Tidak ada kartu yang tertahan.
