'use client';

import { useEffect, useState } from 'react';
import { Lesson } from '@/lib/curriculum/types';
import { sampleItems } from '@/lib/curriculum/practiceSet';
import { LessonPlayer } from '@/app/lesson/[id]/LessonPlayer';

interface Props {
  /** 카테고리의 항목 전체 (getContentPool) */
  pool: Lesson;
  /** 한 판에 뽑을 개수 */
  size: number;
  /** 결과 화면에 뜨는 이름 — "30 Random Words" */
  title: string;
  /** 연습 기록을 남길 id */
  id: string;
}

/** 풀에서 size 개를 뽑아 한 판을 만든다. 영어 뜻·출처도 함께 따라온다. */
function drawSet({ pool, size, title, id }: Props): Lesson {
  const picks = sampleItems(
    pool.items.map((_, i) => i),
    size,
  );
  return {
    id,
    stage: pool.stage,
    title,
    items: picks.map((i) => pool.items[i]),
    glosses: picks.map((i) => pool.glosses?.[i] ?? null),
    sources: picks.map((i) => pool.sources?.[i] ?? null),
  };
}

/**
 * 목록 없이 바로 연습으로 들어가는 카테고리(Vocabulary, Sentences)용.
 * 들어올 때마다 세트를 새로 뽑는다.
 *
 * 선택을 효과에서 하는 이유가 두 가지다.
 * - 렌더 중에 Math.random 을 부르면 순수하지 않다 (재렌더마다 세트가 바뀐다).
 * - 서버와 클라이언트가 각자 뽑으면 hydration 이 어긋난다.
 * 레이스 화면(app/RaceGame.tsx)도 같은 이유로 같은 방식을 쓴다.
 */
export function RandomPractice(props: Props) {
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 후 한 번만 뽑는다. 렌더 중에는 뽑을 수 없다.
    setLesson(drawSet(props));
    // props 는 서버에서 내려온 고정값이라 한 번만 뽑으면 된다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  if (!lesson) return <main className="min-h-screen" />;
  return <LessonPlayer lesson={lesson} />;
}
