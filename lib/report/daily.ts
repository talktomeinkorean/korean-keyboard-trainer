import { formatRaceTime } from '@/lib/game/rank';

/** 리포트에 담는 숫자. 조회가 실패하면 그 항목만 null 로 둔다. */
export interface DailyReport {
  /** 집계 대상 날짜 (한국 시간 기준, YYYY-MM-DD) */
  date: string;
  finishes: number;
  participants: number;
  submissions: number;
  newsletterOptIns: number;
  /** 그날의 상위 기록 — 닉네임과 시간 */
  top: { nickname: string; timeMs: number }[];
  totals: { finishes: number; participants: number; submissions: number };
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * "어제 하루"를 한국 시간 기준으로 자른 구간. 리포트는 오전 9시(KST)에 돌므로
 * 그 시점에서 어제는 이미 끝난 하루다.
 */
export function kstYesterday(now: Date): { start: Date; end: Date; date: string } {
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
  const kstMidnight = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate());
  const end = new Date(kstMidnight - KST_OFFSET_MS); // 오늘 00:00 KST
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  return { start, end, date: new Date(kstMidnight - 24 * 60 * 60 * 1000).toISOString().slice(0, 10) };
}

/** 슬랙에 보낼 본문 (mrkdwn). 숫자만 담고 이메일 같은 개인정보는 넣지 않는다. */
export function formatSlackMessage(r: DailyReport): string {
  const lines = [
    `*한글타자 레이스 — ${r.date} 참여 리포트*`,
    `• 완주 ${r.finishes.toLocaleString('en-US')}회 · 참여자 ${r.participants.toLocaleString('en-US')}명`,
    `• 기록 저장 ${r.submissions.toLocaleString('en-US')}건 · 뉴스레터 동의 ${r.newsletterOptIns.toLocaleString('en-US')}건`,
  ];
  if (r.top.length > 0) {
    const top = r.top.map((t, i) => `${i + 1}. ${t.nickname} ${formatRaceTime(t.timeMs)}`).join(' / ');
    lines.push(`• 그날의 최고 기록 — ${top}`);
  }
  lines.push(
    `• 누계 — 완주 ${r.totals.finishes.toLocaleString('en-US')}회 · 참여자 ${r.totals.participants.toLocaleString('en-US')}명 · 기록 저장 ${r.totals.submissions.toLocaleString('en-US')}건`,
  );
  return lines.join('\n');
}
