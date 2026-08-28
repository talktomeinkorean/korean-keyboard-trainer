import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StartPopup } from './StartPopup';

describe('StartPopup', () => {
  it('시작 팝업 이미지와 Game Start 버튼을 표시한다', () => {
    render(<StartPopup onStart={() => {}} />);
    expect(screen.getByAltText(/find out your rank/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Game Start' })).toBeInTheDocument();
  });

  it('Game Start 를 누르면 onStart 를 호출한다', () => {
    const onStart = vi.fn();
    render(<StartPopup onStart={onStart} />);
    fireEvent.click(screen.getByRole('button', { name: 'Game Start' }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('픽셀아트가 뭉개지지 않도록 pixelated 렌더링을 지정한다', () => {
    render(<StartPopup onStart={() => {}} />);
    expect(screen.getByAltText(/find out your rank/i).style.imageRendering).toBe('pixelated');
  });
});
