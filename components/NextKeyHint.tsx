import { keyByCode } from '@/lib/keyboard/dubeolsik';

const FINGER_KO: Record<string, string> = {
  'left-pinky': '왼손 새끼', 'left-ring': '왼손 약지', 'left-middle': '왼손 중지', 'left-index': '왼손 검지',
  'right-index': '오른손 검지', 'right-middle': '오른손 중지', 'right-ring': '오른손 약지', 'right-pinky': '오른손 새끼',
};

export function NextKeyHint({ code }: { code: string | null }) {
  if (!code) return <div className="h-5" />;
  const key = keyByCode(code);
  if (!key) return <div className="h-5" />;
  const letter = code.replace('Key', '');
  return (
    <div className="text-sm text-gray-500">
      다음 키: <b className="text-blue-500">{letter} ({key.jamo})</b> · {FINGER_KO[key.finger]}
    </div>
  );
}
