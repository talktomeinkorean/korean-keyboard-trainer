/* eslint-disable @next/next/no-img-element -- 고정 크기 로고라 최적화 파이프라인이 필요 없다. */
import type { Metadata } from 'next';
import { formatRaceTime } from '@/lib/game/rank';
import { getCachedLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard/top';
import { getServiceClient } from '@/lib/supabase/server';
import { AutoRefresh } from './AutoRefresh';

/**
 * 사내 대회용 최고 기록 1~10위 화면.
 *
 * 기획에서 공개 리더보드는 빠졌으므로 앱 어디에서도 링크하지 않고, 검색에도 올리지 않는다
 * (사이트맵에도 넣지 않는다). 주소를 아는 사람만 들어온다.
 * 이메일은 보여주지 않는다 — 닉네임과 기록만.
 */
export const metadata: Metadata = {
  title: 'Best Records — Hangeul Typing Race',
  robots: { index: false, follow: false },
};

// 데이터는 60초 캐시(기록 저장 시 즉시 무효화)라 페이지도 같은 주기로 다시 만든다
export const revalidate = 60;

// 조회는 상위 10개까지만 한다 (lib/leaderboard/top) — 더 늘리려면 그쪽 limit 도 같이 올릴 것
const TOP_COUNT = 10;
const REFRESH_MS = 30_000;

async function loadTop(): Promise<LeaderboardEntry[] | null> {
  if (!getServiceClient()) return null;
  try {
    return (await getCachedLeaderboard()).slice(0, TOP_COUNT);
  } catch {
    return null;
  }
}

export default async function BestPage() {
  const entries = await loadTop();

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#36454d] px-4 pt-[50px] pb-[40px]">
      {/* 큰 화면에 띄워도 컬럼 양옆이 흰색으로 남지 않게 화면 폭 전체를 칠한다 */}
      <div aria-hidden className="absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[#36454d]" />
      <AutoRefresh intervalMs={REFRESH_MS} />
      <img src="/logo.png" alt="" aria-hidden className="w-[160px]" />
      <h1 className="mt-[16px] font-dmmono text-[20px] font-medium text-[#8ceb97]">Best Records</h1>

      {entries === null ? (
        <p className="mt-[40px] font-dmsans text-[14px] text-white/70">Couldn&apos;t load records. Try again soon.</p>
      ) : entries.length === 0 ? (
        <p className="mt-[40px] font-dmsans text-[14px] text-white/70">No records yet.</p>
      ) : (
        <ol className="mt-[30px] flex w-[330px] max-w-full flex-col gap-[10px]">
          {entries.map((entry, i) => (
            <li
              key={`${i}-${entry.nickname}`}
              data-testid="best-entry"
              className={`flex h-[56px] items-center gap-[12px] rounded-[2px] border border-[#36454d] px-[16px] text-[#36454d] ${
                i === 0 ? 'bg-[#8ceb97]' : 'bg-white'
              }`}
            >
              <span className="w-[28px] shrink-0 font-vt323 text-[28px] leading-none">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-dmsans text-[16px] font-bold">{entry.nickname}</span>
              <span className="shrink-0 font-vt323 text-[24px] leading-none">{formatRaceTime(entry.timeMs)}</span>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
