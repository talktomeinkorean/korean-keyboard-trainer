import { describe, it, expect } from 'vitest';
import { lessonDescription, pageMetadata } from './seo';
import type { Lesson } from '@/lib/curriculum/types';

function lesson(over: Partial<Lesson>): Lesson {
  return { id: 'x', stage: 'word', title: 'X', items: ['가'], ...over };
}

describe('pageMetadata', () => {
  it('제목과 설명을 og·twitter 에도 같이 넣는다', () => {
    const meta = pageMetadata({ title: 'T', description: 'D', path: '/p' });
    expect(meta.title).toBe('T');
    expect(meta.openGraph).toMatchObject({ title: 'T', description: 'D', url: '/p' });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image', title: 'T' });
    expect(meta.alternates).toEqual({ canonical: '/p' });
  });
});

describe('lessonDescription', () => {
  it('연습용으로 반복되는 자모는 한 번만 넣는다', () => {
    const text = lessonDescription(
      lesson({ stage: 'consonant', items: ['ㅁ', 'ㄴ', 'ㅇ', 'ㅁ', 'ㄴ'] }),
    );
    expect(text).toContain('ㅁ, ㄴ, ㅇ');
    expect(text).not.toContain('ㅁ, ㄴ, ㅇ, ㅁ');
  });

  it('단어는 전체 개수와 앞쪽 몇 개만 보여준다', () => {
    const items = ['가게', '가격', '가깝다', '가다', '가르치다', '가방', '가수'];
    const text = lessonDescription(lesson({ stage: 'word', items }));
    expect(text).toContain('Type 7 Korean words');
    expect(text).toContain('가게, 가격, 가깝다, 가다, 가르치다 and more');
    expect(text).not.toContain('가방');
  });

  it('지문은 여러 줄을 이어붙이지 않고 첫 줄만 인용한다', () => {
    const text = lessonDescription(
      lesson({ stage: 'long_text', items: ['마트에 가요.', '가격을 봐요.', '집에 와요.'] }),
    );
    expect(text).toContain('3 lines');
    expect(text).toContain('"마트에 가요."');
    expect(text).not.toContain('가격을 봐요');
  });

  it('첫 줄이 길면 잘라서 말줄임표를 붙인다', () => {
    const long = '가'.repeat(80);
    const text = lessonDescription(lesson({ stage: 'sentence', items: [long] }));
    expect(text).toContain('…');
    expect(text).not.toContain(long);
  });

  it('설명문이 검색결과에서 잘릴 만큼 길어지지 않는다', () => {
    const cases: Lesson[] = [
      lesson({ stage: 'consonant', items: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ'] }),
      lesson({ stage: 'syllable', items: ['간', '달', '곰', '술', '밥', '눈', '문', '발'] }),
      lesson({ stage: 'word', items: Array.from({ length: 10 }, (_, i) => `단어${i}`) }),
      lesson({ stage: 'sentence', items: ['가'.repeat(80)] }),
      lesson({ stage: 'long_text', items: ['나'.repeat(80)] }),
    ];
    for (const l of cases) {
      expect(lessonDescription(l).length).toBeLessThanOrEqual(160);
    }
  });
});
