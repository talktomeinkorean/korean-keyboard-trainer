// data/*.csv → lib/content/practiceTexts.json 생성
// 실행: npm run content:generate  (시트를 수정해 CSV 를 갈아끼운 뒤 실행하고 커밋한다)
//
// 콘텐츠를 DB 가 아닌 번들에 담는 이유: 레슨/레이스가 요청마다 Supabase 를 거치면
// 콜드 스타트에서 1~2초가 더 붙는다. 정적 콘텐츠라 빌드 산출물에 넣는 편이 빠르고 단순하다.
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';

// 단어/문장/지문 — 서버에서만 읽는 큰 데이터.
const FILES = [
  { path: 'data/vocabulary.csv', kind: 'vocabulary' },
  { path: 'data/sentences.csv', kind: 'sentence' },
  { path: 'data/long-text.csv', kind: 'long_text' },
];

const OUT = 'lib/content/practiceTexts.json';

// Basics(자음·모음·음절) — 연습 세트를 브라우저에서 뽑기 때문에 클라이언트 번들에 들어간다.
// 큰 데이터와 파일을 나눠 두는 이유가 그것이다 (한 글자짜리 항목뿐이라 몇 KB).
const BASICS_OUT = 'lib/content/basics.json';

function toRow(record) {
  const korean = (record.text_korean ?? '').trim();
  if (!korean) return null; // 빈 행 스킵
  const level = parseInt(record.level, 10);
  return {
    level: Number.isInteger(level) ? level : null,
    text_korean: korean,
    text_english: (record.text_english ?? '').trim() || null,
    source: (record.source ?? '').trim() || null,
  };
}

/** 레슨 세트 구성이 매번 같도록 결정적으로 정렬한다 (level → source → 한국어). */
function sortRows(rows) {
  return rows.sort(
    (a, b) =>
      (a.level ?? 0) - (b.level ?? 0) ||
      (a.source ?? '').localeCompare(b.source ?? '') ||
      a.text_korean.localeCompare(b.text_korean),
  );
}

const out = {};
for (const { path, kind } of FILES) {
  const records = parse(readFileSync(path, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true, // long-text 헤더의 메모 컬럼 등 여분 컬럼 허용
  });
  out[kind] = sortRows(records.map(toRow).filter(Boolean));
  console.log(`${path}: ${out[kind].length}행`);
}

writeFileSync(OUT, JSON.stringify(out) + '\n');
const total = Object.values(out).reduce((n, rows) => n + rows.length, 0);
console.log(`→ ${OUT} (총 ${total}행, ${(readFileSync(OUT).length / 1024).toFixed(0)}KB)`);

/** CSV 의 한국어 컬럼만 뽑는다. 정렬하지 않는다 — 자음·모음은 CSV 순서가 곧 교육 순서다. */
function koreanColumn(path) {
  return parse(readFileSync(path, 'utf8'), { columns: true, skip_empty_lines: true })
    .map((r) => ({ level: parseInt(r.level, 10) || 1, text: (r.text_korean ?? '').trim() }))
    .filter((r) => r.text);
}

const syllables = {};
for (const { level, text } of koreanColumn('data/syllables.csv')) {
  (syllables[level] ??= []).push(text);
}

const basics = {
  consonants: koreanColumn('data/consonants.csv').map((r) => r.text),
  vowels: koreanColumn('data/vowels.csv').map((r) => r.text),
  syllables,
};
writeFileSync(BASICS_OUT, JSON.stringify(basics) + '\n');
const levels = Object.entries(syllables).map(([l, v]) => `L${l}:${v.length}`).join(' ');
console.log(
  `→ ${BASICS_OUT} (자음 ${basics.consonants.length}, 모음 ${basics.vowels.length}, ` +
    `음절 ${levels}, ${(readFileSync(BASICS_OUT).length / 1024).toFixed(0)}KB)`,
);
