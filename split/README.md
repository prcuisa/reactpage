# Livin' by Mandiri — versi 3 file (HTML / CSS / JS)

```
index.html   markup semantik, tanpa <style>/<script> inline
style.css    semua CSS (Tailwind dikompilasi + 5 file CSS asli), ter-scope, dikelompokkan
script.js    semua JS (9 modul + GSAP/ScrollTrigger + Lucide + qrcodejs), 1 IIFE, tanpa global
assets/      gambar yang dipakai (path relatif sama seperti aslinya)
src-js/      sumber modul JS yang terbaca (script.js adalah hasil bundle-nya)
```

Buka lewat `http://` (bukan `file://`), mis. `npx serve .` atau server lokal apa pun.
`?static` mematikan animasi, `?tone=classic` menampilkan tone kuning/navy.

Verifikasi: screenshot halaman penuh 1440px & 390px dibandingkan dengan halaman asli — tinggi
halaman dan semua section identik; perbedaan piksel hanya pada animasi float CSS yang terus berjalan.

## Self-diagnosis (troubleshooting di AEM)
`script.js` memeriksa dirinya sendiri dan melaporkan di Console (prefix `[Livin']`, plus versi build untuk cek cache):

| Gejala | Pesan di console | Solusi |
|---|---|---|
| Root tidak ada | `Elemen root <div class="livin"> tidak ditemukan` | Markup belum ditempel / dibuang filter AEM / typo class |
| ID hilang / typo / duplikat | `ID #promo-grid (blok promo) tidak ada` · `ID #year dipakai 2x` | Samakan ID persis (huruf kecil, `-`), ID harus unik |
| CSS tidak termuat | `style.css tidak termuat (404, salah path, atau cache)` | Tab Network: style.css harus 200 |
| Data kosong | `#stats-grid kosong setelah render` | Cek data.js dan error JS sebelumnya |
| Tersembunyi wadah AEM | `Halaman tersembunyi oleh elemen induk: div.custom-css-js (visibility:hidden, tinggi 0)` | Pakai komponen Embed/HTML, bukan custom-css-js |
| Animasi macet | `Animasi pembuka tidak berjalan; konten ditampilkan tanpa animasi` | Failsafe otomatis; cek error/bentrok library |
| Di editor AEM | info: `Berjalan di dalam iframe` | Cek juga dengan `?wcmmode=disabled` |

Kalau semua beres: `[Livin'] build <tanggal> — OK`. Tambahkan `?livindebug` di URL untuk melihat laporan yang sama sebagai panel di halaman.
Tidak ada log `[Livin']` sama sekali = `script.js` tidak termuat (cek Network, harus 200) atau error sintaks.
