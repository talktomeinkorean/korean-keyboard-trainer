/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아트라 최적화 파이프라인이 필요 없다. */
import { formatRaceTime, goalText, rankAnimalSrc, rankFor } from '@/lib/game/rank';
import { resultBackgroundSrc } from '@/lib/game/backgrounds';

/**
 * 카드 배경(노란 그라디언트·격자·제목·폴라로이드 테두리·기록 라벨바·흰 박스)은
 * 시안을 2x 로 내보낸 한 장의 이미지다. 아래 좌표들은 이 이미지에서 실측했다.
 */
const CARD_SRC = '/race/result-card.webp';

/**
 * 폴라로이드 사진 창 — 배경 이미지의 빈 사각형 자리다.
 * 안에는 뛴 장소와 등급 캐릭터를 겹쳐 넣는다 (시안 695:7837).
 * 캐릭터 좌표는 시안(창 224.756x222.959, 캐릭터 75.725x94.656 @ 74.515,115.003)을
 * 이 창 크기로 줄인 값이다.
 */
const PHOTO = { left: 78, top: 75.5, width: 110.5, height: 109.5 };
const ANIMAL = { left: 36.63, top: 56.48, width: 37.23, height: 46.49 };

// 시안 캔버스 (265x450 + 1px 테두리). 아래 좌표는 모두 이 기준이다.
const CARD_WIDTH = 267;
const CARD_HEIGHT = 452;

interface Props {
  /** 완주 기록 (ms) */
  timeMs: number;
  /** 분당 타수 — lib/game/rank 의 keysPerMinute 로 계산해서 넘긴다 */
  keysPerMin: number;
  /** 이 판에서 뛴 배경 id. 모르면(공유 링크) 기본 배경으로 그린다. */
  backgroundId?: string;
}

/**
 * 레이스 결과 카드. 공유 이미지로도 쓸 수 있게 화면 상태에 기대지 않고
 * 기록만으로 등급·문구를 결정한다.
 * 아래 목표 문구는 흰 글씨라 어두운 배경 위에 놓아야 한다.
 */
export function ResultCard({ timeMs, keysPerMin, backgroundId }: Props) {
  const rank = rankFor(timeMs);

  return (
    <div data-testid="result-card" className="flex flex-col items-center gap-[10px]">
      <div
        className="relative shrink-0 bg-no-repeat"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          backgroundImage: `url(${CARD_SRC})`,
          backgroundSize: '100% 100%',
        }}
      >
        {/* 폴라로이드 사진 — 뛴 장소 위에 등급 캐릭터를 세운다 */}
        <div className="absolute overflow-hidden" style={PHOTO}>
          <img
            src={resultBackgroundSrc(backgroundId)}
            alt=""
            aria-hidden
            data-testid="result-place"
            className="absolute inset-0 size-full"
          />
          <img
            src={rankAnimalSrc(rank)}
            alt=""
            aria-hidden
            data-testid="result-animal"
            className="absolute"
            style={ANIMAL}
          />
        </div>

        {/* 등급 라벨 — 폴라로이드 아래쪽 흰 여백 */}
        <div
          data-testid="result-rank"
          className="absolute left-1/2 top-[191.8px] w-[136px] -translate-x-1/2 text-center text-[#36454d]"
        >
          {/* 줄바꿈되면 2줄이 폴라로이드 밖으로 밀려나므로 한 줄로 고정한다 */}
          <p className="whitespace-nowrap font-pixel leading-[1.5]">
            <span className="text-[16px]">{rank.korean}</span>{' '}
            <span className="text-[14px]">{rank.romaja}</span>
          </p>
          {/* 이모지는 아랫줄 영어 이름 앞에 붙인다 */}
          <p className="whitespace-nowrap font-dmmono text-[12px] leading-[1.5] text-[#7d9fb2]">
            <span>{rank.emoji}</span> {rank.english}
          </p>
        </div>

        {/* 등급별 문구 — 배경 이미지에 흰 글로우가 깔려 있는 자리 */}
        <p
          data-testid="result-message"
          className="absolute left-1/2 top-[247.3px] flex h-[103.4px] w-[190px] -translate-x-1/2 items-center justify-center text-center font-dmsans text-[14px] font-medium leading-[1.4] text-[#36454d]"
        >
          {rank.message}
        </p>

        {/* 기록 — 배경 이미지의 흰 박스 안. 세로 중앙(380.5~427.5)에 맞춘다 */}
        <div className="absolute left-1/2 top-[404px] flex -translate-x-1/2 -translate-y-1/2 items-center gap-[10px] whitespace-nowrap text-[#36454d]">
          <span data-testid="result-time" className="font-vt323 text-[20px] leading-[1.8]">
            {formatRaceTime(timeMs)}
          </span>
          <span aria-hidden className="h-[11.5px] w-px bg-[#36454d]" />
          <span data-testid="result-speed" className="font-vt323 text-[20px] leading-[1.8]">
            {keysPerMin}{' '}
            <span className="font-dmsans text-[12px] font-medium text-[#6b8999]">keys/min</span>
          </span>
        </div>
      </div>

      <p
        data-testid="result-goal"
        className="w-full text-center font-dmsans text-[14px] font-semibold text-white"
      >
        {goalText(timeMs)}
      </p>
    </div>
  );
}
