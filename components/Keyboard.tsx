/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
'use client';

import { useState } from 'react';
import { DUBEOLSIK, SPACE_KEY } from '@/lib/keyboard/dubeolsik';

const BASIC_ROWS: string[][] = [
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL'],
  ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period'],
];

// 문장/긴글용 — 숫자열과 따옴표/물음표 키 추가
const EXTENDED_ROWS: string[][] = [
  ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'],
  BASIC_ROWS[0],
  [...BASIC_ROWS[1], 'Quote'],
  [...BASIC_ROWS[2], 'Slash'],
];

const byCode = new Map(DUBEOLSIK.map((k) => [k.code, k]));

// 시안 기준 흰 키 + 진한 테두리. 다음에 칠 키만 연두로 강조한다.
// 폭은 --key-w (시안 34px, 좁은 화면에선 비율대로 축소). 브레이크포인트를 쓰지 않아
// PC 와 모바일이 같은 레이아웃을 유지한다.
const KEY_BASE =
  'h-[40px] rounded-[5px] border-[0.75px] border-[#36454d] ' +
  'flex flex-col items-center justify-center select-none touch-manipulation ' +
  'transition active:scale-95';

function keyClasses(isNext: boolean, widthClass = 'w-[var(--key-w)]'): string {
  return `${KEY_BASE} ${widthClass} ${isNext ? 'bg-[#8ceb97]' : 'bg-white active:bg-neutral-100'}`;
}

interface Props {
  nextCode: string | null;
  /** 다음 입력에 Shift 가 필요한지 — Shift 키 강조용 */
  nextShift?: boolean;
  /** basic: 자모/단어 연습용, extended: 문장/긴글용(숫자·따옴표·물음표 포함) */
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

  function press(code: string) {
    onKeyPress?.(code, shiftOn);
    setShiftOn(false);
  }

  const shiftButtonClass = keyGuide && nextShift
    ? 'bg-[#8ceb97]'
    : shiftOn
      ? 'bg-[#36454d] text-white'
      : 'bg-white active:bg-neutral-100';

  return (
    <div className="flex flex-col gap-[var(--key-gap)] items-center">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-[var(--key-gap)]">
          {row.map((code) => {
            const k = byCode.get(code)!;
            const isNext = keyGuide && code === nextCode;
            const cap = shiftOn && k.shift ? k.shift : k.jamo;
            return (
              <button
                key={code}
                type="button"
                data-testid={`kbd-key-${code}`}
                data-kbd-key
                onClick={() => press(code)}
                className={keyClasses(isNext)}
              >
                <span className="text-[14px] font-bold text-[#36454d]">{cap}</span>
                <span className="text-[10px] font-bold text-[#5c8499]">
                  {code.startsWith('Key') ? code.slice(3) : code.startsWith('Digit') ? code.slice(5) : ''}
                </span>
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex gap-[var(--key-gap)]">
        <button
          type="button"
          data-testid="kbd-key-Shift"
          data-kbd-key
          onClick={() => setShiftOn((s) => !s)}
          style={{ width: 'calc(var(--key-w) * 2 + var(--key-gap))' }}
          className={`h-[40px] rounded-[5px] border-[0.75px] border-[#36454d] flex items-center justify-center gap-[7px] text-[14px] font-semibold text-[#36454d] select-none touch-manipulation transition active:scale-95 ${shiftButtonClass}`}
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
          style={{ width: 'calc(var(--key-w) * 4 + var(--key-gap) * 3)' }}
          className={keyClasses(keyGuide && nextCode === SPACE_KEY.code, '')}
        >
          <span className="text-[14px] font-semibold text-[#36454d]">Space</span>
        </button>
      </div>
    </div>
  );
}
