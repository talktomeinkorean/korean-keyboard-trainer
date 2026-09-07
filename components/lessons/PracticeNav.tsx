/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import Link from 'next/link';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  /** 뒤로가기 목적지 */
  backHref: string;
  /** 오른쪽 자리 (긴 글의 TTMIK Stories 배지 등). 비면 제목을 가운데 두기 위한 빈 자리가 된다 */
  right?: ReactNode;
}

/** 연습 화면 공통 내비게이션 바 (시안 320:22506). */
export function PracticeNav({ title, backHref, right }: Props) {
  return (
    <header className="flex h-[85px] shrink-0 items-center justify-between p-[24px]">
      <Link href={backHref} aria-label="Back" data-testid="practice-back" className="shrink-0">
        <img
          src="/lessons/icons/arrow-back.svg"
          alt=""
          aria-hidden
          /* 시안의 화살표는 오른쪽을 보는 에셋을 180도 돌려 쓴다 */
          className="h-[15px] w-[18px] rotate-180"
        />
      </Link>
      <h1 className="truncate px-[10px] text-center font-dmsans text-[20px] font-bold text-[#36454d]">
        {title}
      </h1>
      <span className="flex size-[32px] shrink-0 items-center justify-center">{right}</span>
    </header>
  );
}
