'use client';

import { useState } from 'react';
import { DUBEOLSIK, SPACE_KEY } from '@/lib/keyboard/dubeolsik';
import { KeyDef } from '@/lib/keyboard/types';

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

function keyClasses(k: KeyDef, isNext: boolean): string {
  // 모바일에서 한 줄(키 10개)이 넘치지 않도록 작은 화면에선 키/글자를 축소한다.
  const base =
    'w-8 h-10 sm:w-11 sm:h-11 rounded-lg border flex flex-col items-center justify-center ' +
    'text-sm sm:text-base select-none touch-manipulation transition active:scale-95';
  const typeBorder =
    k.type === 'consonant' ? 'border-b-2 border-b-amber-500'
    : k.type === 'vowel' ? 'border-b-2 border-b-emerald-500'
    : 'border-b-2 border-b-neutral-500'; // space/punct/digit — 중립
  if (isNext) return `${base} bg-blue-500 text-white border-blue-500 ring-2 ring-blue-300`;
  return `${base} bg-neutral-800 text-neutral-100 border-white/10 active:bg-neutral-700 ${typeBorder}`;
}

interface Props {
  nextCode: string | null;
  /** 다음 입력에 Shift 가 필요한지 — Shift 키 강조용 */
  nextShift?: boolean;
  /** basic: 자모/단어 연습용, extended: 문장/긴글용(숫자·따옴표·물음표 포함) */
  layout?: 'basic' | 'extended';
  /** 키 탭/클릭 시 호출 (모바일 입력). 데스크톱은 물리 키보드를 쓰므로 선택적. */
  onKeyPress?: (code: string, shift: boolean) => void;
}

export function Keyboard({ nextCode, nextShift = false, layout = 'basic', onKeyPress }: Props) {
  // 화면 키보드 전용 Shift 토글 (모바일 탭 입력용). 키 입력 후 자동 해제.
  const [shiftOn, setShiftOn] = useState(false);
  const rows = layout === 'extended' ? EXTENDED_ROWS : BASIC_ROWS;

  function press(code: string) {
    onKeyPress?.(code, shiftOn);
    setShiftOn(false);
  }

  const shiftButtonClass = nextShift
    ? 'bg-blue-500 text-white border-blue-500 ring-2 ring-blue-300'
    : shiftOn
      ? 'bg-neutral-600 text-white border-white/30'
      : 'bg-neutral-800 text-neutral-100 border-white/10 active:bg-neutral-700';

  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 items-center">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1 sm:gap-1.5">
          {row.map((code) => {
            const k = byCode.get(code)!;
            const isNext = code === nextCode;
            const cap = shiftOn && k.shift ? k.shift : k.jamo;
            return (
              <button
                key={code}
                type="button"
                data-testid={`kbd-key-${code}`}
                data-kbd-key
                onClick={() => press(code)}
                className={keyClasses(k, isNext)}
              >
                <span>{cap}</span>
                <span className="text-[9px] opacity-40">
                  {code.startsWith('Key') ? code.slice(3) : code.startsWith('Digit') ? code.slice(5) : ''}
                </span>
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex gap-1 sm:gap-1.5">
        <button
          type="button"
          data-testid="kbd-key-Shift"
          data-kbd-key
          onClick={() => setShiftOn((s) => !s)}
          className={`h-10 sm:h-11 w-16 sm:w-20 rounded-lg border flex items-center justify-center text-xs select-none touch-manipulation transition active:scale-95 border-b-2 border-b-neutral-500 ${shiftButtonClass}`}
        >
          ⇧ Shift
        </button>
        <button
          type="button"
          data-testid="kbd-key-Space"
          data-kbd-key
          onClick={() => press(SPACE_KEY.code)}
          className={`${keyClasses(SPACE_KEY, nextCode === SPACE_KEY.code)} !w-36 sm:!w-56`}
        >
          <span className="text-xs opacity-70">Space</span>
        </button>
      </div>
    </div>
  );
}
