'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lesson } from '@/lib/curriculum/types';
import { LocalProgressStore } from '@/lib/progress/localStore';

const store = new LocalProgressStore();

export function LessonList({ lessons }: { lessons: Lesson[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    void store.getCompletedLessonIds().then((ids) => setDone(new Set(ids)));
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      {lessons.map((l) => (
        <Link
          key={l.id}
          href={`/lesson/${l.id}`}
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-100"
        >
          <span>{l.title}</span>
          {done.has(l.id) && <span className="text-emerald-500">✓</span>}
        </Link>
      ))}
    </div>
  );
}
