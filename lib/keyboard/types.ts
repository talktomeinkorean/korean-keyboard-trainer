export type KeyType = 'consonant' | 'vowel';

export type Finger =
  | 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index'
  | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky';

export interface KeyDef {
  /** KeyboardEvent.code, e.g. "KeyR" */
  code: string;
  /** 기본(비-shift) 자모 */
  jamo: string;
  /** shift 조합 자모 (쌍자음/ㅒㅖ). MVP 입력 처리에는 미사용 — 확장 이음새(스펙 §9.1) */
  shift?: string;
  type: KeyType;
  finger: Finger;
}
