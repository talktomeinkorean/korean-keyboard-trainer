import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PracticeResult } from './PracticeResult';

function open(over: Partial<Parameters<typeof PracticeResult>[0]> = {}) {
  return render(
    <PracticeResult
      category="Long Text"
      title="엘리베이터에 4층이 없어요"
      timeMs={33_120}
      keysPerMin={87}
      backHref="/lessons/long-text"
      onRetry={() => {}}
      {...over}
    />,
  );
}

describe('PracticeResult', () => {
  it('카테고리와 레슨 제목을 두 줄로 보여준다', () => {
    open();
    expect(screen.getByTestId('practice-result-category')).toHaveTextContent('Long Text');
    expect(screen.getByTestId('practice-result-title')).toHaveTextContent('엘리베이터에 4층이 없어요');
  });

  it('기록을 시안 표기로 보여준다', () => {
    open();
    expect(screen.getByTestId('practice-result-time')).toHaveTextContent('00:33.12');
    expect(screen.getByTestId('practice-result-speed')).toHaveTextContent('87 keys/min');
  });

  it('Try Again 은 콜백을 호출한다', () => {
    const onRetry = vi.fn();
    open({ onRetry });
    fireEvent.click(screen.getByTestId('practice-result-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('Back to Practice 는 넘겨준 목록으로 간다 — 긴 글은 지문 목록', () => {
    open();
    expect(screen.getByTestId('practice-result-back')).toHaveAttribute(
      'href',
      '/lessons/long-text',
    );
  });
});
