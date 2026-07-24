import { LESSONS } from '@/lib/curriculum/lessons';

/** 게임용 단어 풀 — 현재는 word 단계 레슨 단어. 추후 외부 데이터 연동 시 이 공급부만 교체. */
export const RACE_WORD_POOL: string[] = LESSONS.filter((l) => l.stage === 'word').flatMap(
  (l) => l.items,
);

/** 풀에서 중복 없이 count개 랜덤 추출 (Fisher-Yates 셔플) */
export function pickRaceWords(count = 5): string[] {
  const pool = [...RACE_WORD_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
