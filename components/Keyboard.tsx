import { DUBEOLSIK, SPACE_KEY } from '@/lib/keyboard/dubeolsik';
import { KeyDef } from '@/lib/keyboard/types';

const ROWS: string[][] = [
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL'],
  ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period'],
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
    : 'border-b-2 border-b-neutral-500'; // space/punct — 중립
  if (isNext) return `${base} bg-blue-500 text-white border-blue-500 ring-2 ring-blue-300`;
  return `${base} bg-neutral-800 text-neutral-100 border-white/10 active:bg-neutral-700 ${typeBorder}`;
}

interface Props {
  nextCode: string | null;
  /** 키 탭/클릭 시 호출 (모바일 입력). 데스크톱은 물리 키보드를 쓰므로 선택적. */
  onKeyPress?: (code: string) => void;
}

export function Keyboard({ nextCode, onKeyPress }: Props) {
  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 items-center">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1 sm:gap-1.5">
          {row.map((code) => {
            const k = byCode.get(code)!;
            const isNext = code === nextCode;
            return (
              <button
                key={code}
                type="button"
                data-testid={`kbd-key-${code}`}
                data-kbd-key
                onClick={() => onKeyPress?.(code)}
                className={keyClasses(k, isNext)}
              >
                <span>{k.jamo}</span>
                <span className="text-[9px] opacity-40">{code.replace('Key', '')}</span>
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex">
        <button
          type="button"
          data-testid="kbd-key-Space"
          data-kbd-key
          onClick={() => onKeyPress?.(SPACE_KEY.code)}
          className={`${keyClasses(SPACE_KEY, nextCode === SPACE_KEY.code)} !w-44 sm:!w-64`}
        >
          <span className="text-xs opacity-70">Space</span>
        </button>
      </div>
    </div>
  );
}
