/**
 * 레이스 배경 — 판마다(Try Again 포함) 무작위로 하나를 고른다.
 *
 * 세 장 모두 1983x793 이고 캐릭터 발 높이(아래 10%)가 길 위에 떨어지도록 그려져 있어,
 * 배치 코드는 그대로 두고 이미지만 바꾸면 된다.
 */
export interface RaceBackground {
  id: string;
  src: string;
}

export const RACE_BACKGROUNDS: readonly RaceBackground[] = [
  { id: 'hanriver', src: '/race/bg_hanriver.webp' },
  { id: 'gwanghwamun', src: '/race/bg_gwanghwamun.webp' },
  { id: 'uljiro', src: '/race/bg_uljiro.webp' },
];

/** 무작위 선택 — 렌더 중에 부르면 안 된다 (서버·클라이언트가 달리 뽑아 hydration 이 어긋난다) */
export function pickRaceBackground(random: () => number = Math.random): RaceBackground {
  return RACE_BACKGROUNDS[Math.floor(random() * RACE_BACKGROUNDS.length)];
}
