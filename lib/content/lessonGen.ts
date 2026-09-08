import { Lesson, Stage } from '@/lib/curriculum/types';
import { sanitizeTypable } from './sanitize';

/** practice_texts 조회 결과 중 레슨 생성에 필요한 부분 */
export interface PracticeText {
  level: number | null;
  text_korean: string;
  text_english: string | null;
  source: string | null;
}

interface SetOptions {
  stage: Stage;
  chunkSize: number;
  idPrefix: string;
  titlePrefix: string;
}

/**
 * 레벨별로 chunkSize 개씩 묶어 세트 레슨을 만든다.
 * rows 는 호출부에서 결정적 순서(level, source, text_korean)로 정렬돼 있어야 한다.
 */
export function buildSetLessons(rows: PracticeText[], opts: SetOptions): Lesson[] {
  const byLevel = new Map<number, PracticeText[]>();
  for (const row of rows) {
    if (!sanitizeTypable(row.text_korean)) continue;
    const level = row.level ?? 0;
    const kept = byLevel.get(level) ?? [];
    kept.push(row);
    byLevel.set(level, kept);
  }

  const lessons: Lesson[] = [];
  for (const level of [...byLevel.keys()].sort((a, b) => a - b)) {
    const kept = byLevel.get(level)!;
    for (let i = 0; i < kept.length; i += opts.chunkSize) {
      const set = i / opts.chunkSize + 1;
      const chunk = kept.slice(i, i + opts.chunkSize);
      lessons.push({
        id: `${opts.idPrefix}-${level}-${set}`,
        stage: opts.stage,
        title: `${opts.titlePrefix} · Level ${level} · Set ${set}`,
        items: chunk.map((r) => sanitizeTypable(r.text_korean)),
        glosses: chunk.map((r) => r.text_english),
        sources: chunk.map((r) => r.source),
      });
    }
  }
  return lessons;
}

/** 지문 1개 = 레슨 1개. 항목은 줄 단위로 나눈다. 제목은 source 의 "Articles " 뒤. */
export function buildPassageLessons(rows: PracticeText[]): Lesson[] {
  const lessons: Lesson[] = [];
  rows.forEach((row, index) => {
    const items = row.text_korean.split('\n').map(sanitizeTypable).filter(Boolean);
    if (items.length === 0) return;
    // 한국어와 영어의 줄 수가 같아 줄 단위로 짝지을 수 있다 (49개 지문 전부 확인)
    const englishLines = (row.text_english ?? '').split('\n').map((l) => l.trim());
    const articleTitle = row.source?.match(/Articles\s+(.+)$/)?.[1];
    // 배지에는 교재명까지만 — 지문 제목은 이미 화면 제목으로 나온다
    const bookSource = articleTitle
      ? row.source!.slice(0, row.source!.length - articleTitle.length).trim()
      : row.source;
    lessons.push({
      id: `txt-${index + 1}`,
      stage: 'long_text',
      title: articleTitle ?? `Story ${index + 1}`,
      items,
      glosses: items.map((_, i) => englishLines[i] ?? null),
      sources: items.map(() => bookSource),
    });
  });
  return lessons;
}
