import { describe, it, expect } from 'vitest';
import { buildSetLessons, buildPassageLessons, PracticeText } from './lessonGen';

function rows(items: Array<[number, string, string?]>): PracticeText[] {
  return items.map(([level, text_korean, source]) => ({
    level,
    text_korean,
    text_english: null,
    source: source ?? null,
  }));
}

describe('buildSetLessons', () => {
  it('레벨별로 chunkSize 개씩 세트를 만든다', () => {
    const lessons = buildSetLessons(
      rows([[1, '가'], [1, '나'], [1, '다'], [2, '라'], [2, '마']]),
      { stage: 'word', chunkSize: 2, idPrefix: 'voc', titlePrefix: 'Words' },
    );
    expect(lessons.map((l) => l.id)).toEqual(['voc-1-1', 'voc-1-2', 'voc-2-1']);
    expect(lessons[0].items).toEqual(['가', '나']);
    expect(lessons[1].items).toEqual(['다']);
    expect(lessons[2].items).toEqual(['라', '마']);
    expect(lessons[0].title).toBe('Words · Level 1 · Set 1');
  });

  it('항목을 sanitize 하고 빈 항목은 제외한다', () => {
    const lessons = buildSetLessons(
      rows([[1, '좋아요!'], [1, '???']]),
      { stage: 'sentence', chunkSize: 5, idPrefix: 'sen', titlePrefix: 'Sentences' },
    );
    expect(lessons[0].items).toEqual(['좋아요']);
  });
});

describe('buildPassageLessons', () => {
  it('지문 1개를 레슨 1개로 만들고 줄 단위로 항목을 나눈다', () => {
    const lessons = buildPassageLessons(
      rows([[1, '저는 커피를 마셨어요.\n배가 아팠어요.', 'TTMIK Stories Level 1 Articles 보리차를 마셔요']]),
    );
    expect(lessons).toHaveLength(1);
    expect(lessons[0].id).toBe('txt-1');
    expect(lessons[0].title).toBe('보리차를 마셔요');
    expect(lessons[0].items).toEqual(['저는 커피를 마셨어요.', '배가 아팠어요.']);
  });

  it('source 에 제목이 없으면 Story N 으로 대체한다', () => {
    const lessons = buildPassageLessons(rows([[1, '한 줄 지문']]));
    expect(lessons[0].title).toBe('Story 1');
  });
});
