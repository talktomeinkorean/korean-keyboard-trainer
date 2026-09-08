/**
 * 문장·긴글 연습의 입력창 (시안 519:15861).
 * 위에 칠 문장, 아래에 지금까지 친 내용이 커서와 함께 따라 붙는다.
 */
interface Props {
  /** 이번에 쳐야 할 줄 */
  target: string;
  /** 지금까지 친 내용 */
  typed: string;
}

export function TypingInput({ target, typed }: Props) {
  return (
    <div className="flex w-full flex-col gap-[15px] text-[22px] leading-[1.3]">
      <p data-testid="typing-target" className="font-bold text-[#36454d]">
        {target}
      </p>
      <p data-testid="typing-echo" className="font-bold text-[#9680ff]">
        {typed}
        <span
          aria-hidden
          className="ml-[1px] inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-[#8ceb97] animate-caret-blink"
        />
      </p>
    </div>
  );
}
