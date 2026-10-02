/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */

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

/** 점선 아래 버튼들 (시안 1728:10068). 링크는 받은 주소 그대로. */
const FOOTER_LINKS = [
  { label: 'Feedback & Bug Report', href: 'https://tally.so/r/gDBxJD' },
  { label: 'How To Install the Korean Keyboard', href: 'https://youtu.be/t7T4GJ_hvBw' },
];

/** 시안 버튼 (1728:10069) — 테두리만 있는 가로 꽉 찬 버튼 */
const FOOTER_BUTTON =
  'flex w-full items-center justify-center rounded-[2px] border border-[#8eb6cc] ' +
  'px-[15px] pt-[10px] pb-[12px] text-center font-dmmono text-[12px] leading-[1.25] text-[#8eb6cc]';

/** 하단 TTMIK 푸터 — 로고, 앱 목록, 저작권 (홈 1277:13618, 결과 화면 1278:7095, 타자연습 1278:7321). */
export function TtmikFooter() {
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

      {/* 시안 1736:9724 — 점선(0.5px 3px 간격) 아래로 버튼 묶음과 저작권 */}
      <hr className="w-full border-0 border-t-[0.5px] border-dashed border-[#8eb6cc]" />

      <div className="flex w-full flex-col gap-[20px]">
        <div className="flex w-full flex-col gap-[10px]">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={FOOTER_BUTTON}
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="text-center font-dmmono text-[11px] font-medium leading-[1.5] text-white">
          © 2026 Talk To Me In Korean. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
