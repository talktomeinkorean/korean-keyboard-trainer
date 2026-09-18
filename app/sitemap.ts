import type { MetadataRoute } from 'next';
import { CATEGORIES, lessonsInCategory } from '@/lib/curriculum/categories';
import { getContentLessons } from '@/lib/content/catalog';
import { SITE_URL } from '@/lib/site';

const BASE_URL = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/race`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/lessons`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
  ];

  for (const category of CATEGORIES) {
    // 카테고리별 레슨 목록 — DB 미설정/오류 시 null 이면 정적 레슨만 사용
    const lessons = category.dbKind
      ? getContentLessons(category.dbKind)
      : lessonsInCategory(category.slug);
    if (lessons.length === 0) continue; // 콘텐츠 없는 카테고리는 색인하지 않는다

    entries.push({
      url: `${BASE_URL}/lessons/${category.slug}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
    // 단어·문장은 카테고리 화면에서 바로 랜덤 연습을 해서 개별 레슨 페이지로 가는 링크가 없다.
    // 앱이 링크하지 않는 한 항목짜리 얇은 페이지 수백 개를 색인시키면 사이트 품질 평가만 깎인다.
    if (category.randomSet) continue;
    for (const lesson of lessons) {
      entries.push({
        url: `${BASE_URL}/lesson/${lesson.id}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return entries;
}
