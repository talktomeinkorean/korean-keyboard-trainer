/* eslint-disable @next/next/no-img-element -- 시안 그대로의 고정 크기 배너라 최적화 파이프라인이 필요 없다. */
import Link from 'next/link';
import { CATEGORIES } from '@/lib/curriculum/categories';
import { pageMetadata } from '@/lib/seo';
import { TtmikFooter } from '@/components/event/TtmikFooter';
import { LessonSky } from '@/components/LessonSky';

export const metadata = pageMetadata({
  title: 'Korean Typing Practice — Hangeul Keyboard Lessons',
  description:
    'Free Korean typing practice: consonants and vowels, vocabulary, sentences, and long passages, with feedback on every consonant and vowel you type.',
  path: '/lessons',
});

/** 예전에는 배경 이미지에 구워져 있던 로고 */
const LOGO_SRC = '/logo.png';
/** 컬럼 밖으로 번져 좌우를 채우는 층. 섹션 높이를 그대로 따라간다. */
const BLEED = 'absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2';
const BANNER_SRC = '/lessons/promotion-banner.webp';
/**
 * 데스크톱 배너 — 1920x85 (2x 로 3840 px). 양옆은 단색이라 좁은 화면에서는 가운데만 보인다.
 * 글자는 가운데 약 800 폭에 있어서, 860 보다 좁으면 잘리지 않게 이미지 전체를 줄인다 (1920 / 860 ≈ 223.3vw).
 */
const DESKTOP_BANNER_SRC = '/lessons/desktop-banner.webp';

// 시안 버튼: 300x55, #ab99ff, 진한 테두리, 위아래 안쪽 그림자로 입체감
const CATEGORY_BUTTON =
  'flex h-[55px] w-[300px] max-w-full items-center justify-center rounded-[2px] ' +
  'border border-[#36454d] bg-[#ab99ff] font-dmsans text-[20px] font-medium text-[#36454d] ' +
  'shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.2),inset_0_3px_0_0_rgba(255,255,255,0.5)] ' +
  'transition active:translate-y-px hover:brightness-105';

export default function LessonsPage() {
  return (
    <main className='flex min-h-screen flex-col'>
      <h1 className='sr-only'>Hangeul Typing Practice</h1>

      {/* pt 를 % 로 잡은 건 배너 높이(w-full 이라 폭에 비례)와 같이 움직이게 하기 위해서다 —
          고정 px 이면 393px 보다 좁은 화면에서 간격이 틀어진다. */}
      <div className='relative flex flex-1 flex-col items-center pt-[15%] pb-[130px]'>
        {/* 배경 — 컬럼과 좌우를 한 겹으로 칠한다 */}
        <LessonSky variant='home' className={BLEED} />

        {/* 이벤트 배너 — 배경 위에 겹쳐 띄운다. 누르면 홈(레이스)으로 */}
        <Link
          href='/'
          data-testid='promotion-banner'
          className='absolute inset-x-0 top-0 z-10'
        >
          <img
            src={BANNER_SRC}
            alt='Hangeul Day Typing Race, until Oct 11th. More records, more chances to win!'
            className='w-full sm:hidden'
          />
          {/* 데스크톱은 컬럼이 아니라 화면 폭 전체에 깐다 */}
          <div className='absolute left-1/2 top-0 hidden w-screen -translate-x-1/2 justify-center overflow-hidden sm:flex'>
            <img
              src={DESKTOP_BANNER_SRC}
              alt='Hangeul Day Typing Race, until Oct 11th. More records, more chances to win!'
              className='max-w-none shrink-0'
              style={{ width: 'min(1920px, 223.3vw)' }}
            />
          </div>
        </Link>

        {/* 로고·문구 — 배경에 구워져 있던 것을 요소로 꺼냈다. 폭에 비례해 함께 줄어들도록 비율로 잡는다. */}
        <div className='flex w-full shrink-0 flex-col items-center gap-[2.56px] pt-[8%] pb-[6%]'>
          <img src={LOGO_SRC} alt='' aria-hidden className='w-[58%]' />
          {/* 시안 타이포 그대로 (1278:7976 · 1278:7977) */}
          <p className='text-center font-dmsans text-[29.62px] font-black leading-normal text-[#36454d]'>
            Hangeul Typing
          </p>
          <p className='text-center font-dmmono text-[23.696px] font-medium leading-normal text-[#ab99ff]'>
            Practice
          </p>
        </div>

        <nav className='flex w-full flex-col items-center gap-[10px] px-4'>
          {CATEGORIES.map((category) => {
            const hasContent = category.stages.length > 0 || category.dbKind;
            return hasContent ? (
              <Link
                key={category.slug}
                href={`/lessons/${category.slug}`}
                data-testid={`category-${category.slug}`}
                className={CATEGORY_BUTTON}
              >
                {category.title}
              </Link>
            ) : (
              <span
                key={category.slug}
                data-testid={`category-${category.slug}`}
                className={`${CATEGORY_BUTTON} cursor-not-allowed opacity-50`}
              >
                {category.title}
              </span>
            );
          })}
        </nav>
      </div>

      {/* TTMIK 푸터 (시안 294:18025) — 밝은 영역이 끝나고 55px 아래에서 시작, 하단 40px.
          시안은 마지막 버튼 아래 130px 에서 어두운 영역이 시작한다 (위 pb). 배경 아트 하단은
          고른 연보라 격자라 어디서 잘려도 어색하지 않다. */}
      <div className='relative bg-[#36454d] px-4 pt-[55px] pb-[40px]'>
        <div aria-hidden className={`${BLEED} bg-[#36454d]`} />
        <div className='mx-auto w-[350px] max-w-full'>
          <TtmikFooter />
        </div>
      </div>
    </main>
  );
}
