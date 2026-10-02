import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * PostgREST 가 한 응답에 담아 주는 행 수 상한.
 * `.limit()` 을 더 크게 줘도 여기서 잘리므로, 전부 읽으려면 나눠 읽어야 한다.
 */
const PAGE_SIZE = 1000;

/** 읽을 페이지 수 상한 — 하루 10만 판까지 센다. 더 늘면 숫자가 모자라게 나온다. */
const MAX_PAGES = 100;

/**
 * 구간 안의 참여자 수 — 같은 브라우저의 여러 판은 한 명으로 센다.
 *
 * 완주 수와 달리 중복을 걷어내야 해서 세어 달라고 맡길 수가 없고 session_id 를 직접 읽는다.
 * 한 번에 PAGE_SIZE 행까지만 오므로 다 읽을 때까지 이어서 받는다.
 */
export async function countParticipants(
  supabase: SupabaseClient,
  from: string,
  to: string,
): Promise<number> {
  const sessions = new Set<string>();
  // session_id 가 없던 옛 기록은 묶을 수가 없어 각각 센다
  let anonymous = 0;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { data, error } = await supabase
      .from('race_finishes')
      .select('session_id')
      .gte('created_at', from)
      .lt('created_at', to)
      // 페이지가 겹치거나 빠지지 않게 고정된 순서로 읽는다 (created_at 은 같은 값이 나올 수 있다)
      .order('id')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) throw error;

    const rows = (data ?? []) as { session_id: string | null }[];
    for (const row of rows) {
      if (row.session_id) sessions.add(row.session_id);
      else anonymous += 1;
    }
    if (rows.length < PAGE_SIZE) break;
  }

  return sessions.size + anonymous;
}
