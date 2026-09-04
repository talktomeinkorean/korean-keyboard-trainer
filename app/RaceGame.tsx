'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { pickRaceWords } from '@/lib/game/words';
import { keysPerMinute } from '@/lib/game/rank';
import { playSfx, startBgm, pauseBgm, stopBgm } from '@/lib/audio/sounds';
import { loadMuted, saveMuted } from '@/lib/audio/mutePreference';
import { useLessonSession } from '@/lib/session/useLessonSession';
import { RaceScene } from '@/components/RaceScene';
import { Keyboard } from '@/components/Keyboard';
import { ResultScreen } from '@/components/game/ResultScreen';
import { StartPopup } from '@/components/StartPopup';
import { ExitPopup } from '@/components/game/ExitPopup';
import { GameTopBar } from '@/components/game/GameTopBar';
import { WordCard } from '@/components/game/WordCard';
import { KeyGuideToggle } from '@/components/game/KeyGuideToggle';
import type { RaceWord } from '@/lib/game/raceWord';

/** 한 판에 출제할 단어 수 (DB 미설정 시 폴백 풀에서 뽑는 개수) */
const RACE_WORD_COUNT = 10;

/** 단어 로드 (/api/race-words). 실패 시 내장 풀로 폴백 — 영어 뜻은 없다. */
async function loadWords(): Promise<RaceWord[]> {
  try {
    const res = await fetch('/api/race-words');
    if (res.ok) {
      const data = (await res.json()) as { words: RaceWord[] };
      if (Array.isArray(data.words) && data.words.length > 0) return data.words;
    }
  } catch {
    /* 폴백으로 진행 */
  }
  return pickRaceWords(RACE_WORD_COUNT).map((korean) => ({ korean, english: null }));
}

function RaceRound({ words, onRetry }: { words: RaceWord[]; onRetry: () => void }) {
  const session = useLessonSession({ items: words.map((w) => w.korean) });
  // Key Guide — 기본 켜짐
  const [keyGuide, setKeyGuide] = useState(true);
  const [nowMs, setNowMs] = useState<number | null>(null);
  // 시작 팝업을 닫아야 게임이 시작된다
  const [showStartPopup, setShowStartPopup] = useState(true);
  // 나가기 확인 팝업
  const [showExitPopup, setShowExitPopup] = useState(false);

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

  // BGM — 첫 키 입력 시 시작, 나가기 팝업 중에는 그 지점에서 멈췄다가 이어서, 완주·음소거 시 정지.
  // 정리(stopBgm)를 여기서 반환하지 않는 건, 팝업을 열 때 이 효과가 다시 실행되면서
  // 정리가 먼저 돌아 재생 위치를 0 으로 되돌려 버리기 때문이다.
  const isPlaying = session.startedAt !== null && !session.isComplete;
  useEffect(() => {
    if (muted || !isPlaying) stopBgm();
    else if (showExitPopup) pauseBgm();
    else startBgm();
  }, [muted, isPlaying, showExitPopup]);

  // 화면을 벗어날 때는 처음으로 되돌리며 끈다
  useEffect(() => () => stopBgm(), []);

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
      if (showStartPopup || showExitPopup) return; // 팝업이 떠 있는 동안은 게임 입력을 받지 않는다
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
  }, [session, showStartPopup, showExitPopup]);

  // 나가기 팝업이 떠 있는 동안 흐른 시간의 합 — 기록에서 빼야 시간이 멈춘 것처럼 보인다
  const [pausedMs, setPausedMs] = useState(0);
  const pauseStartedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (showExitPopup) {
      pauseStartedAtRef.current = Date.now();
      return;
    }
    const startedAt = pauseStartedAtRef.current;
    if (startedAt === null) return; // 첫 렌더 — 아직 멈춘 적이 없다
    pauseStartedAtRef.current = null;
    setPausedMs((ms) => ms + (Date.now() - startedAt));
  }, [showExitPopup]);

  // 경과 타이머 — 첫 키 입력부터 완주까지 100ms 간격 갱신 (팝업 중에는 멈춘다)
  useEffect(() => {
    if (session.startedAt === null || session.isComplete || showExitPopup) return;
    const t = setInterval(() => setNowMs(Date.now()), 100);
    return () => clearInterval(t);
  }, [session.startedAt, session.isComplete, showExitPopup]);

  const elapsedMs =
    session.startedAt === null
      ? 0
      : Math.max(
          0,
          (session.finishedAt ?? nowMs ?? session.startedAt) - session.startedAt - pausedMs,
        );

  return (
    <main className="flex min-h-screen flex-col items-center gap-4">
      {/* 시안: 상단 바와 단어 카드가 배경 씬 안에 겹쳐 들어간다 */}
      <RaceScene
        progress={session.currentIndex + (session.isComplete ? 1 : 0)}
        total={words.length}
        running={isPlaying}
      >
        <div className="absolute inset-x-0 top-[29.55px] flex justify-center">
          <GameTopBar
            elapsedMs={elapsedMs}
            muted={muted}
            onToggleMuted={toggleMuted}
            onExit={() => setShowExitPopup(true)}
          />
        </div>
        <div className="absolute inset-x-0 top-[104.3px] flex justify-center">
          <WordCard
            word={words[session.currentIndex] ?? words[words.length - 1]}
            typedJamoCount={session.typedJamoCount}
            index={Math.min(session.currentIndex + 1, words.length)}
            total={words.length}
            errorCount={session.errorCount}
          />
        </div>
      </RaceScene>

      <Keyboard
        nextCode={session.nextCode}
        nextShift={session.nextShift}
        keyGuide={keyGuide}
        onKeyPress={session.handleKey}
      />
      <KeyGuideToggle on={keyGuide} onToggle={() => setKeyGuide((v) => !v)} />

      {showStartPopup && <StartPopup onStart={() => setShowStartPopup(false)} />}

      {showExitPopup && (
        <ExitPopup
          onClose={() => setShowExitPopup(false)}
          onRestart={() => {
            setShowExitPopup(false);
            onRetry();
          }}
        />
      )}

      {session.isComplete && (
        <ResultScreen
          timeMs={elapsedMs}
          accuracy={session.accuracy}
          // 오타를 뺀 자모 수가 곧 타수다
          keysPerMin={keysPerMinute(session.keystrokes - session.errorCount, elapsedMs)}
          onRetry={onRetry}
        />
      )}
    </main>
  );
}

export function RaceGame() {
  const [words, setWords] = useState<RaceWord[] | null>(null);

  // 랜덤 선택은 hydration 불일치를 피해 클라이언트에서 실행
  useEffect(() => {
    void loadWords().then(setWords);
  }, []);

  if (!words) return <main className="min-h-screen" />;

  // words 배열을 key 로 사용 — Retry 시 세션 전체 리마운트
  return (
    <RaceRound
      key={words.map((w) => w.korean).join(',')}
      words={words}
      onRetry={() => void loadWords().then(setWords)}
    />
  );
}
