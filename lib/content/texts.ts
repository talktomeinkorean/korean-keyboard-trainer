import practiceTexts from './practiceTexts.json';
import { PracticeText } from './lessonGen';

export type ContentKind = 'vocabulary' | 'sentence' | 'long_text';

/**
 * 연습 텍스트 — 빌드 산출물에 포함된 정적 데이터.
 *
 * 원본은 data/*.csv 이고 `npm run content:generate` 로 practiceTexts.json 을 만든다.
 * DB 조회를 없앤 이유: 정적 콘텐츠인데도 요청마다 Supabase 를 거치면서
 * 콜드 스타트에 1~2초가 더 붙었다.
 *
 * 서버에서만 import 할 것 — 216KB 라 클라이언트 번들에 들어가면 안 된다.
 */
export function getTexts(kind: ContentKind): PracticeText[] {
  return practiceTexts[kind];
}
