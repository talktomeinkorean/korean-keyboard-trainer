interface Props {
  wpm: number;
  accuracy: number;
  index: number;
  total: number;
}

export function StatsBar({ wpm, accuracy, index, total }: Props) {
  return (
    <div className="flex gap-6 text-sm">
      <div><b className="block text-xl text-blue-500">{wpm}</b>타/분</div>
      <div><b className="block text-xl text-emerald-500">{accuracy}%</b>정확도</div>
      <div><b className="block text-xl">{index}/{total}</b>진행</div>
    </div>
  );
}
