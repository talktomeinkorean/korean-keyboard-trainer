import { describe, it, expect } from 'vitest';
import { DUBEOLSIK, keyByCode, keyByJamo } from './dubeolsik';

describe('DUBEOLSIK keymap', () => {
  it('14개 기본 자음과 12개 기본 모음, 총 26개 기본 키를 매핑한다', () => {
    const consonants = DUBEOLSIK.filter((k) => k.type === 'consonant');
    const vowels = DUBEOLSIK.filter((k) => k.type === 'vowel');
    expect(consonants).toHaveLength(14);
    expect(vowels).toHaveLength(12);
    expect(DUBEOLSIK).toHaveLength(26);
  });

  it('대표 키들을 올바른 자모로 매핑한다', () => {
    expect(keyByCode('KeyR')?.jamo).toBe('ㄱ');
    expect(keyByCode('KeyK')?.jamo).toBe('ㅏ');
    expect(keyByCode('KeyD')?.jamo).toBe('ㅇ');
    expect(keyByCode('KeyS')?.jamo).toBe('ㄴ');
  });

  it('자모로 키를 역조회할 수 있다', () => {
    expect(keyByJamo('ㄱ')?.code).toBe('KeyR');
    expect(keyByJamo('ㅏ')?.code).toBe('KeyK');
  });

  it('모든 code 가 유일하다', () => {
    const codes = DUBEOLSIK.map((k) => k.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('스페이스 키를 공백 자모로 매핑한다 (문장 연습용)', () => {
    expect(keyByCode('Space')?.jamo).toBe(' ');
    expect(keyByJamo(' ')?.code).toBe('Space');
  });

  it('shift 항목(쌍자음/ㅒㅖ)이 이음새로 채워져 있다', () => {
    expect(keyByCode('KeyR')?.shift).toBe('ㄲ');
    expect(keyByCode('KeyO')?.shift).toBe('ㅒ');
  });
});
