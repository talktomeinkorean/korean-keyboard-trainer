import { describe, it, expect } from 'vitest';
import { formatRaceTime } from './raceWord';

describe('formatRaceTime', () => {
  it('mm:ss.cc 형식으로 표기한다', () => {
    expect(formatRaceTime(0)).toBe('00:00.00');
    expect(formatRaceTime(55000)).toBe('00:55.00');
    expect(formatRaceTime(33120)).toBe('00:33.12');
  });

  it('분 단위를 넘어가도 처리한다', () => {
    expect(formatRaceTime(61000)).toBe('01:01.00');
    expect(formatRaceTime(600000)).toBe('10:00.00');
  });

  it('음수는 0으로 처리한다', () => {
    expect(formatRaceTime(-100)).toBe('00:00.00');
  });
});
