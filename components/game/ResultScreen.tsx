'use client';

/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ResultCard } from './ResultCard';
import { SubmitRecordPopup } from './SubmitRecordPopup';
import { PIXEL_BUTTON, PIXEL_BUTTON_BASE } from './pixelButton';
import { formatRaceTime, rankFor } from '@/lib/game/rank';
import { encodeResultCode } from '@/lib/game/resultCode';

interface Props {
  timeMs: number;
  accuracy: number;
  /** 분당 타수 — lib/game/rank 의 keysPerMinute 로 계산해서 넘긴다 */
  keysPerMin: number;
  onRetry: () => void;
}

/** 시안 버튼 폭 (265px) */
const BUTTON = 'w-[265px] max-w-full';

export function ResultScreen({ timeMs, accuracy, keysPerMin, onRetry }: Props) {
  const [showSubmit, setShowSubmit] = useState(false);
  // null = 아직 확인 전/미설정 — 저장 버튼을 숨긴다
  const [scoringEnabled, setScoringEnabled] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    // 503(Supabase 미설정) 이면 저장 기능을 노출하지 않는다
    void fetch('/api/leaderboard')
      .then((res) => setScoringEnabled(res.ok))
      .catch(() => {});
  }, []);

  async function share() {
    const rank = rankFor(timeMs);
    const text = `I finished the Hangeul Typing Race in ${formatRaceTime(timeMs)} — ${rank.emoji} ${rank.korean} (${rank.english})!`;
    // 이 주소를 열면 결과 카드가 보이고, 링크 미리보기에도 카드 이미지가 뜬다
    const url = `${window.location.origin}/result/${encodeResultCode({ timeMs, keysPerMin })}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Hangeul Typing Race', text, url });
        return;
      } catch {
        return; // 사용자가 공유 시트를 닫은 경우 — 클립보드로 대체하지 않는다
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShared(true);
    } catch {
      /* 클립보드 권한이 없으면 아무 일도 하지 않는다 */
    }
  }

  return (
    <div
      data-testid="result-screen"
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#36454d]/50 backdrop-blur-[5px]"
    >
      <div className="flex min-h-full flex-col">
        {/* 상단 — 뒤의 게임 화면이 블러로 비친다 */}
        <div className="flex shrink-0 flex-col items-center gap-[20px] px-4 pt-[50px] pb-[26px]">
          <ResultCard timeMs={timeMs} keysPerMin={keysPerMin} />

          <div className="flex flex-col items-center gap-[10px]">
            {scoringEnabled && (
              <button
                type="button"
                onClick={() => setShowSubmit(true)}
                data-testid="result-submit"
                className={`${PIXEL_BUTTON_BASE} ${BUTTON} h-[60px] flex-col bg-[#48dd59]`}
              >
                <span className="leading-[1.2]">Submit This Record</span>
                <span className="font-dmsans text-[14px] font-bold leading-[1.2] text-[#277830]">
                  More entries, more chances to win
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={share}
              data-testid="result-share"
              className={`${PIXEL_BUTTON} ${BUTTON}`}
            >
              {shared ? 'Link copied!' : 'Save & Share'}
            </button>
            <button
              type="button"
              onClick={onRetry}
              data-testid="result-retry"
              className={`${PIXEL_BUTTON} ${BUTTON}`}
            >
              Try Again
            </button>
          </div>
        </div>

        {/* 하단 — 타자 연습 유도. 화면이 남으면 끝까지 채운다 */}
        <div className="flex min-h-[460px] flex-1 flex-col items-center gap-[10px] bg-[#36454d] px-4 pt-[21px] pb-[40px]">
          <p className="text-center font-dmsans text-[14px] font-bold text-white">
            Want to build <span className="text-[#ab99ff]">real typing skills</span>?
          </p>
          <Link
            href="/lessons"
            data-testid="result-practice"
            className={`${PIXEL_BUTTON_BASE} ${BUTTON} h-[50px] gap-[30px] bg-[#ab99ff] pl-[40px]`}
          >
            Practice Typing
            <img
              src="/race/icons/arrow-right.svg"
              alt=""
              aria-hidden
              className="h-[11px] w-[16.5px]"
            />
          </Link>
        </div>
      </div>

      {showSubmit && (
        <SubmitRecordPopup
          timeMs={timeMs}
          accuracy={accuracy}
          onClose={() => setShowSubmit(false)}
        />
      )}
    </div>
  );
}
