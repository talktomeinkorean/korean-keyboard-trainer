/**
 * 연습 콘텐츠의 출처 → 배지 문구와 상품 링크 (시안 214:2403 · 413:10486 · 401:8676).
 *
 * 데이터의 source 는 "Core Grammar Level 1 Lesson 1" 처럼 레슨·지문 단위까지 적혀 있지만,
 * 배지는 교재 단위다. 교재는 13종이고 주소가 규칙적이라 표 대신 규칙으로 만든다.
 * 규칙은 시안에 걸린 Book 1 · Level 1 주소에서 가져왔고, Book 2 · Level 2~10 도 실제로 열어
 * 해당 상품 페이지(og:title)가 나오는 것을 확인했다 (없는 번호는 404).
 */

/** TTMIK Stories 앱 — 시안의 Long Text 배지와 연습 화면 헤더 아이콘에 같은 주소가 걸려 있다 */
export const TTMIK_STORIES_URL =
  'https://ttmikstories.app/?utm_source=ttmik&utm_medium=landing&utm_campaign=button&utm_content=251101_ttmik_brandhome_ttmikservices_button_stories&utm_term=251101_ttmik_brandhome_ttmikservices_button_stories';

export interface SourceLink {
  /** 배지에 적는 문구 */
  label: string;
  href: string;
  /** 배지 왼쪽 교재 표지 (시안에서는 Vocabulary 만 있다) */
  cover?: string;
}

const RULES: { pattern: RegExp; link: (n: string) => SourceLink }[] = [
  {
    pattern: /^My First 500 Korean Words Book (\d+)/,
    link: (n) => ({
      label: `My First 500 Korean Words Book ${n}`,
      href: `https://store.talktomeinkorean.com/products/my-first-500-korean-words-book-${n}`,
      cover: `/lessons/book${n}.png`,
    }),
  },
  {
    pattern: /^Core Grammar Level (\d+)/,
    link: (n) => ({
      label: `TTMIK Courses - Core Grammar Level ${n}`,
      href: `https://courses.talktomeinkorean.com/core-grammar-level-${n}-non`,
    }),
  },
  {
    pattern: /^TTMIK Stories Level (\d+)/,
    link: (n) => ({ label: `TTMIK Stories - Level ${n} Articles`, href: TTMIK_STORIES_URL }),
  },
];

/** 규칙에 없는 출처면 null — 배지는 원문만 링크 없이 보인다. */
export function sourceLink(source: string): SourceLink | null {
  for (const { pattern, link } of RULES) {
    const match = pattern.exec(source);
    if (match) return link(match[1]);
  }
  return null;
}
