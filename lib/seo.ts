import type { Metadata } from 'next';
import type { Lesson } from '@/lib/curriculum/types';

export const SITE_NAME = 'Hangeul Typing Practice';

interface PageMeta {
  /** <title> 에 그대로 들어간다 — 페이지마다 달라야 색인에서 중복 취급을 받지 않는다 */
  title: string;
  description: string;
  /** 사이트 루트 기준 경로. canonical 과 og:url 에 쓴다 */
  path: string;
}

/**
 * 페이지 메타데이터를 한 곳에서 만든다.
 *
 * Next 는 하위 페이지가 openGraph 를 정의하면 상위의 openGraph 를 통째로 갈아끼운다
 * (필드 단위 병합이 아니다). 그래서 페이지마다 직접 쓰지 않고 이 함수를 거치게 해
 * og/twitter 태그가 빠지는 일이 없게 한다.
 */
export function pageMetadata({ title, description, path }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
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
