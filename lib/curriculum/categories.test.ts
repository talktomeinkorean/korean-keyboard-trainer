import { describe, it, expect } from 'vitest';
import { CATEGORIES, getCategory, lessonsInCategory } from './categories';
import { LESSONS } from './lessons';

describe('categories', () => {
  it('4개 타입을 순서대로 정의한다', () => {
    expect(CATEGORIES.map((c) => c.slug)).toEqual([
      'consonants-vowels',
      'vocabulary',
      'short-sentences',
      'long-text',
    ]);
  });

  it('slug 로 카테고리를 조회한다', () => {
    expect(getCategory('vocabulary')?.title).toBe('Vocabulary');
    expect(getCategory('nope')).toBeUndefined();
  });

  it('자음/모음/조합 레슨은 Consonants & Vowels 에 속한다', () => {
    const ids = lessonsInCategory('consonants-vowels').map((l) => l.id);
    expect(ids).toEqual(['c1', 'c2', 'c3', 'v1', 'v2', 's1', 's2']);
  });

  it('단어/문장/지문 카테고리는 DB kind 를 갖고 정적 레슨은 없다', () => {
    expect(getCategory('vocabulary')?.dbKind).toBe('vocabulary');
    expect(getCategory('short-sentences')?.dbKind).toBe('sentence');
    expect(getCategory('long-text')?.dbKind).toBe('long_text');
    expect(lessonsInCategory('vocabulary')).toEqual([]);
    expect(lessonsInCategory('short-sentences')).toEqual([]);
    expect(lessonsInCategory('long-text')).toEqual([]);
  });

  it('모든 정적 레슨이 정확히 하나의 카테고리에 속한다', () => {
    const all = CATEGORIES.flatMap((c) => lessonsInCategory(c.slug).map((l) => l.id));
    expect(all.sort()).toEqual(LESSONS.map((l) => l.id).sort());
    expect(new Set(all).size).toBe(all.length);
  });
});
