interface Props {
  /** 완성한 단어 수 */
  progress: number;
  /** 전체 단어 수 */
  total: number;
  /** 달리기 애니메이션 재생 여부 (게임 진행 중) */
  running?: boolean;
}

const BG_SRC = '/race/bg_hanriver.webp';
const RUN_SHEET_SRC = '/race/run_sheet.webp';
/** 캐릭터 렌더 크기(px). 스프라이트 시트는 이 크기 4프레임 가로 배열이다. */
const CHAR_PX = 64;

/**
 * 레이스 배경 씬 — 한강 파노라마(1983×793)를 창(뷰포트)으로 잘라 보여주고,
 * 단어를 완성할 때마다 배경을 가로로 밀어 전진하는 느낌을 준다.
 *
 * backgroundPosition 을 % 로 다루면 실제 렌더 크기를 재지 않아도
 * 0% = 장면 시작, 100% = 장면 끝(결승선)이 되어 반응형에서 그대로 동작한다.
 */
export function RaceScene({ progress, total, running = false }: Props) {
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
      {/* 캐릭터 — 4프레임 스프라이트. 진행 중에만 달리고, 멈추면 첫 프레임으로 선다. */}
      <div
        data-testid="race-runner"
        role="img"
        aria-label="runner"
        className="absolute bottom-[10%] left-[40%]"
        style={{
          width: CHAR_PX,
          height: CHAR_PX,
          backgroundImage: `url(${RUN_SHEET_SRC})`,
          backgroundSize: `${CHAR_PX * 4}px ${CHAR_PX}px`,
          backgroundRepeat: 'no-repeat',
          backgroundPositionX: 0,
          imageRendering: 'pixelated',
          animation: running ? 'sprite-run 0.5s steps(4) infinite' : undefined,
        }}
      />
    </div>
  );
}
