/**
 * 레이스 결과 등급 — 결과 스펙 명세서 기준.
 * 기록이 빠를수록 높은 등급이다.
 */
export type RankId = 'king' | 'horse' | 'deer' | 'rabbit' | 'turtle' | 'snail';

export interface Rank {
  id: RankId;
  emoji: string;
  korean: string;
  /** 로마자 표기 (등급 라벨 1줄) */
  romaja: string;
  /** 영어 이름 (등급 라벨 2줄) */
  english: string;
  /** 이 등급에 들려면 기록이 이 값보다 작아야 한다(ms). 최하위 등급은 null. */
  maxMs: number | null;
  /** 카드 가운데 문구 */
  message: string;
}

/** 빠른 등급부터 나열 — rankFor 가 위에서부터 훑는다. */
export const RANKS: Rank[] = [
  {
    id: 'king',
    emoji: '👑',
    korean: '타자왕',
    romaja: 'Tajawang',
    english: 'Typing King',
    maxMs: 12_000,
    // 최고 등급만 이스터에그로 한국어 문장을 섞는다 (스펙 명세서 지시)
    message: 'You crossed Seoul in a blink! 한글 타자, 완전히 정복하셨네요!',
  },
  {
    id: 'horse',
    emoji: '🐎',
    korean: '말',
    romaja: 'Mal',
    english: 'Horse',
    maxMs: 18_000,
    message: "You raced across Seoul. The city couldn't keep up with you!",
  },
  {
    id: 'deer',
    emoji: '🦌',
    korean: '사슴',
    romaja: 'Saseum',
    english: 'Deer',
    maxMs: 28_000,
    message: 'You glided smoothly through Seoul. Your typing feels natural and steady!',
  },
  {
    id: 'rabbit',
    emoji: '🐇',
    korean: '토끼',
    romaja: 'Tokki',
    english: 'Rabbit',
    maxMs: 45_000,
    message: 'You hopped through Seoul with ease. Korean is starting to feel more familiar!',
  },
  {
    id: 'turtle',
    emoji: '🐢',
    korean: '거북이',
    romaja: 'Geobugi',
    english: 'Turtle',
    maxMs: 75_000,
    message: 'You strolled through Seoul at a relaxed pace. One steady step at a time!',
  },
  {
    id: 'snail',
    emoji: '🐌',
    korean: '달팽이',
    romaja: 'Dalpaengi',
    english: 'Snail',
    maxMs: null,
    message: "You took your time exploring Seoul. Every step counts when you're starting out.",
  },
];

/** 기록(ms)에 해당하는 등급. 경계값은 '미만'이라 정확히 12초면 말(horse). */
export function rankFor(timeMs: number): Rank {
  return RANKS.find((r) => r.maxMs === null || timeMs < r.maxMs) ?? RANKS[RANKS.length - 1];
}

/** 한 단계 위(더 빠른) 등급. 최고 등급이면 null. */
export function nextRank(rank: Rank): Rank | null {
  const i = RANKS.findIndex((r) => r.id === rank.id);
  return i > 0 ? RANKS[i - 1] : null;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** 기록을 시안 표기(MM:SS.CC)로 — 예: 33120ms → "00:33.12" */
export function formatRaceTime(ms: number): string {
  const centis = Math.max(0, Math.round(ms / 10));
  return `${pad(Math.floor(centis / 6000))}:${pad(Math.floor(centis / 100) % 60)}.${pad(centis % 100)}`;
}

/** 카드 아래 한 줄 — 다음 등급까지 남은 목표. 최고 등급이면 축하 문구. */
export function goalText(timeMs: number): string {
  const next = nextRank(rankFor(timeMs));
  if (!next || next.maxMs === null) return 'Top rank reached! Can you go even faster?!';
  const crown = next.id === 'king' ? ' 👑' : '';
  return `Beat ${formatRaceTime(next.maxMs)} to reach ${next.korean} (${next.english.toLowerCase()})!${crown}`;
}

/**
 * 분당 타수. 자음·모음 1개를 1타로 센다 (한국 타자 연습 서비스의 표준 방식).
 * 오타는 제외하므로 correctKeys = keystrokes - errorCount 를 넘긴다.
 */
export function keysPerMinute(correctKeys: number, ms: number): number {
  if (ms <= 0) return 0;
  return Math.round(correctKeys / (ms / 60_000));
}
