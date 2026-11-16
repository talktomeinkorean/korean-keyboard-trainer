import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BASICS_META, lessonDescription, pageMetadata } from '@/lib/seo';
import { getLesson, LESSONS } from '@/lib/curriculum/lessons';
import { CATEGORIES } from '@/lib/curriculum/categories';
import { getContentLesson, getContentLessons } from '@/lib/content/catalog';
import { LessonPlayer } from './LessonPlayer';
import { BasicsPractice } from './BasicsPractice';

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
  // 기초 3개는 확정 문구를 쓰고, 자동 생성 레슨은 연습 내용에서 문구를 만든다
  const fixed = BASICS_META[lesson.id];
  return pageMetadata({
    title: fixed?.title ?? `${lesson.title} — Korean Typing Practice`,
    description: fixed?.description ?? lessonDescription(lesson),
    path: `/lesson/${lesson.id}`,
  });
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 정적 커리큘럼(자음/모음/조합) 우선, 그 외에는 콘텐츠 레슨(voc-/sen-/txt-) 해석
  const lesson = getLesson(id) ?? getContentLesson(id);
  if (!lesson) notFound();
  // Basics 는 전체 풀에서 한 판을 뽑아야 해서 클라이언트에서 세트를 만든다
  if (getLesson(id)) return <BasicsPractice lesson={lesson} />;
  return <LessonPlayer lesson={lesson} />;
}
