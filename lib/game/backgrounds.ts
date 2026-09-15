/**
 * 레이스 배경 — 판마다(Try Again 포함) 무작위로 하나를 고른다.
 *
 * 세 장 모두 1983x793 이고 캐릭터 발 높이(아래 10%)가 길 위에 떨어지도록 그려져 있어,
 * 배치 코드는 그대로 두고 이미지만 바꾸면 된다.
 */
export interface RaceBackground {
  id: string;
  /** 게임 화면 배경 (1983x793) */
  src: string;
  /** 결과 카드 폴라로이드에 들어가는 같은 장소 그림 (225x223) */
  resultSrc: string;
}

export const RACE_BACKGROUNDS: readonly RaceBackground[] = [
  { id: 'hanriver', src: '/race/bg_hanriver.webp', resultSrc: '/race/result-hanriver.png' },
  { id: 'gwanghwamun', src: '/race/bg_gwanghwamun.webp', resultSrc: '/race/result-gwanghwamun.png' },
  { id: 'uljiro', src: '/race/bg_uljiro.webp', resultSrc: '/race/result-uljiro.png' },
];

/** 무작위 선택 — 렌더 중에 부르면 안 된다 (서버·클라이언트가 달리 뽑아 hydration 이 어긋난다) */
export function pickRaceBackground(random: () => number = Math.random): RaceBackground {
  return RACE_BACKGROUNDS[Math.floor(random() * RACE_BACKGROUNDS.length)];
}

/**
 * 결과 카드에 쓸 장소 그림. 배경을 모르는 화면(공유 링크)에서는 첫 배경으로 떨어진다 —
 * 링크 주소에는 기록만 담겨 있어 어느 배경으로 뛰었는지 알 수 없다.
 */
export function resultBackgroundSrc(id?: string): string {
  return (RACE_BACKGROUNDS.find((b) => b.id === id) ?? RACE_BACKGROUNDS[0]).resultSrc;
}
