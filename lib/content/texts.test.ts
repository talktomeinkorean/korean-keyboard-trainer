import { describe, it, expect } from 'vitest';
import { getTexts } from './texts';

describe('getTexts', () => {
  it('단어에는 숫자가 없다 — 시트의 동음이의어 번호(눈1·눈2)가 레이스·연습 화면에 나오면 안 된다', () => {
    const withDigits = getTexts('vocabulary').filter((t) => /\d/.test(t.text_korean));
    expect(withDigits.map((t) => t.text_korean)).toEqual([]);
  });
});
