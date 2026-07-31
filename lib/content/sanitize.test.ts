import { describe, it, expect } from 'vitest';
import { sanitizeTypable } from './sanitize';

describe('sanitizeTypable', () => {
  it('한글·공백·마침표·쉼표는 보존한다', () => {
    expect(sanitizeTypable('안녕하세요. 저는, 학생이에요.')).toBe('안녕하세요. 저는, 학생이에요.');
  });

  it('키가 없는 문장부호를 제거한다', () => {
    expect(sanitizeTypable('왜 앉지 않아요?')).toBe('왜 앉지 않아요');
    expect(sanitizeTypable('맛있어요!')).toBe('맛있어요');
    expect(sanitizeTypable('‘임산부’가 앉아요.')).toBe('임산부가 앉아요.');
  });

  it('자모 낱자를 보존한다 (자모 연습용)', () => {
    expect(sanitizeTypable('ㅁ')).toBe('ㅁ');
    expect(sanitizeTypable('ㅢ')).toBe('ㅢ');
  });

  it('제거 후 남는 이중 공백을 정리하고 양끝을 trim 한다', () => {
    expect(sanitizeTypable('네 “좋아요” 라고 했어요')).toBe('네 좋아요 라고 했어요');
    expect(sanitizeTypable('  안녕  ')).toBe('안녕');
  });

  it('숫자와 영문을 제거한다', () => {
    expect(sanitizeTypable('3시에 만나요')).toBe('시에 만나요');
  });
});
