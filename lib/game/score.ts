export interface ScoreSubmission {
  email: string;
  nickname: string;
  timeMs: number;
  accuracy: number;
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
  const { email, nickname, timeMs, accuracy } = body as Record<string, unknown>;

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

  return {
    ok: true,
    value: { email: email.toLowerCase(), nickname: trimmedNickname, timeMs, accuracy },
  };
}
