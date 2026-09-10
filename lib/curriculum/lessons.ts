import basics from '@/lib/content/basics.json';
import { Lesson } from './types';

/**
 * Basics 커리큘럼 — 시안(179:6625)의 버튼 3개와 1:1 로 맞춘다.
 *
 * items 는 "연습에 나올 수 있는 전체 풀" 이다. 실제 한 판(자모 40개, 음절 30개)은
 * 들어올 때마다 브라우저에서 뽑는다 — lib/curriculum/practiceSet.ts 와
 * app/lesson/[id]/BasicsPractice.tsx 참고.
 *
 * 풀의 원본은 data/consonants.csv·vowels.csv·syllables.csv 이고,
 * `npm run content:generate` 로 basics.json 을 만든다. 자음·모음은 CSV 순서가
 * 곧 교육 순서(홈로우 → 윗줄 → 아랫줄 → 된소리)라 정렬하지 않는다.
 */
export const LESSONS: Lesson[] = [
  { id: 'consonants', stage: 'consonant', title: 'Consonants', items: basics.consonants },
  { id: 'vowels', stage: 'vowel', title: 'Vowels', items: basics.vowels },
  {
    id: 'syllables',
    stage: 'syllable',
    title: 'Syllables',
    items: Object.values(basics.syllables).flat(),
  },
  // 단어/문장/지문 레슨은 콘텐츠 데이터 기반 자동 생성 (lib/content/catalog.ts)
];

const byId = new Map(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): Lesson | undefined {
  return byId.get(id);
}
