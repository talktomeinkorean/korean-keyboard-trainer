import { describe, it, expect } from 'vitest';
import { basicsSet, sampleItems, syllableSet, BASICS_SET_SIZE } from './practiceSet';
import basics from '@/lib/content/basics.json';

const CONSONANTS = basics.consonants;
const VOWELS = basics.vowels;

describe('sampleItems', () => {
  it('풀보다 적게 뽑으면 중복이 없다', () => {
    const picked = sampleItems(CONSONANTS, 10);
    expect(picked).toHaveLength(10);
    expect(new Set(picked).size).toBe(10);
  });

  it('풀보다 많이 뽑으면 풀을 다시 돌려 채운다 — 한 바퀴 안에서는 중복이 없다', () => {
    const picked = sampleItems(CONSONANTS, 40);
    expect(picked).toHaveLength(40);
    // 앞 19개가 한 바퀴 = 자음 전체
    expect(new Set(picked.slice(0, CONSONANTS.length)).size).toBe(CONSONANTS.length);
    expect(picked.every((c) => CONSONANTS.includes(c))).toBe(true);
  });

  it('빈 풀에서는 빈 배열 — 무한 루프에 빠지지 않는다', () => {
    expect(sampleItems([], 5)).toEqual([]);
  });
});

describe('basicsSet', () => {
  it('자음 — 아직 못 끝냈으면: 19개를 순서대로 돈 뒤 21개를 무작위로 채운다', () => {
    const set = basicsSet(CONSONANTS, true);
    expect(set).toHaveLength(BASICS_SET_SIZE);
    expect(set.slice(0, 19)).toEqual(CONSONANTS);
  });

  it('모음 — 아직 못 끝냈으면: 21개를 순서대로 돈 뒤 19개를 무작위로 채운다', () => {
    const set = basicsSet(VOWELS, true);
    expect(set).toHaveLength(BASICS_SET_SIZE);
    expect(set.slice(0, 21)).toEqual(VOWELS);
  });

  it('한 번 끝낸 뒤에는 순서대로 도는 구간 없이 40개 전부 무작위다', () => {
    const set = basicsSet(CONSONANTS, false);
    expect(set).toHaveLength(BASICS_SET_SIZE);
    expect(set.every((c) => CONSONANTS.includes(c))).toBe(true);
    // 40번 다 같은 순서로 시작할 확률은 사실상 0
    const runs = Array.from({ length: 20 }, () => basicsSet(CONSONANTS, false).join(''));
    expect(new Set(runs).size).toBeGreaterThan(1);
  });
});

describe('syllableSet', () => {
  it('레벨 순서대로 10·8·7·5 개, 총 30개를 뽑는다', () => {
    const set = syllableSet(basics.syllables);
    expect(set).toHaveLength(30);

    const level = (s: string) =>
      Object.entries(basics.syllables).find(([, list]) => list.includes(s))?.[0];
    expect(set.slice(0, 10).map(level)).toEqual(Array(10).fill('1'));
    expect(set.slice(10, 18).map(level)).toEqual(Array(8).fill('2'));
    expect(set.slice(18, 25).map(level)).toEqual(Array(7).fill('3'));
    expect(set.slice(25).every((s) => ['4', '5'].includes(level(s)!))).toBe(true);
  });

  it('구간마다 중복 없이 뽑는다', () => {
    const set = syllableSet(basics.syllables);
    expect(new Set(set).size).toBe(30);
  });
});
