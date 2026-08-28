'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { pickRaceWords } from '@/lib/game/words';
import { playSfx, startBgm, stopBgm } from '@/lib/audio/sounds';
import { loadMuted, saveMuted } from '@/lib/audio/mutePreference';
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

  // 소리 설정 — 기본 켜짐. SSR 과 초기 HTML 을 맞추려 마운트 후 저장값을 읽는다.
  const [muted, setMuted] = useState(false);
  useEffect(() => setMuted(loadMuted()), []);
  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      saveMuted(next);
      return next;
    });
  }, []);

  // BGM — 첫 키 입력 시 시작, 완주·음소거·이탈 시 정지
  const isPlaying = session.startedAt !== null && !session.isComplete;
  useEffect(() => {
    if (muted || !isPlaying) {
      stopBgm();
      return;
    }
    startBgm();
    return () => stopBgm();
  }, [muted, isPlaying]);

  // 단어 완성 효과음 (마지막 단어는 완주음이 대신하므로 currentIndex 가 오르지 않는다)
  const prevIndexRef = useRef(session.currentIndex);
  useEffect(() => {
    if (session.currentIndex > prevIndexRef.current && !muted) playSfx('wordComplete');
    prevIndexRef.current = session.currentIndex;
  }, [session.currentIndex, muted]);

  // 완주 효과음
  useEffect(() => {
    if (session.isComplete && !muted) playSfx('finish');
  }, [session.isComplete, muted]);

  // 키 입력 캡처 — LessonPlayer 와 동일 (IME 회피)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // 폼 입력(닉네임/이메일 등)에 포커스가 있으면 게임 키 캡처를 하지 않는다
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
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
      <div className="flex items-center gap-3">
        <div className="text-3xl font-bold tabular-nums" data-testid="race-timer">
          {formatSeconds(elapsedMs)}s
        </div>
        <button
          type="button"
          onClick={toggleMuted}
          data-testid="sound-toggle"
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          aria-pressed={muted}
          className="rounded-lg border border-neutral-300 px-2 py-1 text-lg leading-none text-neutral-600 hover:bg-neutral-100"
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
      <RaceTrack progress={session.currentIndex + (session.isComplete ? 1 : 0)} total={words.length} />
      <TypingLine target={session.currentItem} typedJamoCount={session.typedJamoCount} />
      <JamoTrack
        item={session.currentItem}
        typedJamoCount={session.typedJamoCount}
        errorCount={session.errorCount}
      />
      <Keyboard
        nextCode={session.nextCode}
        nextShift={session.nextShift}
        onKeyPress={session.handleKey}
      />
      <NextKeyHint code={session.nextCode} shift={session.nextShift} />
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
