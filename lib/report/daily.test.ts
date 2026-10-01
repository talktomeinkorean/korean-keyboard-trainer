import { describe, it, expect } from 'vitest';
import { kstYesterday, formatSlackMessage } from './daily';

describe('kstYesterday', () => {
  it('오전 9시(KST)에 돌면 어제 하루(KST 00:00~24:00)를 자른다', () => {
    // 2026-10-02 00:00 UTC = 2026-10-02 09:00 KST
    const w = kstYesterday(new Date('2026-10-02T00:00:00Z'));
    expect(w.date).toBe('2026-10-01');
    expect(w.start.toISOString()).toBe('2026-09-30T15:00:00.000Z'); // 10/01 00:00 KST
    expect(w.end.toISOString()).toBe('2026-10-01T15:00:00.000Z'); // 10/02 00:00 KST
  });

  it('한국 시간으로 자정 직후에 돌아도 같은 날을 가리킨다', () => {
    // 2026-10-01 15:30 UTC = 2026-10-02 00:30 KST
    expect(kstYesterday(new Date('2026-10-01T15:30:00Z')).date).toBe('2026-10-01');
  });
});

describe('formatSlackMessage', () => {
  const report = {
    date: '2026-10-01',
    finishes: 1234,
    participants: 567,
    submissions: 89,
    newsletterOptIns: 42,
    top: [
      { nickname: 'sw', timeMs: 7100 },
      { nickname: 'Jan', timeMs: 9265 },
    ],
    totals: { finishes: 5000, participants: 2500, submissions: 400 },
  };

  it('숫자를 읽기 쉬운 한 덩어리로 묶는다', () => {
    const text = formatSlackMessage(report);
    expect(text).toContain('2026-10-01 참여 리포트');
    expect(text).toContain('완주 1,234회 · 참여자 567명');
    expect(text).toContain('뉴스레터 동의 42건');
    expect(text).toContain('1. sw 00:07.10');
    expect(text).toContain('누계');
  });

  it('그날 저장된 기록이 없으면 최고 기록 줄을 빼고 보낸다', () => {
    const text = formatSlackMessage({ ...report, top: [] });
    expect(text).not.toContain('최고 기록');
  });
});
