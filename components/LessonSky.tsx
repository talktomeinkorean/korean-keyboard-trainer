/**
 * 타자연습 화면들의 배경.
 *
 * 데스크톱에서는 시안 배경 이미지 한 장으로 컬럼과 좌우를 **함께** 덮는다.
 * 예전에는 컬럼용·전체 폭용 두 장을 나눠 깔았는데, 두 이미지가 서로 다른 높이에
 * 그라디언트를 펼치는 바람에 컬럼 경계에 선이 보였다. 한 장이면 그럴 일이 없다.
 * (로고는 배경에서 빼내 요소로 그리므로 컬럼용 이미지가 더는 필요 없다.)
 *
 * 모바일은 그라디언트만 쓴다 — 에셋이 1920x1080 가로 이미지라 좁고 긴 화면에 늘리면
 * 격자가 세로 줄무늬로 뭉개진다. 좌우가 빌 일도 없어 이미지를 받을 이유가 없다.
 * 색은 같은 에셋에서 줄별로 실측한 값이라 두 모드가 같은 톤이다.
 */
const SKY = {
  home: 'linear-gradient(to bottom, #f9f395 0%, #f9f395 10%, #fffef3 30%, #fffef3 70%, #ebe7ff 100%)',
  practice:
    'linear-gradient(to bottom, #f8f07d 0%, #f8f07d 5%, #ffffff 30%, #ffffff 60%, #eeebff 100%)',
} as const;

/** 시안 에셋 (1278:7657 · 1171:9029). 아래쪽 다크 밴드는 잘라냈다 — 푸터가 자기 색으로 그린다. */
const IMAGE = {
  home: '/lessons/desktop-bg-home.webp',
  practice: '/lessons/desktop-bg-practice.webp',
} as const;

interface Props {
  /** 홈(/lessons)과 연습 화면은 배경이 다르다 — 가운데가 홈은 크림, 연습은 순백이다 */
  variant: keyof typeof SKY;
  /** 어디에 어떻게 깔지는 쓰는 쪽이 정한다 (섹션에 붙이거나 화면에 고정하거나) */
  className: string;
}

export function LessonSky({ variant, className }: Props) {
  return (
    <div aria-hidden className={className} style={{ backgroundImage: SKY[variant] }}>
      {/* 상자를 꽉 채운다 — 섹션(또는 화면) 높이에 맞춰 늘어나므로 아래 푸터와 경계가 저절로 맞는다 */}
      <div
        className="absolute inset-0 hidden bg-no-repeat sm:block"
        style={{ backgroundImage: `url(${IMAGE[variant]})`, backgroundSize: '100% 100%' }}
      />
    </div>
  );
}
