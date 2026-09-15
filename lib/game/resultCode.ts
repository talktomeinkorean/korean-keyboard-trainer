import { TIME_MS_MAX, TIME_MS_MIN } from './score';

export interface ResultCodeValue {
  timeMs: number;
  keysPerMin: number;
  /** 뛴 배경 id. 이 칸이 생기기 전에 만들어진 링크에는 없다. */
  backgroundId?: string;
}

const KEYS_PER_MIN_MAX = 2000;

/**
 * 공유 링크용 결과 코드. 기록·타수·배경을 담는다 — 예: 33120-112-uljiro
 *
 * DB 를 거치지 않으므로 저장(동의)하지 않아도 공유할 수 있다. 대신 주소를
 * 직접 고쳐 아무 기록이나 만들어낼 수 있으니, 순위의 근거는 어디까지나
 * leaderboard(서버에 저장된 기록)다. 이 코드는 미리보기 카드용일 뿐이다.
 */
export function encodeResultCode({ timeMs, keysPerMin, backgroundId }: ResultCodeValue): string {
  const record = `${Math.round(timeMs)}-${Math.round(keysPerMin)}`;
  return backgroundId ? `${record}-${backgroundId}` : record;
}

/** 형식·범위가 어긋나면 null — 라우트에서 notFound() 로 처리한다. */
export function decodeResultCode(code: string): ResultCodeValue | null {
  // 배경 칸은 없을 수도 있다 — 예전 링크를 깨지 않는다
  const match = /^(\d{1,8})-(\d{1,4})(?:-([a-z]{1,20}))?$/.exec(code);
  if (!match) return null;

  const timeMs = Number(match[1]);
  const keysPerMin = Number(match[2]);
  if (timeMs < TIME_MS_MIN || timeMs > TIME_MS_MAX) return null;
  if (keysPerMin > KEYS_PER_MIN_MAX) return null;

  // 모르는 배경 id 로 404 를 내지는 않는다 — 그리는 쪽에서 기본 배경으로 떨어진다
  return { timeMs, keysPerMin, backgroundId: match[3] };
}
