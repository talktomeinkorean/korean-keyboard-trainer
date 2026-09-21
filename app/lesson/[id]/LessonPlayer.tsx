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
import { StoriesAppLink } from '@/components/lessons/StoriesAppLink';
import { TypingInput } from '@/components/lessons/TypingInput';
import { splitByJamoProgress } from '@/lib/hangul/jamoGroups';
import { PracticeResult } from '@/components/PracticeResult';
import { PracticeBackground } from '@/components/PracticeBackground';
import { LocalProgressStore } from '@/lib/progress/localStore';
import { categoryForStage } from '@/lib/curriculum/categories';
import { keysPerMinute } from '@/lib/game/rank';
import { loadKeyGuide, saveKeyGuide } from '@/lib/game/keyGuidePreference';

const store = new LocalProgressStore();

interface PlayerProps {
  lesson: Lesson;
  /** Try Again 을 누르면 호출 — 무작위 세트인 연습은 여기서 새로 뽑는다 */
  onRedraw?: () => void;
}

export function LessonPlayer({ lesson, onRedraw }: PlayerProps) {
  const session = useLessonSession({ items: lesson.items });
  const savedRef = useRef(false);
  const isLongText = lesson.stage === 'long_text';
  // 문장/긴글: 확장 키보드 사용 + 자모 칩 숨김 (칩은 자모~단어 단계용 초급 가이드)
  const isExtendedStage = lesson.stage === 'sentence' || isLongText;
  const isBasics = !isExtendedStage && lesson.stage !== 'word';
  const [keyGuide, setKeyGuide] = useState(true);
  // 레이스와 같은 저장값을 쓴다 — 껐으면 다음 연습에도 꺼진 채로 시작한다
  // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR 과 초기 HTML 을 맞추려 마운트 후에 읽는다 (muted 와 같은 방식)
  useEffect(() => setKeyGuide(loadKeyGuide()), []);
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
        e.code === 'Semicolon' || e.code === 'Quote' || e.code === 'Slash'
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

  // Vocabulary·Sentences 는 카테고리 주소가 곧 새 연습이라 뒤로가기가
  // "다른 단어로 이동"처럼 보인다. 목록이 있는 카테고리만 그리로 보낸다.
  const backHref = category?.randomSet ? '/lessons' : `/lessons/${categorySlug}`;

  const result = session.isComplete && (
    <PracticeResult
      stage={lesson.stage}
      title={lesson.title}
      timeMs={elapsedMs}
      // 레이스와 같은 기준 — 오타를 뺀 자모 수를 분당으로 환산한다
      keysPerMin={keysPerMinute(session.keystrokes - session.errorCount, elapsedMs)}
      // 끝내고 돌아갈 곳도 헤더 뒤로가기와 같다 — 긴 글은 지문 목록, Basics 는 Basics 목록
      backHref={backHref}
      onRetry={() => {
        savedRef.current = false;
        // 무작위 세트는 부모가 다시 뽑아 새 판으로 갈아 끼운다 (그때 이 화면이 새로 뜬다)
        if (onRedraw) onRedraw();
        else session.reset();
      }}
    />
  );

  const isWord = lesson.stage === 'word';
  const { done, current, todo } = splitByJamoProgress(session.currentItem, session.typedJamoCount);

  return (
    // 배경이 밝아서 글자색을 고정한다 — 다크 모드에서 body 색을 물려받으면 안 보인다
    <main className="flex min-h-screen flex-col items-center text-[#36454d]">
      <PracticeBackground />
      {/* 긴 글은 지문 제목이 곧 화면 제목이다 (시안 519:15870) */}
      <PracticeNav
        title={isExtendedStage && isLongText ? lesson.title : navTitle}
        backHref={backHref}
        // 긴 글은 연습 화면에 출처 배지를 두지 않고 헤더에 Stories 앱 아이콘을 둔다 (시안 413:9472)
        right={isLongText ? <StoriesAppLink /> : undefined}
      />

      <PracticeProgress
        done={session.currentIndex}
        total={lesson.items.length}
        running={session.startedAt !== null && !session.isComplete}
      />

      {/* 진행 바(123) 아래 325px 를 이 덩어리가 차지해 키보드가 늘 463 에서 시작한다.
          문장이 길어지면 늘어나면서 아래를 밀어낸다. */}
      <div className="flex min-h-[325px] w-full flex-col items-center">
      {isExtendedStage ? (
        <>
          {/* 문장·긴글: 칠 문장 위, 친 내용 아래 (시안 519:15861) */}
          <PracticeCard className="mt-[19px] min-h-[152px] items-start justify-start p-[15px]">
            <TypingInput target={session.currentItem} typed={session.typed} />
          </PracticeCard>
          {gloss && (
            <p
              data-testid="practice-gloss"
              className="mt-[10px] w-[330px] max-w-full px-[5px] font-dmsans text-[14px] font-bold leading-[1.4] text-[#597280]"
            >
              {gloss}
            </p>
          )}
        </>
      ) : (
        <PracticeCard className="mt-[19px] h-[200px] gap-[20px]">
          {isWord ? (
            <div className="flex w-full flex-col items-center text-center">
              {/* 시안 415:10849 — Pretendard Bold 50 */}
              <p className="font-pretendard text-[50px] font-bold tracking-[5px] text-[#36454d]">
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
            <p className="text-center font-pretendard text-[50px] font-bold tracking-[5px] text-[#36454d]">
              {session.currentItem}
            </p>
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

        {/* 다음 줄 미리보기와 출처 배지는 키보드 바로 위에 붙는다 */}
        <div className="mt-auto flex w-full flex-col items-center gap-[15px]">
          {isLongText && nextLine && (
            // 시안 487:11867 — 회색 상자 전체를 50% 로 흐리게 해 아직 칠 차례가 아님을 보인다.
            // Figma 는 테두리를 안쪽에 그려 40 높이다 — CSS 테두리는 바깥이라 위아래 여백을 1px 씩 줄였다
            <p
              data-testid="next-line"
              className="w-[330px] max-w-full break-words rounded-[2px] border border-[#36454d] bg-[#e6e6e6] px-[20px] py-[9px] font-pretendard text-[14px] font-bold leading-[1.4] text-[#36454d] opacity-50"
            >
              {nextLine}
            </p>
          )}
          {/* 긴 글의 출처는 지문 목록 화면에 한 번만 보인다 (시안 250:4244) */}
          {source && !isLongText && <SourceBadge source={source} />}
        </div>
      </div>

      <div className="mt-[15px] flex w-full flex-col items-center gap-[15px] pb-[30px]">
        <Keyboard
          nextCode={session.nextCode}
          nextShift={session.nextShift}
          layout={isExtendedStage ? 'extended' : 'basic'}
          keyGuide={!isExtendedStage && keyGuide}
          onKeyPress={session.handleKey}
        />
        {/* 문장·긴글에는 Key Guide 가 없다 (시안 1171:9029). 글자를 보고 치는 단계라
            다음 키를 짚어 주지 않는다 — 토글을 감추는 데 그치지 않고 강조도 끈다. */}
        {!isExtendedStage && (
          <KeyGuideToggle
            on={keyGuide}
            onToggle={() => setKeyGuide((v) => {
              saveKeyGuide(!v);
              return !v;
            })}
          />
        )}
      </div>

      {result}
    </main>
  );
}
