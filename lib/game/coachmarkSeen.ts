export const COACHMARK_KEY = 'race-coachmark-seen';

/** 조작 안내를 이미 봤는지. 저장값을 못 읽으면 "봤다"로 친다 — 매번 띄우는 것보다 낫다. */
export function hasSeenCoachmark(): boolean {
  try {
    return localStorage.getItem(COACHMARK_KEY) === '1';
  } catch {
    return true; // 프라이빗 모드 등에서 접근이 막힌 경우
  }
}

export function markCoachmarkSeen(): void {
  try {
    localStorage.setItem(COACHMARK_KEY, '1');
  } catch {
    /* 저장 실패는 무시 — 이번 세션에만 적용된다 */
  }
}
