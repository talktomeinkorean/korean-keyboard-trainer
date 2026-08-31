import { disassemble } from 'es-hangul';

/**
 * 항목 문자열을 음절별 자모 그룹으로 분해한다.
 * 예: "아마" → [["ㅇ","ㅏ"], ["ㅁ","ㅏ"]]
 * 한글이 아닌 문자(공백, 문장부호)는 길이 1짜리 그룹으로 그대로 둔다.
 * useLessonSession 과 동일하게 글자 단위 disassemble 을 사용하므로
 * 평탄화한 인덱스가 세션의 typedJamoCount 와 1:1 대응한다.
 */
export function toJamoGroups(item: string): string[][] {
  return Array.from(item).map((ch) => disassemble(ch).split(''));
}

export interface JamoProgressSplit {
  /** 완성된 음절들 */
  done: string;
  /** 조합 중인 음절 (없으면 빈 문자열) */
  current: string;
  /** 아직 시작하지 않은 글자들 */
  todo: string;
}

/**
 * 자모 소비량(typedJamoCount) 기준으로 대상 문자열을
 * 완성 / 조합 중 / 남은 글자로 분할한다. TypingLine·PassageView 공용.
 */
export function splitByJamoProgress(target: string, typedJamoCount: number): JamoProgressSplit {
  const groups = toJamoGroups(target);
  let consumed = 0;
  let doneChars = 0;
  let hasCurrent = false;
  for (const g of groups) {
    if (consumed + g.length <= typedJamoCount) {
      consumed += g.length;
      doneChars++;
    } else {
      hasCurrent = typedJamoCount > consumed;
      break;
    }
  }
  return {
    done: target.slice(0, doneChars),
    current: hasCurrent ? target[doneChars] : '',
    todo: target.slice(doneChars + (hasCurrent ? 1 : 0)),
  };
}

export interface CurrentSyllable {
  /** 현재 입력 중인 음절의 자모들 (모두 입력했거나 아직 시작 전이면 다음 음절) */
  jamos: string[];
  /** 그중 이미 입력한 개수 */
  typedCount: number;
}

/**
 * 지금 화면에 칩으로 보여줄 음절의 자모와 진행 상태를 구한다.
 * 단어 전체가 아니라 "지금 치고 있는 글자"만 보여주기 위한 것.
 */
export function currentSyllableJamos(
  target: string,
  typedJamoCount: number,
): CurrentSyllable {
  const groups = toJamoGroups(target);
  let consumed = 0;
  for (const group of groups) {
    if (typedJamoCount < consumed + group.length) {
      return { jamos: group, typedCount: typedJamoCount - consumed };
    }
    consumed += group.length;
  }
  // 전부 입력함 — 마지막 음절을 완료 상태로 보여준다
  const last = groups[groups.length - 1] ?? [];
  return { jamos: last, typedCount: last.length };
}
