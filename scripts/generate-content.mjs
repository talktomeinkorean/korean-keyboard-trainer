// data/*.csv → lib/content/practiceTexts.json 생성
// 실행: npm run content:generate  (시트를 수정해 CSV 를 갈아끼운 뒤 실행하고 커밋한다)
//
// 콘텐츠를 DB 가 아닌 번들에 담는 이유: 레슨/레이스가 요청마다 Supabase 를 거치면
// 콜드 스타트에서 1~2초가 더 붙는다. 정적 콘텐츠라 빌드 산출물에 넣는 편이 빠르고 단순하다.
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';

// 앱에서 실제로 쓰는 종류만 담는다.
// 자음/모음/음절은 lib/curriculum/lessons.ts 의 정적 커리큘럼이 담당한다.
const FILES = [
  { path: 'data/vocabulary.csv', kind: 'vocabulary' },
  { path: 'data/sentences.csv', kind: 'sentence' },
  { path: 'data/long-text.csv', kind: 'long_text' },
];

const OUT = 'lib/content/practiceTexts.json';

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
