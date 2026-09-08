'use client';

import { useEffect, useRef, useState } from 'react';
import { Lesson } from '@/lib/curriculum/types';
import { useLessonSession } from '@/lib/session/useLessonSession';
import { Keyboard } from '@/components/Keyboard';
import { JamoTrack } from '@/components/JamoTrack';
import { PracticeNav } from '@/components/lessons/PracticeNav';
import { PracticeProgress } from '@/components/lessons/PracticeProgress';
import { PracticeCard } from '@/components/lessons/PracticeCard';
import { KeyGuideToggle } from '@/components/game/KeyGuideToggle';
import { SourceBadge } from '@/components/lessons/SourceBadge';
import { TypingInput } from '@/components/lessons/TypingInput';
import { splitByJamoProgress } from '@/lib/hangul/jamoGroups';
import { PracticeResult } from '@/components/PracticeResult';
import { PracticeBackground } from '@/components/PracticeBackground';
import { LocalProgressStore } from '@/lib/progress/localStore';
import { categoryForStage } from '@/lib/curriculum/categories';
import { keysPerMinute } from '@/lib/game/rank';

const store = new LocalProgressStore();

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const session = useLessonSession({ items: lesson.items });
  const savedRef = useRef(false);
  const isLongText = lesson.stage === 'long_text';
  // 문장/긴글: 확장 키보드 사용 + 자모 칩 숨김 (칩은 자모~단어 단계용 초급 가이드)
  const isExtendedStage = lesson.stage === 'sentence' || isLongText;
  const isBasics = !isExtendedStage && lesson.stage !== 'word';
  const [keyGuide, setKeyGuide] = useState(true);
  // 시안은 지금 치는 항목의 영어 뜻과 출처를 함께 보여준다
  const gloss = lesson.glosses?.[session.currentIndex] ?? null;
  const source = lesson.sources?.[session.currentIndex] ?? null;
  const nextLine = lesson.items[session.currentIndex + 1] ?? null;
  const category = categoryForStage(lesson.stage);
  const categorySlug = category?.slug ?? 'consonants-vowels';
  // Basics 는 레슨 이름(Consonants…), 나머지는 카테고리 이름이 제목이다
  const navTitle = isBasics ? lesson.title : (category?.title ?? lesson.title);

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

  const result = session.isComplete && (
    <PracticeResult
      category={categoryForStage(lesson.stage)?.title ?? ''}
      title={lesson.title}
      timeMs={elapsedMs}
      // 레이스와 같은 기준 — 오타를 뺀 자모 수를 분당으로 환산한다
      keysPerMin={keysPerMinute(session.keystrokes - session.errorCount, elapsedMs)}
      onRetry={() => {
        savedRef.current = false;
        session.reset();
      }}
    />
  );

  const backHref = `/lessons/${categorySlug}`;
  const isWord = lesson.stage === 'word';
  const { done, current, todo } = splitByJamoProgress(session.currentItem, session.typedJamoCount);

  return (
    // 배경이 밝아서 글자색을 고정한다 — 다크 모드에서 body 색을 물려받으면 안 보인다
    <main className="flex min-h-screen flex-col items-center text-[#36454d]">
      <PracticeBackground />
      {/* 긴 글은 지문 제목이 곧 화면 제목이다 (시안 519:15870) */}
      <PracticeNav title={isExtendedStage && isLongText ? lesson.title : navTitle} backHref={backHref} />

      <PracticeProgress
        done={session.currentIndex}
        total={lesson.items.length}
        running={session.startedAt !== null && !session.isComplete}
      />

      {isExtendedStage ? (
        <>
          {/* 문장·긴글: 칠 문장 위, 친 내용 아래 (시안 519:15861) */}
          <PracticeCard className="mt-[19px] min-h-[160px] items-start justify-start p-[15px]">
            <TypingInput target={session.currentItem} typed={session.typed} />
          </PracticeCard>
          {gloss && (
            <p
              data-testid="practice-gloss"
              className="mt-[10px] w-[330px] max-w-full px-[5px] font-dmsans text-[14px] font-bold leading-[1.3] text-[#597280]"
            >
              {gloss}
            </p>
          )}
        </>
      ) : (
        <PracticeCard className="mt-[19px] h-[200px] gap-[20px]">
          {isWord ? (
            <div className="flex w-full flex-col items-center text-center">
              <p className="text-[50px] tracking-[5px]">
                {done}
                {current}
                <span className="text-[#36454d]/50">{todo}</span>
              </p>
              {gloss && (
                <p
                  data-testid="practice-gloss"
                  className="font-dmsans text-[20px] font-bold leading-[1.8] text-[#7d9fb2]"
                >
                  {gloss}
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-[50px] tracking-[5px]">{session.currentItem}</p>
          )}
          {(isWord || lesson.stage === 'syllable') && (
            <JamoTrack
              item={session.currentItem}
              typedJamoCount={session.typedJamoCount}
              errorCount={session.errorCount}
            />
          )}
        </PracticeCard>
      )}

      {/* 시안: 카드 아래 여백을 두고 키보드가 463 에서 시작한다 */}
      <div
        className={`flex w-full flex-col items-center gap-[15px] pb-[30px] ${
          isExtendedStage ? 'mt-auto' : 'mt-[121px]'
        }`}
      >
        {/* 긴 글은 다음 줄을 미리 보여준다 (시안 413:9472) */}
        {isLongText && nextLine && (
          <p
            data-testid="next-line"
            className="w-[330px] max-w-full truncate rounded-[2px] bg-[#36454d]/8 px-[15px] py-[12px] text-[14px] text-[#36454d]/45"
          >
            {nextLine}
          </p>
        )}
        {source && <SourceBadge source={source} />}
        <Keyboard
          nextCode={session.nextCode}
          nextShift={session.nextShift}
          layout={isExtendedStage ? 'extended' : 'basic'}
          keyGuide={keyGuide}
          onKeyPress={session.handleKey}
        />
        <KeyGuideToggle on={keyGuide} onToggle={() => setKeyGuide((v) => !v)} />
      </div>

      {result}
    </main>
  );
}
