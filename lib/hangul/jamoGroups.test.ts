import { describe, it, expect } from 'vitest';
import { disassemble } from 'es-hangul';
import { toJamoGroups, splitByJamoProgress, currentSyllableJamos } from './jamoGroups';

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

describe('currentSyllableJamos', () => {
  it('현재 입력 중인 음절의 자모만 돌려준다', () => {
    // 한글: ㅎㅏㄴ / ㄱㅡㄹ — 0개 입력이면 첫 음절
    expect(currentSyllableJamos('한글', 0)).toEqual({ jamos: ['ㅎ', 'ㅏ', 'ㄴ'], typedCount: 0 });
    expect(currentSyllableJamos('한글', 2)).toEqual({ jamos: ['ㅎ', 'ㅏ', 'ㄴ'], typedCount: 2 });
  });

  it('음절을 넘기면 다음 음절로 이동한다', () => {
    expect(currentSyllableJamos('한글', 3)).toEqual({ jamos: ['ㄱ', 'ㅡ', 'ㄹ'], typedCount: 0 });
    expect(currentSyllableJamos('한글', 4)).toEqual({ jamos: ['ㄱ', 'ㅡ', 'ㄹ'], typedCount: 1 });
  });

  it('전부 입력하면 마지막 음절을 완료 상태로 보여준다', () => {
    expect(currentSyllableJamos('한글', 6)).toEqual({ jamos: ['ㄱ', 'ㅡ', 'ㄹ'], typedCount: 3 });
  });

  it('빈 문자열도 안전하다', () => {
    expect(currentSyllableJamos('', 0)).toEqual({ jamos: [], typedCount: 0 });
  });
});
