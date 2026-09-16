/**
 * 타자연습 화면들의 배경 — 이미지가 아니라 칠한다.
 *
 * 예전에는 컬럼용·전체 폭용 이미지 두 장으로 나눠 깔았는데, 두 이미지가 서로 다른
 * 높이에 그라디언트를 펼치는 바람에 컬럼 경계에 선이 보였다. 한 겹으로 칠하면
 * 어느 폭·높이에서도 그럴 일이 없고, 배경 에셋을 다시 뽑아도 코드가 흔들리지 않는다.
 *
 * 값은 시안 에셋(1278:7657)에서 실측했다.
 */
export const SKY =
  'linear-gradient(to bottom, #f9f395 0%, #f9f395 10%, #fffef3 30%, #fffef3 70%, #ebe7ff 100%)';

/** 시안의 격자 — 1920 기준 18px 주기로 실측했다 */
export const GRID =
  'repeating-linear-gradient(to right, rgba(54,69,77,0.05) 0 1px, transparent 1px 18px), ' +
  'repeating-linear-gradient(to bottom, rgba(54,69,77,0.05) 0 1px, transparent 1px 18px)';

/** 두 겹을 겹쳐 background-image 한 줄로 */
export const SKY_WITH_GRID = `${GRID}, ${SKY}`;
