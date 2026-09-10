import { revalidateTag } from 'next/cache';
import { after } from 'next/server';
import { parseScoreSubmission } from '@/lib/game/score';
import { getServiceClient } from '@/lib/supabase/server';
import { syncMarketingConsent, type ConsentStore } from '@/lib/kajabi/sync';
import type { SupabaseClient } from '@supabase/supabase-js';

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

  // (선택) 마케팅 동의자만 Kajabi 뉴스레터로 넘긴다. 이메일당 한 번이다.
  // after: 응답을 보낸 뒤에 돌기 때문에 Kajabi 가 느려도 사용자가 기다리지 않는다.
  // 실패해도 기록은 이미 저장됐고, kajabi_synced_at 이 null 로 남아 나중에 다시 보낼 수 있다.
  if (consentMarketing) {
    after(() => syncMarketingConsent(consentStore(supabase), { name: nickname, email }));
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

/** ConsentStore 의 Supabase 구현 — 넘긴 시각(kajabi_synced_at)으로 중복을 막는다. */
function consentStore(supabase: SupabaseClient): ConsentStore {
  return {
    async hasSynced(email) {
      const { count } = await supabase
        .from('race_scores')
        .select('*', { count: 'exact', head: true })
        .eq('email', email)
        .not('kajabi_synced_at', 'is', null);
      // 조회가 실패하면 count 가 null 이다 — 그때는 보내는 쪽을 택한다.
      // 중복 제출은 Kajabi 가 한 연락처로 합쳐 주지만, 누락은 되돌릴 방법이 없다.
      return (count ?? 0) > 0;
    },
    async markSynced(email) {
      // 이 이메일이 동의한 채로 제출한 행 전부를 넘김 처리한다 — 연락처는 하나이므로
      // 앞서 실패했던 판들도 함께 해소된다. 동의 없이 제출한 행은 건드리지 않는다.
      await supabase
        .from('race_scores')
        .update({ kajabi_synced_at: new Date().toISOString() })
        .eq('email', email)
        .eq('consent_marketing', true)
        .is('kajabi_synced_at', null);
    },
  };
}
