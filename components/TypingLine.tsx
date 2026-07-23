interface Props {
  target: string;
  typed: string;
}

export function TypingLine({ target, typed }: Props) {
  const done = target.startsWith(typed) ? typed : '';
  const todo = target.slice(done.length);
  return (
    <div className="text-4xl tracking-widest font-medium">
      <span data-testid="done" className="text-emerald-500">{done}</span>
      <span
        data-testid="caret"
        aria-hidden
        className="inline-block w-0.5 h-[1em] align-middle bg-blue-500 animate-caret-blink"
      />
      <span data-testid="todo" className="text-gray-400">{todo}</span>
    </div>
  );
}
