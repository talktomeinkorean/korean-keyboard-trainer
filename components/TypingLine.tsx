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
      <span data-testid="todo" className="text-gray-400">{todo}</span>
    </div>
  );
}
