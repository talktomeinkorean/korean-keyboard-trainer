/**
 * 데스크톱에서 컬럼(393px) 양옆을 채우는 배경.
 *
 * 컬럼 배경을 대신하는 것이 아니라 그 뒤에 깔린다 — 시안도 전체 폭 배경 위에
 * 컬럼을 그대로 얹는 구조다 (1278:7657). 그래서 컬럼 안쪽 모습은 변하지 않고
 * 비어 있던 좌우만 채워진다.
 *
 * 화면이 컬럼보다 넉넉히 넓을 때만 그린다. 모바일에서는 보일 일이 없는데
 * 이미지만 받게 되므로 display 로 끊어 아예 요청하지 않게 한다.
 */
export function DesktopBackground({ src }: { src: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 hidden bg-no-repeat sm:block"
      style={{ backgroundImage: `url(${src})`, backgroundSize: '100% 100%' }}
    />
  );
}
