import { notFound } from 'next/navigation';
import { getLesson, LESSONS } from '@/lib/curriculum/lessons';
import { LessonPlayer } from './LessonPlayer';

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
