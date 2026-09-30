// 장표 텍스트를 뽑아 assets/search-index.js 로 저장 (홈 검색용)
// 장표 내용을 고친 뒤:  node build-search.js
const fs = require('fs');
const path = require('path');

const FILES = ['01-planning.html', '02-feature.html', '03-domain.html', '04-ai.html', '05-reserve.html'];

const clean = html => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<\/?(div|p|li|ul|ol|td|th|tr|h\d|br|text|tspan|section|svg|g)\b[^>]*>/g, ' ')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&middot;/g, '·').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ').trim();

const out = [];
for (const f of FILES) {
  const src = fs.readFileSync(path.join(__dirname, f), 'utf8');
  const sections = src.match(/<section[\s\S]*?<\/section>/g) || [];
  sections.forEach((sec, i) => {
    const h = sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    const body = sec
      .replace(/<div class="pnum">[\s\S]*?<\/div>/g, ' ')
      .replace(/<div class="eyebrow"[^>]*>[\s\S]*?<\/div>/g, ' ')
      .replace(/<h2[\s\S]*?<\/h2>/, ' ');
    out.push({ file: f, s: i + 1, title: h ? clean(h[1]) : '', body: clean(body) });
  });
}

fs.writeFileSync(path.join(__dirname, 'assets/search-index.js'),
  '// build-search.js 로 생성됨 — 직접 수정하지 말 것\nwindow.SEARCH = ' + JSON.stringify(out, null, 0) + ';\n');
console.log('slides indexed:', out.length);
