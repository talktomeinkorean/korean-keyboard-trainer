'use client';

import { useEffect, useState } from 'react';
import { countdownParts, isCountdownVisible, remainingMs } from '@/lib/event/countdown';

/**
 * 칸 폭 — 시안 1857:12569. 아래 라벨 글자 폭에 맞춰 칸마다 다르다.
 * Days 는 쓰지 않는다 (남은 시간이 24시간 안이라 시·분·초면 충분하다).
 */
const BOX = [
  { key: 'hours', label: 'Hours', width: 55 },
  { key: 'minutes', label: 'Minutes', width: 60 },
  { key: 'seconds', label: 'Seconds', width: 57 },
] as const;

/** 숫자 칸과 구분점이 같은 서체·크기를 쓴다 (시안 VT323 30px) */
const DIGIT = 'font-vt323 text-[30px] leading-[1.1] text-[#36454d]';

/**
 * 종료까지 남은 시간. 종료 24시간 전부터 저절로 나타난다 — 그때 맞춰 배포하지 않아도 된다.
 *
 * 시각은 브라우저에서만 읽는다. 홈은 정적으로 만들어 캐시되므로 서버에서 읽으면 캐시된
 * 시각이 굳어 버리고, 서버와 다른 값을 그리면 하이드레이션이 어긋난다.
 * 그래서 첫 렌더에서는 아무것도 그리지 않는다.
 */
export function EventCountdown({ className }: { className?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 서버에서 읽으면 캐시된 시각이 굳는다. 브라우저에서만 읽어야 한다.
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null || !isCountdownVisible(now)) return null;

  const parts = countdownParts(remainingMs(now));

  return (
    <div
      data-testid="event-countdown"
      role="timer"
      className={`flex flex-col items-center gap-[5px] ${className ?? ''}`}
    >
      <div className="flex items-center gap-[5px]">
        {BOX.map(({ key, width }, i) => (
          <div key={key} className="flex items-center gap-[5px]">
            {/* 칸 사이 구분점 — 첫 칸 앞에는 없다 */}
            {i > 0 && <span className={DIGIT}>:</span>}
            <span
              data-testid={`countdown-${key}`}
              style={{ width }}
              className={`flex items-center justify-center rounded-[19px] bg-white px-[15px] py-[10px] ${DIGIT}`}
            >
              {parts[key]}
            </span>
          </div>
        ))}
      </div>

      {/* 라벨 — 칸과 같은 폭으로 두어 숫자 아래 가운데에 선다 */}
      <div className="flex items-center gap-[23px] font-vt323 text-[13px] leading-[1.1] text-black">
        {BOX.map(({ key, label, width }) => (
          <span key={key} style={{ width }} className="text-center opacity-40">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
