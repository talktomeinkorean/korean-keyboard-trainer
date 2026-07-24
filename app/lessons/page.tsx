import Link from 'next/link';
import { CATEGORIES } from '@/lib/curriculum/categories';

export default function LessonsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center gap-6 p-8">
      <div className="flex flex-col gap-6 w-full max-w-md">
        {/* 상단 배너 슬롯 — 이벤트 배너(예: 한글날 이벤트) 자리. 현재는 비워둠. */}
        <div data-testid="banner-slot" aria-hidden className="h-32" />

        {CATEGORIES.map((category) =>
          category.stages.length > 0 ? (
            <Link
              key={category.slug}
              href={`/lessons/${category.slug}`}
              className="flex items-center justify-center h-24 rounded-xl bg-neutral-100 text-neutral-900 border border-neutral-200 font-semibold hover:bg-neutral-200 transition"
            >
              {category.title}
            </Link>
          ) : (
            <div
              key={category.slug}
              className="flex items-center justify-center h-24 rounded-xl bg-neutral-100 text-neutral-400 border border-neutral-200 font-semibold cursor-not-allowed"
            >
              {category.title} · Coming soon
            </div>
          ),
        )}
      </div>
    </main>
  );
}
