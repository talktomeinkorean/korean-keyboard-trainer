// data/*.csv → Supabase practice_texts 임포트 (전체 교체, 재실행 가능)
// 실행: npm run seed:content  (.env.local 의 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 사용)
import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const FILES = [
  { path: 'data/consonants.csv', kind: 'consonant' },
  { path: 'data/vowels.csv', kind: 'vowel' },
  { path: 'data/syllables.csv', kind: 'syllable' },
  { path: 'data/vocabulary.csv', kind: 'vocabulary' },
  { path: 'data/sentences.csv', kind: 'sentence' },
  { path: 'data/long-text.csv', kind: 'long_text' },
];

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다 (.env.local)');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

function toRow(record, kind) {
  const korean = (record.text_korean ?? '').trim();
  if (!korean) return null; // 빈 행 스킵
  const level = parseInt(record.level, 10);
  return {
    kind,
    level: Number.isInteger(level) ? level : null,
    text_korean: korean,
    text_english: (record.text_english ?? '').trim() || null,
    source: (record.source ?? '').trim() || null,
    part_of_speech: (record['parts of speech'] ?? '').trim() || null,
  };
}

const rows = [];
for (const { path, kind } of FILES) {
  const records = parse(readFileSync(path, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true, // long-text 헤더의 메모 컬럼 등 여분 컬럼 허용
  });
  const before = rows.length;
  for (const record of records) {
    const row = toRow(record, kind);
    if (row) rows.push(row);
  }
  console.log(`${path}: ${rows.length - before}행`);
}

// 전체 교체: 기존 데이터 삭제 후 배치 삽입
const { error: deleteError } = await supabase
  .from('practice_texts')
  .delete()
  .not('id', 'is', null);
if (deleteError) {
  console.error('삭제 실패:', deleteError.message);
  process.exit(1);
}

const BATCH = 500;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await supabase.from('practice_texts').insert(batch);
  if (error) {
    console.error(`삽입 실패 (${i}~${i + batch.length}):`, error.message);
    process.exit(1);
  }
  console.log(`삽입 ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
}

const { count } = await supabase
  .from('practice_texts')
  .select('*', { count: 'exact', head: true });
console.log(`완료 — DB 총 ${count}행`);
