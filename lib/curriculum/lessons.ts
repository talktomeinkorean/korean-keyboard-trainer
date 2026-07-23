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
  // 4. 단어
  { id: 'w1', stage: 'word', title: 'Words 1', items: ['한국', '사람', '학교', '친구', '음악', '시간'] },
  { id: 'w2', stage: 'word', title: 'Words 2', items: ['안녕', '커피', '주말', '여행', '사랑', '행복'] },
  // 5. 짧은 문장
  { id: 'st1', stage: 'sentence', title: 'Sentences 1', items: ['안녕하세요', '한국어 배우기', '만나서 반가워요'] },
  { id: 'st2', stage: 'sentence', title: 'Sentences 2', items: ['오늘 날씨 좋아요', '커피 한 잔 주세요', '한국 음악 좋아해요'] },
];

const byId = new Map(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): Lesson | undefined {
  return byId.get(id);
}
