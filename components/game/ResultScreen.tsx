'use client';

/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import { useEffect, useRef, useState } from 'react';
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
  // 이번 기록을 이미 저장했는지 — 한 판에 한 번만 등록되게 한다
  const [submitted, setSubmitted] = useState(false);
  // 버튼에 잠깐 띄우는 안내 문구 (복사됨 / 저장됨)
  const [feedback, setFeedback] = useState<string | null>(null);

  const code = encodeResultCode({ timeMs, keysPerMin });

  // 공유용 카드 이미지를 미리 받아둔다.
  // iOS Safari 는 navigator.share 가 사용자 제스처 직후에 불려야 해서, 클릭한 뒤에
  // fetch 를 기다렸다가 부르면 조용히 실패한다. 그래서 화면이 뜰 때 미리 받는다.
  const cardFileRef = useRef<File | null>(null);
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const res = await fetch(`/result/${code}/card`);
        if (!res.ok) return;
        const blob = await res.blob();
        if (alive) {
          cardFileRef.current = new File([blob], 'hangeul-typing-race.png', { type: 'image/png' });
        }
      } catch {
        /* 이미지를 못 받으면 아래에서 링크 공유로 떨어진다 */
      }
    })();
    return () => {
      alive = false;
    };
  }, [code]);

  async function share() {
    const rank = rankFor(timeMs);
    const message = `I finished the Hangeul Typing Race in ${formatRaceTime(timeMs)} — ${rank.emoji} ${rank.korean} (${rank.english})!`;
    // 이 주소를 열면 결과 카드가 보이고, 링크 미리보기에도 카드 이미지가 뜬다
    const url = `${window.location.origin}/result/${code}`;
    const file = cardFileRef.current;

    // 1) 이미지를 공유 시트로 넘길 수 있으면 그렇게 한다 (인스타·카톡에 바로 붙는다).
    //    파일과 함께 넘긴 url 은 iOS 에서 버려지는 일이 많아 문구 안에 넣는다.
    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `${message} ${url}` });
      } catch {
        /* 사용자가 공유 시트를 닫은 경우 */
      }
      return;
    }

    // 2) 파일 공유가 안 되는 환경(주로 PC) — 이미지를 내려받는다
    if (file) {
      const href = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = href;
      a.download = file.name;
      a.click();
      // 클릭 직후 즉시 해제하면 일부 브라우저에서 다운로드가 끊긴다
      setTimeout(() => URL.revokeObjectURL(href), 0);
      setFeedback('Image saved!');
      return;
    }

    // 3) 이미지를 못 받았으면 링크라도 공유한다
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Hangeul Typing Race', text: message, url });
      } catch {
        /* 사용자가 공유 시트를 닫은 경우 — 클립보드로 대체하지 않는다 */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${message} ${url}`);
      setFeedback('Link copied!');
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
            {/* 저장 후에는 잠기고 문구가 바뀐다. 새 판을 시작하면 화면이 다시
                마운트되므로 자동으로 원래 상태로 돌아간다. */}
            <button
              type="button"
              disabled={submitted}
              onClick={() => setShowSubmit(true)}
              data-testid="result-submit"
              className={`${PIXEL_BUTTON_BASE} ${BUTTON} h-[60px] flex-col disabled:hover:brightness-100 ${
                submitted ? 'bg-[#8ceb97]' : 'bg-[#48dd59]'
              }`}
            >
              <span className="leading-[1.2]">
                {submitted ? '✓ Record Submitted' : 'Submit This Record'}
              </span>
              <span className="font-dmsans text-[14px] font-bold leading-[1.2] text-[#277830]">
                {submitted ? 'Play again for another entry' : 'More entries, more chances to win'}
              </span>
            </button>
            <button
              type="button"
              onClick={share}
              data-testid="result-share"
              className={`${PIXEL_BUTTON} ${BUTTON}`}
            >
              {feedback ?? 'Save & Share'}
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
          onSubmitted={() => setSubmitted(true)}
        />
      )}
    </div>
  );
}
