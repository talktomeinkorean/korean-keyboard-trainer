import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingLine } from './TypingLine';

describe('TypingLine', () => {
  it('완료 텍스트와 남은 텍스트를 구분 표시한다', () => {
    render(<TypingLine target="한국어" typed="한국" />);
    expect(screen.getByTestId('done')).toHaveTextContent('한국');
    expect(screen.getByTestId('todo')).toHaveTextContent('어');
  });
});
