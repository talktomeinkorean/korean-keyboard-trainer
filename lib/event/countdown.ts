/**
 * 이벤트 종료 시각 — 10/12 00:00 UTC (= 09:00 KST 월).
 * FAQ 의 "Oct 1 – Oct 11, 2026 (11:59 PM UTC)" 가 가리키는 시점과 같다.
 */
export const EVENT_END_MS = Date.parse('2026-10-12T00:00:00Z');

/** 종료 24시간 전부터 보인다 */
export const COUNTDOWN_WINDOW_MS = 24 * 60 * 60 * 1000;

/** 종료까지 남은 밀리초. 지난 뒤에는 0 에서 멈춘다 — 음수를 보여 주지 않는다. */
export function remainingMs(now: number): number {
  return Math.max(0, EVENT_END_MS - now);
}

/**
 * 지금 보여 줄 때인지. 종료 24시간 전부터 true 다.
 *
 * 0 이 된 뒤를 어떻게 할지는 아직 정해지지 않아 그대로 둔다 — 00:00:00 에서 멈춘 채
 * 남아 있다가 종료 배포로 홈이 바뀌면서 함께 사라진다.
 */
export function isCountdownVisible(now: number): boolean {
  return EVENT_END_MS - now <= COUNTDOWN_WINDOW_MS;
}

/** HH:MM:SS. 24시간 창 안에서만 쓰므로 시간은 두 자리로 충분하다. */
export function formatCountdown(ms: number): string {
  const total = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
}
