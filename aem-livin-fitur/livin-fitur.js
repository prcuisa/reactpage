/* ============================================================
   FITUR TERBARU LIVIN (HIGH-TECH MOTION) - Script (ES5)
   Root: #appLivinFitur / .lf-app | semua query lewat root
   Color mode ikut atribut data-theme di tag html (light/dark/half)
   ============================================================ */
(function () {
  'use strict';

  var ROOT_ID = 'appLivinFitur';
  var BUILD = '2026-11-20';
  var TAG = '[LivinFitur]';

  /* Peta pemulih atribut aria/role (AEM bisa membuang aria-*, role) */
  var ARIA_MAP = {
    'lf-r-region': { 'role': 'region', 'aria-labelledby': 'lfTitle' },
    'lf-r-group': { 'role': 'group', 'aria-label': 'Filter kategori fitur' },
    'lf-r-on': { 'aria-pressed': 'true' },
    'lf-r-off': { 'aria-pressed': 'false' },
    'lf-r-hide': { 'aria-hidden': 'true' }
  };

  function findRoot() {
    return document.getElementById(ROOT_ID) || document.querySelector('.lf-app');
  }

  function toArray(list) {
    var out = [];
    for (var i = 0; i < list.length; i++) out.push(list[i]);
    return out;
  }

  function hasClass(el, c) {
    return (' ' + el.className + ' ').indexOf(' ' + c + ' ') > -1;
  }

  function addClass(el, c) {
    if (el.classList) el.classList.add(c);
    else if (!hasClass(el, c)) el.className += ' ' + c;
  }

  function removeClass(el, c) {
    if (el.classList) el.classList.remove(c);
    else el.className = (' ' + el.className + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, '');
  }

  function toggleClass(el, c, on) {
    if (on) addClass(el, c); else removeClass(el, c);
  }

  function allWithin(root) {
    return [root].concat(toArray(root.querySelectorAll('*')));
  }

  /* ---------- Pemulih atribut (A3 - A5) ---------- */
  function restoreIds(root) {
    var els = allWithin(root);
    for (var i = 0; i < els.length; i++) {
      var m = (' ' + els[i].className + ' ').match(/ lf-id--([A-Za-z0-9_-]+) /);
      if (m && !els[i].id) els[i].id = m[1];
    }
  }

  function restoreData(root) {
    var els = allWithin(root);
    var re = / lf-x-([A-Za-z0-9_]+)(?:--([A-Za-z0-9_-]+))? /g;
    for (var i = 0; i < els.length; i++) {
      var cls = ' ' + els[i].className.split(/\s+/).join('  ') + ' ';
      var m;
      re.lastIndex = 0;
      while ((m = re.exec(cls)) !== null) {
        var name = 'data-' + m[1].replace(/_x/g, '-').toLowerCase();
        var val = m[2] === undefined ? '' : m[2].replace(/([0-9])p([0-9])/g, '$1.$2');
        if (!els[i].hasAttribute(name)) els[i].setAttribute(name, val);
      }
    }
  }

  function restoreAria(root) {
    for (var key in ARIA_MAP) {
      if (!ARIA_MAP.hasOwnProperty(key)) continue;
      var els = hasClass(root, key) ? [root] : [];
      els = els.concat(toArray(root.querySelectorAll('.' + key)));
      for (var i = 0; i < els.length; i++) {
        var attrs = ARIA_MAP[key];
        for (var a in attrs) {
          if (attrs.hasOwnProperty(a) && !els[i].hasAttribute(a)) els[i].setAttribute(a, attrs[a]);
        }
      }
    }
  }

  /* ---------- Color mode ---------- */
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
    var m = (' ' + root.className + ' ').match(/ lf-mode-(light|dark|half) /);
    return m ? m[1] : '';
  }

  function cmsTheme() {
    var t = (document.documentElement.getAttribute('data-theme') || '').toLowerCase();
    return (t === 'light' || t === 'dark' || t === 'half') ? t : '';
  }

  function setMode(root, mode) {
    toggleClass(root, 'lf-theme-dark', mode === 'dark' || mode === 'half');
    toggleClass(root, 'lf-theme-half', mode === 'half');
  }

  function initTheme(root) {
    var timer = null;
    function apply() {
      var forced = forcedMode(root);
      setMode(root, forced || cmsTheme() || (isCmsDark(root) ? 'dark' : 'light'));
    }
    function schedule() { apply(); clearTimeout(timer); timer = setTimeout(apply, 400); }
    apply();
    if ('MutationObserver' in window) {
      var opts = { attributes: true, attributeFilter: ['class', 'style', 'data-theme', 'data-mode', 'data-color-scheme', 'data-bs-theme'] };
      var mo = new MutationObserver(schedule);
      mo.observe(document.documentElement, opts);
      if (document.body) mo.observe(document.body, opts);
      /* class paksa lf-mode-* ditambah/dicabut saat runtime */
      var moRoot = new MutationObserver(function () {
        var want = forcedMode(root);
        if (want !== root.getAttribute('data-lf-forced')) {
          root.setAttribute('data-lf-forced', want);
          apply();
        }
      });
      moRoot.observe(root, { attributes: true, attributeFilter: ['class'] });
    }
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.addEventListener) mq.addEventListener('change', schedule);
      else if (mq.addListener) mq.addListener(schedule);
    }
    window.addEventListener('load', schedule);
  }

  /* ---------- Lingkungan: iframe editor, static, reduced motion ---------- */
  function inIframe() {
    try { return window.self !== window.top; } catch (e) { return true; }
  }

  function prefersReduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function initEnv(root) {
    var isStatic = inIframe() || /[?&]static\b/.test(window.location.search) || prefersReduced();
    toggleClass(root, 'lf-static', isStatic);
    return isStatic;
  }

  /* ---------- Motion masuk (reveal bertahap) ---------- */
  function initReveal(root, isStatic) {
    var items = toArray(root.querySelectorAll('.lf-item'));
    var head = root.querySelector('.lf-head');
    var targets = head ? [head].concat(items) : items;

    for (var i = 0; i < items.length; i++) {
      var idx = items[i].getAttribute('data-i');
      items[i].style.setProperty('--lf-i', idx !== null && idx !== '' ? idx : String(i));
    }

    if (isStatic || !('IntersectionObserver' in window)) return;

    addClass(root, 'lf-motion');

    /* failsafe: bila observer tidak pernah jalan, tampilkan semua */
    var failsafe = setTimeout(function () {
      if (!root.querySelector('.lf-is-in')) removeClass(root, 'lf-motion');
    }, 3000);

    var pending = targets.slice();
    var ticking = false;

    function reveal(el) {
      addClass(el, 'lf-is-in');
      io.unobserve(el);
      clearTimeout(failsafe);
    }

    /* scroll loncat (anchor / End): elemen yang sudah terlewati juga ditampilkan */
    function sweep() {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var rest = [];
      for (var s = 0; s < pending.length; s++) {
        if (pending[s].getBoundingClientRect().top < vh - 40) reveal(pending[s]);
        else rest.push(pending[s]);
      }
      pending = rest;
      if (!pending.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      (window.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(sweep);
    }

    var io = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        if (entries[k].isIntersecting) onScroll();
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);
  }

  /* ---------- Tilt 3D + spotlight ikut kursor ---------- */
  function initTilt(root, isStatic) {
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var cards = toArray(root.querySelectorAll('.lf-card'));
    var MAX = 6;

    function bind(card) {
      var raf = 0;
      var px = 0.5;
      var py = 0;

      function paint() {
        raf = 0;
        card.style.setProperty('--lf-mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--lf-my', (py * 100).toFixed(1) + '%');
        if (fine && !isStatic) {
          card.style.setProperty('--lf-rx', ((0.5 - py) * MAX).toFixed(2) + 'deg');
          card.style.setProperty('--lf-ry', ((px - 0.5) * MAX).toFixed(2) + 'deg');
        }
      }

      function onMove(e) {
        var r = card.getBoundingClientRect();
        if (!r.width || !r.height) return;
        px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
        if (!raf) raf = (window.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(paint);
      }

      function onLeave() {
        card.style.setProperty('--lf-rx', '0deg');
        card.style.setProperty('--lf-ry', '0deg');
      }

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    }

    for (var i = 0; i < cards.length; i++) bind(cards[i]);
  }

  /* ---------- Filter kategori + indikator meluncur ---------- */
  function initFilters(root, isStatic) {
    var wrap = root.querySelector('.lf-filters');
    if (!wrap) return;
    var buttons = toArray(wrap.querySelectorAll('.lf-filter'));
    var ind = wrap.querySelector('.lf-filters__ind');
    var items = toArray(root.querySelectorAll('.lf-item'));

    function active() {
      for (var i = 0; i < buttons.length; i++) if (hasClass(buttons[i], 'lf-is-active')) return buttons[i];
      return buttons[0];
    }

    function moveInd() {
      var b = active();
      if (!ind || !b || !b.offsetWidth) return;
      ind.style.left = b.offsetLeft + 'px';
      ind.style.top = b.offsetTop + 'px';
      ind.style.width = b.offsetWidth + 'px';
      ind.style.height = b.offsetHeight + 'px';
      addClass(wrap, 'lf-has-ind');
    }

    function apply(btn) {
      var f = btn.getAttribute('data-filter') || 'all';
      var n = 0;
      for (var i = 0; i < buttons.length; i++) {
        var on = buttons[i] === btn;
        toggleClass(buttons[i], 'lf-is-active', on);
        buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      moveInd();
      var shown = [];
      for (var j = 0; j < items.length; j++) {
        var show = f === 'all' || items[j].getAttribute('data-cat') === f;
        toggleClass(items[j], 'lf-is-hidden', !show);
        if (show) {
          items[j].style.setProperty('--lf-i', String(n++));
          shown.push(items[j]);
        }
      }
      /* putar ulang animasi masuk untuk kartu yang tampil */
      if (!isStatic && hasClass(root, 'lf-motion')) {
        for (var k = 0; k < shown.length; k++) removeClass(shown[k], 'lf-is-in');
        void root.offsetWidth;
        for (var m = 0; m < shown.length; m++) addClass(shown[m], 'lf-is-in');
      }
    }

    for (var i = 0; i < buttons.length; i++) {
      (function (b) {
        b.addEventListener('click', function () { apply(b); });
      })(buttons[i]);
    }

    moveInd();
    var t = null;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(moveInd, 80); });
    window.addEventListener('load', moveInd);
    /* font CMS bisa terlambat dimuat dan mengubah lebar tombol */
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) document.fonts.ready.then(moveInd);
  }

  /* ---------- Logo fitur: samakan ukuran visual ----------
     Ukur kotak isi logo (piksel non-transparan / berbeda dari warna latar),
     lalu skala supaya luas visual sama (akar luas = TARGET x tile) dan sisi terpanjang
     tidak lebih dari MAX_W / MAX_H x tile, dan pusatkan secara optis. */
  var LOGO_N = 160;
  var LOGO_TARGET = 0.56;
  var LOGO_MAX_W = 0.84;
  var LOGO_MAX_H = 0.74;

  function measureLogo(img) {
    var nw = img.naturalWidth || 1;
    var nh = img.naturalHeight || 1;
    var cv = document.createElement('canvas');
    cv.width = LOGO_N;
    cv.height = LOGO_N;
    var cx = cv.getContext('2d');
    if (!cx) return null;
    var r = Math.min(LOGO_N / nw, LOGO_N / nh);
    var dw = nw * r;
    var dh = nh * r;
    cx.drawImage(img, (LOGO_N - dw) / 2, (LOGO_N - dh) / 2, dw, dh);
    var d = cx.getImageData(0, 0, LOGO_N, LOGO_N).data; /* bisa throw bila cross-origin */

    function px(x, y) { var i = (y * LOGO_N + x) * 4; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; }
    function bbox(test) {
      var x0 = LOGO_N, y0 = LOGO_N, x1 = -1, y1 = -1;
      for (var y = 0; y < LOGO_N; y++) {
        for (var x = 0; x < LOGO_N; x++) {
          if (test(px(x, y))) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    }

    var b = bbox(function (p) { return p[3] > 16; });
    if (!b) return null;
    var full = b.w >= LOGO_N * 0.94 && b.h >= LOGO_N * 0.94;
    var mode = 'glyph';
    if (full) {
      /* logo punya latar penuh: putih -> buang latarnya, berwarna -> tampil sebagai tile */
      var c = px(2, 2);
      var white = c[3] > 200 && c[0] > 235 && c[1] > 235 && c[2] > 235;
      if (!white) return { mode: 'tile' };
      var inner = bbox(function (p) {
        return p[3] > 16 && (Math.abs(p[0] - c[0]) + Math.abs(p[1] - c[1]) + Math.abs(p[2] - c[2])) > 36;
      });
      if (!inner) return { mode: 'tile' };
      b = inner;
      mode = 'knock';
    }
    var area = Math.sqrt(b.w * b.h);
    var s = (LOGO_TARGET * LOGO_N) / area;
    s = Math.min(s, (LOGO_MAX_W * LOGO_N) / b.w, (LOGO_MAX_H * LOGO_N) / b.h);
    s = Math.max(0.4, Math.min(4, s));
    var fx = (b.x + b.w / 2) / LOGO_N - 0.5;
    var fy = (b.y + b.h / 2) / LOGO_N - 0.5;
    return { mode: mode, s: s, tx: -fx * s * 100, ty: -fy * s * 100 };
  }

  function initLogos(root) {
    var logos = toArray(root.querySelectorAll('.lf-logo'));

    function done(box) { removeClass(box, 'lf-is-pending'); }

    function fit(box, img) {
      var m = null;
      try { m = measureLogo(img); } catch (e) { m = null; }
      if (m && m.mode === 'tile') addClass(box, 'lf-is-tile');
      else if (m) {
        box.style.setProperty('--lf-ls', m.s.toFixed(3));
        box.style.setProperty('--lf-lx', m.tx.toFixed(2) + '%');
        box.style.setProperty('--lf-ly', m.ty.toFixed(2) + '%');
        addClass(box, 'lf-is-fit');
        if (m.mode === 'knock') addClass(box, 'lf-is-knock');
      }
      /* m null: tetap pakai fallback CSS (contain 44px) */
      done(box);
    }

    function bind(box) {
      var img = box.querySelector('.lf-logo__img');
      if (!img) { done(box); return; }
      var settled = false;
      function onLoad() { if (settled) return; settled = true; fit(box, img); }
      function onErr() { if (settled) return; settled = true; addClass(box, 'lf-is-err'); done(box); }
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onErr);
      if (img.complete) {
        if (img.naturalWidth || img.naturalHeight) onLoad();
        else if (img.src) onErr();
      }
      /* failsafe: jangan biarkan logo tersembunyi */
      setTimeout(function () { if (hasClass(box, 'lf-is-pending')) done(box); }, 4000);
    }

    for (var i = 0; i < logos.length; i++) bind(logos[i]);
  }

  /* ---------- Init ---------- */
  function init() {
    var root = findRoot();
    if (!root) {
      console.error(TAG + ' Element #' + ROOT_ID + ' / .lf-app tidak ditemukan. Tempel HTML di komponen HTML (bukan custom-css-js).');
      return;
    }
    if (root.getAttribute('data-lf-ready') === '1') return;
    root.setAttribute('data-lf-ready', '1');
    if (!root.id) {
      root.id = ROOT_ID;
      console.warn(TAG + ' id root dibuang AEM; fallback .lf-app aktif');
    }

    restoreIds(root);
    restoreData(root);
    restoreAria(root);

    initTheme(root);
    var isStatic = initEnv(root);

    initLogos(root);
    initReveal(root, isStatic);
    initFilters(root, isStatic);
    initTilt(root, isStatic);

    console.info(TAG + ' build ' + BUILD + ' - OK');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
