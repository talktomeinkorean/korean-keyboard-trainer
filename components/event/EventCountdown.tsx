'use client';

import { useEffect, useState } from 'react';
import { formatCountdown, isCountdownVisible, remainingMs } from '@/lib/event/countdown';

/**
 * 종료까지 남은 시간. 종료 24시간 전부터 저절로 나타난다 — 그때 맞춰 배포하지 않아도 된다.
 *
 * 시각은 브라우저에서만 읽는다. 홈은 정적으로 만들어 캐시되므로 서버에서 읽으면 캐시된
 * 시각이 굳어 버리고, 서버와 다른 값을 그리면 하이드레이션이 어긋난다.
 * 그래서 첫 렌더에서는 아무것도 그리지 않는다.
 *
 * 글자는 DM Mono 다 — 폭이 고정이라 숫자가 바뀔 때 줄이 흔들리지 않는다.
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

  return (
    <p
      data-testid="event-countdown"
      className={`text-center font-dmmono text-[17px] leading-[1.4] text-[#36454d] ${className ?? ''}`}
    >
      Entries close in{' '}
      <span className="font-medium">{formatCountdown(remainingMs(now))}</span>
    </p>
  );
}
