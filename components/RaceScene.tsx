interface Props {
  /** 완성한 단어 수 */
  progress: number;
  /** 전체 단어 수 */
  total: number;
}

const BG_SRC = '/race/bg_hanriver.webp';

/**
 * 레이스 배경 씬 — 한강 파노라마(1983×793)를 창(뷰포트)으로 잘라 보여주고,
 * 단어를 완성할 때마다 배경을 가로로 밀어 전진하는 느낌을 준다.
 *
 * backgroundPosition 을 % 로 다루면 실제 렌더 크기를 재지 않아도
 * 0% = 장면 시작, 100% = 장면 끝(결승선)이 되어 반응형에서 그대로 동작한다.
 */
export function RaceScene({ progress, total }: Props) {
  const ratio = total > 0 ? Math.min(Math.max(progress / total, 0), 1) : 0;
  const positionX = `${ratio * 100}%`;

  return (
    // 이미지(2.5:1)가 창보다 넓어야 스크롤이 성립한다. 디자인 비율 7:6 을 유지하면
    // 창 너비의 약 2.1배가 보이지 않는 영역으로 남아 전진 여유가 생긴다.
    <div
      data-testid="race-scene"
      className="relative w-full max-w-md aspect-[7/6] overflow-hidden rounded-xl border-2 border-sky-300 bg-sky-300"
    >
      <div
        data-testid="race-scene-bg"
        className="absolute inset-0 transition-[background-position] duration-500 ease-out motion-reduce:transition-none"
        style={{
          backgroundImage: `url(${BG_SRC})`,
          backgroundSize: 'auto 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `${positionX} bottom`,
          imageRendering: 'pixelated',
        }}
      />
      {/* 캐릭터 — 스프라이트 에셋이 준비되면 교체 */}
      <span
        data-testid="race-runner"
        aria-label="runner"
        className="absolute bottom-[12%] left-[42%] text-3xl sm:text-4xl"
      >
        🏃
      </span>
    </div>
  );
}
