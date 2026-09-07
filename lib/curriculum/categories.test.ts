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
    expect(getCategory('consonants-vowels')?.title).toBe('Basics');
    expect(getCategory('short-sentences')?.title).toBe('Sentences');
    expect(getCategory('nope')).toBeUndefined();
  });

  it('Basics 는 시안대로 자음·모음·조합 세 레슨이다', () => {
    const ids = lessonsInCategory('consonants-vowels').map((l) => l.id);
    expect(ids).toEqual(['consonants', 'vowels', 'syllables']);
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

  it('Vocabulary·Sentences 만 목록 없이 바로 연습으로 들어간다', () => {
    const direct = CATEGORIES.filter((c) => c.startsDirectly).map((c) => c.slug);
    expect(direct).toEqual(['vocabulary', 'short-sentences']);
  });
});
