import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PracticeResult } from './PracticeResult';

function open(over: Partial<Parameters<typeof PracticeResult>[0]> = {}) {
  return render(
    <PracticeResult
      stage="long_text"
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

  it('Back to Practice 는 넘겨준 목록으로 간다', () => {
    open();
    expect(screen.getByTestId('practice-result-back')).toHaveAttribute('href', '/lessons/long-text');
  });

  describe('연습 종류별 변형', () => {
    it('Basics: 레슨 이름 하나가 제목이고 보라 버튼이 없다', () => {
      open({ stage: 'consonant', title: 'Consonants' });
      expect(screen.getByTestId('practice-result-title')).toHaveTextContent('Consonants');
      expect(screen.queryByTestId('practice-result-category')).toBeNull();
      expect(screen.queryByTestId('practice-result-link')).toBeNull();
    });

    it('Vocabulary: 레슨 제목 대신 Vocabulary, 교재 묶음 링크', () => {
      open({ stage: 'word', title: '30 Random Words' });
      expect(screen.getByTestId('practice-result-title')).toHaveTextContent('Vocabulary');
      const link = screen.getByTestId('practice-result-link');
      expect(link).toHaveTextContent('See how these words are used');
      expect(link).toHaveAttribute(
        'href',
        'https://store.talktomeinkorean.com/products/my-first-500-korean-words-book-1-book-2',
      );
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('Sentences: 강의 링크', () => {
      open({ stage: 'sentence', title: '10 Random Sentences' });
      expect(screen.getByTestId('practice-result-title')).toHaveTextContent('Sentences');
      expect(screen.getByTestId('practice-result-link')).toHaveTextContent('Learn the grammar in these sentences');
      expect(screen.getByTestId('practice-result-link').getAttribute('href')).toMatch(
        /^https:\/\/courses\.talktomeinkorean\.com\//,
      );
    });

    it('Long Text: 작은 "Long Text" 위에 지문 제목, Stories 링크', () => {
      open();
      expect(screen.getByTestId('practice-result-category')).toHaveTextContent('Long Text');
      expect(screen.getByTestId('practice-result-title')).toHaveTextContent('엘리베이터에 4층이 없어요');
      expect(screen.getByTestId('practice-result-link')).toHaveTextContent('Listen, quiz, and review this story');
      expect(screen.getByTestId('practice-result-link').getAttribute('href')).toMatch(/^https:\/\/ttmikstories\.app\//);
    });
  });
});
