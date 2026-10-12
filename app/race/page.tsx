import { RaceGame } from '../RaceGame';
import { pageMetadata } from '@/lib/seo';

// 문구는 마케팅팀 SEO 요청서(2026-10-07) 2부 작업 4 확정안이다.
export const metadata = pageMetadata({
  title: 'Start Korean Typing Race | Hangeul Typing Race',
  description:
    'Type Korean words as fast as you can and race across Seoul. Free Korean typing test with your speed in keys per minute.',
  path: '/race',
});

export default function RacePage() {
  return <RaceGame />;
}
