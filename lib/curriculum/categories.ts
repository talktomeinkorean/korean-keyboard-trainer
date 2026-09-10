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
  /**
   * 목록 없이 곧바로 연습을 시작하는 카테고리 (시안 214:2403).
   * 들어올 때마다 풀 전체에서 size 개를 무작위로 뽑아 한 판을 만든다.
   */
  randomSet?: { size: number; title: string };
  /** 목록에서 끝낸 항목을 회색으로 표시할지. Basics 는 완료 여부를 따지지 않는다. */
  showsCompletion?: boolean;
}

/** 콘텐츠 기반 레슨의 stage 와 카테고리 dbKind 대응 */
const STAGE_TO_KIND: Partial<Record<Stage, Category['dbKind']>> = {
  word: 'vocabulary',
  sentence: 'sentence',
  long_text: 'long_text',
};

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
    randomSet: { size: 30, title: '30 Random Words' },
  },
  {
    slug: 'short-sentences',
    title: 'Sentences',
    description:
      'Type full Korean sentences, including spacing and punctuation, with feedback on every consonant and vowel.',
    stages: [],
    dbKind: 'sentence',
    randomSet: { size: 10, title: '10 Random Sentences' },
  },
  {
    slug: 'long-text',
    title: 'Long Text',
    description:
      'Type Korean passages line by line — the closest thing to real writing practice on the Hangeul keyboard.',
    stages: [],
    dbKind: 'long_text',
    showsCompletion: true,
  },
];

/** 레슨이 속한 카테고리 — 결과 화면에서 어디서 왔는지 보여주는 데 쓴다. */
export function categoryForStage(stage: Stage): Category | undefined {
  return CATEGORIES.find((c) => c.stages.includes(stage) || STAGE_TO_KIND[stage] === c.dbKind);
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function lessonsInCategory(slug: string): Lesson[] {
  const category = getCategory(slug);
  if (!category) return [];
  return LESSONS.filter((l) => category.stages.includes(l.stage));
}
