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

      <div className="flex w-full flex-col gap-[10px]">
        <hr className="border-t-[0.5px] border-[#8eb6cc]" />
        <p className="text-center font-dmmono text-[11px] font-medium leading-[1.5] text-white">
          © 2026 Talk To Me In Korean. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
