import { toJamoGroups } from '@/lib/hangul/jamoGroups';

interface Props {
  target: string;
  /** 맞게 입력된 자모 개수 (세션의 typedJamoCount) */
  typedJamoCount: number;
}

export function TypingLine({ target, typedJamoCount }: Props) {
  // 자모 소비량 기준으로 완성 음절 / 조합 중 음절을 나눈다.
  const groups = toJamoGroups(target);
  let consumed = 0;
  let doneChars = 0;
  let hasCurrent = false;
  for (const g of groups) {
    if (consumed + g.length <= typedJamoCount) {
      consumed += g.length;
      doneChars++;
    } else {
      hasCurrent = typedJamoCount > consumed;
      break;
    }
  }

  const done = target.slice(0, doneChars);
  const current = hasCurrent ? target[doneChars] : '';
  const todo = target.slice(doneChars + (hasCurrent ? 1 : 0));

  return (
    <div className="text-4xl tracking-widest font-medium">
      <span data-testid="done" className="text-emerald-500">{done}</span>
      <span
        data-testid="caret"
        aria-hidden
        className="inline-block w-0.5 h-[1em] align-middle bg-blue-500 animate-caret-blink"
      />
      <span data-testid="current" className="text-amber-500">{current}</span>
      <span data-testid="todo" className="text-gray-400">{todo}</span>
    </div>
  );
}
