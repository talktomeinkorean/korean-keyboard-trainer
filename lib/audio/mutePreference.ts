export const MUTE_KEY = 'race-muted';

/** 음소거 설정 조회. 저장값이 없거나 손상됐으면 소리 켜짐(false). */
export function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false; // 프라이빗 모드 등에서 접근이 막힌 경우
  }
}

export function saveMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* 저장 실패는 무시 — 이번 세션에만 적용된다 */
  }
}
