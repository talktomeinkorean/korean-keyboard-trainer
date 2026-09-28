import { sendGTMEvent } from '@next/third-parties/google';

/**
 * GA4(=GTM dataLayer) 이벤트 한 곳.
 *
 * 개인정보는 넣지 않는다 — 이름·이메일·닉네임·결과 코드는 보내지 않고 숫자와 구분값만 보낸다.
 * GTM 은 프로덕션에서만 로드하므로(app/layout.tsx) 개발 중에는 아무 일도 일어나지 않는다.
 */
export type TrackEvent =
  /** 시작 팝업의 Game Start */
  | { event: 'race_start' }
  /** 10단어 완주 — 결과 화면이 뜨는 시점 */
  | { event: 'race_finish'; time_ms: number; keys_per_min: number; accuracy: number; rank: string }
  /** 기록 저장 성공 */
  | { event: 'record_submit'; consent_marketing: boolean }
  /** 결과 카드 이미지 저장 */
  | { event: 'result_save' }
  /** 결과 링크 공유 팝업 열기 */
  | { event: 'result_share' }
  /** 결과 링크 복사 성공 */
  | { event: 'result_link_copy' }
  /** 타자연습 시작·완료 */
  | { event: 'practice_start'; category: string; stage: string }
  | { event: 'practice_finish'; category: string; stage: string; wpm: number; accuracy: number };

export function track(payload: TrackEvent): void {
  try {
    sendGTMEvent(payload);
  } catch {
    /* 측정 실패가 화면을 막지 않게 한다 (차단 확장 프로그램 등) */
  }
}
