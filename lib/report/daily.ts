/**
 * 리포트에 담는 숫자 — 모두 누계다. 개인정보는 넣지 않는다.
 * 하루치는 넣지 않는다 (2026-10-07 요청) — 추이는 GA4 에서 본다.
 */
export interface DailyReport {
  /** 집계 시각이 한국 시간으로 며칠인지 (YYYY-MM-DD) */
  date: string;
  /** 홈 방문자 수 — GA4 에서 읽는다. 설정이 없으면 null 이라 그 줄을 뺀다 */
  homeVisitors: number | null;
  /** 완주 횟수 */
  finishes: number;
  /** 완주자 수 — 같은 브라우저의 여러 판은 한 명 */
  participants: number;
  /** 응모 횟수 (= 기록 저장) */
  submissions: number;
  /** 응모자 수 — 같은 이메일은 한 명 */
  entrants: number;
  /** 마케팅 동의자 수 — 같은 이메일은 한 명 */
  marketingPeople: number;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** now 가 한국 시간으로 며칠인지 (YYYY-MM-DD) */
export function kstDateOf(now: Date): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 한국 시간 시각 — 중간 집계가 언제 기준인지 밝힌다 */
function kstClock(at: Date): string {
  return new Date(at.getTime() + KST_OFFSET_MS).toISOString().slice(11, 16);
}

/** 슬랙에 보낼 본문 (mrkdwn). 숫자만 담고 이메일 같은 개인정보는 넣지 않는다. */
export function formatSlackMessage(r: DailyReport, until?: Date): string {
  const n = (v: number) => v.toLocaleString('en-US');
  const when = until ? ` ${kstClock(until)} KST` : '';
  const lines = [
    `*한글타자 레이스 — 누계 리포트 (${r.date}${when} 기준)*`,
    // GA4 설정이 없으면 이 줄만 빠진다
    ...(r.homeVisitors === null ? [] : [`• 홈 방문자 ${n(r.homeVisitors)}명`]),
    `• 완주 ${n(r.finishes)}회 · 완주자 ${n(r.participants)}명`,
    `• 응모 ${n(r.submissions)}건 · 응모자 ${n(r.entrants)}명`,
    `• 마케팅 동의자 ${n(r.marketingPeople)}명`,
  ];
  return lines.join('\n');
}
