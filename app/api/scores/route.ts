import { revalidateTag } from 'next/cache';
import { after } from 'next/server';
import { parseScoreSubmission } from '@/lib/game/score';
import { getServiceClient } from '@/lib/supabase/server';
import { subscribeToNewsletter } from '@/lib/kajabi/newsletter';

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
  const { email, nickname, timeMs, accuracy, consentRequired, consentMarketing } = parsed.value;

  const { error: insertError } = await supabase.from('race_scores').insert({
    email,
    nickname,
    time_ms: timeMs,
    accuracy,
    consent_required: consentRequired,
    consent_marketing: consentMarketing,
  });
  if (insertError) {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }

  // 새 기록 반영을 위해 리더보드 캐시 무효화 (다음 조회부터 백그라운드 갱신)
  revalidateTag('race-leaderboard', 'max');

  // (선택) 마케팅 동의자만 Kajabi 뉴스레터로 넘긴다.
  // after: 응답을 보낸 뒤에 돌기 때문에 Kajabi 가 느려도 사용자가 기다리지 않는다.
  // 실패해도 기록은 이미 저장됐고 consent_marketing 도 남아 있어 나중에 다시 밀어 넣을 수 있다.
  if (consentMarketing) {
    after(() => subscribeToNewsletter({ name: nickname, email }));
  }

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
