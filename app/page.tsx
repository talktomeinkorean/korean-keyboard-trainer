import { HomeList } from './HomeList';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8">
      <header className="text-center mt-8">
        <h1 className="text-3xl font-bold">Korean Typing Practice ⌨️</h1>
      </header>
      <HomeList />
    </main>
  );
}
