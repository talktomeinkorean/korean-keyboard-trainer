import Link from 'next/link';

interface Props {
  wpm: number;
  accuracy: number;
  onRetry: () => void;
}

export function ResultOverlay({ wpm, accuracy, onRetry }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-2xl p-8 w-80 text-center flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Lesson complete! 🎉</h2>
        <div className="flex justify-center gap-8">
          <div><b className="block text-2xl text-blue-500">{wpm}</b>keys/min</div>
          <div><b className="block text-2xl text-emerald-500">{accuracy}%</b>accuracy</div>
        </div>
        <div className="flex gap-2 justify-center mt-2">
          <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-blue-500 text-white">Retry</button>
          <Link href="/lessons" className="px-4 py-2 rounded-lg bg-neutral-700 text-white">All lessons</Link>
        </div>
      </div>
    </div>
  );
}
