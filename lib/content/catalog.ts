import { Lesson } from '@/lib/curriculum/types';
import { getTexts, ContentKind } from './texts';
import { buildSetLessons, buildPassageLessons } from './lessonGen';

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
