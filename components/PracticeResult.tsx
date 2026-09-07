import Link from 'next/link';
import { PIXEL_BUTTON } from './game/pixelButton';
import { formatRaceTime } from '@/lib/game/rank';

/**
 * 연습 결과 팝업 (시안 519:16079).
 *
 * 카드의 배경·흰 기록 박스·모래시계·구분선은 시안을 2x 로 내보낸 한 장의
 * 이미지다. 아래 좌표는 그 이미지에서 실측했다 (흰 박스 y139~282, 구분선 y218).
 */
const CARD_SRC = '/lessons/practice-result.webp';

// 시안 캔버스 (320x450 + 1px 테두리)
const CARD_WIDTH = 322;
const CARD_HEIGHT = 452;

interface Props {
  /** 어느 연습에서 왔는지 — Basics / Vocabulary / Sentences / Long Text */
  category: string;
  /** 레슨 제목 */
  title: string;
  timeMs: number;
  /** 분당 타수 — lib/game/rank 의 keysPerMinute 로 계산해서 넘긴다 */
  keysPerMin: number;
  onRetry: () => void;
}

export function PracticeResult({ category, title, timeMs, keysPerMin, onRetry }: Props) {
  return (
    <div
      data-testid="practice-result"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#36454d]/80 p-4 pb-[120px] backdrop-blur-[5px]"
    >
      <div
        className="relative shrink-0 bg-no-repeat text-[#36454d]"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          backgroundImage: `url(${CARD_SRC})`,
          backgroundSize: '100% 100%',
        }}
      >
        {/* 제목 — 카테고리(작게) + 레슨 이름(크게) */}
        <div className="absolute left-[36px] top-[52px] flex w-[250px] flex-col gap-[8px] text-center">
          <p data-testid="practice-result-category" className="font-dmsans text-[15px] font-black leading-[1.3]">
            {category}
          </p>
          <p data-testid="practice-result-title" className="text-[20px] leading-[1.3]">
            {title}
          </p>
        </div>

        {/* 기록 — 모래시계 오른쪽. 흰 박스와 구분선은 배경 이미지에 있다 */}
        <div className="absolute left-[112px] top-[150px] flex h-[50px] w-[132px] items-center justify-center">
          <span data-testid="practice-result-time" className="font-dmmono text-[28px] whitespace-nowrap">
            {formatRaceTime(timeMs)}
          </span>
        </div>
        <div className="absolute inset-x-[36px] top-[225px] flex h-[50px] items-center justify-center">
          <span data-testid="practice-result-speed" className="font-dmmono text-[25px] whitespace-nowrap">
            {keysPerMin}{' '}
            <span className="font-dmsans text-[15px] font-medium text-[#6b8999]">keys/min</span>
          </span>
        </div>

        {/* 버튼 */}
        <div className="absolute left-1/2 top-[311px] flex -translate-x-1/2 flex-col gap-[10px]">
          <button
            type="button"
            onClick={onRetry}
            data-testid="practice-result-retry"
            className={`${PIXEL_BUTTON} w-[200px]`}
          >
            Try Again
          </button>
          <Link
            href="/lessons"
            data-testid="practice-result-back"
            className={`${PIXEL_BUTTON} w-[200px]`}
          >
            Back to Practice
          </Link>
        </div>
      </div>
    </div>
  );
}
