/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import { PracticeBackground } from '@/components/PracticeBackground';
import { CATEGORIES, getCategory, lessonsInCategory } from '@/lib/curriculum/categories';
import { getContentLessons } from '@/lib/content/catalog';
import { LessonList } from './LessonList';

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const found = getCategory(category);
  if (!found) return {};
  return pageMetadata({
    title: `${found.title} — Korean Typing Practice`,
    description: found.description,
    path: `/lessons/${found.slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const found = getCategory(category);
  if (!found) notFound();

  const lessons = found.dbKind
    ? getContentLessons(found.dbKind)
    : lessonsInCategory(category);

  // 시안의 Basics 는 버튼이 3개뿐이라 목록이 화면 가운데쯤에서 시작한다.
  // 항목이 많은 카테고리(Vocabulary 는 101개)까지 그 여백을 두면 첫 화면이
  // 거의 비어 보이므로, 짧은 목록에서만 시안 간격을 쓴다.
  const roomy = lessons.length <= 5;

  return (
    // 배경이 밝아서 글자색을 고정한다 — 다크 모드에서 body 색을 물려받으면 안 보인다
    <main className="min-h-screen text-[#36454d]">
      <PracticeBackground />

      {/* 내비게이션 바 — 오른쪽 32px 은 제목을 가운데 두기 위한 빈 자리 */}
      <header className="flex h-[85px] items-center justify-between p-[24px]">
        <Link href="/lessons" aria-label="Back to practice menu" data-testid="back-to-lessons">
          <img
            src="/lessons/icons/arrow-back.svg"
            alt=""
            aria-hidden
            /* 시안의 화살표는 오른쪽을 보는 에셋을 180도 돌려 쓴다 */
            className="h-[15px] w-[18px] rotate-180"
          />
        </Link>
        <h1 className="font-dmsans text-[20px] font-bold">{found.title}</h1>
        <span aria-hidden className="size-[32px]" />
      </header>

      <div className={`flex flex-col items-center px-4 pb-[40px] ${roomy ? 'pt-[191px]' : 'pt-[30px]'}`}>
        {lessons.length === 0 ? (
          <p className="text-[#6b8999]">Coming soon</p>
        ) : (
          <LessonList lessons={lessons} />
        )}
      </div>
    </main>
  );
}
