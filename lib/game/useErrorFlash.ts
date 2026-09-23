'use client';

import { useEffect, useRef, useState } from 'react';

/** 오타가 나면 카드 테두리와 자모 칩을 이만큼 빨갛게 보여준다 */
export const ERROR_FLASH_MS = 700;

/**
 * 오타 직후 잠깐 켜지는 표시 — 레이스와 타자연습이 같은 규칙을 쓰도록 여기 모았다.
 *
 * `wrong` 은 시간으로만 풀린다. 빨리 치는 사람도 오타가 났다는 걸 놓치지 않게 하려는 것이다.
 * `wrongHere` 는 틀린 그 자리에 그대로 있을 때만 참이다 — 자모 칩처럼 자리를 따라다니는
 * 표시는 이걸 써야 한다. 시간만 보고 칠하면 바로 맞게 쳤을 때 다음 칩이 빨개진다.
 *
 * @param spot 지금 치고 있는 자리 (단어 + 친 자모 수처럼 자리가 바뀌면 달라지는 값)
 */
export function useErrorFlash(errorCount: number, spot?: string) {
  const [wrong, setWrong] = useState(false);
  const [wrongSpot, setWrongSpot] = useState<string | undefined>(undefined);
  const prevError = useRef(errorCount);
  // 오타는 입력을 진행시키지 않으므로 지금 렌더된 자리가 곧 틀린 자리다
  const spotRef = useRef(spot);
  useEffect(() => {
    spotRef.current = spot;
  }, [spot]);

  useEffect(() => {
    const isNewError = errorCount > prevError.current;
    prevError.current = errorCount;
    if (!isNewError) return;
    setWrong(true);
    setWrongSpot(spotRef.current);
    // 다음 오타가 나거나 화면을 벗어나면 이전 타이머는 치운다 (연달아 틀리면 마지막 오타부터 다시 센다)
    const timer = setTimeout(() => setWrong(false), ERROR_FLASH_MS);
    return () => clearTimeout(timer);
  }, [errorCount]);

  return { wrong, wrongHere: wrong && wrongSpot === spot };
}
