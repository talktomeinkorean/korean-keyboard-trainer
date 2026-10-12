import type { Metadata } from 'next';
import type { Lesson } from '@/lib/curriculum/types';
import { SITE_URL } from '@/lib/site';

export const SITE_NAME = 'Hangeul Typing Race';

interface PageMeta {
  /** <title> 에 그대로 들어간다 — 페이지마다 달라야 색인에서 중복 취급을 받지 않는다 */
  title: string;
  description: string;
  /** 사이트 루트 기준 경로. canonical 과 og:url 에 쓴다 */
  path: string;
  /** 공유 카드용 설명. 검색결과와 달리 짧게 끊어 쓰고 싶을 때만 준다 (없으면 description) */
  ogDescription?: string;
  /** 트위터 카드용 설명. 없으면 ogDescription, 그것도 없으면 description */
  twitterDescription?: string;
}

/**
 * 링크 공유 미리보기 이미지 — 시안에서 받은 로고 아트를 1200x630 으로 구웠다.
 * 픽셀 아트라 JPEG 로 구우면 가장자리가 뭉개져 팔레트 PNG 를 쓴다.
 * 결과 공유 링크(/result)는 자기 기록 카드를 따로 그린다 (opengraph-image.tsx).
 */
const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Hangeul Typing Race: Korean typing practice game',
};

/**
 * 페이지 메타데이터를 한 곳에서 만든다.
 *
 * Next 는 하위 페이지가 openGraph 를 정의하면 상위의 openGraph 를 통째로 갈아끼운다
 * (필드 단위 병합이 아니다). 그래서 페이지마다 직접 쓰지 않고 이 함수를 거치게 해
 * og/twitter 태그가 빠지는 일이 없게 한다.
 */
export function pageMetadata({
  title,
  description,
  path,
  ogDescription,
  twitterDescription,
}: PageMeta): Metadata {
  const og = ogDescription ?? description;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description: og, url: path, siteName: SITE_NAME, type: 'website', images: [OG_IMAGE] },
    twitter: {
      card: 'summary_large_image',
      title,
      description: twitterDescription ?? og,
      images: [OG_IMAGE.url],
    },
  };
}

/**
 * 설명문에 넣을 예시 몇 개. 연습용으로 같은 자모가 반복되는 레슨이 있어 중복은 뺀다.
 * 검색결과에서 잘리지 않도록 개수와 길이를 둘 다 제한한다.
 */
function sampleItems(items: string[], maxCount: number, maxChars: number): string {
  const picked: string[] = [];
  let length = 0;
  for (const item of new Set(items)) {
    if (picked.length >= maxCount) break;
    if (picked.length > 0 && length + item.length + 2 > maxChars) break;
    picked.push(item);
    length += item.length + 2; // ", "
  }
  return picked.join(', ');
}

/** 문장·지문은 첫 줄만 인용한다 (여러 줄을 이어붙이면 문장이 아니게 된다) */
function firstLine(items: string[], maxChars: number): string {
  const line = items[0] ?? '';
  return line.length <= maxChars ? line : `${line.slice(0, maxChars - 1).trimEnd()}…`;
}

const FEEDBACK = 'Jamo-level feedback shows exactly where you slipped.';

/**
 * 레슨 설명문. 실제 연습 내용(한국어 항목)을 넣어 페이지마다 다른 문장이 되게 한다.
 * 검색용으로 지어낸 문장이 아니라 그 페이지에서 실제로 치게 되는 것들이다.
 */
export function lessonDescription(lesson: Lesson): string {
  const count = lesson.items.length;
  switch (lesson.stage) {
    case 'consonant':
    case 'vowel':
      return `Learn where ${sampleItems(lesson.items, 8, 40)} sit on the Korean keyboard, one key at a time.`;
    case 'syllable':
      return `Build Korean syllables — ${sampleItems(lesson.items, 8, 40)} — and see each consonant and vowel as you type.`;
    case 'word':
      return `Type ${count} Korean words: ${sampleItems(lesson.items, 5, 40)} and more. ${FEEDBACK}`;
    case 'sentence':
      return `Type ${count} Korean sentences, starting with "${firstLine(lesson.items, 50)}". ${FEEDBACK}`;
    case 'long_text':
      return `Type a Korean passage line by line — ${count} lines, starting with "${firstLine(lesson.items, 50)}".`;
  }
}

/**
 * 홈에 넣는 구조화 데이터 (마케팅팀 SEO 요청서 2026-10-07 작업 3).
 *
 * alternateName 은 화면에 보이지 않는다 — 영어권에서 많이 쓰는 "Hangul" 표기로
 * 검색해도 같은 사이트라는 것을 검색엔진에 알려 주는 용도다.
 *
 * 요청서의 inLanguage 는 "ko" 였으나 이 값은 **페이지 언어**를 가리킨다.
 * 화면 글은 모두 영어이므로(요청서도 "페이지 언어 영어 유지") "en" 으로 넣는다.
 */
export const WEB_APPLICATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Hangeul Typing Race',
  alternateName: ['Hangul Typing Race', 'Hangul Typing Practice'],
  url: SITE_URL,
  description: 'Free Korean typing practice game for learners.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  inLanguage: 'en',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: {
    '@type': 'Organization',
    name: 'Talk To Me In Korean',
    url: 'https://talktomeinkorean.com',
  },
} as const;
