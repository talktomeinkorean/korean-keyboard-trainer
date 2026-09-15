/* eslint-disable @next/next/no-img-element -- 시안 그대로의 고정 px 배경 아트라 최적화 파이프라인이 필요 없다. */
import Link from 'next/link';

// Figma "Home" (node 1220:24828) 을 2x 로 export 한 배경 아트.
// 이벤트 블록(타이틀·Join Now·See prizes)과 참여인원 숫자는 이 이미지에서 빠져 있어
// 아래에서 HTML 로 얹는다.
const HOME_ART = '/home/Home.webp';

// 시안 캔버스 크기. 아래 좌표들은 모두 이 캔버스 기준이다.
const CANVAS_WIDTH = 393;
const HERO_HEIGHT = 832.158;

// 시안의 "Runners so far" 수치. 실제 참가자 수를 붙이기 전까지의 표시값.
const RUNNER_COUNT = '123,456';

/** 시안 배경 위에 얹는 인터랙티브 영역. */
function Hero() {
  return (
    <section className="relative mx-auto" style={{ width: CANVAS_WIDTH, height: HERO_HEIGHT }}>
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
          <PixelArrowDown className="size-[11px] shrink-0" />
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
        {RUNNER_COUNT}
      </p>
    </section>
  );
}

/** 이벤트 안내 — Q&A 위에 놓이는 트로피와 제목·기간 (시안 1220:25047). */
function PrizeDrawHeading() {
  return (
    <div id="prize-draw" className="flex scroll-mt-4 flex-col items-center gap-[20px] text-center">
      {/* 레이아웃은 시안의 트로피 박스(27.97x25.18)로 잡고, 흰 바깥 테두리(3.47px)가 포함된
          에셋은 그만큼 바깥으로 삐져나오게 둔다 — 그래야 아래 글자와의 간격 20px 가 시안과 맞는다. */}
      <div className="relative h-[25.175px] w-[27.972px] shrink-0">
        <img
          src="/home/icon-trophy.svg"
          alt=""
          aria-hidden
          className="absolute left-[-3.467px] top-[-3.467px] h-[33px] w-[35px] max-w-none"
        />
      </div>
      <div>
        <p className="font-dmsans text-[24.85px] font-extrabold leading-[1.5] text-white">
          Hangeul Day Prize Draw
        </p>
        <p className="font-dmsans text-[22px] font-medium leading-[1.5] text-[#f9f064]">
          Oct 1 – Oct 11, 2026
        </p>
      </div>
    </div>
  );
}

/** Q&A 토글 화살표 — Figma `pinhead:pixel-arrow-down` (655:7969). */
function PixelArrowDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className} fill="currentColor">
      <path d="M15.4999 11.5H12.4999V13.5H11.4999V2.5H8.49992V13.5H7.49992V11.5H4.49992V13.5H6.49992V15.5H8.49992V17.5H11.4999V15.5H13.4999V13.5H15.4999V11.5Z" />
    </svg>
  );
}

const FAQ = [
  {
    question: 'What can I win?',
    answer: (
      <>
        <p className="text-[#8166ff]">Pick one, worth $100</p>
        <ul className="list-disc ps-[21px]">
          <li>Korean Bootcamp for Beginners (6 weeks)</li>
          <li>TTMIK Courses (6-month Subscription)</li>
          <li>TTMIK Stories (6-month Subscription)</li>
          <li>Seyo: Learn &amp; Speak Korean (6-month Subscription)</li>
        </ul>
      </>
    ),
  },
  {
    question: "I'm slow. Can I still win?",
    answer: (
      <p>
        Yes! It&apos;s not about being fast.
        <br />
        <br />
        We pick <span className="text-[#8d78f1]">2 winners</span> at random from{' '}
        <span className="text-[#8d78f1]">every rank</span>! (달팽이 🐌 to 타자왕 👑)
        <br />
        <br />
        Your time decides your rank, not your chance of winning 😉
      </p>
    ),
  },
  {
    question: 'How do I enter?',
    answer: (
      <>
        <p className="text-[#8166ff]">Oct 1 – Oct 11, 2026 (11:59 PM KST)</p>
        <p>1. Finish a race</p>
        <p>2. Tap &quot;Submit This Record&quot;</p>
        <p>3. Leave your name and email</p>
        <br />
        <p>Each record you save is one entry in the draw for that rank so play as many times as you like!</p>
      </>
    ),
  },
  {
    question: 'How do I know if I won?',
    answer: (
      <p>
        We&apos;ll email every winner directly, with a short form to choose their prize 📬
        <br />
        <span className="text-[#8166ff]">(Winners announced Oct 16, 2026)</span>
      </p>
    ),
  },
];

/** 하단 Q&A — 시안은 전부 펼친 상태. details 로 접고 펼 수 있게 한다. */
function Faq() {
  return (
      <div className="flex flex-col gap-[22px]">
        {FAQ.map(({ question, answer }) => (
          <details key={question} open className="group border-t border-white/30 pt-[12px]">
            <summary className="flex cursor-pointer list-none items-center gap-[10px] [&::-webkit-details-marker]:hidden">
              <PixelArrowDown className="size-[20px] shrink-0 -rotate-90 text-[#8ceb97] transition-transform group-open:rotate-0" />
              <span className="font-dmsans text-[15px] font-bold leading-[1.5] text-white">{question}</span>
            </summary>
            <div className="mt-[12px] rounded-[10px] bg-white p-[20px] font-dmsans text-[14px] leading-[1.5] text-black">
              {answer}
            </div>
          </details>
        ))}
      </div>
  );
}

/** 푸터의 TTMIK 앱 목록 (시안 1277:13632). 링크는 시안에 걸린 주소 그대로. */
const TTMIK_APPS = [
  {
    name: 'TTMIK Courses',
    tagline: 'Turn Hangeul into real Korean skills.',
    icon: '/home/icons/courses.png',
    href: 'https://ttmik.me/4yub10b',
  },
  {
    name: 'TTMIK Books',
    tagline: 'Build your Korean, one page at a time.',
    icon: '/home/icons/books.png',
    href: 'https://ttmik.me/4xRD4H3',
  },
  {
    name: 'TTMIK Stories',
    tagline: 'Read, listen, and grow naturally.',
    icon: '/home/icons/stories.png',
    href: 'https://ttmikstories.onelink.me/Mj4f/fu8e7afk',
  },
  {
    name: 'Seyo',
    tagline: 'Practice speaking Korean.',
    icon: '/home/icons/seyo.png',
    href: 'https://seyo.onelink.me/xicV/rjuv9u7d',
  },
];

/** 하단 TTMIK 푸터 — 로고, 앱 목록, 저작권 (시안 1277:13618). */
function Footer() {
  return (
    <footer className="flex flex-col items-center gap-[30px]">
      <div className="flex w-full flex-col items-center gap-[20px]">
        <img src="/home/ttmik-logo.svg" alt="Talk To Me In Korean" className="h-[34px] w-[68px]" />
        <p className="text-center font-dmsans text-[20px] font-bold leading-[1.5] tracking-[-0.4px] text-[#8eb6cc]">
          Keep the momentum going
        </p>
      </div>

      <ul className="flex w-full flex-col gap-[20px]">
        {TTMIK_APPS.map((app) => (
          <li key={app.name}>
            <a
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[16px]"
            >
              <img src={app.icon} alt="" aria-hidden className="size-[44.896px] shrink-0" />
              <span className="flex flex-col font-dmsans leading-[1.6]">
                <span className="text-[17px] font-bold text-white">{app.name}</span>
                <span className="-mt-[2px] text-[14px] font-medium text-[#8eb6cc]">{app.tagline}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="flex w-full flex-col gap-[10px]">
        <hr className="border-t-[0.5px] border-[#8eb6cc]" />
        <p className="text-center font-dmmono text-[11px] font-medium leading-[1.5] text-white">
          © 2026 Talk To Me In Korean. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/** 히어로 아래 어두운 영역 — 이벤트 제목, Q&A, 푸터. */
function PrizeSection() {
  return (
    <section className="relative pb-[30px] pt-[72.88px]">
      <div className="mx-auto flex w-[350px] max-w-[calc(100%-32px)] flex-col gap-[60px]">
        <div className="flex flex-col gap-[40px]">
          <PrizeDrawHeading />
          <Faq />
        </div>
        <Footer />
      </div>
    </section>
  );
}

export function HomeScreen() {
  return (
    <main className="relative flex-1 overflow-x-clip bg-[#36454d]">
      {/* 캔버스보다 넓은 화면에서 좌우가 비지 않도록 하늘 그라디언트를 깔아둔다. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 bg-[linear-gradient(180deg,#8ceb97_34.859%,#90cfff_105.22%)]"
        style={{ height: HERO_HEIGHT }}
      />
      {/* 배경 아트. 하단 어두운 영역은 섹션 배경색과 같아 Q&A 뒤로 자연스럽게 이어진다. */}
      <img
        src={HOME_ART}
        alt=""
        aria-hidden
        className="absolute left-1/2 top-0 max-w-none -translate-x-1/2"
        style={{ width: CANVAS_WIDTH }}
      />
      <Hero />
      <PrizeSection />
    </main>
  );
}
