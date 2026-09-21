export const KEY_GUIDE_KEY = 'key-guide-off';

/** Key Guide 설정 조회. 저장값이 없거나 손상됐으면 켜짐(true). */
export function loadKeyGuide(): boolean {
  try {
    return localStorage.getItem(KEY_GUIDE_KEY) !== '1';
  } catch {
    return true; // 프라이빗 모드 등에서 접근이 막힌 경우
  }
}

export function saveKeyGuide(on: boolean): void {
  try {
    localStorage.setItem(KEY_GUIDE_KEY, on ? '0' : '1');
  } catch {
    /* 저장 실패는 무시 — 이번 세션에만 적용된다 */
  }
}
