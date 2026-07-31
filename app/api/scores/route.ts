import { revalidateTag } from 'next/cache';
import { parseScoreSubmission } from '@/lib/game/score';
import { getServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = getServiceClient();
  if (!supabase) {
    return Response.json({ error: 'not configured' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid body' }, { status: 400 });
  }

  const parsed = parseScoreSubmission(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  const { email, nickname, timeMs, accuracy } = parsed.value;

  const { error: insertError } = await supabase.from('race_scores').insert({
    email,
    nickname,
    time_ms: timeMs,
    accuracy,
  });
  if (insertError) {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }

  // 새 기록 반영을 위해 리더보드 캐시 무효화 (다음 조회부터 백그라운드 갱신)
  revalidateTag('race-leaderboard', 'max');

  // 내 최고 기록과 순위 (플레이어별 최고 기록 뷰 기준)
  const { data: best, error: bestError } = await supabase
    .from('race_best')
    .select('time_ms')
    .eq('email', email)
    .single();
  if (bestError || !best) {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }

  const { count, error: rankError } = await supabase
    .from('race_best')
    .select('*', { count: 'exact', head: true })
    .lt('time_ms', best.time_ms);
  if (rankError || count === null) {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }

  return Response.json({ bestMs: best.time_ms, rank: count + 1 });
}
