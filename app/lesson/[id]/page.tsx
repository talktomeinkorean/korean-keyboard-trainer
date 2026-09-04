import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { lessonDescription, pageMetadata } from '@/lib/seo';
import { getLesson, LESSONS } from '@/lib/curriculum/lessons';
import { CATEGORIES } from '@/lib/curriculum/categories';
import { getContentLesson, getContentLessons } from '@/lib/content/catalog';
import { LessonPlayer } from './LessonPlayer';

// 콘텐츠가 빌드 시점에 확정되므로 모든 레슨을 정적 생성한다 (요청 시 서버 렌더 없음).
export function generateStaticParams() {
  const contentIds = CATEGORIES.flatMap((c) =>
    c.dbKind ? getContentLessons(c.dbKind).map((l) => l.id) : [],
  );
  return [...LESSONS.map((l) => l.id), ...contentIds].map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = getLesson(id) ?? getContentLesson(id);
  if (!lesson) return {};
  return pageMetadata({
    title: `${lesson.title} — Korean Typing Practice`,
    description: lessonDescription(lesson),
    path: `/lesson/${lesson.id}`,
  });
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 정적 커리큘럼(자음/모음/조합) 우선, 그 외에는 콘텐츠 레슨(voc-/sen-/txt-) 해석
  const lesson = getLesson(id) ?? getContentLesson(id);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
