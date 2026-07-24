import { LESSONS } from './lessons';
import { Lesson, Stage } from './types';

export interface Category {
  slug: string;
  title: string;
  /** 이 카테고리에 속하는 레슨 stage 들 (빈 배열 = 콘텐츠 준비 중) */
  stages: Stage[];
}

/** /lessons 메뉴의 4개 연습 타입 (표시 순서대로) */
export const CATEGORIES: Category[] = [
  { slug: 'consonants-vowels', title: 'Consonants & Vowels', stages: ['consonant', 'vowel', 'syllable'] },
  { slug: 'vocabulary', title: 'Vocabulary', stages: ['word'] },
  { slug: 'short-sentences', title: 'Short Sentences', stages: ['sentence'] },
  { slug: 'long-text', title: 'Long Text', stages: [] },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function lessonsInCategory(slug: string): Lesson[] {
  const category = getCategory(slug);
  if (!category) return [];
  return LESSONS.filter((l) => category.stages.includes(l.stage));
}
