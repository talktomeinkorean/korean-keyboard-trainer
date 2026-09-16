/**
 * 타자연습 화면들의 배경 — 이미지가 아니라 칠한다.
 *
 * 이미지로 깔면 컬럼용·전체 폭용 두 장이 서로 다른 높이에 그라디언트를 펼쳐
 * 컬럼 경계에 선이 보인다. 한 겹으로 칠하면 어느 폭·높이에서도 그럴 일이 없다.
 *
 * 아래 값은 시안 에셋(1278:7657 · 1171:9029)에서 줄별로 실측했다.
 */

/** 홈은 가운데가 크림, 연습은 순백이다 — 에셋이 서로 다르다. */
const SKY = {
  home: 'linear-gradient(to bottom, #f9f395 0%, #f9f395 10%, #fffef3 30%, #fffef3 70%, #ebe7ff 100%)',
  practice:
    'linear-gradient(to bottom, #f8f07d 0%, #f8f07d 5%, #ffffff 30%, #ffffff 60%, #eeebff 100%)',
} as const;

/** 격자선 자체의 진하기. 위아래에서 가장 진할 때의 값이고, 아래 마스크가 위치별로 깎는다. */
const GRID_LINES =
  'repeating-linear-gradient(to right, rgba(54,69,77,0.2) 0 1px, transparent 1px 18px), ' +
  'repeating-linear-gradient(to bottom, rgba(54,69,77,0.2) 0 1px, transparent 1px 18px)';

/**
 * 격자는 위아래에서만 보이고 가운데에서는 사실상 사라진다.
 * 에셋에서 잰 줄별 대비가 위 26 → 가운데 1 → 아래 7 이라 그 모양을 그대로 옮겼다.
 */
const GRID_FADE =
  'linear-gradient(to bottom, #000 0%, #000 8%, rgba(0,0,0,0.16) 20%, ' +
  'transparent 30%, transparent 66%, rgba(0,0,0,0.07) 80%, rgba(0,0,0,0.15) 100%)';

interface Props {
  /** 홈(/lessons)과 연습 화면은 가운데 색과 격자 세기가 다르다 */
  variant: keyof typeof SKY;
  /** 어디에 어떻게 깔지는 쓰는 쪽이 정한다 (섹션에 붙이거나 화면에 고정하거나) */
  className: string;
}

export function LessonSky({ variant, className }: Props) {
  return (
    <div aria-hidden className={className} style={{ backgroundImage: SKY[variant] }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRID_LINES,
          maskImage: GRID_FADE,
          WebkitMaskImage: GRID_FADE,
        }}
      />
    </div>
  );
}
