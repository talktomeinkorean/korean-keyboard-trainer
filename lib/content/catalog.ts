import { Lesson } from '@/lib/curriculum/types';
import { getTexts, ContentKind } from './texts';
import { buildSetLessons, buildPassageLessons } from './lessonGen';
import { sanitizeTypable } from './sanitize';

export type CatalogKind = ContentKind;

/** 콘텐츠 데이터로 카테고리의 레슨 목록을 생성한다. */
export function getContentLessons(kind: CatalogKind): Lesson[] {
  const texts = getTexts(kind);
  switch (kind) {
    case 'vocabulary':
      return buildSetLessons(texts, { stage: 'word', chunkSize: 10, idPrefix: 'voc', titlePrefix: 'Words' });
    case 'sentence':
      return buildSetLessons(texts, { stage: 'sentence', chunkSize: 5, idPrefix: 'sen', titlePrefix: 'Sentences' });
    case 'long_text':
      return buildPassageLessons(texts);
  }
}

/**
 * 카테고리 전체를 레슨 하나로 묶어 돌려준다 — 목록 없이 바로 시작하는
 * Vocabulary·Sentences 가 여기서 무작위로 뽑아 쓴다 (뽑는 건 클라이언트).
 */
export function getContentPool(kind: CatalogKind): Lesson {
  const rows = getTexts(kind).filter((r) => sanitizeTypable(r.text_korean));
  return {
    id: `${kind}-pool`,
    stage: kind === 'vocabulary' ? 'word' : kind === 'sentence' ? 'sentence' : 'long_text',
    title: kind,
    items: rows.map((r) => sanitizeTypable(r.text_korean)),
    glosses: rows.map((r) => r.text_english),
    sources: rows.map((r) => r.source),
  };
}

const ID_PREFIX_TO_KIND: Record<string, CatalogKind> = {
  voc: 'vocabulary',
  sen: 'sentence',
  txt: 'long_text',
};

/** 레슨 id(voc-, sen-, txt- 접두) 해석. 해당 없으면 null. */
export function getContentLesson(id: string): Lesson | null {
  const kind = ID_PREFIX_TO_KIND[id.split('-')[0]];
  if (!kind) return null;
  return getContentLessons(kind).find((l) => l.id === id) ?? null;
}
