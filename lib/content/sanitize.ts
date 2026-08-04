/**
 * 콘텐츠 문자열에서 키보드 엔진으로 입력 가능한 문자만 남긴다.
 * 허용: 한글 음절(가-힣), 자모 낱자(ㄱ-ㅎ, ㅏ-ㅣ), 공백, 숫자, . , ' " ? !
 * 둥근따옴표(' ' " ")는 키보드로 입력 가능한 곧은따옴표로 정규화한다.
 * 그 외(영문, 특수문자 등)는 제거. 원본 DB 는 수정하지 않고 표시 단계에서만 적용.
 */
export function sanitizeTypable(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,'"?!]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
