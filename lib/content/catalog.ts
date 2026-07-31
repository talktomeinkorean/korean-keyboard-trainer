import { Lesson } from '@/lib/curriculum/types';
import { getTexts } from './db';
import { buildSetLessons, buildPassageLessons } from './lessonGen';

export type CatalogKind = 'vocabulary' | 'sentence' | 'long_text';

/** DB 콘텐츠로 카테고리의 레슨 목록을 생성. 미설정/오류 시 null. */
export async function getDbLessons(kind: CatalogKind): Promise<Lesson[] | null> {
  const texts = await getTexts(kind);
  if (!texts) return null;
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

/** DB 레슨 id(voc-, sen-, txt- 접두) 해석. 해당 없거나 미설정이면 null. */
export async function getDbLesson(id: string): Promise<Lesson | null> {
  const kind = ID_PREFIX_TO_KIND[id.split('-')[0]];
  if (!kind) return null;
  const lessons = await getDbLessons(kind);
  return lessons?.find((l) => l.id === id) ?? null;
}
