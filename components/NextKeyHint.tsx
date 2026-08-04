import { keyByCode } from '@/lib/keyboard/dubeolsik';

const FINGER_LABEL: Record<string, string> = {
  'left-pinky': 'left pinky', 'left-ring': 'left ring', 'left-middle': 'left middle', 'left-index': 'left index',
  'right-index': 'right index', 'right-middle': 'right middle', 'right-ring': 'right ring', 'right-pinky': 'right pinky',
  thumb: 'thumb',
};

interface Props {
  code: string | null;
  /** 다음 입력에 Shift 가 필요한지 (쌍자음/ㅒㅖ/기호) */
  shift?: boolean;
}

export function NextKeyHint({ code, shift = false }: Props) {
  if (!code) return <div className="h-5" />;
  const key = keyByCode(code);
  if (!key) return <div className="h-5" />;

  const char = shift && key.shift ? key.shift : key.jamo;
  const label =
    code === 'Space' ? 'Space'
    : code.startsWith('Key') ? code.slice(3)
    : code.startsWith('Digit') ? code.slice(5)
    : char;
  const keyText = label === char ? label : `${label} (${char})`;

  return (
    <div className="text-sm text-gray-500">
      Next key: <b className="text-blue-500">{shift ? `Shift + ${keyText}` : keyText}</b> · {FINGER_LABEL[key.finger]}
    </div>
  );
}
