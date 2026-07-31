import { LESSONS } from './lessons';
import { Lesson, Stage } from './types';

export interface Category {
  slug: string;
  title: string;
  /** 정적 커리큘럼(lessons.ts)에서 가져오는 stage 들 */
  stages: Stage[];
  /** DB(practice_texts) 기반 자동 생성 레슨의 kind */
  dbKind?: 'vocabulary' | 'sentence' | 'long_text';
}

/** /lessons 메뉴의 4개 연습 타입 (표시 순서대로) */
export const CATEGORIES: Category[] = [
  { slug: 'consonants-vowels', title: 'Consonants & Vowels', stages: ['consonant', 'vowel', 'syllable'] },
  { slug: 'vocabulary', title: 'Vocabulary', stages: [], dbKind: 'vocabulary' },
  { slug: 'short-sentences', title: 'Short Sentences', stages: [], dbKind: 'sentence' },
  { slug: 'long-text', title: 'Long Text', stages: [], dbKind: 'long_text' },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function lessonsInCategory(slug: string): Lesson[] {
  const category = getCategory(slug);
  if (!category) return [];
  return LESSONS.filter((l) => category.stages.includes(l.stage));
}
