/* eslint-disable @next/next/no-img-element -- 고정 크기 로고라 최적화 파이프라인이 필요 없다. */
import type { Metadata } from 'next';
import { formatRaceTime } from '@/lib/game/rank';
import { getCachedKeysLeaderboard, getCachedLeaderboard } from '@/lib/leaderboard/top';
import { getServiceClient } from '@/lib/supabase/server';
import { AutoRefresh } from './AutoRefresh';

/**
 * 사내 대회용 최고 기록 1~10위 화면 — 시간 순위와 분당 타수 순위를 나란히 보여준다.
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

interface Row {
  nickname: string;
  /** 오른쪽에 보일 값 (시간 또는 타수) */
  value: string;
}

/** 조회에 실패하면 null — 한쪽 순위가 실패해도 다른 쪽은 보여준다 */
async function load(read: () => Promise<Row[]>): Promise<Row[] | null> {
  if (!getServiceClient()) return null;
  try {
    return (await read()).slice(0, TOP_COUNT);
  } catch {
    return null;
  }
}

export default async function BestPage() {
  const [byTime, byKeys] = await Promise.all([
    load(async () =>
      (await getCachedLeaderboard()).map((e) => ({ nickname: e.nickname, value: formatRaceTime(e.timeMs) })),
    ),
    load(async () =>
      (await getCachedKeysLeaderboard()).map((e) => ({ nickname: e.nickname, value: String(e.keysPerMin) })),
    ),
  ]);

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#36454d] px-4 pt-[50px] pb-[40px]">
      {/* 큰 화면에 띄워도 컬럼 양옆이 흰색으로 남지 않게 화면 폭 전체를 칠한다 */}
      <div aria-hidden className="absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[#36454d]" />
      <AutoRefresh intervalMs={REFRESH_MS} />
      <img src="/logo.png" alt="" aria-hidden className="w-[160px]" />
      <h1 className="mt-[16px] font-dmmono text-[20px] font-medium text-[#8ceb97]">Best Records</h1>

      {/* 폰에서는 위아래로, 넓은 화면(대회 중 띄워 둘 모니터)에서는 컬럼 밖으로 넓혀 나란히 놓는다 */}
      <div className="mt-[30px] flex w-screen flex-col items-center gap-[30px] px-4 sm:flex-row sm:items-start sm:justify-center sm:gap-[40px]">
        <Ranking testId="best-time" title="Fastest Time" rows={byTime} />
        {/* 타수는 저장하기 시작한 뒤의 기록만 들어간다 */}
        <Ranking testId="best-keys" title="Keys / min" rows={byKeys} />
      </div>
    </main>
  );
}

function Ranking({ testId, title, rows }: { testId: string; title: string; rows: Row[] | null }) {
  return (
    <section data-testid={testId} className="flex w-[330px] max-w-full flex-col">
      <h2 className="font-dmmono text-[16px] font-medium text-white">{title}</h2>
      {rows === null ? (
        <p className="mt-[12px] font-dmsans text-[14px] text-white/70">Couldn&apos;t load records. Try again soon.</p>
      ) : rows.length === 0 ? (
        <p className="mt-[12px] font-dmsans text-[14px] text-white/70">No records yet.</p>
      ) : (
        <ol className="mt-[12px] flex flex-col gap-[10px]">
          {rows.map((row, i) => (
            <li
              key={`${i}-${row.nickname}`}
              data-testid="best-entry"
              className={`flex h-[56px] items-center gap-[12px] rounded-[2px] border border-[#36454d] px-[16px] text-[#36454d] ${
                i === 0 ? 'bg-[#8ceb97]' : 'bg-white'
              }`}
            >
              <span className="w-[28px] shrink-0 font-vt323 text-[28px] leading-none">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-dmsans text-[16px] font-bold">{row.nickname}</span>
              <span className="shrink-0 font-vt323 text-[24px] leading-none">{row.value}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
