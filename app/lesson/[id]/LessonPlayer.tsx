'use client';

import { useEffect, useRef, useState } from 'react';
import { Lesson } from '@/lib/curriculum/types';
import { useLessonSession } from '@/lib/session/useLessonSession';
import { Keyboard } from '@/components/Keyboard';
import { TypingLine } from '@/components/TypingLine';
import { PassageView } from '@/components/PassageView';
import { JamoTrack } from '@/components/JamoTrack';
import { StatsBar } from '@/components/StatsBar';
import { NextKeyHint } from '@/components/NextKeyHint';
import { ResultOverlay } from '@/components/ResultOverlay';
import { LocalProgressStore } from '@/lib/progress/localStore';

const store = new LocalProgressStore();

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const session = useLessonSession({ items: lesson.items });
  const savedRef = useRef(false);
  const isLongText = lesson.stage === 'long_text';

  // 긴 글 연습 실시간 통계 — 500ms tick 으로 경과시간·타수/분 갱신
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    if (!isLongText || session.startedAt === null || session.isComplete) return;
    const t = setInterval(() => setNowMs(Date.now()), 500);
    return () => clearInterval(t);
  }, [isLongText, session.startedAt, session.isComplete]);

  const elapsedMs =
    session.startedAt === null
      ? 0
      : (session.finishedAt ?? nowMs ?? session.startedAt) - session.startedAt;
  const liveWpm =
    session.isComplete || elapsedMs <= 0
      ? session.wpm
      : Math.round(session.keystrokes / (elapsedMs / 60000));

  // 키 입력 캡처 — event.code 사용, 기본 동작 차단(IME 회피)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (
        e.code.startsWith('Key') || e.code.startsWith('Digit') ||
        e.code === 'Space' || e.code === 'Comma' || e.code === 'Period' ||
        e.code === 'Quote' || e.code === 'Slash'
      ) {
        e.preventDefault();
        session.handleKey(e.code, e.shiftKey);
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
      <StatsBar
        wpm={isLongText ? liveWpm : session.wpm}
        accuracy={session.accuracy}
        index={session.currentIndex}
        total={lesson.items.length}
        elapsedSec={isLongText ? elapsedMs / 1000 : undefined}
      />
      {isLongText ? (
        <PassageView
          lines={lesson.items}
          currentIndex={session.currentIndex}
          typedJamoCount={session.typedJamoCount}
        />
      ) : (
        <TypingLine target={session.currentItem} typedJamoCount={session.typedJamoCount} />
      )}
      <JamoTrack
        item={session.currentItem}
        typedJamoCount={session.typedJamoCount}
        errorCount={session.errorCount}
      />
      <Keyboard
        nextCode={session.nextCode}
        nextShift={session.nextShift}
        layout={lesson.stage === 'sentence' || lesson.stage === 'long_text' ? 'extended' : 'basic'}
        onKeyPress={session.handleKey}
      />
      <NextKeyHint code={session.nextCode} shift={session.nextShift} />
      <p className="text-xs text-neutral-600">Left hand = consonants (orange) · Right hand = vowels (green)</p>
      {/* 터치 기기(둔한 포인터)에서만 안내 — 창 너비가 아니라 실제 입력 방식 기준 */}
      <p className="text-xs text-neutral-600 hidden [@media(pointer:coarse)]:block">Tap the keys to type</p>

      {session.isComplete && (
        <ResultOverlay
          wpm={session.wpm}
          accuracy={session.accuracy}
          onRetry={() => {
            savedRef.current = false;
            session.reset();
          }}
        />
      )}
    </main>
  );
}
