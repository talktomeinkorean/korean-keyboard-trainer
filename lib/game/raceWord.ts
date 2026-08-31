/** 레이스에 출제되는 단어 — 화면에 한글과 영어 뜻을 함께 보여준다. */
export interface RaceWord {
  korean: string;
  english: string | null;
}

/** 경과 시간을 디자인 표기(mm:ss.cc)로 변환한다. */
export function formatRaceTime(ms: number): string {
  const safe = Math.max(0, ms);
  const minutes = Math.floor(safe / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  const centis = Math.floor((safe % 1000) / 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
}
