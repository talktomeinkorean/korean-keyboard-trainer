/**
 * 연습 세트 구성 — 스펙(2026-09 타자연습 스펙)의 개수와 순서를 그대로 옮긴 순수 함수들.
 *
 * 무작위가 섞이므로 렌더 중에 부르면 안 된다. 마운트 후 클라이언트에서 한 번 부른다
 * (서버와 클라이언트가 각자 뽑으면 hydration 이 어긋난다).
 */

/** Basics 한 판의 항목 수 */
export const BASICS_SET_SIZE = 40;

/** 음절 한 판 구성 — 레벨 순서대로 이만큼씩 뽑는다 (합 30) */
const SYLLABLE_PLAN: { levels: number[]; count: number }[] = [
  { levels: [1], count: 10 },
  { levels: [2], count: 8 },
  { levels: [3], count: 7 },
  { levels: [4, 5], count: 5 },
];

function shuffled<T>(pool: readonly T[]): T[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * 풀에서 count 개를 무작위로 뽑는다.
 * count 가 풀보다 크면 (자음 19개에서 40개를 뽑는 경우처럼) 풀을 다시 섞어 이어 붙인다 —
 * 한 바퀴 안에서는 중복이 없으니 특정 글자만 몰려 나오지 않는다.
 */
export function sampleItems<T>(pool: readonly T[], count: number): T[] {
  if (pool.length === 0) return [];
  const picked: T[] = [];
  while (picked.length < count) {
    picked.push(...shuffled(pool).slice(0, count - picked.length));
  }
  return picked;
}

/**
 * 자음·모음 한 판.
 * 아직 한 번도 끝내지 않았으면(firstTime) 순서대로 한 바퀴 돈 뒤 나머지를 무작위로 채우고,
 * 이미 끝낸 적이 있으면 전부 무작위다.
 */
export function basicsSet(
  pool: readonly string[],
  firstTime: boolean,
  size = BASICS_SET_SIZE,
): string[] {
  if (!firstTime) return sampleItems(pool, size);
  return [...pool.slice(0, size), ...sampleItems(pool, size - pool.length)];
}

/** 음절 한 판 — 레벨 1→2→3→4·5 순서로 10·8·7·5 개. */
export function syllableSet(byLevel: Record<string, readonly string[]>): string[] {
  return SYLLABLE_PLAN.flatMap(({ levels, count }) =>
    sampleItems(levels.flatMap((level) => byLevel[level] ?? []), count),
  );
}
