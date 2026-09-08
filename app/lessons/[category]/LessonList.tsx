'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lesson } from '@/lib/curriculum/types';
import { LocalProgressStore } from '@/lib/progress/localStore';

const store = new LocalProgressStore();

// 시안 179:6625 의 목록 버튼 — 300x55, 진한 테두리.
// 아직 안 한 글은 연초록, 끝낸 글은 회색으로 채운다 (시안 250:4244).
const ITEM =
  'flex h-[55px] w-[300px] max-w-full items-center justify-center rounded-[2px] ' +
  'border border-[#36454d] px-[30px] text-center font-dmsans text-[20px] ' +
  'font-bold text-[#36454d] transition hover:brightness-97 active:translate-y-px';

interface Props {
  lessons: Lesson[];
  /** 끝낸 항목을 회색으로 칠할지 (Basics 는 완료 여부를 따지지 않는다) */
  showCompletion?: boolean;
}

export function LessonList({ lessons, showCompletion = false }: Props) {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!showCompletion) return;
    void store.getCompletedLessonIds().then((ids) => setDone(new Set(ids)));
  }, [showCompletion]);

  return (
    <nav className="flex flex-col items-center gap-[15px]">
      {lessons.map((l) => (
        <Link
          key={l.id}
          href={`/lesson/${l.id}`}
          data-testid={`lesson-${l.id}`}
          data-done={done.has(l.id)}
          className={`${ITEM} ${done.has(l.id) ? 'bg-[#e6e6e6]' : 'bg-[#e5ffe8]'}`}
        >
          <span className="truncate">{l.title}</span>
        </Link>
      ))}
    </nav>
  );
}
