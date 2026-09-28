/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘·장식이라 최적화가 필요 없다. */
import Link from 'next/link';
import { PIXEL_BUTTON } from './game/pixelButton';
import { RESULT_LINKS } from '@/lib/content/sources';
import type { Stage } from '@/lib/curriculum/types';

interface Props {
  /** 어떤 연습이었는지 — 제목 구성과 보라 버튼이 여기에 따라 달라진다 */
  stage: Stage;
  /** 레슨 제목. Basics 는 이게 제목이고, 긴 글은 지문 제목으로 쓴다 */
  title: string;
  /** 분당 타수 — lib/game/rank 의 keysPerMinute 로 계산해서 넘긴다 */
  keysPerMin: number;
  /** Back to Practice 목적지 — 목록이 있는 연습은 그 목록으로 돌아간다 */
  backHref: string;
  onRetry: () => void;
}

/**
 * 변형마다 다른 세로 배치 (시안 320x500).
 * - Basics(294:18956): 위 44.5 · 제목→기록 30 · 버튼은 330 에 고정(기록 아래 55.5)
 * - Vocabulary·Sentences(1171:7822 · 1171:7821): 전체가 가운데(위 45) · 간격 25 · 25
 * - Long Text(519:14075): 위 44.5 · 제목→기록 30 · 기록→버튼 25
 */
// top 은 시안 값에서 1px 뺀다 — Figma 는 카드 테두리를 안쪽에 그려 바깥 모서리부터 재지만,
// CSS 의 absolute 는 테두리 안쪽에서부터 잰다.
const LAYOUT: Record<'basics' | 'set' | 'long', { top: number; titleGap: number; buttonsGap: number }> = {
  basics: { top: 43.5, titleGap: 30, buttonsGap: 55.5 },
  set: { top: 44, titleGap: 25, buttonsGap: 25 },
  long: { top: 43.5, titleGap: 30, buttonsGap: 25 },
};

/** 제목 문구 — Vocabulary·Sentences 는 레슨 제목("30 Random Words") 대신 카테고리 이름 */
const SET_TITLE: Partial<Record<Stage, string>> = { word: 'Vocabulary', sentence: 'Sentences' };

/**
 * 시안 카드 배경의 장식 — 노란 바탕 위에 흐린 타원·별·격자를 overlay 로 겹친다.
 * 타원·별은 Figma 의 노이즈 번짐 필터가 들어 있는 SVG 라 에셋을 그대로 쓴다.
 * 이미지는 inset 만으로는 늘어나지 않아서 inset 을 준 상자 안을 채운다.
 */
function CardDecoration() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute left-[calc(50%+37.39px)] top-[31.44px] flex h-[228.899px] w-[344.129px] -translate-x-1/2 items-center justify-center mix-blend-overlay">
        <div className="relative h-[152.458px] w-[315.418px] -rotate-15">
          <div className="absolute inset-[40.16%_-4.76%_-9.84%_-4.76%]">
            <img src="/lessons/result/ellipse.svg" alt="" className="block size-full max-w-none" />
          </div>
        </div>
      </div>
      <div className="absolute left-[-61.23px] top-[-10.63px] flex size-[227.284px] items-center justify-center mix-blend-overlay">
        <div className="relative size-[177.279px] rotate-[20.03deg]">
          <div className="absolute inset-[-8.46%_-6.01%_1.09%_-6.01%]">
            <img src="/lessons/result/star.svg" alt="" className="block size-full max-w-none" />
          </div>
        </div>
      </div>
      <div className="absolute left-[calc(50%+0.05px)] top-[calc(50%-0.81px)] h-[425px] w-[320px] -translate-1/2 bg-[url(/lessons/result/grid.png)] bg-size-[15.7106px_15.7106px] bg-top-left opacity-46 mix-blend-overlay" />
    </div>
  );
}

/**
 * 연습 결과 팝업 (시안 294:18956 · 1171:7822 · 1171:7821 · 519:14075).
 * 틀은 같고, 연습 종류에 따라 제목 구성과 세 번째(보라) 버튼이 달라진다.
 */
export function PracticeResult({ stage, title, keysPerMin, backHref, onRetry }: Props) {
  const isBasics = stage === 'consonant' || stage === 'vowel' || stage === 'syllable';
  const isLongText = stage === 'long_text';
  const layout = LAYOUT[isBasics ? 'basics' : isLongText ? 'long' : 'set'];
  const link = isBasics ? undefined : RESULT_LINKS[stage as keyof typeof RESULT_LINKS];

  return (
    <div
      data-testid="practice-result"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#36454d]/80 p-4 pb-[120px] backdrop-blur-[5px]"
    >
      <div className="relative isolate h-[500px] w-[320px] shrink-0 overflow-clip rounded-[2px] border border-[#36454d] bg-[#f9f395] text-[#36454d]">
        <CardDecoration />

        <div
          className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
          style={{ top: layout.top }}
        >
          {/* 제목 */}
          {isLongText ? (
            <div className="flex w-[250px] flex-col gap-[8px] text-center">
              <p data-testid="practice-result-category" className="font-dmsans text-[15px] font-black leading-[1.3]">
                Long Text
              </p>
              <p data-testid="practice-result-title" className="text-[20px] leading-[1.3]">
                {title}
              </p>
            </div>
          ) : (
            <p
              data-testid="practice-result-title"
              className="flex h-[57px] items-center font-dmsans text-[25px] font-black leading-[1.3]"
            >
              {SET_TITLE[stage] ?? title}
            </p>
          )}

          {/* 기록 — 시안 1562:17191 에서 완주 시간이 빠지고 분당 타수만 남았다 */}
          <div
            className="flex w-[250px] items-center justify-center rounded-[2px] border border-[#36454d] bg-white px-[25px] py-[16px] shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.25)]"
            style={{ marginTop: layout.titleGap }}
          >
            <div className="flex w-full flex-col items-center gap-[10px]">
              <img
                src="/lessons/result/flag.png"
                alt=""
                aria-hidden
                data-testid="practice-result-flag"
                className="size-[31.598px] shrink-0"
              />
              {/* 시안의 선은 자리를 차지하지 않는다 — 높이를 주면 기록 상자가 1px 커진다 */}
              <div aria-hidden className="relative h-0 w-full">
                <div className="absolute inset-x-0 -top-[0.5px] h-px bg-[#36454d]" />
              </div>
              <span
                data-testid="practice-result-speed"
                className="whitespace-nowrap font-dmsans text-[30px] font-bold leading-[1.8]"
              >
                {keysPerMin}{' '}
                <span className="text-[18px] font-medium text-[#6b8999]">keys/min</span>
              </span>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex w-[230px] flex-col gap-[10px]" style={{ marginTop: layout.buttonsGap }}>
            <button type="button" onClick={onRetry} data-testid="practice-result-retry" className={`${PIXEL_BUTTON} w-full`}>
              Try Again
            </button>
            <Link href={backHref} data-testid="practice-result-back" className={`${PIXEL_BUTTON} w-full`}>
              Back to Practice
            </Link>
            {link && (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="practice-result-link"
                className="flex h-[60px] w-full items-center justify-between rounded-[2px] border border-[#36454d] bg-gradient-to-r from-[#ab99ff] from-50% to-[#d0c6ff] py-[5px] pr-[15px] text-center font-dmmono text-[14px] leading-[1.3] text-[#36454d] shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.25)] transition hover:brightness-105 active:translate-y-px"
                style={{ paddingLeft: link.padLeft }}
              >
                {/* 줄바꿈 앞 공백 — 없으면 "these" 와 "words" 가 붙어 읽힌다 (스크린리더·검색) */}
                <span>
                  {link.lines[0]}{' '}
                  <br />
                  {link.lines[1]}
                </span>
                {/* 아래 화살표 에셋을 돌려 오른쪽 위(바깥으로 나감)를 보게 한다 */}
                <span className="flex size-[17.712px] shrink-0 items-center justify-center">
                  <img src="/lessons/icons/arrow-external.svg" alt="" aria-hidden className="h-[14.951px] w-[13.097px] max-w-none -rotate-135" />
                </span>
              </a>
            )}
          </div>
        </div>

        {/* 카드 안쪽 흰 테두리 */}
        <div aria-hidden className="pointer-events-none absolute inset-[-1px] rounded-[inherit] shadow-[inset_-3px_-3px_0_0_white,inset_3px_3px_0_0_white]" />
      </div>
    </div>
  );
}
