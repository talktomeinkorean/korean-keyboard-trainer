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
import { RaceResultCard } from '@/components/RaceResultCard';

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(1);
}

/** DB 단어 풀(/api/race-words)에서 5개 로드. 미설정/오류 시 내장 풀로 폴백. */
async function loadWords(): Promise<string[]> {
  try {
    const res = await fetch('/api/race-words');
    if (res.ok) {
      const data = (await res.json()) as { words: string[] };
      if (Array.isArray(data.words) && data.words.length > 0) return data.words;
    }
  } catch {
    /* 폴백으로 진행 */
  }
  return pickRaceWords(5);
}

function RaceRound({ words, onRetry }: { words: string[]; onRetry: () => void }) {
  const session = useLessonSession({ items: words });
  const [nowMs, setNowMs] = useState<number | null>(null);

  // 키 입력 캡처 — LessonPlayer 와 동일 (IME 회피)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // 폼 입력(닉네임/이메일 등)에 포커스가 있으면 게임 키 캡처를 하지 않는다
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (e.code.startsWith('Key') || e.code === 'Space' || e.code === 'Comma' || e.code === 'Period') {
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
        <RaceResultCard timeMs={elapsedMs} accuracy={session.accuracy} onRetry={onRetry} />
      )}
    </main>
  );
}

export function RaceGame() {
  const [words, setWords] = useState<string[] | null>(null);

  // 랜덤 선택은 hydration 불일치를 피해 클라이언트에서 실행
  useEffect(() => {
    void loadWords().then(setWords);
  }, []);

  if (!words) return <main className="min-h-screen" />;

  // words 배열을 key 로 사용 — Retry 시 세션 전체 리마운트
  return (
    <RaceRound
      key={words.join(',')}
      words={words}
      onRetry={() => void loadWords().then(setWords)}
    />
  );
}
