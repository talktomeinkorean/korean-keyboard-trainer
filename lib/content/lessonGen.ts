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
  const byLevel = new Map<number, string[]>();
  for (const row of rows) {
    const item = sanitizeTypable(row.text_korean);
    if (!item) continue;
    const level = row.level ?? 0;
    const items = byLevel.get(level) ?? [];
    items.push(item);
    byLevel.set(level, items);
  }

  const lessons: Lesson[] = [];
  for (const level of [...byLevel.keys()].sort((a, b) => a - b)) {
    const items = byLevel.get(level)!;
    for (let i = 0; i < items.length; i += opts.chunkSize) {
      const set = i / opts.chunkSize + 1;
      lessons.push({
        id: `${opts.idPrefix}-${level}-${set}`,
        stage: opts.stage,
        title: `${opts.titlePrefix} · Level ${level} · Set ${set}`,
        items: items.slice(i, i + opts.chunkSize),
      });
    }
  }
  return lessons;
}

/** 지문 1개 = 레슨 1개. 항목은 줄 단위로 나눈다. 제목은 source 의 "Articles " 뒤. */
export function buildPassageLessons(rows: PracticeText[]): Lesson[] {
  const lessons: Lesson[] = [];
  rows.forEach((row, index) => {
    const items = row.text_korean
      .split('\n')
      .map(sanitizeTypable)
      .filter(Boolean);
    if (items.length === 0) return;
    const articleTitle = row.source?.match(/Articles\s+(.+)$/)?.[1];
    lessons.push({
      id: `txt-${index + 1}`,
      stage: 'long_text',
      title: articleTitle ?? `Story ${index + 1}`,
      items,
    });
  });
  return lessons;
}
