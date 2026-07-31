/** 풀에서 중복 없이 count개 랜덤 추출 (Fisher-Yates 셔플) */
export function pickRandom<T>(pool: readonly T[], count: number): T[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

/** 폴백용 단어 풀 — 평소에는 /api/race-words 가 DB(vocabulary)에서 공급한다. */
export const RACE_WORD_POOL: string[] = [
  '한국', '사람', '학교', '친구', '음악', '시간',
  '안녕', '커피', '주말', '여행', '사랑', '행복',
];

export function pickRaceWords(count = 5): string[] {
  return pickRandom(RACE_WORD_POOL, count);
}
