import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Keyboard } from './Keyboard';

describe('Keyboard', () => {
  it('26개 키를 렌더링한다', () => {
    const { container } = render(<Keyboard nextCode={null} />);
    expect(container.querySelectorAll('[data-kbd-key]')).toHaveLength(26);
  });

  it('nextCode 키에 강조 표시를 한다', () => {
    render(<Keyboard nextCode="KeyR" />);
    expect(screen.getByTestId('kbd-key-KeyR').className).toContain('bg-blue-500');
  });
});
