/**
 * 연습 화면 배경 — 스크롤해도 화면에 고정된다.
 *
 * 목록 화면은 배경(850px)보다 훨씬 길어서(Vocabulary 는 6,000px 이 넘는다)
 * 같이 흐르게 두면 아래쪽이 비거나 격자가 늘어난다. 화면에 고정해 그라디언트와
 * 격자가 언제나 시안 비율대로 보이게 한다.
 *
 * 앱 본문과 같은 폭(--app-width)으로 가운데 정렬한다.
 */
const BG_SRC = '/lessons/basic-practice.webp';

export function PracticeBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-1/2 -z-10 w-full max-w-[var(--app-width)] -translate-x-1/2 bg-no-repeat"
      style={{ backgroundImage: `url(${BG_SRC})`, backgroundSize: '100% 100%' }}
    />
  );
}
