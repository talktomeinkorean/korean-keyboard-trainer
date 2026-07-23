import { describe, it, expect } from 'vitest';
import { disassemble } from 'es-hangul';
import { toJamoGroups } from './jamoGroups';

describe('toJamoGroups', () => {
  it('단어를 음절별 자모 그룹으로 분해한다', () => {
    expect(toJamoGroups('아마')).toEqual([
      ['ㅇ', 'ㅏ'],
      ['ㅁ', 'ㅏ'],
    ]);
  });

  it('받침을 포함해 분해한다', () => {
    expect(toJamoGroups('안녕')).toEqual([
      ['ㅇ', 'ㅏ', 'ㄴ'],
      ['ㄴ', 'ㅕ', 'ㅇ'],
    ]);
  });

  it('복합모음을 자모 단위로 분해한다', () => {
    expect(toJamoGroups('과')).toEqual([['ㄱ', 'ㅗ', 'ㅏ']]);
  });

  it('한글이 아닌 문자는 길이 1짜리 그룹으로 둔다', () => {
    expect(toJamoGroups('한 글')).toEqual([
      ['ㅎ', 'ㅏ', 'ㄴ'],
      [' '],
      ['ㄱ', 'ㅡ', 'ㄹ'],
    ]);
  });

  it('그룹을 평탄화하면 전체 disassemble 결과와 일치한다 (세션 인덱스 정합성)', () => {
    const items = ['아마', '안녕하세요', '과일', '한 글', '띄어 쓰기'];
    for (const item of items) {
      expect(toJamoGroups(item).flat().join('')).toBe(disassemble(item));
    }
  });
});
