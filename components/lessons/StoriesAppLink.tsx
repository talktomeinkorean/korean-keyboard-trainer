/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import { TTMIK_STORIES_URL } from '@/lib/content/sources';

/**
 * 긴 글 연습 화면 헤더 오른쪽의 TTMIK Stories 앱 아이콘 (시안 419:11247).
 * 긴 글은 연습 화면에 출처 배지가 없고 이 아이콘이 그 자리를 대신한다 — 배지는 지문 목록에 있다.
 * 36px 아이콘을 15° 기울여서 차지하는 자리가 44.09px 다.
 */
export function StoriesAppLink() {
  return (
    <span className="flex size-[44.091px] items-center justify-center">
      <a
        href={TTMIK_STORIES_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TTMIK Stories"
        data-testid="stories-app-link"
        className="relative size-[36px] rotate-15 rounded-[10px] border border-white bg-[#031b30] shadow-[0_0_4px_0_rgba(102,98,41,0.25)] transition hover:brightness-110"
      >
        <img
          src="/lessons/icons/ttmik-stories.svg"
          alt=""
          aria-hidden
          className="absolute left-[8.06px] top-[8.06px] h-[17.877px] w-[17.874px] max-w-none"
        />
      </a>
    </span>
  );
}
