import { DUBEOLSIK } from '@/lib/keyboard/dubeolsik';
import { KeyDef } from '@/lib/keyboard/types';

const ROWS: string[][] = [
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL'],
  ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM'],
];

const byCode = new Map(DUBEOLSIK.map((k) => [k.code, k]));

function keyClasses(k: KeyDef, isNext: boolean): string {
  const base =
    'w-11 h-11 rounded-lg border flex flex-col items-center justify-center text-base select-none';
  const typeBorder = k.type === 'consonant' ? 'border-b-2 border-b-amber-500' : 'border-b-2 border-b-emerald-500';
  if (isNext) return `${base} bg-blue-500 text-white border-blue-500 ring-2 ring-blue-300`;
  return `${base} bg-neutral-800 text-neutral-100 border-white/10 ${typeBorder}`;
}

export function Keyboard({ nextCode }: { nextCode: string | null }) {
  return (
    <div className="flex flex-col gap-1.5 items-center">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1.5">
          {row.map((code) => {
            const k = byCode.get(code)!;
            const isNext = code === nextCode;
            return (
              <div
                key={code}
                data-testid={`kbd-key-${code}`}
                data-kbd-key
                className={keyClasses(k, isNext)}
              >
                <span>{k.jamo}</span>
                <span className="text-[9px] opacity-40">{code.replace('Key', '')}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
