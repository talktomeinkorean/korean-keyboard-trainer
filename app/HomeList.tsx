'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LESSONS } from '@/lib/curriculum/lessons';
import { LocalProgressStore } from '@/lib/progress/localStore';

const store = new LocalProgressStore();
const STAGE_LABEL: Record<string, string> = {
  consonant: 'Basic Consonants', vowel: 'Basic Vowels', syllable: 'Syllables', word: 'Words', sentence: 'Short Sentences',
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
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-100"
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
