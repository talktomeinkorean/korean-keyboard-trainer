'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lesson } from '@/lib/curriculum/types';
import { LocalProgressStore } from '@/lib/progress/localStore';

const store = new LocalProgressStore();

// 시안 179:6625 의 목록 버튼 — 300x55, 연초록 채움에 진한 테두리
const ITEM =
  'relative flex h-[55px] w-[300px] max-w-full items-center justify-center rounded-[2px] ' +
  'border border-[#36454d] bg-[#e5ffe8] px-[30px] text-center font-dmsans text-[20px] ' +
  'font-bold text-[#36454d] transition hover:brightness-97 active:translate-y-px';

export function LessonList({ lessons }: { lessons: Lesson[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    void store.getCompletedLessonIds().then((ids) => setDone(new Set(ids)));
  }, []);

  return (
    <nav className="flex flex-col items-center gap-[15px]">
      {lessons.map((l) => (
        <Link key={l.id} href={`/lesson/${l.id}`} data-testid={`lesson-${l.id}`} className={ITEM}>
          <span className="truncate">{l.title}</span>
          {done.has(l.id) && (
            <span aria-label="completed" className="absolute right-[12px] text-[16px]">
              ✓
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
