'use client';

/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 화살표라 최적화가 필요 없다. */
import { useCallback, useEffect, useState } from 'react';

/** 시안에서 내보낸 점선 화살표 (흰색) */
const ARROW = {
  word: '/race/coachmark/arrow-word.svg',
  hint: '/race/coachmark/arrow-hint.svg',
  start: '/race/coachmark/arrow-start.svg',
} as const;

const ALT =
  'Type the word shown. The letter chips are a hint if you need it. To start, tap the first letter or press it on your keyboard.';

/** 어두운 막 (시안 1604:11681) */
const SCRIM = '#36454D';
const SCRIM_OPACITY = 0.85;
/** 구멍 모서리 */
const HOLE_RADIUS = 5;

interface Props {
  onClose: () => void;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * 구멍을 뚫을 자리 — 실제 화면 엘리먼트를 재서 정한다.
 * 여백은 시안(1604:12025)의 구멍 크기에서 역산한 값이다.
 */
function measureHoles(): { word: Rect; chips: Rect; keyboard: Rect } | null {
  const wordLine = document.querySelector('[data-testid="word-typed"]')?.parentElement;
  const chipRow = document.querySelector('[data-testid="syllable-jamo-0"]')?.parentElement;
  const keyboard = document.querySelector('[data-testid="race-keyboard-block"]');
  if (!wordLine || !chipRow || !keyboard) return null;

  // 단어는 글자 폭에 맞춰 뚫는다 — 줄 상자(240px)를 쓰면 짧은 단어에서 헐렁해진다.
  // jsdom 의 Range 에는 getBoundingClientRect 가 없어 줄 상자로 떨어진다 (테스트 전용 경로).
  const range = document.createRange();
  range.selectNodeContents(wordLine);
  const ink =
    typeof range.getBoundingClientRect === 'function'
      ? range.getBoundingClientRect()
      : wordLine.getBoundingClientRect();

  const pad = (r: DOMRect, x: number, y: number): Rect => ({
    left: r.left - x,
    top: r.top - y,
    width: r.width + x * 2,
    height: r.height + y * 2,
  });

  // 가로는 글자 폭(Range), 세로는 줄 상자에서 위아래 3.5 씩 깎은 값 — 시안의 47px 이 된다
  const line = wordLine.getBoundingClientRect();

  return {
    word: {
      left: ink.left - 3,
      width: ink.width + 6,
      top: line.top + 3.5,
      height: line.height - 7,
    },
    chips: pad(chipRow.getBoundingClientRect(), 2.5, 11),
    keyboard: pad(keyboard.getBoundingClientRect(), 4.5, 5),
  };
}

function holePath({ left, top, width, height }: Rect): string {
  const r = Math.min(HOLE_RADIUS, width / 2, height / 2);
  const right = left + width;
  const bottom = top + height;
  return (
    `M${left + r} ${top}H${right - r}A${r} ${r} 0 0 1 ${right} ${top + r}` +
    `V${bottom - r}A${r} ${r} 0 0 1 ${right - r} ${bottom}` +
    `H${left + r}A${r} ${r} 0 0 1 ${left} ${bottom - r}` +
    `V${top + r}A${r} ${r} 0 0 1 ${left + r} ${top}Z`
  );
}

/**
 * 안내 문구 — 시안은 DM Sans 15px/1.2, 가운데 정렬, #75ff85 (1604:11686~11688).
 * 좌우를 0 으로 펼쳐야 줄이 안 접힌다 (left-1/2 로 두면 폭이 절반으로 잡힌다).
 */
const TEXT = 'absolute inset-x-0 text-center text-[15px] leading-[1.2] text-[#75ff85]';

/** 시안에서 화살표가 놓인 가로 위치 — 컬럼 가운데(196.5)를 기준으로 한 값 */
const ARROW_X = { word: -98.9, hint: 107.74, start: -135.12 } as const;

/**
 * 첫 판 시작 직후 한 번만 뜨는 조작 안내 (시안 1562:17159).
 *
 * 화면을 어둡게 덮되 단어·자모 칩·키보드 자리에는 구멍을 뚫어 실제 화면이 비치게 한다.
 * 구멍 위치는 엘리먼트를 재서 정하므로 화면 크기나 단어 길이가 달라져도 따라간다.
 * 문구와 화살표는 그 구멍을 기준으로 시안의 간격만큼 떨어뜨려 놓는다.
 */
export function Coachmark({ onClose }: Props) {
  const [holes, setHoles] = useState<ReturnType<typeof measureHoles>>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const remeasure = useCallback(() => {
    setHoles(measureHoles());
    setSize({ w: window.innerWidth, h: window.innerHeight });
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 실제 DOM 을 재야 해서 그릴 수 있다. 렌더 중에는 잴 수 없다.
    remeasure();
    window.addEventListener('resize', remeasure);
    return () => window.removeEventListener('resize', remeasure);
  }, [remeasure]);

  // 재기 전에는 막만 깔아 둔다 — 구멍 없이 한 프레임 번쩍이는 편이 문구가 엉뚱한 데 붙는 것보다 낫다
  const word = holes?.word;
  const chips = holes?.chips;
  const keyboard = holes?.keyboard;
  const center = size.w / 2;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close the guide"
      data-testid="coachmark"
      onClick={onClose}
      onKeyDown={(e) => {
        // 스페이스·엔터는 물론 게임 키를 눌러도 안내를 닫는다 (바로 치고 싶은 사람)
        e.preventDefault();
        onClose();
      }}
      className="fixed inset-0 z-[70] cursor-pointer"
    >
      <span className="sr-only">{ALT}</span>

      <svg
        aria-hidden
        data-testid="coachmark-scrim"
        className="absolute inset-0 size-full"
        preserveAspectRatio="none"
      >
        <path
          fill={SCRIM}
          fillOpacity={SCRIM_OPACITY}
          fillRule="evenodd"
          d={`M0 0H${size.w}V${size.h}H0Z${holes ? [word!, chips!, keyboard!].map(holePath).join('') : ''}`}
        />
      </svg>

      {holes && (
        <>
          {/* 단어 — 구멍 왼쪽 위에서 올라가 문구를 가리킨다 */}
          <img
            src={ARROW.word}
            alt=""
            aria-hidden
            style={{
              // 짧은 단어는 구멍이 좁아 화살표가 문구를 덮는다 — 시안 자리보다 오른쪽으로는 안 간다
              left: Math.min(word!.left - 13.9, center + ARROW_X.word),
              top: word!.top - 25.1,
              width: 34.616,
              height: 48.747,
            }}
            className="absolute"
          />
          <p className={`${TEXT} font-dmsans font-semibold`} style={{ top: word!.top - 34.1 }}>
            Type this word
          </p>

          {/* 자모 칩 — 구멍 오른쪽으로 내려가 문구를 가리킨다 */}
          <img
            src={ARROW.hint}
            alt=""
            aria-hidden
            style={{
              left: Math.max(chips!.left + chips!.width + 47.74, center + ARROW_X.hint),
              top: chips!.top + 82.45,
              width: 44.99,
              height: 60.195,
            }}
            className="absolute"
          />
          <p
            className={`${TEXT} font-dmsans font-bold`}
            style={{ top: chips!.top + chips!.height + 16.65 }}
          >
            A hint if you need it,
            <br />
            letter by letter
          </p>

          {/* 키보드 */}
          <img
            src={ARROW.start}
            alt=""
            aria-hidden
            style={{
              left: keyboard!.left + 57.38,
              top: keyboard!.top - 43.18,
              width: 21.121,
              height: 40.588,
            }}
            className="absolute"
          />
          <p className={`${TEXT} font-dmsans font-bold`} style={{ top: keyboard!.top - 69.71 }}>
            To start,
            <br />
            tap the first letter or press it
            <br />
            on your keyboard
          </p>

          <p
            className={`${TEXT} font-dmmono font-light`}
            style={{ top: keyboard!.top + keyboard!.height + 16.25 }}
          >
            Tap anywhere to continue
          </p>
        </>
      )}
    </div>
  );
}
