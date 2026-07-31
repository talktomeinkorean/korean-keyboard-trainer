import { unstable_cache } from 'next/cache';
import { getServiceClient } from '@/lib/supabase/server';

export interface LeaderboardEntry {
  nickname: string;
  timeMs: number;
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
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
// 주의: 미설정(503) 판단은 캐시 밖에서 한다. 캐시 안에서 판단하면 환경 변수를
// 넣은 뒤에도 최대 60초간 미설정 응답이 캐시로 남는다.
// 스코어 저장 시 /api/scores 가 'race-leaderboard' 태그를 무효화한다.
const getCachedLeaderboard = unstable_cache(fetchLeaderboard, ['race-leaderboard'], {
  revalidate: 60,
  tags: ['race-leaderboard'],
});

export async function GET(request: Request) {
  if (!getServiceClient()) {
    return Response.json({ error: 'not configured' }, { status: 503 });
  }
  // 제출 직후 클라이언트는 ?fresh=1 로 캐시를 우회해 방금 저장한 기록을 바로 본다
  const fresh = new URL(request.url).searchParams.has('fresh');
  try {
    const entries = fresh ? await fetchLeaderboard() : await getCachedLeaderboard();
    return Response.json({ entries });
  } catch {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
}
