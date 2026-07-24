import { describe, it, expect } from 'vitest';
import { RACE_WORD_POOL, pickRaceWords } from './words';

describe('pickRaceWords', () => {
  it('기본 5개 단어를 뽑는다', () => {
    expect(pickRaceWords()).toHaveLength(5);
  });

  it('중복 없이 뽑는다', () => {
    for (let i = 0; i < 20; i++) {
      const words = pickRaceWords();
      expect(new Set(words).size).toBe(words.length);
    }
  });

  it('모든 단어가 풀에 속한다', () => {
    for (const w of pickRaceWords()) {
      expect(RACE_WORD_POOL).toContain(w);
    }
  });

  it('요청 개수가 풀보다 크면 풀 크기로 제한한다', () => {
    expect(pickRaceWords(999)).toHaveLength(RACE_WORD_POOL.length);
  });

  it('풀은 word 단계 레슨 단어들로 구성된다', () => {
    expect(RACE_WORD_POOL.length).toBeGreaterThanOrEqual(10);
    expect(RACE_WORD_POOL).toContain('한국');
    expect(RACE_WORD_POOL).toContain('안녕');
  });
});
