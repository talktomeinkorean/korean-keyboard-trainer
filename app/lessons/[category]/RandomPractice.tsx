'use client';

import { useEffect, useState } from 'react';
import { Lesson } from '@/lib/curriculum/types';
import { LessonPlayer } from '@/app/lesson/[id]/LessonPlayer';

/**
 * 목록 없이 바로 연습으로 들어가는 카테고리(Vocabulary, Sentences)용.
 * 들어올 때마다 세트를 무작위로 고른다.
 *
 * 선택을 효과에서 하는 이유가 두 가지다.
 * - 렌더 중에 Math.random 을 부르면 순수하지 않다 (재렌더마다 세트가 바뀐다).
 * - 서버와 클라이언트가 각자 뽑으면 hydration 이 어긋난다.
 * 레이스 화면(app/RaceGame.tsx)도 같은 이유로 같은 방식을 쓴다.
 */
export function RandomPractice({ lessons }: { lessons: Lesson[] }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 후 한 번만 고른다. 렌더 중에는 뽑을 수 없다.
    setLesson(lessons[Math.floor(Math.random() * lessons.length)] ?? null);
  }, [lessons]);

  if (!lesson) return <main className="min-h-screen" />;
  return <LessonPlayer lesson={lesson} />;
}
