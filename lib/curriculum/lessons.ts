import { Lesson } from './types';

/**
 * Basics 커리큘럼 — 시안(179:6625)의 버튼 3개와 1:1 로 맞춘다.
 *
 * 예전에는 자음을 Home/Top/Bottom Row 세 레슨으로 쪼갰지만, 시안에서 Basics 는
 * Consonants / Vowels / Syllables 세 버튼이고 누르면 바로 연습으로 들어간다.
 * 항목 순서는 쪼개져 있던 때의 순서(홈로우 → 윗줄 → 아랫줄)를 그대로 이어붙였다.
 */
export const LESSONS: Lesson[] = [
  {
    id: 'consonants',
    stage: 'consonant',
    title: 'Consonants',
    items: [
      // 홈로우
      'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅁ', 'ㄴ', 'ㅇ',
      // 윗줄
      'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㄱ', 'ㄷ', 'ㅂ',
      // 아랫줄
      'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅋ', 'ㅊ', 'ㅌ', 'ㅍ',
    ],
  },
  {
    id: 'vowels',
    stage: 'vowel',
    title: 'Vowels',
    items: [
      'ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ', 'ㅏ', 'ㅗ',
      'ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅐ', 'ㅔ', 'ㅑ', 'ㅔ',
    ],
  },
  {
    id: 'syllables',
    stage: 'syllable',
    title: 'Syllables',
    items: [
      '가', '나', '다', '라', '마', '바', '사', '아',
      // 받침
      '간', '달', '곰', '술', '밥', '눈', '문', '발',
    ],
  },
  // 단어/문장/지문 레슨은 콘텐츠 데이터 기반 자동 생성 (lib/content/catalog.ts)
];

const byId = new Map(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): Lesson | undefined {
  return byId.get(id);
}
