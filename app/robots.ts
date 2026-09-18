import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * 검색엔진에 사이트맵 위치를 알린다.
 * /best·/result 는 막지 않는다 — 막으면 크롤러가 페이지의 noindex 를 읽지 못해
 * 링크만으로 색인될 수 있다. 색인 제외는 각 페이지의 robots 메타가 맡는다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
