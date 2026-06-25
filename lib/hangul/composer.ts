import { assemble } from 'es-hangul';

export interface Composer {
  push(jamo: string): void;
  pop(): void;
  reset(): void;
  /** 현재까지 조합된 표시 문자열 */
  text(): string;
  /** 입력된 자모 시퀀스 (디버그/테스트용) */
  jamos(): readonly string[];
}

export function createComposer(): Composer {
  let seq: string[] = [];
  return {
    push(jamo) {
      seq.push(jamo);
    },
    pop() {
      seq.pop();
    },
    reset() {
      seq = [];
    },
    text() {
      if (seq.length === 0) return '';
      return assemble(seq);
    },
    jamos() {
      return seq;
    },
  };
}
