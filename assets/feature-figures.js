/* 02 기능 덱 — 절차적으로 그리는 도식들 (결정론적) */
(function () {
  'use strict';
  const R = ODY.rng;
  const $ = function (id) { return document.getElementById(id); };
  const svg = function (tag, attrs) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };

  /* ---------- 스켈레톤 목록 ---------- */
  function skeleton(el, n, seed) {
    if (!el) return;
    const r = R(seed);
    let h = '';
    for (let i = 0; i < n; i++) {
      h += '<div class="sk-row" data-a="fu" style="--d:' + (0.6 + i * 0.05).toFixed(2) + 's">' +
           '<i></i><span style="width:' + (62 + Math.round(r() * 30)) + '%"></span></div>';
    }
    el.innerHTML = h;
  }
  skeleton($('s2-sk'), 10, 5);

  /* ---------- S2 : 내 곡 + 이웃 10곡 ---------- */
  (function () {
    const rays = $('s2-rays'), nodes = $('s2-nodes');
    if (!rays) return;
    const cx = 450, cy = 285;
    const pts = [[-150,-58],[-96,-108],[-18,-122],[70,-104],[142,-56],[158,22],[104,86],[16,116],[-74,104],[-146,44]];
    pts.forEach(function (p, i) {
      const x = cx + p[0], y = cy + p[1];
      const ln = svg('line', {x1:cx, y1:cy, x2:x, y2:y});
      ln.setAttribute('data-draw', '');
      ln.style.setProperty('--len', '220');
      ln.style.setProperty('--d', (0.75 + i * 0.07).toFixed(2) + 's');
      rays.appendChild(ln);
      const halo = svg('circle', {cx:x, cy:y, r:20, fill:'#2AA38B', opacity:'.28'});
      const c = svg('circle', {cx:x, cy:y, r:11, fill:'#2AD3AE'});
      [halo, c].forEach(function (n) {
        n.setAttribute('data-a', 'pop');
        n.style.setProperty('--d', (0.95 + i * 0.07).toFixed(2) + 's');
        nodes.appendChild(n);
      });
    });
  })();

  /* ---------- S3 : 469만 번 전수 비교 ---------- */
  (function () {
    const g = $('s3-rays');
    if (!g) return;
    const r = R(313), cx = 450, cy = 285;
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2 + r() * 0.13;
      const d = 170 + r() * 230;
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.62;
      const ln = svg('line', {x1:cx, y1:cy, x2:x.toFixed(1), y2:y.toFixed(1)});
      ln.setAttribute('data-draw', '');
      ln.style.setProperty('--len', '420');
      ln.style.setProperty('--d', (0.4 + i * 0.012).toFixed(2) + 's');
      g.appendChild(ln);
      g.appendChild(svg('circle', {cx:x.toFixed(1), cy:y.toFixed(1), r:(3 + r() * 3).toFixed(1), fill:'#F09D6B', opacity:'.85'}));
    }
  })();

  /* ---------- S4 : HNSW 레이어 점 ---------- */
  (function () {
    const g = $('s4-dots');
    if (!g) return;
    const r = R(409);
    const layers = [[110, 6], [250, 12], [390, 26]];
    layers.forEach(function (L, li) {
      const yb = L[0], n = L[1];
      for (let i = 0; i < n; i++) {
        const t = r();
        const x = 90 + t * 640;
        const y = yb - t * 46 + (r() - 0.5) * 30;
        const c = svg('circle', {cx:x.toFixed(1), cy:y.toFixed(1), r:(4 + r() * 2.5).toFixed(1), fill:'#A8ACC0'});
        c.setAttribute('data-a', 'fi');
        c.style.setProperty('--d', (0.35 + li * 0.12).toFixed(2) + 's');
        g.appendChild(c);
      }
    });
  })();

  /* ---------- S5 / S6 : 이웃 16곡 타일 ---------- */
  const TILES = [
    {nm:'자기 자신', rs:'자기 자신', col:'#1B1E3A', out:true},
    {nm:'같은 녹음', rs:'거리 < 1.66', col:'#2C3057', dup:true, out:true},
    {nm:'가수 A', col:'#5B67E8'},
    {nm:'가수 B', col:'#B79BF0'},
    {nm:'같은 녹음', rs:'거리 < 1.66', col:'#2C3057', dup:true, out:true},
    {nm:'가수 A', col:'#5B67E8'},
    {nm:'20초 효과음', rs:'30초 미만', col:'#8F94AA', out:true},
    {nm:'가수 A', col:'#5B67E8'},
    {nm:'가수 C', col:'#2AA38B'},
    {nm:'가수 A (4번째)', rs:'같은 가수 3곡 초과', col:'#5B67E8', out:true},
    {nm:'가수 D', col:'#4F8FE8'},
    {nm:'가수 B', col:'#B79BF0'},
    {nm:'가수 E', col:'#F5B971'},
    {nm:'가수 C', col:'#2AA38B'},
    {nm:'가수 D', col:'#4F8FE8'},
    {nm:'가수 B', col:'#B79BF0'}
  ];
  const KEPT = {2:1, 3:2, 5:3, 7:4, 8:5, 10:6, 11:7, 12:8, 13:9, 14:10};

  function renderTiles(el, marked) {
    if (!el) return;
    el.innerHTML = TILES.map(function (t, i) {
      const cls = ['tile'];
      let mark = '';
      if (marked) {
        if (KEPT[i] !== undefined) { cls.push('keepc'); mark = '<span class="badge">' + KEPT[i] + '</span>'; }
        else if (t.out) mark = '<span class="mk" style="color:var(--orange)">✕</span>';
        else cls.push('dim');
      } else if (t.out) cls.push('out');
      const stop = (marked && i === 15) ? '<div class="rs" style="color:var(--ink2)">여기서 멈춤</div>' : '';
      const ball = (marked && t.col === '#8F94AA') ? '#8F94AA' : t.col;
      return '<div class="' + cls.join(' ') + '" data-a="fu" style="--d:' + (0.3 + i * 0.035).toFixed(2) + 's">' +
        '<span class="idx">' + (i + 1) + '</span>' + mark +
        '<span class="ball' + (t.dup ? ' dup' : '') + '" style="background:' + (marked && !KEPT[i] && !t.out ? '#C8CBD8' : ball) + '"></span>' +
        '<div class="nm">' + t.nm + '</div>' +
        (t.rs ? '<div class="rs">' + t.rs + '</div>' : '') + stop +
        '</div>';
    }).join('');
  }
  renderTiles($('s5-grid'), false);
  renderTiles($('s6-grid'), true);

  /* ---------- S4 / S5 : 흘러가는 목록 상자 ---------- */
  (function () {
    const cols = ['#5B67E8', '#B79BF0', '#2AA38B', '#4F8FE8', '#F5B971', '#98A4FF', '#7FD6C4'];
    function scrollRows(seed, n) {
      const r = R(seed); let html = '', i = 0, prev = null;
      function row(k, col, w1, w2, cls, tag) {
        return '<div class="pr' + (cls ? ' odd ' + cls : '') + '"><span class="rk">' + k + '</span><i class="dt' + (cls ? ' ' + cls : '') + '" style="--c:' + col + '"></i>' +
          '<span class="bars"><i class="t" style="width:' + w1 + '%"></i><i class="a" style="width:' + w2 + '%"></i></span><span class="tg">' + (tag || '') + '</span></div>';
      }
      // 고정 패턴 (24행 주기, 회색 10행) — 어느 시점에 보이는 창(≈11행)에도 세 종류가 다 들어가도록
      const PAT = 'n d n R s n d R n s d n R s d';
      const seq = PAT.split(' ');
      let p = 0;
      while (i < n) {
        const t = seq[p++ % seq.length];
        if (t === 'd' && prev) {                      // 같은 곡 다른 버전: 바로 위 행 복제
          html += row(i + 1, prev.col, prev.w1, prev.w2, 'dup', '같은 녹음'); i++;
        } else if (t === 'R') {                       // 한 가수 4연속
          const c = cols[Math.floor(r() * cols.length)];
          for (let k = 0; k < 4 && i < n; k++, i++) {
            const w1 = (45 + r() * 45) | 0, w2 = (25 + r() * 35) | 0;
            html += row(i + 1, c, w1, w2, k === 3 ? 'x' : '', k === 3 ? '같은 가수 4번째' : '');
            prev = {col:c, w1:w1, w2:w2};
          }
        } else if (t === 's') {                       // 효과음
          html += row(i + 1, '#8F94AA', 14, 10, 'sfx', '효과음'); i++;
        } else {
          const c = cols[Math.floor(r() * cols.length)], w1 = (45 + r() * 45) | 0, w2 = (25 + r() * 35) | 0;
          html += row(i + 1, c, w1, w2, '', ''); prev = {col:c, w1:w1, w2:w2}; i++;
        }
      }
      return html;
    }
    const a = $('sc-a'), b = $('sc-b');
    if (a) { const h = scrollRows(505, 40); a.innerHTML = h + h; }   // 두 번 이어 붙여 무한 루프
    if (b) { const h = scrollRows(505, 40); b.innerHTML = h + h; }

    /* S5 : 회색 아닌 행이 위에서부터 연보라로 켜지며 네모 10개가 찬다 */
    const sec = $('sl-filter'), box = $('sc-box'), grid = $('sq10'), cnt = $('sq-cnt');
    if (!sec || !grid) return;
    grid.innerHTML = Array.from({length:10}, function () { return '<div class="sq"></div>'; }).join('');
    const sqs = grid.children;
    let timers = [];
    function reset() {
      timers.forEach(clearTimeout); timers = [];
      box.querySelectorAll('.pr.pick').forEach(function (p) { p.classList.remove('pick'); });
      Array.from(sqs).forEach(function (q) { q.classList.remove('on'); });
      cnt.textContent = '0';
    }
    function pick(k) {
      const B = box.getBoundingClientRect(), top = B.top + B.height * .15, bot = B.bottom - B.height * .15;
      const row = Array.from(box.querySelectorAll('.pr:not(.odd):not(.pick)')).find(function (p) {
        const r = p.getBoundingClientRect(); return r.top >= top && r.bottom <= bot;
      });
      if (row) row.classList.add('pick');
      sqs[k].classList.add('on');
      cnt.textContent = k + 1;
    }
    function run() {
      reset();
      for (let k = 0; k < 10; k++) timers.push(setTimeout(function () { pick(k); }, 700 + k * 330));
    }
    new MutationObserver(function () {
      if (sec.classList.contains('is-active')) run(); else reset();
    }).observe(sec, {attributes:true, attributeFilter:['class']});
    if (sec.classList.contains('is-active')) run();
  })();

  /* ---------- S7 / S8 : 3D 배경 별 (카메라가 돌 때 시차) ---------- */
  document.querySelectorAll('.orb[data-bgd]').forEach(function (orb) {
    const r = R(parseInt(orb.dataset.bgd, 10));
    let h = '';
    for (let i = 0; i < 44; i++) {
      h += '<i class="bgd" style="--x:' + Math.round((r() - .5) * 2000) + 'px;--y:' + Math.round((r() - .5) * 700) +
        'px;--z:' + Math.round(-1300 + r() * 1700) + 'px;--r:' + (5 + r() * 6).toFixed(1) + 'px;opacity:' + (.4 + r() * .5).toFixed(2) + '"></i>';
    }
    orb.insertAdjacentHTML('afterbegin', h);
  });

  /* ---------- S15 / S16 : kNN 그래프 배경 ---------- */
  function knnWeb(g, seed) {
    if (!g) return;
    const r = R(seed);
    const pts = [];
    for (let i = 0; i < 52; i++) pts.push([90 + r() * 1480, 60 + r() * 400]);
    pts.forEach(function (p) {
      let best = null, bd = 1e9;
      pts.forEach(function (q) {
        if (q === p) return;
        const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
        if (d < bd) { bd = d; best = q; }
      });
      if (best) g.appendChild(svg('line', {x1:p[0].toFixed(0), y1:p[1].toFixed(0), x2:best[0].toFixed(0), y2:best[1].toFixed(0)}));
      g.appendChild(svg('circle', {cx:p[0].toFixed(0), cy:p[1].toFixed(0), r:3.5, fill:'#7A80AE', stroke:'none'}));
    });
  }
  knnWeb($('s15-web'), 811);
  knnWeb($('s16-web'), 811);

  /* ---------- S18 / S19 : 정거장 후보 60곡 ---------- */
  function candidates(g, seed, stations, fade) {
    if (!g) return;
    const r = R(seed);
    stations.forEach(function (s, si) {
      for (let i = 0; i < 26; i++) {
        const a = r() * Math.PI * 2, d = r() * 92;
        const x = s[0] + Math.cos(a) * d, y = s[1] + Math.sin(a) * d * 0.95;
        const c = svg('circle', {cx:x.toFixed(1), cy:y.toFixed(1), r:(4 + r() * 4).toFixed(1), fill:'#D7DAEA', opacity:(fade ? .35 : (.45 + r() * .4)).toFixed(2)});
        c.setAttribute('data-a', 'fi');
        c.style.setProperty('--d', (0.45 + si * 0.18).toFixed(2) + 's');
        g.appendChild(c);
      }
    });
  }
  candidates($('s18-cand'), 907, [[510,243],[812,236],[1114,229]], false);
  candidates($('s19-cand'), 907, [[510,243],[812,236],[1114,229]], true);

  /* ---------- S20 : 전수 탐색 vs DP ---------- */
  (function () {
    const cols = [[150,5],[260,5],[380,5],[500,5]];
    const ys = [40,105,170,235,290];
    function lattice(g, full, color) {
      if (!g) return;
      const pts = cols.map(function (c) { return ys.map(function (y) { return [c[0], y]; }); });
      g.appendChild(svg('circle', {cx:60, cy:165, r:18, fill:'#14162A'}));
      const t = svg('text', {x:60, y:173, 'font-size':20, 'font-weight':800, fill:'#fff', 'text-anchor':'middle'});
      t.textContent = 'A'; g.appendChild(t);
      pts[0].forEach(function (p) { g.appendChild(svg('line', {x1:78, y1:165, x2:p[0], y2:p[1], stroke:color, 'stroke-width':1.3, opacity:.85})); });
      for (let ci = 0; ci < pts.length - 1; ci++) {
        pts[ci].forEach(function (p, pi) {
          if (full) pts[ci+1].forEach(function (q) { g.appendChild(svg('line', {x1:p[0], y1:p[1], x2:q[0], y2:q[1], stroke:color, 'stroke-width':1.1, opacity:.75})); });
          else { const q = pts[ci+1][pi]; g.appendChild(svg('line', {x1:p[0], y1:p[1], x2:q[0], y2:q[1], stroke:color, 'stroke-width':1.6, opacity:.9})); }
        });
      }
      pts.forEach(function (col) { col.forEach(function (p) { g.appendChild(svg('circle', {cx:p[0], cy:p[1], r:8.5, fill:color})); }); });
      g.setAttribute('data-a', 'fi');
      g.style.setProperty('--d', '.55s');
    }
    lattice($('s20-full'), true, '#F09D6B');
    lattice($('s20-dp'), false, '#5B67E8');
  })();

  /* ---------- S23 / S24 : 별자리 ---------- */
  function constellation(g, pts, color, extra, seed) {
    if (!g) return;
    const r = R(seed);
    for (let i = 0; i < 26; i++) g.appendChild(svg('circle', {cx:(g.dataset.x0*1 + r()*620).toFixed(0), cy:(40 + r()*380).toFixed(0), r:(1.6+r()*2.6).toFixed(1), fill:'#8F96C9', opacity:(.3+r()*.5).toFixed(2)}));
    // 별 하나 → 다음 별까지 선 → 별 … 순서로 그려진다 (별자리 긋듯이)
    // 오른쪽(+1곡 뒤)은 왼쪽이 다 그려지고 새 별이 뜬 다음에 그린다
    const STEP = 0.15, T0 = extra ? 1.7 : 0.4;
    pts.forEach(function (q, i) {
      const t = T0 + i * STEP;
      const st = svg('g', {});
      st.appendChild(svg('circle', {cx:q[0], cy:q[1], r:20, fill:color, opacity:.26}));
      st.appendChild(svg('circle', {cx:q[0], cy:q[1], r:12, fill:color}));
      st.setAttribute('data-a', 'fi'); st.style.setProperty('--d', t.toFixed(2) + 's'); st.style.animationDuration = '.12s';
      g.appendChild(st);
      if (i < pts.length - 1) {
        const n = pts[i + 1], len = Math.hypot(n[0] - q[0], n[1] - q[1]);
        const ln = svg('line', {x1:q[0], y1:q[1], x2:n[0], y2:n[1], stroke:color, 'stroke-width':3});
        ln.setAttribute('data-draw', ''); ln.style.setProperty('--len', len.toFixed(0));
        ln.style.setProperty('--d', (t + 0.05).toFixed(2) + 's'); ln.style.animationDuration = '.14s';
        g.appendChild(ln);
      }
    });
    if (extra) {
      const st = svg('g', {});
      st.appendChild(svg('circle', {cx:extra[0], cy:extra[1], r:20, fill:'#fff', opacity:.2}));
      st.appendChild(svg('circle', {cx:extra[0], cy:extra[1], r:12, fill:'#fff'}));
      st.setAttribute('data-a', 'fi'); st.style.setProperty('--d', '1.4s');
      g.appendChild(st);
    }
  }
  const SHAPE_A = [[110,300],[200,180],[300,225],[400,290],[350,370],[210,350]];
  const SHAPE_B = [[110,300],[168,178],[228,262],[258,352],[352,205],[420,268]];
  function shift(pts, dx) { return pts.map(function (p) { return [p[0] + dx, p[1]]; }); }
  (function () {
    const a = $('s23-a'), b = $('s23-b');
    if (a) { a.dataset.x0 = 40; constellation(a, shift(SHAPE_A, 60), '#F09D6B', null, 1009); }
    if (b) { b.dataset.x0 = 960; constellation(b, shift(SHAPE_B, 980), '#F09D6B', [1000, 352], 1013); }
  })();
  (function () {
    const a = $('s24-a'), b = $('s24-b');
    if (a) { a.dataset.x0 = 40; constellation(a, shift(SHAPE_A, 60), '#2AD3AE', null, 1009); }
    if (b) { b.dataset.x0 = 960; constellation(b, shift(SHAPE_A, 980), '#2AD3AE', [1420, 355], 1013); }
  })();

  /* ---------- S21 / S22 : 어두운 패널 안 격자 + 화면 프레임 + 아바타 + 던지는 신호 ---------- */
  function gridScene(g, o) {
    if (!g) return;
    const C = o.c || 96, GAP = 10, X0 = 80, Y0 = o.y0 || 40, ST = C + GAP;
    const at = function (p) { return [X0 + (p[0] - .5) * ST - GAP / 2, Y0 + (p[1] - .5) * ST - GAP / 2]; };
    const inBox = function (p, b) { return p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3]; };
    for (let y = 1; y <= 5; y++) for (let x = 1; x <= 8; x++) {
      let cls = 'cell';
      const p = [x, y], now = inBox(p, o.frame), next = o.next && inBox(p, o.next);
      if (o.next) { if (now && next) cls += ' in'; else if (next) cls += ' fresh'; else if (now) cls += ' drop'; }
      else if (now) cls += ' in';
      g.appendChild(svg('rect', {x:X0 + (x - 1) * ST, y:Y0 + (y - 1) * ST, width:C, height:C, rx:16, class:cls}));
    }
    const f = o.frame;
    g.appendChild(svg('rect', {x:X0 + (f[0] - 1) * ST - 7, y:Y0 + (f[1] - 1) * ST - 7, width:(f[2] - f[0] + 1) * ST - GAP + 14, height:(f[3] - f[1] + 1) * ST - GAP + 14, rx:22, class:'frame'}));
    if (o.screen) {                                             // 실제 화면(뷰포트) 테두리
      const sc = o.screen, x1 = X0 + (sc[0] - 1) * ST, y1 = Y0 + (sc[1] - 1) * ST, x2 = X0 + (sc[2] - 1) * ST, y2 = Y0 + (sc[3] - 1) * ST;
      const r = svg('rect', {x:x1, y:y1, width:x2 - x1, height:y2 - y1, rx:18, class:'scr'});
      r.setAttribute('data-draw', ''); r.style.setProperty('--len', (2 * (x2 - x1 + y2 - y1)).toFixed(0)); r.style.setProperty('--d', (o.screenD || 1) + 's');
      g.appendChild(r);
    }
    function avatar(x, y, col, r, cls, show) {
      const gg = svg('g', {class:cls || ''});
      if (show != null) { gg.setAttribute('data-a', 'fi'); gg.style.setProperty('--d', show + 's'); }
      gg.appendChild(svg('circle', {cx:x, cy:y, r:r * 1.45, fill:col, opacity:.22}));
      gg.appendChild(svg('circle', {cx:x, cy:y, r:r, fill:col, stroke:'#fff', 'stroke-width':r * .1, 'stroke-opacity':.85}));
      gg.appendChild(svg('circle', {cx:x, cy:y - r * .2, r:r * .24, fill:'#fff'}));
      gg.appendChild(svg('path', {d:'M' + (x - r * .44) + ' ' + (y + r * .62) + 'a' + (r * .44) + ' ' + (r * .44) + ' 0 0 1 ' + (r * .88) + ' 0z', fill:'#fff'}));
      g.appendChild(gg);
    }
    const B = [1330, 300];                                        // 오른쪽 파란 사람
    o.people.forEach(function (p, i) {
      const q = at(p.at);
      for (let k = 0; k < (p.dim ? 0 : 2); k++) {                 // 신호 2개씩 엇갈려 계속 (dim 은 안 보냄)
        const pos = svg('g', {transform:'translate(' + (B[0] - 60) + ',' + (B[1] - 10) + ')'});
        const pk = svg('g', {class:'pk' + (p.cls ? ' once ' + p.cls : '')});
        pk.style.setProperty('--tx', (q[0] + 44 - (B[0] - 60)).toFixed(0) + 'px');
        pk.style.setProperty('--ty', (q[1] - 10 - (B[1] - 10)).toFixed(0) + 'px');
        pk.style.setProperty('--d', ((p.t0 != null ? p.t0 : o.t0) + i * .3 + k * .75).toFixed(2) + 's');
        const py = svg('g', {class:'pky'});
        py.appendChild(svg('circle', {r:18, fill:'#fff', opacity:.28}));
        py.appendChild(svg('circle', {r:8, fill:'#fff'}));
        pk.appendChild(py); pos.appendChild(pk); g.appendChild(pos);
      }
      avatar(q[0], q[1], p.col, 34, (p.cls || '') + (p.dim ? ' dim' : ''), p.show);
    });
    avatar(B[0], B[1], '#4F8FE8', 50);
  }
  gridScene($('s21-gs'), {frame:[3,3,6,5], t0:1.0, people:[{at:[4,3], col:'#F5B971'}, {at:[5,5], col:'#2AD3AE'}]});
  // 22쪽 끝 장면(프레임 1~3행, 노랑) 그대로 → 사람이 더 생기고 → 실제 화면 테두리 → 화면 안 사람에게만
  gridScene($('s23-gs'), {frame:[3,1,6,3], screen:[3.55,1.3,5.6,3.35], screenD:1.4, t0:0.2, people:[
    {at:[4,3], col:'#F5B971'},
    {at:[5.05,1.7], col:'#2AD3AE', show:.6, t0:2.2},
    {at:[3.35,1.3], col:'#8A5FE0', show:.75, dim:true},
    {at:[5.9,2.9], col:'#4F8FE8', show:.9, dim:true}]});
  gridScene($('s22-gs'), {frame:[3,3,6,5], next:[3,1,6,3], t0:0.2, people:[{at:[4,3], col:'#F5B971'}, {at:[5,5], col:'#2AD3AE', cls:'gr'}]});

  /* ---------- S32 : 들어옴 / 움직임 / 나감 ---------- */
  function miniGrid(el, view, from, to, color) {
    if (!el) return;
    let h = '';
    for (let y = 1; y <= 5; y++) for (let x = 1; x <= 6; x++) {
      const k = x + ',' + y;
      h += '<div class="cell' + (view.indexOf(k) >= 0 ? ' on' : '') + '"></div>';
    }
    el.innerHTML = h;
    el.style.position = 'relative';
    const ov = document.createElement('div');
    ov.style.cssText = 'position:absolute;inset:0;pointer-events:none';
    const cw = 100 / 6, ch = 100 / 5;
    const px = function (p) { return [(p[0] - 0.5) * cw, (p[1] - 0.5) * ch]; };
    const a = px(from), b = px(to);
    ov.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">' +
      '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + color + '" stroke-width="1" vector-effect="non-scaling-stroke" style="stroke-width:2.6px"/></svg>' +
      '<span style="position:absolute;left:' + a[0] + '%;top:' + a[1] + '%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:#B98A5E;opacity:.75"></span>' +
      '<span style="position:absolute;left:' + b[0] + '%;top:' + b[1] + '%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:#F09D6B"></span>';
    el.appendChild(ov);
  }
  const VIEW5 = ['2,2','3,2','4,2','2,3','3,3','4,3','2,4','3,4','4,4'];
  miniGrid($('s32-a'), VIEW5, [1,5], [3,2], '#2AD3AE');
  miniGrid($('s32-b'), VIEW5, [2,2], [4,4], '#5B67E8');
  miniGrid($('s32-c'), VIEW5, [3,2], [6,4], '#F09D6B');

  /* ---------- S34 : 한 명씩 vs 칸별 숫자 ---------- */
  (function () {
    const a = $('s34-a');
    if (a) {
      const dots = {'4,1':'#4FBF7E','2,2':'#E86B6B','5,3':'#8A5FE0','4,4':'#4F8FE8','1,5':'#8A5FE0','3,5':'#4FBF7E','6,6':'#F09D6B'};
      let h = '';
      for (let y = 1; y <= 6; y++) for (let x = 1; x <= 6; x++) {
        const k = x + ',' + y;
        h += '<div class="cell keep" style="position:relative">' + (dots[k] ? '<span style="position:absolute;inset:28%;border-radius:50%;background:' + dots[k] + '"></span>' : '') + '</div>';
      }
      a.innerHTML = h;
    }
    const b = $('s34-b');
    if (b) {
      const nums = [[null,3,12,5,null,1],[8,25,40,9,2,null],[4,18,33,14,6,1],[null,7,11,21,3,null],[2,null,5,9,4,1],[null,1,null,2,null,null]];
      let h = '';
      nums.forEach(function (row) {
        row.forEach(function (v) {
          const hot = v >= 18;
          h += '<div class="cell keep" style="display:grid;place-items:center;font-size:22px;font-weight:800;color:' + (hot ? '#F09D6B' : '#98A4FF') + '">' + (v == null ? '' : v) + '</div>';
        });
      });
      b.innerHTML = h;
    }
  })();

  /* ---------- S35 : 주변 사람 패널 ---------- */
  (function () {
    const g = $('s35-people');
    if (!g) return;
    const r = R(1117), cx = 830, cy = 285;
    function person(x, y, s, col, op) {
      const gg = svg('g', {transform:'translate(' + x.toFixed(0) + ',' + y.toFixed(0) + ') scale(' + s + ')', opacity:op});
      gg.appendChild(svg('circle', {cx:14, cy:10, r:10, fill:col}));
      gg.appendChild(svg('path', {d:'M0 40a14 14 0 0128 0z', fill:col}));
      return gg;
    }
    for (let i = 0; i < 22; i++) {
      const x = 90 + r() * 1460, y = 70 + r() * 400;
      if (Math.abs(x - cx) < 250 && Math.abs(y - cy) < 200) continue;
      g.appendChild(person(x, y, .85 + r() * .4, '#6B7199', .55));
      g.appendChild(svg('circle', {cx:(80 + r()*1500).toFixed(0), cy:(50 + r()*460).toFixed(0), r:(2+r()*3).toFixed(1), fill:'#8F96C9', opacity:.5}));
    }
    const near = [[-250,-90],[-200,60],[-120,150],[-40,170],[40,140],[110,80],[130,-10],[90,-110],[10,-140],[-90,-150],[-170,-40],[60,40]];
    near.forEach(function (p, i) {
      const x = cx + p[0], y = cy + p[1];
      const ln = svg('line', {x1:cx, y1:cy, x2:x, y2:y, stroke:'#2AD3AE', 'stroke-width':1.8, opacity:.9});
      ln.setAttribute('data-draw',''); ln.style.setProperty('--len', '300'); ln.style.setProperty('--d', (0.55 + i * 0.05).toFixed(2) + 's');
      g.appendChild(ln);
      const pp = person(x - 14, y - 22, 1, '#2AD3AE', 1);
      pp.setAttribute('data-a', 'pop'); pp.style.setProperty('--d', (0.7 + i * 0.05).toFixed(2) + 's');
      g.appendChild(pp);
    });
    g.appendChild(svg('circle', {cx:cx, cy:cy, r:28, fill:'#fff', opacity:.22}));
    g.appendChild(svg('circle', {cx:cx, cy:cy, r:16, fill:'#fff'}));
    const me = person(cx - 14, cy + 4, 1.1, '#fff', 1);
    g.appendChild(me);
  })();
})();
