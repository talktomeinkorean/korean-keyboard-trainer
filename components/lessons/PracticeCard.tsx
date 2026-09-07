import type { ReactNode } from 'react';

/**
 * 연습 화면의 흰 카드 (시안 415:10859) — 330 폭, 진한 테두리.
 * 높이는 화면마다 다르므로 호출부에서 정한다 (Basics 는 200).
 */
export function PracticeCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-testid="practice-card"
      className={`flex w-[330px] max-w-full shrink-0 flex-col items-center justify-center rounded-[2px] border border-[#36454d] bg-white ${className}`}
    >
      {children}
    </div>
  );
}
