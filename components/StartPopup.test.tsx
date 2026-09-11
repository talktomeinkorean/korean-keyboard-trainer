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

  it('안내 문구를 alt 로 읽을 수 있다 — 본문이 이미지 안에 있다', () => {
    render(<StartPopup onStart={() => {}} />);
    const art = screen.getByAltText(/find out your rank/i);
    expect(art).toHaveAttribute('alt', expect.stringContaining('keyboard on desktop'));
    expect(art).toHaveAttribute('alt', expect.stringContaining('tap the keys on screen'));
    // 2x 에셋이라 최근접 축소를 쓰면 격자선과 글자가 깨진다
    expect(art.style.imageRendering).toBe('');
  });
});
