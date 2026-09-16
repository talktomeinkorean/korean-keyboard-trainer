import { LessonSky } from './LessonSky';

/**
 * 연습 화면 배경 — 스크롤해도 화면에 고정된다.
 *
 * 목록 화면은 화면보다 훨씬 길어서(Vocabulary 는 6,000px 이 넘는다) 같이 흐르게 두면
 * 아래쪽이 비거나 격자가 늘어난다. 화면에 고정해 그라디언트가 언제나 한 화면 안에 담기게 한다.
 *
 * 컬럼 폭으로 가두지 않는다 — 데스크톱에서 좌우까지 한 겹으로 칠해야 경계가 안 생긴다.
 */
export function PracticeBackground() {
  return <LessonSky variant="practice" className="pointer-events-none fixed inset-0 -z-10" />;
}
