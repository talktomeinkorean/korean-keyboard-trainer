/* eslint-disable @next/next/no-img-element -- 시안 그대로의 고정 px 배경 아트라 최적화 파이프라인이 필요 없다. */
import Link from 'next/link';
import { PrizeDrawHeading } from '@/components/event/PrizeDrawHeading';
import { Faq } from '@/components/event/Faq';
import { TtmikFooter } from '@/components/event/TtmikFooter';

// 홈 배경 시안 (1359:10058) 을 2x 로 export 한 아트. 1920 폭이고 가운데 393 이 모바일 홈(1220:24828) 과 같은 그림이다.
// 이벤트 블록(타이틀·Join Now·See prizes)과 참여인원 숫자는 이 이미지에서 빠져 있어 아래에서 HTML 로 얹는다.
// 하늘(832)과 그 아래로 걸친 캐릭터 발까지만 잘라 864 높이다 — 그 아래는 단색이라 CSS 로 칠한다.
// 640 미만 화면은 1920 이 필요 없으므로 가운데 640 만 잘라낸 -sm 파일을 받는다.

// 시안 캔버스 크기. 아래 좌표들은 모두 이 캔버스 기준이다.
const CANVAS_WIDTH = 393;
const HERO_HEIGHT = 832.158;


/** "Runners so far" 숫자. 집계를 못 읽었으면 가짜 숫자 대신 "-" 를 보인다. */
function formatRunnerCount(count: number | null): string {
  return count === null ? '-' : count.toLocaleString('en-US');
}

/** 시안 배경 위에 얹는 인터랙티브 영역. */
function Hero({ runnerCount }: { runnerCount: number | null }) {
  return (
    // mx-auto 는 화면이 캔버스(393)보다 좁으면 왼쪽에 붙어 버려 가운데 정렬된 배경 그림과 어긋난다 — 양쪽으로 넘치게 가운데 맞춘다.
    <section
      className="relative"
      style={{ width: CANVAS_WIDTH, height: HERO_HEIGHT, marginLeft: `calc((100% - ${CANVAS_WIDTH}px) / 2)` }}
    >
      {/* 헤드라인은 배경 아트에 그려져 있어 문서 구조용으로만 남긴다. */}
      <h1 className="sr-only">Type a Korean word. Take a step. Race across Seoul!</h1>

      {/* 이벤트 블록 — 배경 아트에는 하늘만 있고 여기부터는 전부 HTML 이다. */}
      <div className="absolute left-[46.5px] top-[530.07px] flex w-[300px] flex-col items-center gap-[20px]">
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

      {/* 이벤트 타이틀 — 픽셀 글자라 에셋으로 넣는다. 40% 검정이라 뒤의 민트가 비쳐 짙은 초록이 된다.
          (파일 속 mix-blend-mode: plus-darker 는 Safari 전용이지만 검정에는 효과가 없어 브라우저마다 같다) */}
      <img
        src="/home/prize-title.svg"
        alt="Hangeul Day Prize Draw"
        className="absolute left-[65.26px] top-[486px] h-[22px] w-[262.49px]"
      />
      {/* 선물·게임패드 — Join Now 버튼 모서리에 걸친다. 버튼 위에 그려지므로 클릭을 가로채지 않게 한다.
          좌표: 시안 프레임(1220:25125) 46.5·486 + 그룹(1220:25167) 0·31 + 그룹 안 위치.
          회전된 아이콘이라 get_metadata 의 x/y 는 회전 전 값이 섞여 틀린다 — get_design_context 의
          렌더 위치(좌 5.14·0, 우 257.55·59.89)를 쓴다. */}
      <img
        src="/home/icon-gift-left.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[51.64px] top-[517px] size-[38px]"
      />
      <img
        src="/home/icon-gift-right.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[304.05px] top-[576.89px] h-[33.88px] w-[38.52px]"
      />

      <p className="absolute left-1/2 top-[726.7px] -translate-x-1/2 whitespace-nowrap text-center font-silkscreen text-[40px] leading-[1.3] tracking-[-4px] text-[#36454d]">
        {formatRunnerCount(runnerCount)}
      </p>
    </section>
  );
}

/** 히어로 아래 어두운 영역 — 이벤트 제목, Q&A, 푸터. */
function PrizeSection() {
  return (
    <section className="relative pb-[30px] pt-[72.88px]">
      <div className="mx-auto flex w-[350px] max-w-[calc(100%-32px)] flex-col gap-[60px]">
        <div className="flex flex-col gap-[40px]">
          <PrizeDrawHeading id="prize-draw" />
          <Faq defaultOpen />
        </div>
        <TtmikFooter />
      </div>
    </section>
  );
}

export function HomeScreen({ runnerCount }: { runnerCount: number | null }) {
  return (
    // 바깥 상자는 화면 폭 배경을 담는 자리다 — main 은 가로를 잘라내므로 거기 두면 컬럼 밖이 잘린다.
    <div className="relative flex flex-1 flex-col">
      <HomeBackdrop />
      <main className="relative flex-1 overflow-x-clip">
        <Hero runnerCount={runnerCount} />
        <PrizeSection />
      </main>
    </div>
  );
}

/**
 * 홈 배경 — 화면 폭 전체를 컬럼까지 **한 장으로** 덮는다. 모바일도 같은 그림의 가운데를 쓴다.
 * (모바일 전용 아트를 컬럼에만 깔면 393~639 폭에서 컬럼 밖이 흰 여백으로 남는다.)
 *
 * 처음에는 좌우만 이 이미지로 채우고 가운데는 모바일 2x 아트(Home.webp)를 올렸는데, 컬럼 경계에
 * 세로선이 보였다. 두 그림은 같은 장면이지만 Figma 프레임마다 격자 시작점이 달라 세로 격자가
 * 반 칸(9px) 어긋나고, 컬럼 경계가 이미지 안에서 763.5 로 반 픽셀에 걸려 선명도도 달라진다.
 * /lessons 도 같은 이유로 한 장을 쓴다 (LessonSky).
 *
 * - 하늘 구간: 원래 크기로 가운데 맞춰 깐다. 확대·축소하지 않아야 이미지 속 가운데 그림이 컬럼 위
 *   HTML 요소(버튼·숫자)와 어느 화면 폭에서나 겹친다. 1920 보다 넓은 화면 바깥은 같은 하늘 그라디언트.
 * - 아래 Q&A·푸터 구간: 섹션과 같은 어두운 색.
 */
function HomeBackdrop() {
  return (
    // overflow-hidden: 이미지가 화면보다 넓으면 가로 스크롤이 생긴다 — 화면 폭에서 잘라낸다
    <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#36454d]">
      <div
        className="absolute inset-x-0 top-0 bg-[linear-gradient(180deg,#8ceb97_34.859%,#90cfff_105.22%)]"
        style={{ height: HERO_HEIGHT }}
      />
      <div className="absolute left-1/2 top-0 h-[864px] w-[640px] -translate-x-1/2 bg-[url(/home/desktop-home-sm.webp)] bg-size-[100%_100%] bg-no-repeat sm:w-[1920px] sm:bg-[url(/home/desktop-home.webp)]" />
    </div>
  );
}
