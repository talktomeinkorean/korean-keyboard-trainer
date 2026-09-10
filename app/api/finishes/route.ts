/**
 * 완주 집계 — 결과 화면이 뜰 때 POST 로 한 행 쌓고, GET 으로 집계를 읽는다.
 *
 * race_scores 는 이메일까지 남긴 사람만 담기 때문에 "완주한 사람 수" 를 알 수 없다.
 * 그 수를 세려고 별도 테이블(race_finishes)을 쓴다. 행 하나 = 완주 한 번이고,
 * 브라우저별 익명 난수(session_id)를 함께 남겨 "횟수" 와 "사람 수" 를 구분한다.
 * 개인 식별 정보는 담지 않는다.
 *
 * 주의: 인증이 없어 반복 호출로 숫자를 부풀릴 수 있다. 표시용 집계값이라 그대로
 * 두기로 했으니, 정확도가 필요한 곳(추첨·순위)에는 이 값을 쓰지 말 것.
 */
import { revalidateTag, unstable_cache } from 'next/cache';
import { getServiceClient } from '@/lib/supabase/server';

interface FinishStats {
  /** 완주 횟수 — 행 수 */
  finishes: number;
  /** 참여자 수 — 서로 다른 session_id 수 */
  participants: number;
}

async function fetchFinishStats(): Promise<FinishStats> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('not configured');
  const { data, error } = await supabase
    .from('race_finish_stats')
    .select('finishes, participants')
    .single<FinishStats>();
  if (error || !data) throw new Error(error?.message ?? 'no stats');
  return data;
}

// 60초 캐시 — 리더보드와 같은 이유(free 티어 egress)로 조회를 분당 1회 수준으로 묶는다.
// 주의: 미설정(503) 판단은 캐시 밖에서 한다. 캐시 안에서 판단하면 환경 변수를
// 넣은 뒤에도 최대 60초간 미설정 응답이 캐시로 남는다.
// 키에 v2: 숫자 하나만 담던 시절의 캐시가 남아 있어도 섞이지 않게 한다.
const getCachedFinishStats = unstable_cache(fetchFinishStats, ['race-finishes-v2'], {
  revalidate: 60,
  tags: ['race-finishes'],
});

/**
 * 익명 세션 ID 추출. 형식이 어긋나면 null 로 두고 그냥 쌓는다 —
 * 집계 때문에 완주가 기록되지 않는 편이 더 나쁘다.
 */
function sessionIdFrom(body: unknown): string | null {
  const value = (body as { sessionId?: unknown } | null)?.sessionId;
  return typeof value === 'string' && value.length > 0 && value.length <= 64 ? value : null;
}

export async function GET() {
  if (!getServiceClient()) {
    return Response.json({ error: 'not configured' }, { status: 503 });
  }
  try {
    const { finishes, participants } = await getCachedFinishStats();
    // count 는 기존 응답과의 호환을 위해 남긴다 (= finishes)
    return Response.json({ count: finishes, participants });
  } catch {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getServiceClient();
  if (!supabase) {
    return Response.json({ error: 'not configured' }, { status: 503 });
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    /* 본문 없이 온 요청 — 익명 행으로 쌓는다 */
  }

  const { error } = await supabase
    .from('race_finishes')
    .insert({ session_id: sessionIdFrom(body) });
  if (error) {
    return Response.json({ error: 'internal error' }, { status: 500 });
  }

  revalidateTag('race-finishes', 'max');
  return new Response(null, { status: 204 });
}
