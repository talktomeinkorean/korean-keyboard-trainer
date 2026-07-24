import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, getCategory, lessonsInCategory } from '@/lib/curriculum/categories';
import { LessonList } from './LessonList';

export function generateStaticParams() {
  return CATEGORIES.filter((c) => c.stages.length > 0).map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const found = getCategory(category);
  const lessons = lessonsInCategory(category);
  if (!found || lessons.length === 0) notFound();

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 p-8">
      <header className="text-center mt-8 w-full max-w-md">
        <Link href="/lessons" className="block text-left text-sm text-neutral-500 mb-4">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">{found.title}</h1>
      </header>
      <LessonList lessons={lessons} />
    </main>
  );
}
