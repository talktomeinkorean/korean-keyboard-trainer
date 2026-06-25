'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LESSONS } from '@/lib/curriculum/lessons';
import { LocalProgressStore } from '@/lib/progress/localStore';

const store = new LocalProgressStore();
const STAGE_LABEL: Record<string, string> = {
  consonant: '기초 자음', vowel: '기초 모음', syllable: '자모 조합', word: '단어', sentence: '짧은 문장',
};

export function HomeList() {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    void store.getCompletedLessonIds().then((ids) => setDone(new Set(ids)));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      {Object.entries(STAGE_LABEL).map(([stage, label]) => (
        <section key={stage} className="flex flex-col gap-2">
          <h2 className="text-sm uppercase tracking-wide text-neutral-500">{label}</h2>
          {LESSONS.filter((l) => l.stage === stage).map((l) => (
            <Link
              key={l.id}
              href={`/lesson/${l.id}`}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700"
            >
              <span>{l.title}</span>
              {done.has(l.id) && <span className="text-emerald-500">✓</span>}
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}
