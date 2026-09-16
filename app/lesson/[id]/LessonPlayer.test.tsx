import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonPlayer } from './LessonPlayer';
import type { Lesson, Stage } from '@/lib/curriculum/types';

function lessonOf(stage: Stage): Lesson {
  return { id: `${stage}-1`, stage, title: stage, items: ['가나'] };
}

/** 다음에 칠 키가 연두로 강조돼 있는지 */
function hasHighlight(): boolean {
  return document.querySelector('[class*="bg-[#8ceb97]"][data-testid^="kbd-key-"]') !== null;
}

describe('LessonPlayer — Key Guide', () => {
  beforeEach(() => localStorage.clear());

  it('자모·단어 단계에는 Key Guide 가 있고 다음 키를 짚어 준다', () => {
    render(<LessonPlayer lesson={lessonOf('consonant')} />);
    expect(screen.getByTestId('key-guide-toggle')).toBeInTheDocument();
    expect(hasHighlight()).toBe(true);
  });

  // 시안 1171:9029 에 Key Guide 가 없다 — 글자를 보고 치는 단계라 짚어 주지 않는다
  it.each<Stage>(['sentence', 'long_text'])('%s 단계에는 Key Guide 가 없다', (stage) => {
    render(<LessonPlayer lesson={lessonOf(stage)} />);
    expect(screen.queryByTestId('key-guide-toggle')).not.toBeInTheDocument();
    expect(hasHighlight()).toBe(false);
  });

  it('문장·긴글은 숫자열이 있는 확장 키보드를 쓴다', () => {
    const { unmount } = render(<LessonPlayer lesson={lessonOf('consonant')} />);
    expect(screen.queryByTestId('kbd-key-Digit1')).not.toBeInTheDocument();
    unmount();

    render(<LessonPlayer lesson={lessonOf('sentence')} />);
    expect(screen.getByTestId('kbd-key-Digit1')).toBeInTheDocument();
  });
});
