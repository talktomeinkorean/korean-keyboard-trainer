import { HomeScreen } from './HomeScreen';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Hangeul Typing Race — Type Korean Words, Race Across Seoul',
  description:
    'A free Korean typing game. Type Korean words to race across Seoul and see your speed in keys per minute — no sign-up needed.',
  path: '/',
});

export default function Home() {
  return <HomeScreen />;
}
