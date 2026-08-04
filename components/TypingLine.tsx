import { splitByJamoProgress } from '@/lib/hangul/jamoGroups';

interface Props {
  target: string;
  /** 맞게 입력된 자모 개수 (세션의 typedJamoCount) */
  typedJamoCount: number;
}

export function TypingLine({ target, typedJamoCount }: Props) {
  const { done, current, todo } = splitByJamoProgress(target, typedJamoCount);

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
