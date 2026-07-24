'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pickRaceWords } from '@/lib/game/words';
import { useLessonSession } from '@/lib/session/useLessonSession';
import { RaceTrack } from '@/components/RaceTrack';
import { TypingLine } from '@/components/TypingLine';
import { JamoTrack } from '@/components/JamoTrack';
import { Keyboard } from '@/components/Keyboard';
import { NextKeyHint } from '@/components/NextKeyHint';

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(1);
}

function RaceRound({ words, onRetry }: { words: string[]; onRetry: () => void }) {
  const session = useLessonSession({ items: words });
  const [nowMs, setNowMs] = useState<number | null>(null);

  // 키 입력 캡처 — LessonPlayer 와 동일 (IME 회피)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code.startsWith('Key') || e.code === 'Space') {
        e.preventDefault();
        session.handleKey(e.code);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [session]);

  // 경과 타이머 — 첫 키 입력부터 완주까지 100ms 간격 갱신
  useEffect(() => {
    if (session.startedAt === null || session.isComplete) return;
    const t = setInterval(() => setNowMs(Date.now()), 100);
    return () => clearInterval(t);
  }, [session.startedAt, session.isComplete]);

  const elapsedMs =
    session.startedAt === null
      ? 0
      : (session.finishedAt ?? nowMs ?? session.startedAt) - session.startedAt;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-lg text-neutral-400">Type 5 words to reach the finish line!</h1>
      <div className="text-3xl font-bold tabular-nums" data-testid="race-timer">
        {formatSeconds(elapsedMs)}s
      </div>
      <RaceTrack progress={session.currentIndex + (session.isComplete ? 1 : 0)} total={words.length} />
      <TypingLine target={session.currentItem} typedJamoCount={session.typedJamoCount} />
      <JamoTrack
        item={session.currentItem}
        typedJamoCount={session.typedJamoCount}
        errorCount={session.errorCount}
      />
      <Keyboard nextCode={session.nextCode} onKeyPress={session.handleKey} />
      <NextKeyHint code={session.nextCode} />
      <Link href="/lessons" className="text-sm text-neutral-500 underline">
        Skip to typing practice →
      </Link>

      {session.isComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-2xl p-8 w-80 text-center flex flex-col gap-4 text-white">
            <h2 className="text-2xl font-semibold">Finished! 🏁</h2>
            <div>
              <b className="block text-4xl text-blue-400 tabular-nums">
                {formatSeconds(elapsedMs)}s
              </b>
              <span className="text-sm text-neutral-400">
                accuracy {session.accuracy}%
              </span>
            </div>
            <div className="flex gap-2 justify-center mt-2">
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white"
              >
                Retry
              </button>
              <Link href="/lessons" className="px-4 py-2 rounded-lg bg-neutral-700 text-white">
                Start typing practice
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export function RaceGame() {
  const [words, setWords] = useState<string[] | null>(null);

  // pickRaceWords 는 Math.random 을 쓰므로 hydration 불일치를 피해 클라이언트에서 1회 실행
  useEffect(() => {
    setWords(pickRaceWords(5));
  }, []);

  if (!words) return <main className="min-h-screen" />;

  // words 배열을 key 로 사용 — Retry 시 세션 전체 리마운트
  return <RaceRound key={words.join(',')} words={words} onRetry={() => setWords(pickRaceWords(5))} />;
}
