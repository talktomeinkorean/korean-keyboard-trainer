'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { pickRaceWords } from '@/lib/game/words';
import { pickRaceBackground, type RaceBackground } from '@/lib/game/backgrounds';
import { keysPerMinute } from '@/lib/game/rank';
import { playSfx, startBgm, pauseBgm, stopBgm } from '@/lib/audio/sounds';
import { loadMuted, saveMuted } from '@/lib/audio/mutePreference';
import { loadKeyGuide, saveKeyGuide } from '@/lib/game/keyGuidePreference';
import { useLessonSession } from '@/lib/session/useLessonSession';
import { LocalProgressStore } from '@/lib/progress/localStore';
import { RaceScene } from '@/components/RaceScene';
import { Keyboard } from '@/components/Keyboard';
import { ResultScreen } from '@/components/game/ResultScreen';
import { StartPopup } from '@/components/StartPopup';
import { Coachmark } from '@/components/game/Coachmark';
import { hasSeenCoachmark, markCoachmarkSeen } from '@/lib/game/coachmarkSeen';
import { ExitPopup } from '@/components/game/ExitPopup';
import { GameTopBar } from '@/components/game/GameTopBar';
import { WordCard } from '@/components/game/WordCard';
import { KeyGuideToggle } from '@/components/game/KeyGuideToggle';
import type { RaceWord } from '@/lib/game/raceWord';

/** 게임 화면 흰 바탕 — 컬럼(393px) 밖까지 화면 폭으로, 내용 뒤에 깐다 */
const RACE_BACKDROP =
  'pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-white';

/** 한 판에 출제할 단어 수 (DB 미설정 시 폴백 풀에서 뽑는 개수) */
const RACE_WORD_COUNT = 10;

// 완주 집계에 실어 보낼 익명 ID 를 꺼내오는 용도 (연습 진행률과 같은 값을 쓴다)
const progressStore = new LocalProgressStore();

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

function RaceRound({
  words,
  background,
  onRetry,
}: {
  words: RaceWord[];
  background: RaceBackground;
  onRetry: () => void;
}) {
  const session = useLessonSession({ items: words.map((w) => w.korean) });
  // Key Guide — 기본 켜짐. 소리 설정과 같이 저장해 두고 다음 판에도 이어 쓴다.
  const [keyGuide, setKeyGuide] = useState(true);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR 과 초기 HTML 을 맞추려 마운트 후에 읽는다 (muted 와 같은 방식)
  useEffect(() => setKeyGuide(loadKeyGuide()), []);
  const toggleKeyGuide = useCallback(() => {
    setKeyGuide((prev) => {
      saveKeyGuide(!prev);
      return !prev;
    });
  }, []);
  const [nowMs, setNowMs] = useState<number | null>(null);
  // 시작 팝업을 닫아야 게임이 시작된다
  const [showStartPopup, setShowStartPopup] = useState(true);
  // 나가기 확인 팝업
  const [showExitPopup, setShowExitPopup] = useState(false);
  // 조작 안내 — 시작 팝업을 닫은 뒤 처음 한 번만 뜬다
  const [showCoachmark, setShowCoachmark] = useState(false);

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

  // 완주 수 익명 집계 — 결과 화면이 뜨는 시점에 한 행 쌓는다.
  // 한 판에 한 번만 보낸다 (다시하기는 RaceRound 를 리마운트하므로 ref 가 초기화된다).
  const countedRef = useRef(false);
  useEffect(() => {
    if (!session.isComplete || countedRef.current) return;
    countedRef.current = true;
    // 집계 실패가 게임 흐름을 막으면 안 되므로 조용히 넘긴다.
    void (async () => {
      // 브라우저별 익명 난수. 같은 사람이 여러 판을 해도 한 명으로 세기 위한 값이다.
      const sessionId = await progressStore.getUserId();
      // keepalive: 결과 화면에서 바로 다른 페이지로 넘어가도 요청이 취소되지 않게 한다.
      await fetch('/api/finishes', {
        method: 'POST',
        keepalive: true,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    })().catch(() => {});
  }, [session.isComplete]);

  // 키 입력 캡처 — LessonPlayer 와 동일 (IME 회피)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (showStartPopup || showExitPopup || showCoachmark) return; // 팝업·안내가 떠 있는 동안은 게임 입력을 받지 않는다
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
  }, [session, showStartPopup, showExitPopup, showCoachmark]);

  // 나가기 팝업이 떠 있는 동안 흐른 시간의 합 — 기록에서 빼야 시간이 멈춘 것처럼 보인다
  const [pausedMs, setPausedMs] = useState(0);
  const pauseStartedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (showExitPopup) {
      // 아직 첫 키를 누르기 전이면 뺄 시간이 없다 — 재면 시작하자마자 그만큼 0 에 붙어 있게 된다
      pauseStartedAtRef.current = session.startedAt === null ? null : Date.now();
      return;
    }
    const startedAt = pauseStartedAtRef.current;
    if (startedAt === null) return; // 첫 렌더이거나, 시작 전에 열었다 닫은 경우
    pauseStartedAtRef.current = null;
    const now = Date.now();
    // 멈춘 시간을 더하면서 '지금'도 같이 앞당긴다. 옛 nowMs 에서 늘어난 pausedMs 를 빼면
    // 다음 tick(100ms) 이 올 때까지 시계가 멈춘 만큼 뒤로 감겼다가 튀어오른다.
    setPausedMs((ms) => ms + (now - startedAt));
    setNowMs(now);
  }, [showExitPopup, session.startedAt]);

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
    <main className="relative flex min-h-screen flex-col items-center gap-4">
      {/* 키보드 좌우·아래 여백은 다크 모드에서도 흰색이다. 페이지 기본 배경(--background)이
          다크 모드에서 검게 바뀌므로, 컬럼 밖까지 화면 폭으로 흰 바탕을 깐다.
          위쪽은 RaceScene 이 배경 이미지로 덮는다. */}
      <div aria-hidden className={RACE_BACKDROP} />
      {/* 시안: 상단 바와 단어 카드가 배경 씬 안에 겹쳐 들어간다 */}
      <RaceScene
        backgroundSrc={background.src}
        progress={session.currentIndex + (session.isComplete ? 1 : 0)}
        total={words.length}
        running={isPlaying}
        errorCount={session.errorCount}
      >
        {/* 시안 320:22623 — 내비게이션 바 위 여백 24px (원이 50→40 으로 줄며 함께 올라갔다) */}
        <div className="absolute inset-x-0 top-[24px] flex justify-center">
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

      {/* 코치마크가 이 덩어리에 구멍을 뚫는다 — main 의 gap-4 를 그대로 물려받아 간격은 그대로다 */}
      <div data-testid="race-keyboard-block" className="flex flex-col items-center gap-4">
        <Keyboard
          nextCode={session.nextCode}
          nextShift={session.nextShift}
          keyGuide={keyGuide}
          onKeyPress={session.handleKey}
        />
        <KeyGuideToggle on={keyGuide} onToggle={toggleKeyGuide} />
      </div>

      {showStartPopup && (
        <StartPopup
          onStart={() => {
            setShowStartPopup(false);
            // 저장값은 이 시점에 읽는다 — 서버 렌더와 초기 HTML 을 맞추기 위해서다
            if (!hasSeenCoachmark()) setShowCoachmark(true);
          }}
        />
      )}

      {showCoachmark && (
        <Coachmark
          onClose={() => {
            markCoachmarkSeen();
            setShowCoachmark(false);
          }}
        />
      )}

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
          backgroundId={background.id}
          onRetry={onRetry}
        />
      )}
    </main>
  );
}

export function RaceGame() {
  // 한 판 = 단어 묶음 + 배경. Try Again 도 새 판이라 둘 다 새로 뽑는다.
  const [round, setRound] = useState<{ words: RaceWord[]; background: RaceBackground } | null>(null);

  // 랜덤 선택은 hydration 불일치를 피해 클라이언트에서 실행
  const startRound = useCallback(() => {
    void loadWords().then((words) => setRound({ words, background: pickRaceBackground() }));
  }, []);
  useEffect(() => {
    startRound();
  }, [startRound]);

  // 단어를 불러오는 동안에도 다크 모드에서 검은 화면이 번쩍이지 않게 같은 흰 바탕을 깐다
  if (!round) {
    return (
      <main className="relative min-h-screen">
        <div aria-hidden className={RACE_BACKDROP} />
      </main>
    );
  }

  // 단어·배경을 key 로 사용 — Retry 시 세션 전체 리마운트
  return (
    <RaceRound
      key={`${round.background.id}:${round.words.map((w) => w.korean).join(',')}`}
      words={round.words}
      background={round.background}
      onRetry={startRound}
    />
  );
}
