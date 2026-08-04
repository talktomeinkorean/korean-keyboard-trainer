import { describe, it, expect } from 'vitest';
import { LESSONS, getLesson } from './lessons';

describe('LESSONS', () => {
  it('정적 커리큘럼 3개 단계가 모두 최소 1개 이상의 레슨을 가진다', () => {
    // 단어/문장/지문은 DB(practice_texts) 기반 자동 생성으로 대체됨
    const stages = new Set(LESSONS.map((l) => l.stage));
    expect(stages).toEqual(new Set(['consonant', 'vowel', 'syllable']));
  });

  it('레슨 id 가 유일하다', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('모든 레슨이 비어있지 않은 items 를 가진다', () => {
    for (const l of LESSONS) {
      expect(l.items.length).toBeGreaterThan(0);
      expect(l.items.every((i) => i.length > 0)).toBe(true);
    }
  });

  it('id 로 레슨을 조회한다', () => {
    expect(getLesson(LESSONS[0].id)?.id).toBe(LESSONS[0].id);
    expect(getLesson('does-not-exist')).toBeUndefined();
  });
});
