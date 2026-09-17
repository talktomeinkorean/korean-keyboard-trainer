import { unstable_cache } from 'next/cache';
import { getServiceClient } from '@/lib/supabase/server';

export interface LeaderboardEntry {
  nickname: string;
  timeMs: number;
}

/** 플레이어(이메일)별 최고 기록 상위 10개. */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('not configured');
  const { data, error } = await supabase
    .from('race_best')
    .select('nickname, time_ms')
    .order('time_ms', { ascending: true })
    .limit(10);
  if (error) throw new Error(error.message);
  return data.map((r) => ({ nickname: r.nickname, timeMs: r.time_ms }));
}

// 60초 캐시 — 트래픽과 무관하게 Supabase 조회는 분당 1회 수준 (free 티어 egress 대비)
// 주의: 미설정 판단은 캐시 밖에서 한다. 캐시 안에서 판단하면 환경 변수를
// 넣은 뒤에도 최대 60초간 미설정 응답이 캐시로 남는다.
// 스코어 저장 시 /api/scores 가 'race-leaderboard' 태그를 무효화한다.
export const getCachedLeaderboard = unstable_cache(fetchLeaderboard, ['race-leaderboard'], {
  revalidate: 60,
  tags: ['race-leaderboard'],
});

export interface KeysLeaderboardEntry {
  nickname: string;
  keysPerMin: number;
}

interface KeysRow {
  email: string;
  nickname: string;
  keys_per_min: number;
}

/**
 * 타수 순으로 정렬된 행에서 플레이어(이메일)마다 첫 행(=최고 타수)만 남긴다.
 * 닉네임은 그 최고 기록을 낸 판의 것이다 (시간 순위의 race_best 와 같은 규칙).
 */
export function bestKeysPerPlayer(rows: KeysRow[], limit: number): KeysLeaderboardEntry[] {
  const seen = new Set<string>();
  const entries: KeysLeaderboardEntry[] = [];
  for (const row of rows) {
    if (seen.has(row.email)) continue;
    seen.add(row.email);
    entries.push({ nickname: row.nickname, keysPerMin: row.keys_per_min });
    if (entries.length === limit) break;
  }
  return entries;
}

/**
 * 1명이 여러 판을 저장해도 상위 10명이 채워지도록 넉넉히 읽는다.
 * 플레이어별 최고값 뷰를 만들지 않은 건 SQL 을 한 번 더 돌리지 않기 위해서다 —
 * 사내 대회 규모에서는 이 정도면 충분하다. 참가자가 크게 늘면 race_best 같은 뷰로 옮길 것.
 */
const KEYS_SCAN_ROWS = 1000;

/** 플레이어별 최고 분당 타수 상위 10개. 타수를 저장하기 전 기록(null)은 빠진다. */
async function fetchKeysLeaderboard(): Promise<KeysLeaderboardEntry[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('not configured');
  const { data, error } = await supabase
    .from('race_scores')
    .select('email, nickname, keys_per_min')
    .not('keys_per_min', 'is', null)
    .order('keys_per_min', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(KEYS_SCAN_ROWS);
  if (error) throw new Error(error.message);
  return bestKeysPerPlayer(data as KeysRow[], 10);
}

// 시간 순위와 같은 태그라 기록 저장 시 함께 무효화된다
export const getCachedKeysLeaderboard = unstable_cache(fetchKeysLeaderboard, ['race-leaderboard-keys'], {
  revalidate: 60,
  tags: ['race-leaderboard'],
});
