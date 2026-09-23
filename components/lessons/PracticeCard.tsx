import type { ReactNode } from 'react';

/**
 * 연습 화면의 흰 카드 (시안 415:10859) — 330 폭, 진한 테두리.
 * 높이는 화면마다 다르므로 호출부에서 정한다 (Basics 는 200).
 */
export function PracticeCard({
  children,
  className = '',
  wrong = false,
}: {
  children: ReactNode;
  className?: string;
  /** 오타 직후 — 레이스 단어 카드처럼 테두리가 잠깐 빨개진다 */
  wrong?: boolean;
}) {
  return (
    <div
      data-testid="practice-card"
      data-wrong={wrong || undefined}
      // 테두리를 굵히는 대신 안쪽으로 1px 그림자를 덧대 2px 로 보이게 한다 —
      // border-width 를 바꾸면 카드 크기가 늘었다 줄어 글자가 흔들린다 (레이스 카드와 같은 처리)
      className={`flex w-[330px] max-w-full shrink-0 flex-col items-center justify-center rounded-[2px] border bg-white ${
        wrong ? 'border-[#FF2B00] shadow-[inset_0_0_0_1px_#FF2B00]' : 'border-[#36454d]'
      } ${className}`}
    >
      {children}
    </div>
  );
}
