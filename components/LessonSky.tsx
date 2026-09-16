/**
 * 타자연습 화면들의 배경 — 이미지가 아니라 칠한다.
 *
 * 이미지로 깔면 컬럼용·전체 폭용 두 장이 서로 다른 높이에 그라디언트를 펼쳐
 * 컬럼 경계에 선이 보인다. 한 겹으로 칠하면 어느 폭·높이에서도 그럴 일이 없다.
 *
 * 색은 시안 에셋(1278:7657 · 1171:9029)에서 줄별로 실측했다.
 * 홈은 가운데가 크림, 연습은 순백이다 — 에셋이 서로 다르다.
 */
const SKY = {
  home: 'linear-gradient(to bottom, #f9f395 0%, #f9f395 10%, #fffef3 30%, #fffef3 70%, #ebe7ff 100%)',
  practice:
    'linear-gradient(to bottom, #f8f07d 0%, #f8f07d 5%, #ffffff 30%, #ffffff 60%, #eeebff 100%)',
} as const;

interface Props {
  /** 홈(/lessons)과 연습 화면은 가운데 색이 다르다 */
  variant: keyof typeof SKY;
  /** 어디에 어떻게 깔지는 쓰는 쪽이 정한다 (섹션에 붙이거나 화면에 고정하거나) */
  className: string;
}

export function LessonSky({ variant, className }: Props) {
  return <div aria-hidden className={className} style={{ backgroundImage: SKY[variant] }} />;
}
