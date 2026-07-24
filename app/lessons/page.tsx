import { HomeList } from './HomeList';

export default function LessonsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8">
      <header className="text-center mt-8">
        <h1 className="text-3xl font-bold">Korean Typing Practice ⌨️</h1>
        <p className="text-neutral-400 mt-2">Learn the Korean keyboard, one key at a time.</p>
      </header>
      <HomeList />
    </main>
  );
}
