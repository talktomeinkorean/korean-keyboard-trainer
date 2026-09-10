/**
 * "이 연습을 전에 열어본 적 있나" 만 기억하는 아주 작은 저장소.
 *
 * Basics 는 첫 방문에만 순서대로 한 바퀴 돌기 때문에 이 값이 필요하다.
 * 완료가 아니라 방문 기준이다 — 중간에 나가도 다음부터는 재방문으로 친다.
 * 진행률(htt.results)과 목적이 달라 키를 따로 쓴다.
 */
const VISITED_KEY = 'htt.visited';

function read(): string[] {
  try {
    const raw = localStorage.getItem(VISITED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** 전에 연 적이 있으면 true. 없으면 방문으로 기록하고 false 를 준다. */
export function visitOnce(key: string): boolean {
  const seen = read();
  if (seen.includes(key)) return true;
  try {
    localStorage.setItem(VISITED_KEY, JSON.stringify([...seen, key]));
  } catch {
    // 시크릿 모드 등 — 저장 생략 (매번 첫 방문으로 보인다)
  }
  return false;
}
