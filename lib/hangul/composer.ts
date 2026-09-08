import { assemble } from 'es-hangul';

/** 한글 자모(호환 자모 포함) — assemble 에 넘길 수 있는 문자 */
const JAMO = /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/;

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
      // assemble 은 자모만 받는다. 공백·문장부호가 섞이면 예외를 던지므로
      // 자모 구간만 조합하고 나머지는 그대로 이어 붙인다 (문장·긴글에 필요).
      let out = '';
      let run: string[] = [];
      const flush = () => {
        if (run.length > 0) {
          out += assemble(run);
          run = [];
        }
      };
      for (const ch of seq) {
        if (JAMO.test(ch)) run.push(ch);
        else {
          flush();
          out += ch;
        }
      }
      flush();
      return out;
    },
    jamos() {
      return seq;
    },
  };
}
