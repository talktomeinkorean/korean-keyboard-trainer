import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Keyboard } from './Keyboard';

describe('Keyboard', () => {
  it('26개 자모 키와 스페이스바를 렌더링한다', () => {
    const { container } = render(<Keyboard nextCode={null} />);
    expect(container.querySelectorAll('[data-kbd-key]')).toHaveLength(27);
    expect(screen.getByTestId('kbd-key-Space')).toBeInTheDocument();
  });

  it('스페이스바를 탭하면 Space code로 onKeyPress를 호출한다', () => {
    const onKeyPress = vi.fn();
    render(<Keyboard nextCode={null} onKeyPress={onKeyPress} />);
    fireEvent.click(screen.getByTestId('kbd-key-Space'));
    expect(onKeyPress).toHaveBeenCalledWith('Space');
  });

  it('nextCode 키에 강조 표시를 한다', () => {
    render(<Keyboard nextCode="KeyR" />);
    expect(screen.getByTestId('kbd-key-KeyR').className).toContain('bg-blue-500');
  });

  it('키를 탭하면 해당 code로 onKeyPress를 호출한다 (모바일 입력)', () => {
    const onKeyPress = vi.fn();
    render(<Keyboard nextCode={null} onKeyPress={onKeyPress} />);
    fireEvent.click(screen.getByTestId('kbd-key-KeyR'));
    expect(onKeyPress).toHaveBeenCalledWith('KeyR');
  });
});
