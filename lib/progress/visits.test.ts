import { describe, it, expect, beforeEach } from 'vitest';
import { visitOnce } from './visits';

describe('visitOnce', () => {
  beforeEach(() => localStorage.clear());

  it('처음에는 false, 그 뒤로는 true', () => {
    expect(visitOnce('consonants')).toBe(false);
    expect(visitOnce('consonants')).toBe(true);
    expect(visitOnce('consonants')).toBe(true);
  });

  it('연습마다 따로 센다', () => {
    expect(visitOnce('consonants')).toBe(false);
    expect(visitOnce('vowels')).toBe(false);
    expect(visitOnce('consonants')).toBe(true);
  });

  it('저장값이 깨져 있어도 첫 방문으로 처리한다', () => {
    localStorage.setItem('htt.visited', '{oops');
    expect(visitOnce('consonants')).toBe(false);
  });
});
