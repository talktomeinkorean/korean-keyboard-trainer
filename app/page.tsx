import { HomeScreen } from './HomeScreen';
import { pageMetadata } from '@/lib/seo';
import { getParticipantCount } from '@/lib/finishes/stats';

// 참여인원 숫자 때문에 1분마다 다시 만든다. 페이지 자체는 정적이라 방문자마다 DB 를 부르지 않는다.
export const revalidate = 60;

export const metadata = pageMetadata({
  title: 'Hangeul Typing Race — Type Korean Words, Race Across Seoul',
  description:
    'A free Korean typing game. Type Korean words to race across Seoul and see your speed in keys per minute — no sign-up needed.',
  path: '/',
});

export default async function Home() {
  return <HomeScreen runnerCount={await getParticipantCount()} />;
}
