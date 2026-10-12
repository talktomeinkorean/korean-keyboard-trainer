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
    returningVisitors: 2_840,
    finishes: 21_811,
    participants: 6_277,
    marketingPeople: 1_380,
  };

  // 2026-10-07 요청 — 하루치는 빼고 누계만 보낸다. 응모 줄은 2026-10-12 에 뺐다.
  it('누계 숫자들을 보낸다', () => {
    const text = formatSlackMessage(report, new Date('2026-10-01T00:00:00Z'));
    expect(text).toContain('누계 리포트 (2026-10-01 09:00 KST 기준)');
    expect(text).toContain('홈 방문자 12,345명 (재방문 2,840명 · 23%)');
    expect(text).toContain('완주 21,811회 · 완주자 6,277명');
    expect(text).toContain('마케팅 동의자 1,380명');
  });

  it('하루치 숫자는 넣지 않는다', () => {
    const text = formatSlackMessage(report);
    expect(text).not.toContain('참여 리포트');
    expect(text).not.toContain('중간 현황');
    expect(text).not.toContain('뉴스레터');
  });

  it('GA4 설정이 없으면 홈 방문자 줄만 뺀다', () => {
    const text = formatSlackMessage({ ...report, homeVisitors: null, returningVisitors: null });
    expect(text).not.toContain('홈 방문자');
    expect(text).toContain('완주 21,811회');
    expect(text).toContain('마케팅 동의자 1,380명');
  });

  it('재방문자만 못 읽었으면 괄호 없이 홈 방문자만 보인다', () => {
    const text = formatSlackMessage({ ...report, returningVisitors: null });
    expect(text).toContain('• 홈 방문자 12,345명\n');
  });

  it('홈 방문자가 0 이면 비율은 빼고 숫자만 둔다', () => {
    const text = formatSlackMessage({ ...report, homeVisitors: 0, returningVisitors: 0 });
    expect(text).toContain('홈 방문자 0명 (재방문 0명)');
  });
});
