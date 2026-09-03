import { describe, it, expect } from 'vitest';
import { RANKS, rankFor, nextRank, formatRaceTime, goalText, keysPerMinute } from './rank';

describe('rankFor', () => {
  it('스펙의 구간대로 등급을 정한다', () => {
    expect(rankFor(11_999).id).toBe('king');
    expect(rankFor(17_999).id).toBe('horse');
    expect(rankFor(27_999).id).toBe('deer');
    expect(rankFor(33_120).id).toBe('rabbit');
    expect(rankFor(74_999).id).toBe('turtle');
    expect(rankFor(75_000).id).toBe('snail');
  });

  it('경계값은 미만 기준이라 상한과 같으면 아래 등급이다', () => {
    expect(rankFor(12_000).id).toBe('horse');
    expect(rankFor(45_000).id).toBe('turtle');
  });
});

describe('nextRank', () => {
  it('한 단계 위 등급을 준다', () => {
    expect(nextRank(rankFor(33_120))?.id).toBe('deer');
  });

  it('최고 등급 위는 없다', () => {
    expect(nextRank(RANKS[0])).toBeNull();
  });
});

describe('formatRaceTime', () => {
  it('MM:SS.CC 로 표기한다', () => {
    expect(formatRaceTime(33_120)).toBe('00:33.12');
    expect(formatRaceTime(75_000)).toBe('01:15.00');
    expect(formatRaceTime(12_000)).toBe('00:12.00');
    expect(formatRaceTime(0)).toBe('00:00.00');
  });
});

describe('goalText', () => {
  it('다음 등급과 목표 기록을 안내한다', () => {
    expect(goalText(33_120)).toBe('Beat 00:28.00 to reach 사슴 (deer)!');
    expect(goalText(90_000)).toBe('Beat 01:15.00 to reach 거북이 (turtle)!');
  });

  it('타자왕 직전에는 왕관을 붙인다', () => {
    expect(goalText(15_000)).toBe('Beat 00:12.00 to reach 타자왕 (typing king)! 👑');
  });

  it('최고 등급이면 축하 문구를 준다', () => {
    expect(goalText(9_000)).toBe('Top rank reached! Can you go even faster?!');
  });
});

describe('keysPerMinute', () => {
  it('오타를 뺀 자모 수를 분당으로 환산한다', () => {
    expect(keysPerMinute(100, 60_000)).toBe(100);
    expect(keysPerMinute(62, 33_120)).toBe(112);
  });

  it('기록이 0 이면 0 이다 (0 으로 나누지 않는다)', () => {
    expect(keysPerMinute(50, 0)).toBe(0);
  });
});
