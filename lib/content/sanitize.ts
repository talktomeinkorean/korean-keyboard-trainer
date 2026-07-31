/**
 * 콘텐츠 문자열에서 현재 키보드 엔진으로 입력 가능한 문자만 남긴다.
 * 허용: 한글 음절(가-힣), 자모 낱자(ㄱ-ㅎ, ㅏ-ㅣ), 공백, 마침표, 쉼표.
 * ?, !, 따옴표 등은 키가 없어 제거한다 (Shift 입력 체계는 추후 과제).
 * 원본 DB 는 수정하지 않고 표시 단계에서만 적용한다.
 */
export function sanitizeTypable(text: string): string {
  return text
    .replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ\s.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
