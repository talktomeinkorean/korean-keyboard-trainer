/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
'use client';

import { useState } from 'react';
import { DUBEOLSIK, SPACE_KEY } from '@/lib/keyboard/dubeolsik';

const BASIC_ROWS: string[][] = [
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL'],
  ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period'],
];

// 문장/긴글용 — 숫자열과 세미콜론/따옴표/물음표 키가 붙는다 (시안 1171:9048)
const EXTENDED_ROWS: string[][] = [
  ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'],
  BASIC_ROWS[0],
  [...BASIC_ROWS[1], 'Semicolon', 'Quote'],
  [...BASIC_ROWS[2], 'Slash'],
];

const byCode = new Map(DUBEOLSIK.map((k) => [k.code, k]));

/**
 * 키캡 글자 — 위(큰 글자)와 아래(작은 파란 글자).
 * 기본 규칙은 [자모, 영문 자판]이고, 아래 키들만 시안이 따로 정해 두었다.
 * 숫자키는 1 에만 !, 나머지는 아랫글자가 없다 — 대신 빈 줄을 남겨 1 과 높이를 맞춘다 (시안 487:11870).
 *
 * `:` `"` `?` 처럼 윗글자를 크게 적는 키는 눌렀을 때도 그 글자가 나와야 한다 —
 * 보이는 대로 눌렀는데 `/` 가 나오면 Shift 를 따로 눌러야 하는 줄 모른다.
 */
const CAPS: Record<string, [main: string, sub: string]> = {
  Digit1: ['1', '!'],
  Semicolon: [':', ';'],
  Quote: ['"', "'"],
  Slash: ['?', ''],
};

/**
 * 시안 키 폭 — 자모 34px, 문장 30px(한 줄이 11키라 더 좁다).
 * 좁은 화면에선 비율대로 줄어든다. 브레이크포인트를 쓰지 않아 PC 와 모바일이
 * 같은 레이아웃을 유지한다. CSS 변수로 빼지 않는 건 여기서만 쓰기 때문이다 —
 * 변수가 비면 키가 글자 폭으로 쪼그라들어 키보드가 무너진다.
 */
const KEY_WIDTH = {
  basic: 'w-[min(34px,calc((100vw_-_53px)/10))]',
  extended: 'w-[min(30px,calc((100vw_-_63px)/11))]',
} as const;

/** 키 사이 4px, 줄 사이 5px (시안 237:9862) */
const KEY_GAP = 'gap-[4px]';
const ROW_GAP = 'gap-[5px]';

// 시안 기준 흰 키 + 진한 테두리. 다음에 칠 키만 연두로 강조한다.
// 모서리는 자모 키 5px, shift·Space 3.708px 라 호출부에서 정한다.
const KEY_BASE =
  'h-[40px] border-[0.75px] border-[#36454d] ' +
  'flex flex-col items-center justify-center select-none touch-manipulation ' +
  'transition active:scale-95';

function keyClasses(isNext: boolean, extra = 'rounded-[5px]'): string {
  return `${KEY_BASE} ${extra} ${isNext ? 'bg-[#8ceb97]' : 'bg-white active:bg-neutral-100'}`;
}

interface Props {
  nextCode: string | null;
  /** 다음 입력에 Shift 가 필요한지 — Shift 키 강조용 */
  nextShift?: boolean;
  /** basic: 자모/단어 연습용, extended: 문장/긴글용(숫자·문장부호 포함) */
  layout?: 'basic' | 'extended';
  /** 끄면 다음에 칠 키를 강조하지 않는다 (게임의 Key Guide 토글) */
  keyGuide?: boolean;
  /** 키 탭/클릭 시 호출 (모바일 입력). 데스크톱은 물리 키보드를 쓰므로 선택적. */
  onKeyPress?: (code: string, shift: boolean) => void;
}

export function Keyboard({ nextCode, nextShift = false, layout = 'basic', keyGuide = true, onKeyPress }: Props) {
  // 화면 키보드 전용 Shift 토글 (모바일 탭 입력용). 키 입력 후 자동 해제.
  const [shiftOn, setShiftOn] = useState(false);
  const rows = layout === 'extended' ? EXTENDED_ROWS : BASIC_ROWS;
  const keyWidth = KEY_WIDTH[layout];

  function press(code: string, shift = false) {
    onKeyPress?.(code, shiftOn || shift);
    setShiftOn(false);
  }

  const shiftButtonClass = keyGuide && nextShift
    ? 'bg-[#8ceb97]'
    : shiftOn
      ? 'bg-[#36454d] text-white'
      : 'bg-white active:bg-neutral-100';

  return (
    <div className={`flex flex-col ${ROW_GAP} items-center`}>
      {rows.map((row, ri) => (
        <div key={ri} className={`flex ${KEY_GAP}`}>
          {row.map((code) => {
            const k = byCode.get(code)!;
            const isNext = keyGuide && code === nextCode;
            const [main, sub] = CAPS[code] ?? [k.jamo, code.startsWith('Key') ? code.slice(3) : ''];
            const cap = shiftOn && k.shift ? k.shift : main;
            // 키캡에 윗글자가 적힌 키는 탭만 해도 그 글자가 나오게 한다
            const capNeedsShift = main === k.shift;
            return (
              <button
                key={code}
                type="button"
                data-testid={`kbd-key-${code}`}
                data-kbd-key
                onClick={() => press(code, capNeedsShift)}
                className={keyClasses(isNext, `rounded-[5px] ${keyWidth}`)}
              >
                <span className="font-pretendard text-[14px] font-bold text-[#36454d]">{cap}</span>
                {/* 빈 span 은 높이가 0 이라 숫자가 가운데로 내려간다 — 숫자열은 줄바꿈 없는 공백으로 자리를 채운다 */}
                <span className="font-dmsans text-[10px] font-bold text-[#5c8499]">
                  {sub || (code.startsWith('Digit') ? '\u00a0' : '')}
                </span>
              </button>
            );
          })}
        </div>
      ))}
      {/* shift 70px · Space 150px 는 키 폭과 무관한 고정값이다 (시안 237:9894) */}
      <div className={`flex ${KEY_GAP}`}>
        <button
          type="button"
          data-testid="kbd-key-Shift"
          data-kbd-key
          onClick={() => setShiftOn((s) => !s)}
          className={`h-[40px] w-[70px] rounded-[3.708px] border-[0.75px] border-[#36454d] flex items-center justify-center gap-[7px] font-dmsans text-[14px] font-semibold text-[#36454d] select-none touch-manipulation transition active:scale-95 ${shiftButtonClass}`}
        >
          shift
          {/* 시안에서 내보낸 아이콘 — 유니코드 ⇧ 로 대체하면 모양이 달라진다 */}
          <img
            src="/race/icons/shift-arrow.svg"
            alt=""
            aria-hidden
            data-testid="shift-arrow"
            className="size-[12px]"
          />
        </button>
        <button
          type="button"
          data-testid="kbd-key-Space"
          data-kbd-key
          onClick={() => press(SPACE_KEY.code)}
          className={keyClasses(keyGuide && nextCode === SPACE_KEY.code, 'w-[150px] rounded-[3.708px]')}
        >
          <span className="font-dmsans text-[14px] font-semibold text-[#36454d]">Space</span>
        </button>
      </div>
    </div>
  );
}
