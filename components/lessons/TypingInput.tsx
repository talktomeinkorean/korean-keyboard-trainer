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
    // 시안 1171:9051 — Pretendard Bold 20px, 줄간격 1.3, 두 줄 사이 18px
    <div className="flex w-full flex-col gap-[18px] font-pretendard text-[20px] leading-[1.3]">
      <p data-testid="typing-target" className="font-bold text-[#36454d]">
        {target}
      </p>
      <p data-testid="typing-echo" className="font-bold text-[#9680ff]">
        {typed}
        {/* 커서는 3px 폭 · 한 줄 높이 (시안 1171:9053) */}
        <span
          aria-hidden
          className="ml-[1px] inline-block h-[1em] w-[3px] translate-y-[0.15em] bg-[#8ceb97] animate-caret-blink"
        />
      </p>
    </div>
  );
}
