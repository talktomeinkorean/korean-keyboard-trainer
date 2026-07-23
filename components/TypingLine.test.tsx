import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingLine } from './TypingLine';

describe('TypingLine', () => {
  it('완료 텍스트와 남은 텍스트를 구분 표시한다', () => {
    render(<TypingLine target="한국어" typed="한국" />);
    expect(screen.getByTestId('done')).toHaveTextContent('한국');
    expect(screen.getByTestId('todo')).toHaveTextContent('어');
  });

  it('완료 텍스트와 남은 텍스트 사이에 깜빡이는 캐럿을 표시한다', () => {
    render(<TypingLine target="한국어" typed="한국" />);
    const caret = screen.getByTestId('caret');
    expect(caret).toBeInTheDocument();
    // done 바로 다음 형제가 캐럿, 그 다음이 todo
    expect(screen.getByTestId('done').nextElementSibling).toBe(caret);
    expect(caret.nextElementSibling).toBe(screen.getByTestId('todo'));
  });
});
