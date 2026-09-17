export interface ScoreSubmission {
  email: string;
  nickname: string;
  timeMs: number;
  accuracy: number;
  /**
   * 분당 타수(오타 제외 자모 수 기준). 이 필드가 생기기 전 화면에서 보낸 요청에는 없어 null 이다.
   * 클라이언트가 계산한 값이라 서버가 검증할 수는 없다 — 순위 기준은 여전히 timeMs 다.
   */
  keysPerMin: number | null;
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
/** 사람이 낼 수 없는 값은 받지 않는다 (공유 링크 코드와 같은 상한) */
export const KEYS_PER_MIN_MAX = 2000;

/** POST /api/scores 요청 본문 검증. DB 제약과 동일한 규칙. */
export function parseScoreSubmission(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'invalid body' };
  }
  const { email, nickname, timeMs, accuracy, keysPerMin, consentRequired, consentMarketing } =
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

  // 없으면 null(예전 화면), 있으면 0~상한 정수여야 한다
  if (
    keysPerMin !== undefined &&
    (typeof keysPerMin !== 'number' || !Number.isInteger(keysPerMin) ||
      keysPerMin < 0 || keysPerMin > KEYS_PER_MIN_MAX)
  ) {
    return { ok: false, error: 'invalid keysPerMin' };
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
      keysPerMin: keysPerMin === undefined ? null : keysPerMin,
      consentRequired: true,
      consentMarketing: consentMarketing === true,
    },
  };
}
