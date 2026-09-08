export type Stage = 'consonant' | 'vowel' | 'syllable' | 'word' | 'sentence' | 'long_text';

export interface Lesson {
  id: string;
  stage: Stage;
  title: string;
  /** 칠 대상 목록. 각 항목은 한 줄(한 글자~짧은 문장) */
  items: string[];
  /** 항목별 영어 뜻. items 와 길이가 같다 (없으면 undefined) */
  glosses?: (string | null)[];
  /** 항목별 출처 배지 문구. items 와 길이가 같다 */
  sources?: (string | null)[];
}
