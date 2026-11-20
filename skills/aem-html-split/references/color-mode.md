# Color mode Light / Dark / Half — kode referensi

> v2: di semua contoh, ganti `#appX` dengan `:is(#appX, .xx-app)` (tahan id dibuang AEM) dan `document.getElementById('appX')` dengan `findRoot()` (id ATAU class `.xx-app`).

Ganti `fl`/`appX` sesuai prefix & root komponen.

## CSS

```css
/* Token CMS (samakan dengan Color Picker section) */
#appX {
    --fl-cms-light-bg: #F3F1EC;
    --fl-cms-light-font: #1A1A1A;
    --fl-cms-dark-bg: #0A0A0A;
    --fl-cms-dark-font: #F3F1EC;
    --fl-cms-half-bg: #0A0A0A;
    --fl-cms-half-font: #F3F1EC;
}

/* Light (default) */
#appX {
    --fl-bg: var(--fl-cms-light-bg);
    --fl-text: var(--fl-cms-light-font);
    --fl-surface: #ffffff;
    --fl-line: rgba(26, 26, 26, 0.10);
    --fl-line-hi: rgba(26, 26, 26, 0.20);
    --fl-text-dim: #6b6258;
    --fl-blue: #1ba3e0;          /* aksen */
    --fl-on-blue: #ffffff;       /* teks di atas aksen */
    --fl-glow: radial-gradient(900px 500px at 85% -10%, rgba(255,190,110,.18), transparent 60%);
    --fl-shadow-hi: 0 14px 32px -18px rgba(26, 26, 26, 0.35);
    --fl-arrow-icon: url("data:image/svg+xml,...stroke='%231a1a1a'...");
    --fl-arrow-icon-hi: url("data:image/svg+xml,...stroke='%23ffffff'...");
    color: var(--fl-text);
    background: var(--fl-bg);
    color-scheme: light;
}

/* Dark & Half */
#appX.fl-theme-dark {
    --fl-bg: var(--fl-cms-dark-bg);
    --fl-text: var(--fl-cms-dark-font);
    --fl-surface: rgba(243, 241, 236, 0.05);   /* lapisan tipis, menyatu di dark bg */
    --fl-line: rgba(243, 241, 236, 0.10);
    --fl-line-hi: rgba(243, 241, 236, 0.22);
    --fl-text-dim: #b8b0a5;
    --fl-blue: #3db5e8;
    --fl-on-blue: #06233a;
    --fl-glow: radial-gradient(900px 500px at 85% -10%, rgba(255,190,110,.08), transparent 60%);
    --fl-shadow-hi: 0 14px 32px -18px rgba(0, 0, 0, 0.8);
    --fl-arrow-icon: url("data:image/svg+xml,...stroke='%23f3f1ec'...");
    --fl-arrow-icon-hi: url("data:image/svg+xml,...stroke='%2306233a'...");
    color-scheme: dark;
}
#appX.fl-theme-half {
    --fl-bg: var(--fl-cms-half-bg);
    --fl-text: var(--fl-cms-half-font);
}

#appX .fl-section { background: var(--fl-glow), var(--fl-bg); }

@media (max-width: 600px) {
    #appX {
        /* Token CMS versi Mobile — isi bila beda dari Desktop */
    }
}
```

Glow harus memudar ke `transparent` di tepi supaya pinggir section sama persis dengan warna section CMS tetangga.

## JS (ES5, dipanggil `initTheme(root)` dari `init()`)

```js
function parseRgb(str) {
    var m = str && str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.]+%?))?/);
    if (!m) return null;
    var a = m[4] === undefined ? 1 : (m[4].indexOf('%') > -1 ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
    return { r: +m[1], g: +m[2], b: +m[3], a: a };
}
function luminance(c) {
    function ch(v) { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
}
function isCmsDark(root) {
    var el = root.parentElement;
    while (el) {
        var c = parseRgb(window.getComputedStyle(el).backgroundColor);
        if (c && c.a >= 0.5) return luminance(c) < 0.35;
        el = el.parentElement;
    }
    return false;
}
function forcedMode(root) {
    var m = (' ' + root.className + ' ').match(/ fl-mode-(light|dark|half) /);
    return m ? m[1] : '';
}
function cmsTheme() {
    var t = (document.documentElement.getAttribute('data-theme') || '').toLowerCase();
    return (t === 'light' || t === 'dark' || t === 'half') ? t : '';
}
function setMode(root, mode) {
    root.classList.toggle('fl-theme-dark', mode === 'dark' || mode === 'half');
    root.classList.toggle('fl-theme-half', mode === 'half');
}
function initTheme(root) {
    var timer = null;
    var forced = forcedMode(root);
    if (forced) { setMode(root, forced); return; }
    function apply() { setMode(root, cmsTheme() || (isCmsDark(root) ? 'dark' : 'light')); }
    function schedule() { apply(); clearTimeout(timer); timer = setTimeout(apply, 400); }
    apply();
    if ('MutationObserver' in window) {
        var mo = new MutationObserver(schedule);
        var opts = { attributes: true, attributeFilter: ['class', 'style', 'data-theme', 'data-mode', 'data-color-scheme', 'data-bs-theme'] };
        mo.observe(document.documentElement, opts);
        if (document.body) mo.observe(document.body, opts);
    }
    if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        if (mq.addEventListener) mq.addEventListener('change', schedule);
        else if (mq.addListener) mq.addListener(schedule);
    }
    window.addEventListener('load', schedule);
}
```

Bila nilai `data-theme` di CMS bukan `light|dark|half` (mis. `default`), tambahkan pemetaannya di `cmsTheme()`.

## Debug (minta user jalankan di Console)

```js
console.log('data-theme:', document.documentElement.getAttribute('data-theme'));
console.log('root class:', document.getElementById('appX').className);
var el = document.getElementById('appX').parentElement;
while (el) {
  var cs = getComputedStyle(el);
  console.log(el.tagName, el.className, cs.backgroundColor, cs.backgroundImage.slice(0, 80));
  el = el.parentElement;
}
```

Fakta corpweb yang sudah diketahui: `<html data-theme="half">` + `--page-base-color-light: #FFFFFF`, `--page-base-color-dark: #141414`, `--page-base-color-half: #FFFFFF`, `--active-color: #01a4d8`; di Half, `--cc-bg: #f2f0f0`, `--cc-text: #35383e`; `html { color-scheme: only light }`.
