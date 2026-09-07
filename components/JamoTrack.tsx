import { useEffect, useRef, useState } from 'react';
import { toJamoGroups } from '@/lib/hangul/jamoGroups';

interface Props {
  item: string;
  typedJamoCount: number;
  errorCount: number;
}

// 배경이 흰 카드로 바뀌면서 어두운 테마 색을 쓸 수 없다. 레이스 단어 카드와 같은 팔레트.
const STATE_CLASS = {
  done: 'bg-[#eae5ff] border-[#8166ff] text-[#8166ff]',
  current: 'bg-white border-[#ff5e23] text-[#ff5e23]',
  todo: 'bg-white border-[#b8c5cc] text-[#6b8999]',
} as const;

const FLASH_CLASS = 'bg-[#ffece5] border-[#ff5e23] text-[#ff5e23]';
const FLASH_MS = 300;

export function JamoTrack({ item, typedJamoCount, errorCount }: Props) {
  // 오타 플래시: errorCount 증가를 감지해 현재 칩을 잠깐 빨갛게.
  // 마운트 시점의 누적 errorCount 로는 플래시하지 않는다 (ref 초기값 = 첫 errorCount).
  const [flashing, setFlashing] = useState(false);
  const prevErrorRef = useRef(errorCount);

  useEffect(() => {
    if (errorCount > prevErrorRef.current) {
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), FLASH_MS);
      prevErrorRef.current = errorCount;
      return () => clearTimeout(t);
    }
    prevErrorRef.current = errorCount;
  }, [errorCount]);

  const groups = toJamoGroups(item);
  let jamoIndex = 0;

  return (
    <div data-testid="jamo-track" className="flex items-center gap-3">
      {groups.map((group, g) => (
        <div key={g} className="flex gap-1">
          {group.map((jamo) => {
            const idx = jamoIndex++;
            const state =
              idx < typedJamoCount ? 'done' : idx === typedJamoCount ? 'current' : 'todo';
            const flash = state === 'current' && flashing;
            return (
              <span
                key={idx}
                data-testid={`jamo-${idx}`}
                data-state={state}
                data-flash={flash}
                className={`inline-flex h-8 w-7 items-center justify-center rounded border text-base transition-colors ${
                  flash ? FLASH_CLASS : STATE_CLASS[state]
                }`}
              >
                {jamo}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
