import { describe, it, expect } from 'vitest';
import { kstDateOf, formatSlackMessage } from './daily';

describe('kstDateOf', () => {
  it('한국 시간 기준 날짜를 돌려준다', () => {
    // 2026-10-07 00:00 UTC = 2026-10-07 09:00 KST (크론이 도는 시각)
    expect(kstDateOf(new Date('2026-10-07T00:00:00Z'))).toBe('2026-10-07');
    // UTC 로는 전날이어도 한국은 이미 다음 날이다
    expect(kstDateOf(new Date('2026-10-06T15:30:00Z'))).toBe('2026-10-07');
  });
});

describe('formatSlackMessage', () => {
  const report = {
    date: '2026-10-01',
    homeVisitors: 12_345,
    finishes: 21_811,
    participants: 6_277,
    submissions: 9_530,
    entrants: 4_120,
    marketingPeople: 1_380,
  };

  // 2026-10-07 요청 — 하루치는 빼고 누계 6가지만 보낸다
  it('누계 여섯 가지를 보낸다', () => {
    const text = formatSlackMessage(report, new Date('2026-10-01T00:00:00Z'));
    expect(text).toContain('누계 리포트 (2026-10-01 09:00 KST 기준)');
    expect(text).toContain('홈 방문자 12,345명');
    expect(text).toContain('완주 21,811회 · 완주자 6,277명');
    expect(text).toContain('응모 9,530건 · 응모자 4,120명');
    expect(text).toContain('마케팅 동의자 1,380명');
  });

  it('하루치 숫자는 넣지 않는다', () => {
    const text = formatSlackMessage(report);
    expect(text).not.toContain('참여 리포트');
    expect(text).not.toContain('중간 현황');
    expect(text).not.toContain('뉴스레터');
  });

  it('GA4 설정이 없으면 홈 방문자 줄만 뺀다', () => {
    const text = formatSlackMessage({ ...report, homeVisitors: null });
    expect(text).not.toContain('홈 방문자');
    expect(text).toContain('완주 21,811회');
    expect(text).toContain('마케팅 동의자 1,380명');
  });
});
