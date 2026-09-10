'use client';

import { useEffect, useState } from 'react';
import basics from '@/lib/content/basics.json';
import { Lesson } from '@/lib/curriculum/types';
import { basicsSet, syllableSet } from '@/lib/curriculum/practiceSet';
import { LocalProgressStore } from '@/lib/progress/localStore';
import { LessonPlayer } from './LessonPlayer';

const store = new LocalProgressStore();

/** 스펙: 자음·모음은 아직 한 번도 끝내지 않았을 때만 순서대로 한 바퀴, 음절은 언제나 레벨별 무작위. */
function drawItems(lesson: Lesson, firstTime: boolean): string[] {
  if (lesson.stage === 'syllable') return syllableSet(basics.syllables);
  const pool = lesson.stage === 'consonant' ? basics.consonants : basics.vowels;
  return basicsSet(pool, firstTime);
}

/**
 * Basics 세 연습(Consonants·Vowels·Syllables) — 누르면 바로 시작한다.
 * 한 판을 마운트 후에 뽑는 이유는 RandomPractice 와 같다 (렌더 중 Math.random 금지, hydration).
 *
 * "처음" 판정은 완료 기록(htt.results)으로 한다 — 끝까지 한 번 해봐야 순서대로 도는 구간이 사라진다.
 * 중간에 나갔다 들어오면 다시 순서대로 돈다.
 */
export function BasicsPractice({ lesson }: { lesson: Lesson }) {
  const [set, setSet] = useState<Lesson | null>(null);

  useEffect(() => {
    let alive = true;
    void store.getBest(lesson.id).then((best) => {
      if (alive) setSet({ ...lesson, items: drawItems(lesson, best === null) });
    });
    return () => {
      alive = false;
    };
  }, [lesson]);

  if (!set) return <main className="min-h-screen" />;
  return <LessonPlayer lesson={set} />;
}
