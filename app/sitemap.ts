import type { MetadataRoute } from 'next';
import { CATEGORIES, lessonsInCategory } from '@/lib/curriculum/categories';
import { getContentLessons } from '@/lib/content/catalog';

// 도메인이 바뀌면 이 값을 바꿔야 한다 (사이트맵의 모든 URL이 여기서 파생됨).
const BASE_URL = 'https://hangeultyping.talktomeinkorean.com';

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
