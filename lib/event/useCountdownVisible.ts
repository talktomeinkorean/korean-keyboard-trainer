"use client";

import { useEffect, useState } from "react";
import { isCountdownVisible } from "./countdown";

/**
 * 카운트다운이 떠 있는지 — 홈 레이아웃이 그 자리를 미리 비워 두지 않으려고 쓴다.
 *
 * 서버에서는 늘 false 다. 홈은 정적으로 만들어 캐시되므로 서버에서 시각을 읽으면 그 값이
 * 굳어 버리고, 서버와 다른 값을 그리면 하이드레이션이 어긋난다 (EventCountdown 과 같은 이유다).
 */
export function useCountdownVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 브라우저에서만 읽는다 — 서버에서 읽으면 캐시된 시각이 굳는다
    const read = () => setVisible(isCountdownVisible(Date.now()));
    read();
    const id = setInterval(read, 1000);
    return () => clearInterval(id);
  }, []);

  return visible;
}
