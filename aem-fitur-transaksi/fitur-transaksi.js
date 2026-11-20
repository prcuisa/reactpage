/* ============================================================
   FITUR TRANSAKSI LIVIN (HIGH-TECH MOTION) - Script (ES5)
   Root: #appFiturTransaksi / .ft-app | semua query lewat root
   Color mode ikut atribut data-theme di tag html (light/dark/half)
   ============================================================ */
(function () {
  'use strict';

  var ROOT_ID = 'appFiturTransaksi';
  var BUILD = '2026-11-20';
  var TAG = '[FiturTransaksi]';

  /* Peta pemulih atribut aria/role (AEM bisa membuang aria-*, role) */
  var ARIA_MAP = {
    'ft-r-region': { 'role': 'region', 'aria-labelledby': 'ftTitle' },
    'ft-r-list': { 'role': 'list' },
    'ft-r-hide': { 'aria-hidden': 'true' }
  };

  function findRoot() {
    return document.getElementById(ROOT_ID) || document.querySelector('.ft-app');
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
      var m = (' ' + els[i].className + ' ').match(/ ft-id--([A-Za-z0-9_-]+) /);
      if (m && !els[i].id) els[i].id = m[1];
    }
  }

  function restoreData(root) {
    var els = allWithin(root);
    var re = / ft-x-([A-Za-z0-9_]+)(?:--([A-Za-z0-9_-]+))? /g;
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
    var m = (' ' + root.className + ' ').match(/ ft-mode-(light|dark|half) /);
    return m ? m[1] : '';
  }

  function cmsTheme() {
    var t = (document.documentElement.getAttribute('data-theme') || '').toLowerCase();
    return (t === 'light' || t === 'dark' || t === 'half') ? t : '';
  }

  function setMode(root, mode) {
    toggleClass(root, 'ft-theme-dark', mode === 'dark' || mode === 'half');
    toggleClass(root, 'ft-theme-half', mode === 'half');
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
      /* class paksa ft-mode-* ditambah/dicabut saat runtime */
      var moRoot = new MutationObserver(function () {
        var want = forcedMode(root);
        if (want !== root.getAttribute('data-ft-forced')) {
          root.setAttribute('data-ft-forced', want);
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
    toggleClass(root, 'ft-static', isStatic);
    return isStatic;
  }

  /* ---------- Motion masuk (reveal bertahap) ---------- */
  function initReveal(root, isStatic) {
    var items = toArray(root.querySelectorAll('.ft-item'));
    var head = root.querySelector('.ft-head');
    var targets = head ? [head].concat(items) : items;

    for (var i = 0; i < items.length; i++) {
      var idx = items[i].getAttribute('data-i');
      items[i].style.setProperty('--ft-i', idx !== null && idx !== '' ? idx : String(i));
    }

    if (isStatic || !('IntersectionObserver' in window)) return;

    addClass(root, 'ft-motion');

    /* failsafe: bila observer tidak pernah jalan, tampilkan semua */
    var failsafe = setTimeout(function () {
      if (!root.querySelector('.ft-is-in')) removeClass(root, 'ft-motion');
    }, 3000);

    var pending = targets.slice();
    var ticking = false;

    function reveal(el) {
      addClass(el, 'ft-is-in');
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
    var cards = toArray(root.querySelectorAll('.ft-card'));
    var MAX = 6;

    function bind(card) {
      var raf = 0;
      var px = 0.5;
      var py = 0;

      function paint() {
        raf = 0;
        card.style.setProperty('--ft-mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--ft-my', (py * 100).toFixed(1) + '%');
        if (fine && !isStatic) {
          card.style.setProperty('--ft-rx', ((0.5 - py) * MAX).toFixed(2) + 'deg');
          card.style.setProperty('--ft-ry', ((px - 0.5) * MAX).toFixed(2) + 'deg');
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
        card.style.setProperty('--ft-rx', '0deg');
        card.style.setProperty('--ft-ry', '0deg');
      }

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);

      /* state hover/fokus lewat class (bukan :hover / :focus-within), supaya
         kartu terakhir yang diklik atau di-tap tidak tertahan dalam efek hover */
      card.addEventListener('mouseenter', function () { if (fine) addClass(card, 'ft-is-hover'); });
      card.addEventListener('mouseleave', function () { removeClass(card, 'ft-is-hover'); });
      card.addEventListener('focusin', function (e) {
        var t = e.target;
        var kbd = lastKey;
        try { kbd = t.matches(':focus-visible'); } catch (err) { kbd = lastKey; }
        toggleClass(card, 'ft-is-kbd', !!kbd);
      });
      card.addEventListener('focusout', function () { removeClass(card, 'ft-is-kbd'); });
      card.addEventListener('click', function () { removeClass(card, 'ft-is-kbd'); });
    }

    var lastKey = false;
    document.addEventListener('keydown', function () { lastKey = true; }, true);
    document.addEventListener('mousedown', function () { lastKey = false; }, true);
    document.addEventListener('touchstart', function () { lastKey = false; }, true);

    /* kembali lewat tombol Back (bfcache): bersihkan sisa state */
    window.addEventListener('pageshow', function () {
      for (var k = 0; k < cards.length; k++) {
        removeClass(cards[k], 'ft-is-hover');
        removeClass(cards[k], 'ft-is-kbd');
        cards[k].style.setProperty('--ft-rx', '0deg');
        cards[k].style.setProperty('--ft-ry', '0deg');
      }
    });

    for (var i = 0; i < cards.length; i++) bind(cards[i]);
  }

  /* ---------- Init ---------- */
  function init() {
    var root = findRoot();
    if (!root) {
      console.error(TAG + ' Element #' + ROOT_ID + ' / .ft-app tidak ditemukan. Tempel HTML di komponen HTML (bukan custom-css-js).');
      return;
    }
    if (root.getAttribute('data-ft-ready') === '1') return;
    root.setAttribute('data-ft-ready', '1');
    if (!root.id) {
      root.id = ROOT_ID;
      console.warn(TAG + ' id root dibuang AEM; fallback .ft-app aktif');
    }

    restoreIds(root);
    restoreData(root);
    restoreAria(root);

    initTheme(root);
    var isStatic = initEnv(root);

    initReveal(root, isStatic);
    initTilt(root, isStatic);

    console.info(TAG + ' build ' + BUILD + ' - OK');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
