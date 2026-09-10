/**
 * 완주 수 익명 집계 — 결과 화면이 뜰 때 POST 로 1 올리고, GET 으로 총합을 읽는다.
 *
 * race_scores 는 이메일까지 남긴 사람만 담기 때문에 "완주한 사람 수" 를 알 수 없다.
 * 그 수를 세려고 별도 테이블(race_finishes)을 쓴다. 행 하나 = 완주 한 번이고
 * 개인 식별 정보는 담지 않는다.
 *
 * 주의: 인증이 없어 반복 호출로 숫자를 부풀릴 수 있다. 표시용 집계값이라 그대로
 * 두기로 했으니, 정확도가 필요한 곳(추첨·순위)에는 이 값을 쓰지 말 것.
 */
import { revalidateTag, unstable_cache } from 'next/cache';
import { getServiceClient } from '@/lib/supabase/server';

async function fetchFinishCount(): Promise<number> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('not configured');
  const { count, error } = await supabase
    .from('race_finishes')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// 60초 캐시 — 리더보드와 같은 이유(free 티어 egress)로 조회를 분당 1회 수준으로 묶는다.
// 주의: 미설정(503) 판단은 캐시 밖에서 한다. 캐시 안에서 판단하면 환경 변수를
// 넣은 뒤에도 최대 60초간 미설정 응답이 캐시로 남는다.
const getCachedFinishCount = unstable_cache(fetchFinishCount, ['race-finishes'], {
  revalidate: 60,
  tags: ['race-finishes'],
});

export async function GET() {
  if (!getServiceClient()) {
    return Response.json({ error: 'not configured' }, { status: 503 });
  }
  try {
    return Response.json({ count: await getCachedFinishCount() });
  } catch {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
}

export async function POST() {
  const supabase = getServiceClient();
  if (!supabase) {
    return Response.json({ error: 'not configured' }, { status: 503 });
  }

  const { error } = await supabase.from('race_finishes').insert({});
  if (error) {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }

  revalidateTag('race-finishes', 'max');
  return new Response(null, { status: 204 });
}
