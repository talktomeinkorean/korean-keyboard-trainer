import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, getCategory, lessonsInCategory } from '@/lib/curriculum/categories';
import { getContentLessons } from '@/lib/content/catalog';
import { LessonList } from './LessonList';

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
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

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 p-8">
      <header className="text-center mt-8 w-full max-w-md">
        <Link href="/lessons" className="block text-left text-sm text-neutral-500 mb-4">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">{found.title}</h1>
      </header>
      {lessons === null || lessons.length === 0 ? (
        <p className="text-neutral-400">Coming soon</p>
      ) : (
        <LessonList lessons={lessons} />
      )}
    </main>
  );
}
