import { LessonResult, ProgressStore } from './types';

const USER_KEY = 'htt.userId';
const RESULTS_KEY = 'htt.results';

type ResultMap = Record<string, LessonResult>;

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 시크릿 모드 등 — 저장 생략 (연습은 계속 동작)
  }
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'u-' + Math.abs(hashNow()).toString(36);
}

// Math.random 없이 시간 기반 폴백 (crypto 없는 환경 대비)
function hashNow(): number {
  const s = String(performance.now()) + navigator.userAgent;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export class LocalProgressStore implements ProgressStore {
  async getUserId(): Promise<string> {
    let id = safeGet(USER_KEY);
    if (!id) {
      id = randomId();
      safeSet(USER_KEY, id);
    }
    return id;
  }

  private readResults(): ResultMap {
    const raw = safeGet(RESULTS_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as ResultMap;
    } catch {
      return {};
    }
  }

  async saveResult(result: LessonResult): Promise<void> {
    const map = this.readResults();
    const prev = map[result.lessonId];
    if (!prev || result.wpm > prev.wpm) {
      map[result.lessonId] = result;
      safeSet(RESULTS_KEY, JSON.stringify(map));
    }
  }

  async getBest(lessonId: string): Promise<LessonResult | null> {
    return this.readResults()[lessonId] ?? null;
  }

  async getCompletedLessonIds(): Promise<string[]> {
    return Object.keys(this.readResults());
  }
}
