import { LESSONS } from './lessons';
import { Lesson, Stage } from './types';

export interface Category {
  slug: string;
  title: string;
  /** 카테고리 목록 페이지의 검색 결과 설명문 */
  description: string;
  /** 정적 커리큘럼(lessons.ts)에서 가져오는 stage 들 */
  stages: Stage[];
  /** DB(practice_texts) 기반 자동 생성 레슨의 kind */
  dbKind?: 'vocabulary' | 'sentence' | 'long_text';
}

/** /lessons 메뉴의 4개 연습 타입 (표시 순서대로) */
export const CATEGORIES: Category[] = [
  // 표시 이름은 시안 기준. slug 는 이미 색인·사이트맵에 쓰이고 있어 유지한다.
  {
    slug: 'consonants-vowels',
    title: 'Basics',
    description:
      'Learn where every Korean consonant and vowel sits on the keyboard, then put them together into syllables.',
    stages: ['consonant', 'vowel', 'syllable'],
  },
  {
    slug: 'vocabulary',
    title: 'Vocabulary',
    description:
      'Type real Korean words by level, from everyday basics upward, with the English meaning alongside.',
    stages: [],
    dbKind: 'vocabulary',
  },
  {
    slug: 'short-sentences',
    title: 'Sentences',
    description:
      'Type full Korean sentences, including spacing and punctuation, with feedback on every consonant and vowel.',
    stages: [],
    dbKind: 'sentence',
  },
  {
    slug: 'long-text',
    title: 'Long Text',
    description:
      'Type Korean passages line by line — the closest thing to real writing practice on the Hangeul keyboard.',
    stages: [],
    dbKind: 'long_text',
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function lessonsInCategory(slug: string): Lesson[] {
  const category = getCategory(slug);
  if (!category) return [];
  return LESSONS.filter((l) => category.stages.includes(l.stage));
}
