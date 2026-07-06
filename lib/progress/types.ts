/** 미래 DB/랭킹과의 공용 계약. 모양을 바꾸지 말 것. */
export interface LessonResult {
  lessonId: string;
  /** 분당 타수 (keystrokes per minute) */
  wpm: number;
  /** 0~100 */
  accuracy: number;
  /** epoch ms */
  completedAt: number;
}

export interface ProgressStore {
  /** 익명 사용자 식별자 (없으면 발급해 보관) */
  getUserId(): Promise<string>;
  /** 레슨 결과 저장 — 기존보다 좋은 기록이면 갱신 */
  saveResult(result: LessonResult): Promise<void>;
  /** 레슨별 최고 기록 (없으면 null) */
  getBest(lessonId: string): Promise<LessonResult | null>;
  /** 완료한 레슨 id 집합 */
  getCompletedLessonIds(): Promise<string[]>;
}
