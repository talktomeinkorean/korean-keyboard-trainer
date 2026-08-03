import { describe, it, expect } from 'vitest';
import { disassemble } from 'es-hangul';
import { toJamoGroups, splitByJamoProgress } from './jamoGroups';

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

describe('splitByJamoProgress', () => {
  it('조합 중인 음절을 current 로 분리한다 (안녕 + ㅇ 1개)', () => {
    expect(splitByJamoProgress('안녕', 1)).toEqual({ done: '', current: '안', todo: '녕' });
  });

  it('완성된 음절은 done 으로 넘어간다 (안녕 + ㅇㅏㄴ)', () => {
    expect(splitByJamoProgress('안녕', 3)).toEqual({ done: '안', current: '', todo: '녕' });
  });

  it('입력 전에는 전체가 todo 다', () => {
    expect(splitByJamoProgress('한국어', 0)).toEqual({ done: '', current: '', todo: '한국어' });
  });

  it('전부 입력하면 전체가 done 이다', () => {
    expect(splitByJamoProgress('가', 2)).toEqual({ done: '가', current: '', todo: '' });
  });

  it('공백·문장부호 항목도 자모 인덱스와 정합한다', () => {
    // "가 나." = ㄱㅏ ' ' ㄴㅏ '.' → 3개 소비 시 "가 " 완료
    expect(splitByJamoProgress('가 나.', 3)).toEqual({ done: '가 ', current: '', todo: '나.' });
  });
});
