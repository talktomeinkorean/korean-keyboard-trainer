'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/lib/curriculum/types';
import { useLessonSession } from '@/lib/session/useLessonSession';
import { Keyboard } from '@/components/Keyboard';
import { TypingLine } from '@/components/TypingLine';
import { StatsBar } from '@/components/StatsBar';
import { NextKeyHint } from '@/components/NextKeyHint';
import { ResultOverlay } from '@/components/ResultOverlay';
import { LocalProgressStore } from '@/lib/progress/localStore';

const store = new LocalProgressStore();

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const session = useLessonSession({ items: lesson.items });
  const savedRef = useRef(false);

  // 키 입력 캡처 — event.code 사용, 기본 동작 차단(IME 회피)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code.startsWith('Key')) {
        e.preventDefault();
        session.handleKey(e.code);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [session]);

  // 완료 시 1회 저장
  useEffect(() => {
    if (session.isComplete && !savedRef.current) {
      savedRef.current = true;
      void store.saveResult({
        lessonId: lesson.id,
        wpm: session.wpm,
        accuracy: session.accuracy,
        completedAt: Date.now(),
      });
    }
  }, [session.isComplete, session.wpm, session.accuracy, lesson.id]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-lg text-neutral-400">{lesson.title}</h1>
      <StatsBar wpm={session.wpm} accuracy={session.accuracy} index={session.currentIndex} total={lesson.items.length} />
      <TypingLine target={session.currentItem} typed={session.typed} />
      <Keyboard nextCode={session.nextCode} onKeyPress={session.handleKey} />
      <NextKeyHint code={session.nextCode} />
      <p className="text-xs text-neutral-600">왼손=자음(주황) · 오른손=모음(초록)</p>
      <p className="text-xs text-neutral-600 sm:hidden">모바일에서는 키를 직접 탭하세요</p>

      {session.isComplete && (
        <ResultOverlay
          wpm={session.wpm}
          accuracy={session.accuracy}
          onRetry={() => router.refresh()}
        />
      )}
    </main>
  );
}
