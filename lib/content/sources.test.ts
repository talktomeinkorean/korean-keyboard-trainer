import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import practiceTexts from './practiceTexts.json';
import { sourceLink, TTMIK_STORIES_URL } from './sources';

describe('sourceLink', () => {
  it('시안에 걸린 주소와 문구를 그대로 만든다', () => {
    expect(sourceLink('My First 500 Korean Words Book 1')).toEqual({
      label: 'My First 500 Korean Words Book 1',
      href: 'https://store.talktomeinkorean.com/products/my-first-500-korean-words-book-1',
      cover: '/lessons/book1.png',
    });
    expect(sourceLink('Core Grammar Level 1 Lesson 1')).toEqual({
      label: 'TTMIK Courses - Core Grammar Level 1',
      href: 'https://courses.talktomeinkorean.com/core-grammar-level-1-non',
    });
    expect(sourceLink('TTMIK Stories Level 1')).toEqual({
      label: 'TTMIK Stories - Level 1 Articles',
      href: TTMIK_STORIES_URL,
    });
  });

  it('두 자리 레벨도 레슨 번호와 섞이지 않는다', () => {
    expect(sourceLink('Core Grammar Level 10 Lesson 3')?.href).toBe(
      'https://courses.talktomeinkorean.com/core-grammar-level-10-non',
    );
  });

  it('실제 콘텐츠의 모든 출처가 링크로 바뀐다 — 링크 없는 배지가 남지 않는다', () => {
    const sources = new Set(
      [...practiceTexts.vocabulary, ...practiceTexts.sentence, ...practiceTexts.long_text]
        .map((row) => row.source)
        .filter((s): s is string => Boolean(s)),
    );
    const unmapped = [...sources].filter((s) => sourceLink(s) === null);
    expect(unmapped).toEqual([]);
  });

  it('교재는 13종이다 (Vocab 2 · Sentences 10 · Long Text 1)', () => {
    const labels = new Set(
      [...practiceTexts.vocabulary, ...practiceTexts.sentence, ...practiceTexts.long_text].map(
        (row) => sourceLink(row.source ?? '')?.label,
      ),
    );
    expect(labels.size).toBe(13);
  });

  it('책 표지는 Vocabulary 에만 있고, 가리키는 파일이 실제로 있다', () => {
    const vocabCovers = new Set(practiceTexts.vocabulary.map((row) => sourceLink(row.source ?? '')?.cover));
    expect([...vocabCovers].sort()).toEqual(['/lessons/book1.png', '/lessons/book2.png']);
    for (const cover of vocabCovers) {
      expect(existsSync(join(process.cwd(), 'public', cover!))).toBe(true);
    }
    const others = [...practiceTexts.sentence, ...practiceTexts.long_text].filter(
      (row) => sourceLink(row.source ?? '')?.cover,
    );
    expect(others).toEqual([]);
  });

  it('규칙에 없는 출처는 null', () => {
    expect(sourceLink('Some Other Book')).toBeNull();
  });
});
