import { unstable_cache } from 'next/cache';
import { getServiceClient } from '@/lib/supabase/server';

export interface LeaderboardEntry {
  nickname: string;
  timeMs: number;
}

// 60초 캐시 — 트래픽과 무관하게 Supabase 조회는 분당 1회 수준 (free 티어 egress 대비)
// 주의: 미설정(503) 판단은 캐시 밖에서 한다. 캐시 안에서 null 을 반환하면
// 환경 변수를 넣은 뒤에도 최대 60초간 미설정 응답이 캐시로 남는다.
const getLeaderboard = unstable_cache(
  async (): Promise<LeaderboardEntry[]> => {
    const supabase = getServiceClient();
    if (!supabase) throw new Error('not configured');
    const { data, error } = await supabase
      .from('race_best')
      .select('nickname, time_ms')
      .order('time_ms', { ascending: true })
      .limit(10);
    if (error) throw new Error(error.message);
    return data.map((r) => ({ nickname: r.nickname, timeMs: r.time_ms }));
  },
  ['race-leaderboard'],
  { revalidate: 60 },
);

export async function GET() {
  if (!getServiceClient()) {
    return Response.json({ error: 'not configured' }, { status: 503 });
  }
  try {
    return Response.json({ entries: await getLeaderboard() });
  } catch {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
}
