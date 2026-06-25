export type Stage = 'consonant' | 'vowel' | 'syllable' | 'word' | 'sentence';

export interface Lesson {
  id: string;
  stage: Stage;
  title: string;
  /** 칠 대상 목록. 각 항목은 한 줄(한 글자~짧은 문장) */
  items: string[];
}
