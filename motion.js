/* Wavetone Studio v5 — motion layer */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var desktop = window.matchMedia('(min-width: 768px)');
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var vh = window.innerHeight;
  window.addEventListener('resize', function () { vh = window.innerHeight; });

  /* ---------- 1. 페이지 전환 ---------- */
  function revealPage() { requestAnimationFrame(function () { root.classList.add('m-loaded'); }); }
  if (document.readyState !== 'loading') revealPage(); else document.addEventListener('DOMContentLoaded', revealPage);
  setTimeout(revealPage, 250);
  window.addEventListener('pageshow', function (e) { if (e.persisted) { root.classList.remove('m-leaving'); root.classList.add('m-loaded'); } });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
    if (a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel|https?):/i.test(href)) return;
    var url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    root.classList.add('m-leaving');
    setTimeout(function () { location.href = a.href; }, 160);
  });

  /* ---------- 2. 텍스트 분할 ---------- */
  var ci = 0;
  function splitChars(el) {
    ci = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          if (!n.nodeValue.trim()) return;
          var frag = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (word) {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(word)); return; }
            var w = document.createElement('span'); w.className = 'm-w';
            Array.from(word).forEach(function (ch) {
              var c = document.createElement('span'); c.className = 'm-c'; c.textContent = ch;
              c.style.setProperty('--i', ci++); w.appendChild(c);
            });
            frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('sr-only')) walk(n);
      });
    })(el);
  }
  function splitLines(el) {
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(function (p, i) { return '<span class="m-line"><span style="--i:' + i + '">' + p + '</span></span>'; }).join('');
  }
  var charTargets = $$('.wordmark, .wordmark-mobile, .display-xl, .page-title, .h-section, .gallery h2, .footer-slogan, .class-card h2, .tutor-card .name');
  var lineTargets = $$('.page-lede, .page-sub, .featured-lede, .vision p, .split .copy p');
  charTargets.forEach(function (el) { el.removeAttribute('data-reveal'); splitChars(el); });
  lineTargets.forEach(function (el) { el.removeAttribute('data-reveal'); splitLines(el); });

  /* ---------- 3. 이미지 래핑 ---------- */
  var imgs = $$('img').filter(function (img) {
    return !img.classList.contains('hero-slide') && !img.closest('.lightbox') && !img.closest('.m-img');
  });
  imgs.forEach(function (img) {
    var w = document.createElement('span'); w.className = 'm-img';
    img.parentNode.insertBefore(w, img); w.appendChild(img);
  });
  var mImgs = $$('.m-img');

  /* 표 행 */
  $$('.info-table tbody tr').forEach(function (tr, i) { tr.classList.add('m-row'); tr.style.setProperty('--i', i % 12); });

  /* ---------- 4. 뷰포트 진입 ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('m-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  charTargets.concat(lineTargets, $$('.m-row')).forEach(function (el) {
    if (el.closest('.hero')) return;
    io.observe(el);
  });
  /* 히어로 워드마크 — 로드 직후 */
  setTimeout(function () { $$('.hero .wordmark, .hero .wordmark-mobile').forEach(function (el) { el.classList.add('m-in'); }); }, reduce ? 0 : 450);
  if (reduce) $$('.m-c, .m-line, .m-img, .m-row').forEach(function (el) { el.classList.add('m-in'); });

  /* ---------- 5. 스크롤 연동 ---------- */
  var bar = document.createElement('div'); bar.className = 'm-progress'; document.body.appendChild(bar);
  var hero = document.querySelector('.hero');
  if (hero) {
    var cue = document.createElement('div'); cue.className = 'hero-scroll-cue'; cue.innerHTML = '<i></i><span>Scroll</span>';
    hero.appendChild(cue);
  }
  var heads = $$('.featured .display-xl');
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY, max = document.documentElement.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    /* 이미지 리빌: 다단 레이아웃에서 IO가 불안정해 스크롤 위치로 직접 판정 */
    for (var k = 0; k < mImgs.length; k++) {
      var w0 = mImgs[k];
      if (w0.classList.contains('m-in')) continue;
      var rr = w0.getBoundingClientRect();
      if (rr.top < vh * 0.94 && rr.bottom > 0) w0.classList.add('m-in');
    }
    if (reduce) return;
    if (hero) {
      var t = Math.min(1, y / vh);
      hero.style.setProperty('--hdim', (0.15 + t * 0.6).toFixed(3));
    }
    heads.forEach(function (h, i) {
      var r = h.getBoundingClientRect();
      var p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
      var dir = i === 0 ? -1 : 1;
      h.style.translate = (dir * p * 18).toFixed(2) + 'vw 0';
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();
  window.addEventListener('load', frame);
  setTimeout(frame, 600);

  if (reduce || !fine) return;

  /* ---------- 6. 마그네틱 ---------- */
  $$('.btn-outline, .hero-controls button, .inquiry-arrow, .nav-links a, .site-nav .brand, .hamburger').forEach(function (el) {
    el.classList.add('m-mag');
    var strength = el.classList.contains('inquiry-arrow') ? 0.18 : 0.35;
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.classList.add('m-mag-on');
      el.style.translate = (dx * strength).toFixed(1) + 'px ' + (dy * strength).toFixed(1) + 'px';
    });
    el.addEventListener('mouseleave', function () { el.classList.remove('m-mag-on'); el.style.translate = '0 0'; });
  });

})();
