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
