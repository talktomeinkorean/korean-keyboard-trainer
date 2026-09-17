/**
 * 상위 기록 조회 — 운영용으로만 남겨둔 엔드포인트다.
 *
 * 기획에서 리더보드가 빠지면서 앱 화면에서는 더 이상 호출하지 않는다 (2026-09-04).
 * (사내 대회용 /best 화면은 이 API 를 거치지 않고 lib/leaderboard/top 을 직접 읽는다.)
 * 이벤트 당첨자를 뽑을 때 기록을 확인하는 용도라 지우지 않았으니, 호출하는 곳이
 * 없다고 해서 죽은 코드로 보고 삭제하지 말 것.
 */
import { getServiceClient } from '@/lib/supabase/server';
import { fetchLeaderboard, getCachedLeaderboard } from '@/lib/leaderboard/top';

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
