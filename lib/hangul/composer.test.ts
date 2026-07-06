import { describe, it, expect } from 'vitest';
import { createComposer } from './composer';

describe('createComposer', () => {
  it('초성+중성 을 한 음절로 합성한다', () => {
    const c = createComposer();
    c.push('ㄱ');
    c.push('ㅏ');
    expect(c.text()).toBe('가');
  });

  it('받침을 붙인다', () => {
    const c = createComposer();
    ['ㄱ', 'ㅏ', 'ㄴ'].forEach((j) => c.push(j));
    expect(c.text()).toBe('간');
  });

  it('받침 뒤 모음이 오면 다음 글자로 이동한다 (간+ㅏ → 가나)', () => {
    const c = createComposer();
    ['ㄱ', 'ㅏ', 'ㄴ', 'ㅏ'].forEach((j) => c.push(j));
    expect(c.text()).toBe('가나');
  });

  it('복합모음을 합성한다 (ㄱ ㅗ ㅏ → 과)', () => {
    const c = createComposer();
    ['ㄱ', 'ㅗ', 'ㅏ'].forEach((j) => c.push(j));
    expect(c.text()).toBe('과');
  });

  it('단어를 합성한다 (안녕)', () => {
    const c = createComposer();
    ['ㅇ', 'ㅏ', 'ㄴ', 'ㄴ', 'ㅕ', 'ㅇ'].forEach((j) => c.push(j));
    expect(c.text()).toBe('안녕');
  });

  it('pop 으로 마지막 자모를 되돌린다', () => {
    const c = createComposer();
    ['ㄱ', 'ㅏ', 'ㄴ'].forEach((j) => c.push(j));
    c.pop();
    expect(c.text()).toBe('가');
  });

  it('reset 으로 비운다', () => {
    const c = createComposer();
    c.push('ㄱ');
    c.reset();
    expect(c.text()).toBe('');
  });
});
