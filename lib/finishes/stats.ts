import { unstable_cache } from 'next/cache';
import { getServiceClient } from '@/lib/supabase/server';
import { EVENT_END_MS } from '@/lib/event/countdown';

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

/**
 * 홈 화면 "Runners so far" 숫자 — 완주 횟수(행 수). 같은 사람이 여러 판 뛰어도 판마다 센다.
 * 저장소가 없거나 조회에 실패하면 null — 화면이 깨지지 않게 한다.
 */
export async function getRunnerCount(): Promise<number | null> {
  if (!getServiceClient()) return null;
  try {
    return (await getCachedFinishStats()).finishes;
  } catch {
    return null;
  }
}

async function fetchEventFinishes(): Promise<number> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('not configured');
  const { count, error } = await supabase
    .from('race_finishes')
    .select('*', { count: 'exact', head: true })
    .lt('created_at', new Date(EVENT_END_MS).toISOString());
  if (error || count === null) throw new Error(error?.message ?? 'no count');
  return count;
}

/** 종료 뒤에는 숫자가 바뀌지 않으므로 오래 들고 있는다 */
const getCachedEventFinishes = unstable_cache(fetchEventFinishes, ['race-finishes-event'], {
  revalidate: 3600,
});

/**
 * 이벤트 기간의 완주 횟수 — 종료 공지 팝업의 숫자. 종료 시각 이후 완주는 세지 않는다
 * (게임은 계속되므로 전체 완주 수는 계속 오른다).
 * 저장소가 없거나 조회에 실패하면 null.
 */
export async function getEventFinishCount(): Promise<number | null> {
  if (!getServiceClient()) return null;
  try {
    return await getCachedEventFinishes();
  } catch {
    return null;
  }
}
