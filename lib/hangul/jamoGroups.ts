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
