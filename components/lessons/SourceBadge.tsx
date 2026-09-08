/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */

/**
 * 출처 배지 (시안 I519:13897;423:11708) — 이 연습 내용이 어느 교재에서 왔는지.
 *
 * 시안에는 교재 표지 썸네일과 상품 링크도 붙어 있지만, 우리 데이터에는 출처
 * 문자열만 있고 출처별 이미지·URL 대응표가 없어 배지만 그린다.
 */
export function SourceBadge({ source }: { source: string }) {
  return (
    <div
      data-testid="source-badge"
      className="flex items-center justify-center gap-[4px] rounded-[2px] border border-[#736e17] bg-[#f2eeaa] px-[10px] py-[5px] shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.25)]"
    >
      <img src="/lessons/icons/link.svg" alt="" aria-hidden className="size-[17.8px] shrink-0" />
      <span className="truncate font-dmmono text-[12px] text-[#736e17]">{source}</span>
    </div>
  );
}
