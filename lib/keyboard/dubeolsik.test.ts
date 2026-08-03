import { describe, it, expect } from 'vitest';
import { DUBEOLSIK, keyByCode, keyByJamo, keyForChar } from './dubeolsik';

describe('DUBEOLSIK keymap', () => {
  it('자음 14, 모음 12, 숫자 10, 문장부호 4 키를 매핑한다', () => {
    const count = (t: string) => DUBEOLSIK.filter((k) => k.type === t).length;
    expect(count('consonant')).toBe(14);
    expect(count('vowel')).toBe(12);
    expect(count('digit')).toBe(10);
    expect(count('punct')).toBe(4);
    expect(DUBEOLSIK).toHaveLength(40);
  });

  it('마침표/쉼표 키를 매핑한다 (문장 콘텐츠용)', () => {
    expect(keyByCode('Period')?.jamo).toBe('.');
    expect(keyByCode('Comma')?.jamo).toBe(',');
    expect(keyByJamo('.')?.code).toBe('Period');
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

  it('숫자열을 매핑한다 (shift 는 기호)', () => {
    expect(keyByCode('Digit1')?.jamo).toBe('1');
    expect(keyByCode('Digit1')?.shift).toBe('!');
    expect(keyByCode('Digit0')?.jamo).toBe('0');
  });

  it('따옴표/물음표 키를 매핑한다', () => {
    expect(keyByCode('Quote')?.jamo).toBe("'");
    expect(keyByCode('Quote')?.shift).toBe('"');
    expect(keyByCode('Slash')?.shift).toBe('?');
  });

  it('keyForChar 로 기본/shift 문자를 역조회한다', () => {
    expect(keyForChar('ㄱ')).toMatchObject({ key: { code: 'KeyR' }, shift: false });
    expect(keyForChar('ㅃ')).toMatchObject({ key: { code: 'KeyQ' }, shift: true });
    expect(keyForChar('ㅒ')).toMatchObject({ key: { code: 'KeyO' }, shift: true });
    expect(keyForChar('?')).toMatchObject({ key: { code: 'Slash' }, shift: true });
    expect(keyForChar('!')).toMatchObject({ key: { code: 'Digit1' }, shift: true });
    expect(keyForChar('.')).toMatchObject({ key: { code: 'Period' }, shift: false });
    expect(keyForChar('없는문자')).toBeUndefined();
  });
});
