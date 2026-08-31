import Link from 'next/link';
import { CATEGORIES } from '@/lib/curriculum/categories';

/**
 * 시안의 배경(그라디언트·로고·장식)은 한 장의 이미지로 깐다.
 * 파일이 없으면 아래 그라디언트 폴백만 보인다.
 */
const BG_SRC = '/lessons/bg-practice.webp';

// 시안 버튼: 300x55, #ab99ff, 진한 테두리, 위아래 안쪽 그림자로 입체감
const CATEGORY_BUTTON =
  'flex h-[55px] w-[300px] max-w-full items-center justify-center rounded-[2px] ' +
  'border border-[#36454d] bg-[#ab99ff] font-dmsans text-[20px] font-medium text-[#36454d] ' +
  'shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.2),inset_0_3px_0_0_rgba(255,255,255,0.5)] ' +
  'transition active:translate-y-px hover:brightness-105';

export default function LessonsPage() {
  return (
    // 배경 이미지는 폭에 맞춰 비율대로 늘어난다. 이미지가 없을 때를 대비해
    // 시안과 비슷한 그라디언트를 클래스로 깔아 둔다.
    <main
      className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-[#f9f395] via-[#fffef3] via-70% to-[#ebe7ff] bg-top bg-no-repeat"
      style={{ backgroundImage: `url(${BG_SRC})`, backgroundSize: '100% auto' }}
    >
      <h1 className="sr-only">Hangeul Typing Practice</h1>

      {/* 배경 이미지의 로고·문구 영역. 폭에 비례해 함께 줄어들도록 비율로 잡는다. */}
      <div aria-hidden className="w-full shrink-0 aspect-[393/420]" />

      <nav className="flex w-full flex-col items-center gap-[10px] px-4">
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
    </main>
  );
}
