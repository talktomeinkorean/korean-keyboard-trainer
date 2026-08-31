export interface ScoreSubmission {
  email: string;
  nickname: string;
  timeMs: number;
  accuracy: number;
  /** (필수) 추첨을 위한 이름·이메일 수집 동의. 없으면 저장하지 않는다. */
  consentRequired: true;
  /** (선택) 마케팅 정보 수신 동의 */
  consentMarketing: boolean;
}

export type ParseResult =
  | { ok: true; value: ScoreSubmission }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NICKNAME_MAX = 20;
export const TIME_MS_MIN = 3000;
export const TIME_MS_MAX = 3600000;

/** POST /api/scores 요청 본문 검증. DB 제약과 동일한 규칙. */
export function parseScoreSubmission(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'invalid body' };
  }
  const { email, nickname, timeMs, accuracy, consentRequired, consentMarketing } =
    body as Record<string, unknown>;

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'invalid email' };
  }
  const trimmedNickname = typeof nickname === 'string' ? nickname.trim() : '';
  if (trimmedNickname.length < 1 || trimmedNickname.length > NICKNAME_MAX) {
    return { ok: false, error: 'invalid nickname' };
  }
  if (
    typeof timeMs !== 'number' || !Number.isInteger(timeMs) ||
    timeMs < TIME_MS_MIN || timeMs > TIME_MS_MAX
  ) {
    return { ok: false, error: 'invalid timeMs' };
  }
  if (
    typeof accuracy !== 'number' || !Number.isInteger(accuracy) ||
    accuracy < 0 || accuracy > 100
  ) {
    return { ok: false, error: 'invalid accuracy' };
  }

  // 필수 동의는 정확히 true 여야 한다 ('yes', 1 같은 truthy 값으로 우회되면 안 됨)
  if (consentRequired !== true) {
    return { ok: false, error: 'consent required' };
  }

  return {
    ok: true,
    value: {
      email: email.toLowerCase(),
      nickname: trimmedNickname,
      timeMs,
      accuracy,
      consentRequired: true,
      consentMarketing: consentMarketing === true,
    },
  };
}
