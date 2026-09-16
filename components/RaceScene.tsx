import { RACE_BACKGROUNDS } from '@/lib/game/backgrounds';

interface Props {
  /** 배경 파노라마 — 판마다 무작위로 고른 것 (lib/game/backgrounds) */
  backgroundSrc?: string;
  /** 완성한 단어 수 */
  progress: number;
  /** 전체 단어 수 */
  total: number;
  /** 달리기 애니메이션 재생 여부 (게임 진행 중) */
  running?: boolean;
  /** 씬 위에 겹쳐 놓을 내용 (상단 바·단어 카드). 시안대로 절대 배치된다. */
  children?: React.ReactNode;
}

// 4프레임 시트(512x128, 프레임당 128px). 이 크기를 고른 이유는 아래 CHAR_PX 주석 참고.
const RUN_SHEET_SRC = '/race/run_sheet.webp';
/** 캐릭터 렌더 크기(px). 스프라이트 시트는 이 크기 4프레임 가로 배열이다. */
// 시트는 프레임당 128px 라 레티나에서 64px 로 그리면 정확히 1:1 이다.
// imageRendering 을 지정하지 않는 이유: 어느 화면에서도 확대가 아니라 1:1 이거나 축소라,
// 최근접(pixelated)을 쓰면 축소할 때 1px 디테일이 통째로 날아간다.
const CHAR_PX = 64;

/**
 * 레이스 배경 씬 — 서울 파노라마(1983×793, 한강·광화문·을지로 중 하나)를 창(뷰포트)으로 잘라 보여주고,
 * 단어를 완성할 때마다 배경을 가로로 밀어 전진하는 느낌을 준다.
 *
 * backgroundPosition 을 % 로 다루면 실제 렌더 크기를 재지 않아도
 * 0% = 장면 시작, 100% = 장면 끝(결승선)이 되어 반응형에서 그대로 동작한다.
 */
export function RaceScene({
  backgroundSrc = RACE_BACKGROUNDS[0].src,
  progress,
  total,
  running = false,
  children,
}: Props) {
  const ratio = total > 0 ? Math.min(Math.max(progress / total, 0), 1) : 0;
  const positionX = `${ratio * 100}%`;

  return (
    // 시안: 화면 최상단부터 435px. 상단 바·단어 카드가 이 안에 겹쳐 들어간다.
    // 바깥 상자는 좌우 블리드를 담는 자리다 — 안쪽 창이 overflow-hidden 이라 거기 두면 잘린다.
    <div className="relative w-full aspect-[393/435]">
      {/*
        데스크톱에서 컬럼 좌우를 채운다 (시안 1171:8127).
        같은 배경을 전체 폭으로 한 번 더 깔고, 검정 40% + 블러 20px 로 덮어 뒤로 물린다.
        판마다 배경이 달라지므로 전용 에셋을 두지 않고 그때 쓰는 이미지를 그대로 쓴다.
      */}
      <div
        aria-hidden
        data-testid="race-scene-bleed"
        className="absolute inset-y-0 left-1/2 hidden w-screen -translate-x-1/2 bg-cover bg-center sm:block"
        style={{ backgroundImage: `url(${backgroundSrc})` }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-1/2 hidden w-screen -translate-x-1/2 bg-black/40 backdrop-blur-[20px] sm:block"
      />

      <div
        data-testid="race-scene"
        className="absolute inset-0 overflow-hidden bg-sky-300"
      >
        <div
          data-testid="race-scene-bg"
          className="absolute inset-0 transition-[background-position] duration-500 ease-out motion-reduce:transition-none"
          style={{
            backgroundImage: `url(${backgroundSrc})`,
            backgroundSize: 'auto 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${positionX} bottom`,
            imageRendering: 'pixelated',
          }}
        />
        {children}

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
            animation: running ? 'sprite-run 0.5s steps(4) infinite' : undefined,
          }}
        />
      </div>
    </div>
  );
}
