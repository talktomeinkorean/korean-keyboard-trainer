import { describe, it, expect } from 'vitest';
import { reportWindow, formatSlackMessage } from './daily';

// 2026-10-02 00:00 UTC = 2026-10-02 09:00 KST (크론이 도는 시각)
const CRON_TIME = new Date('2026-10-02T00:00:00Z');

describe('reportWindow', () => {
  it('기본값은 끝난 하루 — 어제 00:00~24:00 KST', () => {
    const w = reportWindow(CRON_TIME)!;
    expect(w.date).toBe('2026-10-01');
    expect(w.partial).toBe(false);
    expect(w.start.toISOString()).toBe('2026-09-30T15:00:00.000Z');
    expect(w.end.toISOString()).toBe('2026-10-01T15:00:00.000Z');
  });

  it('today 는 오늘 00:00 부터 지금까지 — 중간 현황', () => {
    const w = reportWindow(CRON_TIME, 'today')!;
    expect(w.date).toBe('2026-10-02');
    expect(w.partial).toBe(true);
    expect(w.start.toISOString()).toBe('2026-10-01T15:00:00.000Z');
    expect(w.end.toISOString()).toBe(CRON_TIME.toISOString());
  });

  it('날짜를 지정하면 그 하루', () => {
    const w = reportWindow(CRON_TIME, '2026-09-28')!;
    expect(w.date).toBe('2026-09-28');
    expect(w.partial).toBe(false);
    expect(w.start.toISOString()).toBe('2026-09-27T15:00:00.000Z');
    expect(w.end.toISOString()).toBe('2026-09-28T15:00:00.000Z');
  });

  it('오늘을 날짜로 지정하면 today 와 같다 (중간 현황)', () => {
    expect(reportWindow(CRON_TIME, '2026-10-02')!.partial).toBe(true);
  });

  it('형식이 틀렸거나 아직 오지 않은 날짜는 거부한다', () => {
    expect(reportWindow(CRON_TIME, '10/01')).toBeNull();
    expect(reportWindow(CRON_TIME, '2026-13-01')).toBeNull();
    expect(reportWindow(CRON_TIME, '2026-10-03')).toBeNull();
  });

  it('한국 시간 자정 직후에도 어제가 밀리지 않는다', () => {
    // 2026-10-01 15:30 UTC = 2026-10-02 00:30 KST
    expect(reportWindow(new Date('2026-10-01T15:30:00Z'))!.date).toBe('2026-10-01');
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
