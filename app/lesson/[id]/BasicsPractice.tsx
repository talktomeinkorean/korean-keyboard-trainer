'use client';

import { useEffect, useState } from 'react';
import basics from '@/lib/content/basics.json';
import { Lesson } from '@/lib/curriculum/types';
import { basicsSet, syllableSet } from '@/lib/curriculum/practiceSet';
import { visitOnce } from '@/lib/progress/visits';
import { LessonPlayer } from './LessonPlayer';

/** 스펙: 자음·모음은 첫 방문에만 순서대로 한 바퀴, 음절은 언제나 레벨별 무작위. */
function drawItems(lesson: Lesson): string[] {
  if (lesson.stage === 'syllable') return syllableSet(basics.syllables);
  const pool = lesson.stage === 'consonant' ? basics.consonants : basics.vowels;
  return basicsSet(pool, !visitOnce(lesson.id));
}

/**
 * Basics 세 연습(Consonants·Vowels·Syllables) — 누르면 바로 시작한다.
 * 한 판을 마운트 후에 뽑는 이유는 RandomPractice 와 같다 (렌더 중 Math.random 금지, hydration).
 */
export function BasicsPractice({ lesson }: { lesson: Lesson }) {
  const [set, setSet] = useState<Lesson | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 후 한 번만 뽑는다. 렌더 중에는 뽑을 수 없다.
    setSet({ ...lesson, items: drawItems(lesson) });
  }, [lesson]);

  if (!set) return <main className="min-h-screen" />;
  return <LessonPlayer lesson={set} />;
}
