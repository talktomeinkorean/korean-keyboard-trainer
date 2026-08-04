import { describe, it, expect } from 'vitest';
import { sanitizeTypable } from './sanitize';

describe('sanitizeTypable', () => {
  it('한글·공백·마침표·쉼표는 보존한다', () => {
    expect(sanitizeTypable('안녕하세요. 저는, 학생이에요.')).toBe('안녕하세요. 저는, 학생이에요.');
  });

  it('입력 가능한 문장부호(? ! \' ")를 보존한다', () => {
    expect(sanitizeTypable('왜 앉지 않아요?')).toBe('왜 앉지 않아요?');
    expect(sanitizeTypable('맛있어요!')).toBe('맛있어요!');
  });

  it('둥근따옴표를 곧은따옴표로 정규화한다', () => {
    expect(sanitizeTypable('‘임산부’가 앉아요.')).toBe("'임산부'가 앉아요.");
    expect(sanitizeTypable('“좋아요” 라고 했어요')).toBe('"좋아요" 라고 했어요');
  });

  it('숫자를 보존한다', () => {
    expect(sanitizeTypable('3시에 만나요')).toBe('3시에 만나요');
    expect(sanitizeTypable('990원')).toBe('990원');
  });

  it('자모 낱자를 보존한다 (자모 연습용)', () => {
    expect(sanitizeTypable('ㅁ')).toBe('ㅁ');
    expect(sanitizeTypable('ㅢ')).toBe('ㅢ');
  });

  it('키가 없는 문자(영문·특수문자)는 제거하고 공백을 정리한다', () => {
    expect(sanitizeTypable('안녕 hello~ 세계 ★')).toBe('안녕 세계');
    expect(sanitizeTypable('  안녕  ')).toBe('안녕');
  });
});
