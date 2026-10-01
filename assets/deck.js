/* ODY Q&A 발표 덱 공통 스크립트 */
(function () {
  'use strict';

  /* ---------- 결정론적 난수 (별 배치가 새로고침마다 바뀌지 않도록) ---------- */
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /* ---------- 별 필드 ---------- */
  function paintSky(el) {
    const seed = parseInt(el.dataset.seed || '7', 10);
    const density = parseFloat(el.dataset.density || '1');
    const r = rng(seed * 2654435761);
    const w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    const cv = el.querySelector('canvas') || el.insertBefore(document.createElement('canvas'), el.firstChild);
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    const n = Math.round((w * h) / 5200 * density);
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = r() * h;
      const rad = 1.2 + r() * 3.4;
      const t = r();
      let col;
      if (t > 0.86) col = 'rgba(152,164,255,';
      else if (t > 0.72) col = 'rgba(195,202,255,';
      else col = 'rgba(214,218,238,';
      ctx.fillStyle = col + (0.18 + r() * 0.62) + ')';
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, 6.2832);
      ctx.fill();
    }
  }
  function paintAllSkies() {
    document.querySelectorAll('.sky').forEach(paintSky);
  }

  /* ---------- 스케일 ---------- */
  function fit() {
    const deck = document.querySelector('.deck');
    if (!deck) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const k = Math.min(vw / 1920, vh / 1080);
    const tx = (vw - 1920 * k) / 2, ty = (vh - 1080 * k) / 2;
    deck.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + k + ')';
  }

  /* ---------- 아래 여백 채우기 ----------
     장마다 남는 세로 공간을 재서 가장 큰 콘텐츠 블록을 그만큼 늘린다.
     (결론 바 · 각주 · 페이지 번호는 제외) */
  function fillSlide(slide) {
    const skip = '.head,.pnum,.concl,.note';
    const kids = Array.from(slide.children).filter(function (el) {
      return !el.matches(skip) && getComputedStyle(el).position !== 'absolute';
    });
    kids.forEach(function (k) { k.style.minHeight = ''; });
    if (!kids.length) return;
    const concl = slide.querySelector('.concl'), note = slide.querySelector('.note');
    let avail = slide.clientHeight - parseFloat(getComputedStyle(slide).paddingBottom);
    if (concl) avail = Math.min(avail, concl.offsetTop - 44);
    if (note) avail = Math.min(avail, note.offsetTop - 34);
    let bottom = 0, big = kids[0];
    kids.forEach(function (k) {
      bottom = Math.max(bottom, k.offsetTop + k.offsetHeight);
      if (k.offsetHeight > big.offsetHeight) big = k;
    });
    if (big.hasAttribute('data-nofill')) return;   // 이어지는 장표끼리 높이를 고정할 때
    const cs = getComputedStyle(big);
    if (cs.display === 'block') { big.style.display = 'grid'; big.style.alignContent = 'stretch'; }
    else if (cs.display === 'grid') big.style.alignContent = 'stretch';
    const extra = avail - bottom;
    if (extra > 4) big.style.minHeight = (big.offsetHeight + extra) + 'px';
  }

  /* ---------- 덱 내비게이션 ---------- */
  function initDeck(opts) {
    const slides = Array.from(document.querySelectorAll('.slide'));
    if (!slides.length) return;
    const total = slides.length;
    const counter = document.querySelector('.counter');
    const prevB = document.querySelector('[data-prev]');
    const nextB = document.querySelector('[data-next]');
    const prog = document.querySelector('.prog');
    let i = 0;
    // 홈에서 질문을 눌러 들어오면 ?r=5-7 → 그 질문의 장표만 (범위 밖으로는 안 넘어감)
    const rm = /^(\d+)-(\d*)$/.exec(new URLSearchParams(location.search).get('r') || '');
    const lo = rm ? Math.max(0, +rm[1] - 1) : 0;
    const hi = rm && rm[2] ? Math.min(total - 1, +rm[2] - 1) : total - 1;

    function show(n, instant) {
      n = Math.max(lo, Math.min(hi, n));
      i = n;
      slides.forEach(function (s, k) {
        s.classList.toggle('is-active', k === n);
      });
      // 애니메이션 재시작
      const cur = slides[n];
      cur.classList.remove('is-active');
      void cur.offsetWidth;
      cur.classList.add('is-active');
      fillSlide(cur);

      if (counter) counter.textContent = (n - lo + 1) + ' / ' + (hi - lo + 1);
      // 오른쪽 아래 장 번호도 이 질문 안에서 몇 번째인지로 (1 / 3)
      const pn = cur.querySelector('.pnum');
      if (pn) pn.textContent = (n - lo + 1) + ' / ' + (hi - lo + 1);
      if (prevB) prevB.disabled = n === lo;
      if (nextB) nextB.disabled = n === hi;
      if (prog) prog.style.width = ((n - lo + 1) / (hi - lo + 1) * 100) + '%';
      const h = '#s' + (n + 1);
      if (location.hash !== h) history.replaceState(null, '', h);
      paintAllSkies();
    }

    if (prevB) prevB.addEventListener('click', function () { show(i - 1); });
    if (nextB) nextB.addEventListener('click', function () { show(i + 1); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); show(i + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(i - 1); }
      else if (e.key === 'Home') show(lo);
      else if (e.key === 'End') show(hi);
      else if (e.key === 'Escape' && opts && opts.backHref) location.href = opts.backHref;
      else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen();
      }
    });

    // 클릭으로 넘기기 (오른쪽 2/3 = 다음, 왼쪽 1/3 = 이전)
    document.querySelector('.stage').addEventListener('click', function (e) {
      if (e.target.closest('button') || e.target.closest('a')) return;
      show(e.clientX < window.innerWidth / 3 ? i - 1 : i + 1);
    });

    // 시작 위치: #s12 해시 우선
    function fromHash() {
      const m = /^#s(\d+)$/.exec(location.hash);
      return m ? parseInt(m[1], 10) - 1 : lo;
    }
    show(fromHash());
    window.addEventListener('hashchange', function () {
      const n = fromHash();
      if (n !== i) show(n);
    });

    // 마우스 움직이면 잠깐 UI 노출
    let t;
    document.addEventListener('mousemove', function () {
      document.body.classList.add('show-ui');
      clearTimeout(t);
      t = setTimeout(function () { document.body.classList.remove('show-ui'); }, 1800);
    });
  }

  window.addEventListener('resize', function () { fit(); paintAllSkies(); });
  document.addEventListener('DOMContentLoaded', function () {
    fit();
    paintAllSkies();
    setTimeout(paintAllSkies, 120);
  });
  window.addEventListener('load', paintAllSkies);

  window.ODY = { initDeck: initDeck, fit: fit, paintAllSkies: paintAllSkies, rng: rng };
})();
