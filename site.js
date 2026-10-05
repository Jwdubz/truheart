/* Tru Heart Consulting — motion + form. GSAP 3.13 (ScrollTrigger, SplitText) + Lenis 1.3, vendored.
   Motion is mandatory. Start states live under html.m (set in the head). If JS or the libraries
   fail, .m is removed and every element shows its final state. One pause control covers WCAG 2.2.2. */
(function () {
  var d = document.documentElement;
  var motionOn = true;
  var vids = Array.prototype.slice.call(document.querySelectorAll('video'));
  var lenis = null;
  var TAU = 0.41;   /* Lenis smoothing time constant (s). lerp = 1/(60*tau). */

  /* Brand inquiry: no backend, so build a prefilled email. Nothing is sent automatically. */
  var form = document.getElementById('inquiry');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var v = function (id) { return document.getElementById(id).value.trim(); };
    var company = v('f-company');
    var body = ['Name: ' + v('f-name'), 'Company: ' + company, 'Work email: ' + v('f-email'), 'Phone: ' + v('f-phone'), '', 'What are you launching?', v('f-launch')].join('\r\n');
    window.location.href = 'mailto:careers@truheartconsultinginc.com?subject=' + encodeURIComponent('Brand inquiry — ' + company) + '&body=' + encodeURIComponent(body);
  });

  /* Film: autoplay muted loop. Explicit play() + retries. Honors the motion pause toggle. */
  function play(v) {
    if (!motionOn) return;
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    if (!v.paused) return;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function playAll() { if (!motionOn) return; vids.forEach(play); }
  function pauseVids() { vids.forEach(function (v) { v.pause(); }); }
  vids.forEach(function (v) {
    ['loadeddata', 'canplay', 'stalled'].forEach(function (ev) {
      v.addEventListener(ev, function () { if (!document.hidden) play(v); });
    });
  });
  playAll();
  if (document.readyState !== 'complete') addEventListener('load', playAll);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) playAll(); });
  ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'].forEach(function (ev) {
    addEventListener(ev, playAll, { passive: true, once: true });
  });

  /* Phones/tablets: hide the floating Pause/Play while no film or ticker is on screen so it never sits
     on cards, form fields or the footer. CSS applies .mt-away only under 1000px; desktop is unchanged. */
  (function () {
    var btn = document.getElementById('motion-toggle');
    if (!btn || !('IntersectionObserver' in window)) return;
    var watched = vids.slice();
    var util = document.querySelector('.util');
    if (util) watched.push(util);
    var seen = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen.set(en.target, en.isIntersecting); });
      var any = false;
      seen.forEach(function (on) { if (on) any = true; });
      btn.classList.toggle('mt-away', !any);
    }, { rootMargin: '20% 0px 20% 0px', threshold: 0 });
    watched.forEach(function (el) { io.observe(el); });
  })();

  if (!d.classList.contains('m') || !window.gsap || !window.ScrollTrigger || !window.SplitText) {
    d.classList.remove('m');
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  var E_OUT = 'power3.out', E_INOUT = 'power3.inOut';

  /* Smooth scroll (Lenis) on the GSAP ticker so ScrollTrigger stays in sync. */
  if (window.Lenis) {
    lenis = new Lenis({ autoRaf: false, anchors: false, lerp: 1 / (60 * TAU) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        var el = id === '#top' ? 0 : document.querySelector(id);
        if (el === null) return;
        e.preventDefault();
        lenis.scrollTo(el, { duration: 1.2 });
        if (el && el.focus) { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
      });
    });
  }

  /* WCAG 2.2.2: one control pauses videos, the ticker, Lenis and GSAP loops. */
  function setMotion(on) {
    motionOn = on;
    d.classList.toggle('motion-off', !on);
    var btn = document.getElementById('motion-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'false' : 'true');
      btn.setAttribute('aria-label', on ? 'Pause motion' : 'Play motion');
      btn.textContent = on ? 'Pause' : 'Play';
    }
    if (on) {
      gsap.ticker.wake();
      gsap.globalTimeline.play();
      if (lenis) lenis.start();
      playAll();
    } else {
      pauseVids();
      if (lenis) lenis.stop();
      gsap.globalTimeline.pause();
      gsap.ticker.sleep();
    }
  }
  var toggle = document.getElementById('motion-toggle');
  if (toggle) toggle.addEventListener('click', function () { setMotion(!motionOn); });

  /* Counters: tween from 0 to the value already in the markup. */
  function fmt(n, dec, prefix) {
    return (prefix || '') + n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function counter(el, delay) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), pre = el.dataset.prefix || '';
    var o = { v: 0 };
    el.textContent = fmt(0, dec, pre);
    return gsap.to(o, { v: to, duration: 1.6, delay: delay || 0, ease: 'power2.out',
      onUpdate: function () { el.textContent = fmt(dec ? o.v : Math.round(o.v), dec, pre); },
      onComplete: function () { el.textContent = fmt(to, dec, pre); } });
  }

  function boot() {
    var splits = [];
    document.querySelectorAll('[data-split]').forEach(function (el) {
      var s = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: false });
      s.masks && s.masks.forEach(function (m) { m.classList.add('split-mask'); });
      gsap.set(s.lines, { yPercent: 105 });
      el.style.visibility = 'visible';
      splits.push({ el: el, s: s });
    });

    var hero = splits.filter(function (x) { return x.el.classList.contains('h-hero'); })[0];
    var heroCount = document.querySelector('.film-cap [data-count]');
    var intro = gsap.timeline({ paused: true })
      .to('.hero .eyebrow', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0)
      .to(hero ? hero.s.lines : [], { yPercent: 0, duration: 1, ease: E_OUT, stagger: 0.08 }, 0.05)
      .to('.film-frame', { clipPath: 'inset(0% 0 0 0)', duration: 1.15, ease: E_INOUT }, 0.1)
      .to('.hero [data-reveal]', { opacity: 1, y: 0, duration: 0.9, ease: E_OUT, stagger: 0.1 }, 0.45)
      .to('.film-cap', { opacity: 1, duration: 0.6 }, 0.9)
      .add(function () { if (heroCount) counter(heroCount); }, 0.9);

    splits.forEach(function (x) {
      if (x === hero) return;
      gsap.to(x.s.lines, { yPercent: 0, duration: 1, ease: E_OUT, stagger: 0.08,
        scrollTrigger: { trigger: x.el, start: 'top 94%', once: true } });
    });
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      if (el.closest('.hero') || el.matches('.stat, .card, .rep')) return;
      var nums = el.querySelectorAll('[data-count]');
      gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: E_OUT,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true,
          onEnter: function () { nums.forEach(function (n) { counter(n, 0.1); }); } } });
    });
    ScrollTrigger.batch('.stat, .card, .rep', { start: 'top 88%', once: true, onEnter: function (b) {
      gsap.to(b, { opacity: 1, y: 0, duration: 0.9, ease: E_OUT, stagger: 0.1, overwrite: true });
      b.forEach(function (el, i) { el.querySelectorAll('[data-count]').forEach(function (n) { counter(n, 0.15 + i * 0.1); }); });
    } });

    gsap.fromTo('.ghost span', { xPercent: 6 }, { xPercent: -34, ease: 'none',
      scrollTrigger: { trigger: '.ghost', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.hero-text', { yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    if (matchMedia('(pointer: fine)').matches && innerWidth > 991) {
      d.classList.add('fine');
      var cur = document.querySelector('.cursor'), ring = cur.querySelector('.cursor-ring'), prog = cur.querySelector('.c-prog');
      /* Position on the outer node with left/top only. Scale lives on an inner node so grow/shrink can't shove the ring. */
      var x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, sc = 1, scT = 1, C = 125.66;
      var hoverSel = 'a,button,input,textarea,label,.card,.rep,.pill,.motion-toggle,[role="button"]';
      function overHot(t) { return !!(t && t.nodeType === 1 && t.closest && t.closest(hoverSel)); }
      addEventListener('pointermove', function (e) {
        x = e.clientX; y = e.clientY;
        scT = overHot(e.target) ? 1.55 : 1;
      }, { passive: true });
      addEventListener('pointerleave', function () { scT = 1; }, { passive: true });
      gsap.ticker.add(function () {
        /* Stick tight on hot targets so a lagging ring never looks dumped on the film. */
        var k = scT > 1 ? 0.45 : 0.18;
        cx += (x - cx) * k; cy += (y - cy) * k;
        sc += (scT - sc) * 0.22;
        cur.style.left = cx.toFixed(1) + 'px';
        cur.style.top = cy.toFixed(1) + 'px';
        ring.style.transform = 'scale(' + sc.toFixed(3) + ')';
        var max = document.documentElement.scrollHeight - innerHeight;
        prog.style.strokeDashoffset = (C * (1 - (max > 0 ? scrollY / max : 0))).toFixed(2);
      });
    }

    window.__thReady = true;

    var loader = document.querySelector('.loader');
    if (d.classList.contains('noload') || !loader) { intro.play(0); return; }
    var names = loader.querySelectorAll('.loader-list span'), pct = loader.querySelector('.loader-pct'), p = { v: 0 };
    gsap.set(names, { y: 0, yPercent: 100 });
    var tl = gsap.timeline({ onComplete: function () { loader.remove(); } });
    tl.to(p, { v: 100, duration: 1.5, ease: 'power1.inOut', onUpdate: function () { pct.textContent = Math.round(p.v); } }, 0);
    names.forEach(function (n, i) {
      tl.to(n, { yPercent: 0, duration: 0.42, ease: E_OUT }, i * 0.5);
      if (i < names.length - 1) tl.to(n, { yPercent: -100, duration: 0.42, ease: 'power2.in' }, i * 0.5 + 0.38);
    });
    tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: E_INOUT }, 1.6)
      .add(function () { intro.play(0); }, 1.85);
  }

  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
    try { boot(); } catch (err) { d.classList.remove('m'); if (window.console) console.error(err); }
  });
})();
