import { Lesson } from './types';

export const LESSONS: Lesson[] = [
  // 1. 기초 자음 (홈로우 우선)
  { id: 'c1', stage: 'consonant', title: 'Consonants 1 · Home Row', items: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅁ', 'ㄴ', 'ㅇ'] },
  { id: 'c2', stage: 'consonant', title: 'Consonants 2 · Top Row', items: ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㄱ', 'ㄷ', 'ㅂ'] },
  { id: 'c3', stage: 'consonant', title: 'Consonants 3 · Bottom Row', items: ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅋ', 'ㅊ', 'ㅌ', 'ㅍ'] },
  // 2. 기초 모음
  { id: 'v1', stage: 'vowel', title: 'Vowels 1 · Basics', items: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ', 'ㅏ', 'ㅗ'] },
  { id: 'v2', stage: 'vowel', title: 'Vowels 2 · Y-Vowels', items: ['ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅐ', 'ㅔ', 'ㅑ', 'ㅔ'] },
  // 3. 자모 조합
  { id: 's1', stage: 'syllable', title: 'Syllables 1', items: ['가', '나', '다', '라', '마', '바', '사', '아'] },
  { id: 's2', stage: 'syllable', title: 'Syllables 2 · Batchim', items: ['간', '달', '곰', '술', '밥', '눈', '문', '발'] },
  // 단어/문장/지문 레슨은 DB(practice_texts) 기반 자동 생성으로 대체됨 (lib/content/catalog.ts)
];

const byId = new Map(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): Lesson | undefined {
  return byId.get(id);
}
