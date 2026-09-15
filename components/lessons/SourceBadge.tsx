/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import { sourceLink } from '@/lib/content/sources';

interface Props {
  /** 콘텐츠 데이터의 source 원문 — 교재 단위 문구와 상품 링크로 바뀐다 */
  source: string;
  className?: string;
}

/**
 * 출처 배지 (시안 I519:13897;423:11708 · 413:10486 · 401:8676) — 이 연습 내용이 어느 교재에서 왔는지.
 * 누르면 새 탭에서 해당 교재·강의 페이지가 열린다. 규칙에 없는 출처면 원문만 링크 없이 보인다.
 */
export function SourceBadge({ source, className = '' }: Props) {
  const link = sourceLink(source);
  const body = (
    <>
      <img src="/lessons/icons/link.svg" alt="" aria-hidden className="size-[17.8px] shrink-0" />
      <span className="truncate font-dmmono text-[12px] text-[#736e17]">{link?.label ?? source}</span>
    </>
  );
  // 시안 여백은 10·5px 인데 Figma 는 테두리를 안쪽으로 그린다 (배지 높이 27.85 = 아이콘 17.85 + 여백 10).
  // CSS 테두리는 바깥에 더해지므로 여백에서 1px 씩 뺀다.
  const style = `flex items-center justify-center gap-[4px] rounded-[2px] border border-[#736e17] bg-[#f2eeaa] px-[9px] py-[4px] shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.25)] ${className}`;

  if (!link) {
    return (
      <div data-testid="source-badge" className={style}>
        {body}
      </div>
    );
  }
  return (
    <a
      data-testid="source-badge"
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${style} transition hover:brightness-97 active:translate-y-px`}
    >
      {body}
    </a>
  );
}
