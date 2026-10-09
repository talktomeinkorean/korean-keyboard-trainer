/* eslint-disable @next/next/no-img-element -- 시안 그대로의 고정 px 아트라 최적화 파이프라인이 필요 없다. */
"use client";

import Link from "next/link";
import { EventCountdown } from "@/components/event/EventCountdown";
import { useCountdownVisible } from "@/lib/event/useCountdownVisible";

/**
 * 블록 안 요소들의 자리 (홈 캔버스 기준). 카운트다운이 뜨면 전체가 위로 올라가 그 자리를 만들고,
 * 안 뜰 때는 원래 자리에 그대로 둔다 — 미리 비워 두면 빈 공간만 커 보인다.
 *
 * 위아래는 배경 아트가 막고 있다 (태그라인 428 · "Runners so far" 말풍선 657).
 * 뜰 때의 간격은 시안(1857:12569) 비율을 그 사이 229px 에 맞춰 줄인 값이다.
 */
const LAYOUT = {
  hidden: { title: 475.99, join: 520.07, joinGap: 20, giftLeft: 506.99, giftRight: 566.88 },
  shown: { title: 444, join: 561.7, joinGap: 14, giftLeft: 548.62, giftRight: 608.51 },
} as const;

/** 홈 이벤트 블록 — 타이틀·카운트다운·Join Now·See prizes·선물 아이콘. 배경 아트 위에 얹는다. */
export function HomeEventBlock() {
  const visible = useCountdownVisible();
  const at = visible ? LAYOUT.shown : LAYOUT.hidden;

  return (
    <>
      <div
        style={{ top: at.join, gap: at.joinGap }}
        className="absolute left-[46.5px] flex w-[300px] flex-col items-center"
      >
        <Link
          href="/race"
          className="flex h-[59px] w-full items-center justify-center rounded-[2px] border border-[#36454d] bg-[#f9f064] font-dmmono text-[25px] font-medium text-[#36454d] shadow-[inset_0px_-3px_0px_0px_rgba(0,0,0,0.2),inset_0px_3px_0px_0px_rgba(255,255,255,0.8)]"
        >
          Join Now
        </Link>
        <a
          href="#prize-draw"
          className="flex items-center gap-[9px] px-[2px] pb-[2px] font-dmsans text-[15px] font-semibold leading-[1.1] text-black opacity-60"
        >
          See prizes &amp; rules
          {/* 시안 박스는 7.165x10.975 이고 선 굵기만큼 에셋이 좌우로 0.53px 삐져나온다 */}
          <span className="relative h-[10.975px] w-[7.165px] shrink-0">
            <img
              src="/home/arrow-down.svg"
              alt=""
              aria-hidden
              className="absolute left-[-0.53px] top-0 h-[13px] w-[9px] max-w-none"
            />
          </span>
        </a>
      </div>

      {/* 종료 24시간 전부터 나타난다 (시안 1857:12569). 타이틀과 Join Now 사이다. */}
      <EventCountdown className="absolute inset-x-0 top-[480px] items-center" />

      {/* 이벤트 타이틀 — 픽셀 글자라 에셋으로 넣는다.
          시안은 40% 검정 + plus-darker(= 배경에서 102 만큼 빼기)인데, 그 블렌드는 사파리에만 있어
          크롬에서는 그냥 40% 검정으로 깔려 훨씬 밝게 나왔다. 그래서 결과색(#2B7C58)을 에셋에 그대로 넣는다.
          (민트 배경 144.6·225.9·190 − 102) */}
      <img
        src="/home/prize-title.svg"
        alt="Hangeul Day Prize Draw"
        style={{ top: at.title }}
        className="absolute left-[65.26px] h-[22px] w-[262.49px]"
      />
      {/* 선물·게임패드 — Join Now 버튼 모서리에 걸친다. 버튼 위에 그려지므로 클릭을 가로채지 않게 한다.
          좌표: 시안 프레임(1559:11645) 46.5·475.99 + 그룹 0·31 + 그룹 안 위치.
          회전된 아이콘이라 get_metadata 의 x/y 는 회전 전 값이 섞여 틀린다 — get_design_context 의
          렌더 위치(좌 5.14·0, 우 257.55·59.89)를 쓴다. */}
      <img
        src="/home/icon-gift-left.svg"
        alt=""
        aria-hidden
        style={{ top: at.giftLeft }}
        className="pointer-events-none absolute left-[51.64px] size-[38px]"
      />
      <img
        src="/home/icon-gift-right.svg"
        alt=""
        aria-hidden
        style={{ top: at.giftRight }}
        className="pointer-events-none absolute left-[304.05px] h-[33.88px] w-[38.52px]"
      />
    </>
  );
}
