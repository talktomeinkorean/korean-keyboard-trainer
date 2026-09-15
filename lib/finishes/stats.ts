import { unstable_cache } from 'next/cache';
import { getServiceClient } from '@/lib/supabase/server';

export interface FinishStats {
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

/**
 * 완주 집계 (GET /api/finishes 와 홈 화면이 함께 쓴다).
 *
 * 60초 캐시 — 리더보드와 같은 이유(free 티어 egress)로 조회를 분당 1회 수준으로 묶는다.
 * 완주가 들어오면 POST /api/finishes 가 'race-finishes' 태그를 무효화한다.
 * 주의: 미설정 판단은 캐시 밖에서 한다. 캐시 안에서 판단하면 환경 변수를
 * 넣은 뒤에도 최대 60초간 미설정 응답이 캐시로 남는다.
 * 키에 v2: 숫자 하나만 담던 시절의 캐시가 남아 있어도 섞이지 않게 한다.
 */
export const getCachedFinishStats = unstable_cache(fetchFinishStats, ['race-finishes-v2'], {
  revalidate: 60,
  tags: ['race-finishes'],
});

/** 홈 화면 "Runners so far" 숫자. 저장소가 없거나 조회에 실패하면 null — 화면이 깨지지 않게 한다. */
export async function getParticipantCount(): Promise<number | null> {
  if (!getServiceClient()) return null;
  try {
    return (await getCachedFinishStats()).participants;
  } catch {
    return null;
  }
}
