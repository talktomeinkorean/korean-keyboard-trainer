import { unstable_cache } from 'next/cache';
import { getServiceClient } from '@/lib/supabase/server';

export interface LeaderboardEntry {
  nickname: string;
  timeMs: number;
}

// 60초 캐시 — 트래픽과 무관하게 Supabase 조회는 분당 1회 수준 (free 티어 egress 대비)
const getLeaderboard = unstable_cache(
  async (): Promise<LeaderboardEntry[] | null> => {
    const supabase = getServiceClient();
    if (!supabase) return null;
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
  try {
    const entries = await getLeaderboard();
    if (entries === null) {
      return Response.json({ error: 'not configured' }, { status: 503 });
    }
    return Response.json({ entries });
  } catch {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
}
