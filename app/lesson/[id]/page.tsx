import { notFound } from 'next/navigation';
import { getLesson } from '@/lib/curriculum/lessons';
import { getDbLesson } from '@/lib/content/catalog';
import { LessonPlayer } from './LessonPlayer';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 정적 커리큘럼(자음/모음/조합) 우선, 그 외에는 DB 레슨(voc-/sen-/txt-) 해석
  const lesson = getLesson(id) ?? (await getDbLesson(id));
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
