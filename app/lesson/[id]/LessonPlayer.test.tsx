import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('LessonPlayer — Key Guide 기억', () => {
  beforeEach(() => localStorage.clear());

  it('껐으면 다음에 들어와도 꺼진 채로 시작한다', () => {
    const { unmount } = render(<LessonPlayer lesson={lessonOf('consonant')} />);
    fireEvent.click(screen.getByTestId('key-guide-toggle'));
    expect(hasHighlight()).toBe(false);
    unmount();

    render(<LessonPlayer lesson={lessonOf('consonant')} />);
    expect(screen.getByTestId('key-guide-toggle')).toHaveAttribute('aria-checked', 'false');
    expect(hasHighlight()).toBe(false);
  });
});

describe('LessonPlayer — Try Again', () => {
  beforeEach(() => localStorage.clear());

  /** '가나' 를 끝까지 친다 — ㄱㅏㄴㅏ */
  function finishLesson() {
    for (const code of ['KeyR', 'KeyK', 'KeyS', 'KeyK']) {
      fireEvent.keyDown(window, { code });
    }
  }

  it('무작위 세트인 연습은 Try Again 이 새 판을 뽑게 한다', () => {
    const onRedraw = vi.fn();
    render(<LessonPlayer lesson={lessonOf('consonant')} onRedraw={onRedraw} />);
    finishLesson();

    fireEvent.click(screen.getByTestId('practice-result-retry'));
    expect(onRedraw).toHaveBeenCalledTimes(1);
  });

  it('지정된 지문은 Try Again 이 같은 글을 다시 친다 (세트를 뽑지 않는다)', () => {
    render(<LessonPlayer lesson={lessonOf('consonant')} />);
    finishLesson();

    fireEvent.click(screen.getByTestId('practice-result-retry'));
    // 결과 팝업이 닫히고 처음부터 다시 시작한다
    expect(screen.queryByTestId('practice-result-retry')).not.toBeInTheDocument();
  });
});

describe('LessonPlayer — 화면 키보드로 문장부호 치기', () => {
  beforeEach(() => localStorage.clear());

  // 모바일은 화면 키보드만 쓴다. 키캡에 ? 가 적혀 있으니 Shift 없이 눌러도 ? 가 들어가야 한다
  it('? 키를 탭하면 Shift 없이 바로 입력된다', () => {
    const lesson: Lesson = { id: 'sentence-1', stage: 'sentence', title: 'sentence', items: ['가?'] };
    render(<LessonPlayer lesson={lesson} />);

    // '가' 를 물리 키보드로 친 뒤, 물음표만 화면 키보드로 탭한다
    fireEvent.keyDown(window, { code: 'KeyR' });
    fireEvent.keyDown(window, { code: 'KeyK' });
    fireEvent.click(screen.getByTestId('kbd-key-Slash'));

    expect(screen.getByTestId('typing-echo')).toHaveTextContent('가?');
  });
});
