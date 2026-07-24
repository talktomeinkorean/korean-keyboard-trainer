import { KeyDef } from './types';

// 두벌식 표준. 왼손=자음(주황), 오른손=모음(초록).
// finger 는 물리 위치 기준이라 B(ㅠ)처럼 type=vowel 이지만 left-index 인 예외가 존재한다.
export const DUBEOLSIK: KeyDef[] = [
  // 상단 자음
  { code: 'KeyQ', jamo: 'ㅂ', shift: 'ㅃ', type: 'consonant', finger: 'left-pinky' },
  { code: 'KeyW', jamo: 'ㅈ', shift: 'ㅉ', type: 'consonant', finger: 'left-ring' },
  { code: 'KeyE', jamo: 'ㄷ', shift: 'ㄸ', type: 'consonant', finger: 'left-middle' },
  { code: 'KeyR', jamo: 'ㄱ', shift: 'ㄲ', type: 'consonant', finger: 'left-index' },
  { code: 'KeyT', jamo: 'ㅅ', shift: 'ㅆ', type: 'consonant', finger: 'left-index' },
  // 상단 모음
  { code: 'KeyY', jamo: 'ㅛ', type: 'vowel', finger: 'right-index' },
  { code: 'KeyU', jamo: 'ㅕ', type: 'vowel', finger: 'right-index' },
  { code: 'KeyI', jamo: 'ㅑ', type: 'vowel', finger: 'right-middle' },
  { code: 'KeyO', jamo: 'ㅐ', shift: 'ㅒ', type: 'vowel', finger: 'right-ring' },
  { code: 'KeyP', jamo: 'ㅔ', shift: 'ㅖ', type: 'vowel', finger: 'right-pinky' },
  // 홈로우 자음
  { code: 'KeyA', jamo: 'ㅁ', type: 'consonant', finger: 'left-pinky' },
  { code: 'KeyS', jamo: 'ㄴ', type: 'consonant', finger: 'left-ring' },
  { code: 'KeyD', jamo: 'ㅇ', type: 'consonant', finger: 'left-middle' },
  { code: 'KeyF', jamo: 'ㄹ', type: 'consonant', finger: 'left-index' },
  { code: 'KeyG', jamo: 'ㅎ', type: 'consonant', finger: 'left-index' },
  // 홈로우 모음
  { code: 'KeyH', jamo: 'ㅗ', type: 'vowel', finger: 'right-index' },
  { code: 'KeyJ', jamo: 'ㅓ', type: 'vowel', finger: 'right-index' },
  { code: 'KeyK', jamo: 'ㅏ', type: 'vowel', finger: 'right-middle' },
  { code: 'KeyL', jamo: 'ㅣ', type: 'vowel', finger: 'right-ring' },
  // 하단 자음
  { code: 'KeyZ', jamo: 'ㅋ', type: 'consonant', finger: 'left-pinky' },
  { code: 'KeyX', jamo: 'ㅌ', type: 'consonant', finger: 'left-ring' },
  { code: 'KeyC', jamo: 'ㅊ', type: 'consonant', finger: 'left-middle' },
  { code: 'KeyV', jamo: 'ㅍ', type: 'consonant', finger: 'left-index' },
  // 하단 모음
  { code: 'KeyB', jamo: 'ㅠ', type: 'vowel', finger: 'left-index' },
  { code: 'KeyN', jamo: 'ㅜ', type: 'vowel', finger: 'right-index' },
  { code: 'KeyM', jamo: 'ㅡ', type: 'vowel', finger: 'right-index' },
];

// 문장 연습용 스페이스. DUBEOLSIK(자모 26키)에는 포함하지 않고 조회 맵에만 추가한다.
export const SPACE_KEY: KeyDef = { code: 'Space', jamo: ' ', type: 'space', finger: 'thumb' };

const ALL_KEYS = [...DUBEOLSIK, SPACE_KEY];
const byCode = new Map(ALL_KEYS.map((k) => [k.code, k]));
const byJamo = new Map(ALL_KEYS.map((k) => [k.jamo, k]));

export function keyByCode(code: string): KeyDef | undefined {
  return byCode.get(code);
}

export function keyByJamo(jamo: string): KeyDef | undefined {
  return byJamo.get(jamo);
}
