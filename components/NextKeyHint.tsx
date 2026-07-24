import { keyByCode } from '@/lib/keyboard/dubeolsik';

const FINGER_LABEL: Record<string, string> = {
  'left-pinky': 'left pinky', 'left-ring': 'left ring', 'left-middle': 'left middle', 'left-index': 'left index',
  'right-index': 'right index', 'right-middle': 'right middle', 'right-ring': 'right ring', 'right-pinky': 'right pinky',
  thumb: 'thumb',
};

export function NextKeyHint({ code }: { code: string | null }) {
  if (!code) return <div className="h-5" />;
  const key = keyByCode(code);
  if (!key) return <div className="h-5" />;
  const letter = code.replace('Key', '');
  return (
    <div className="text-sm text-gray-500">
      Next key: <b className="text-blue-500">{letter === 'Space' ? 'Space' : `${letter} (${key.jamo})`}</b> · {FINGER_LABEL[key.finger]}
    </div>
  );
}
