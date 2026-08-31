import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExitPopup } from './ExitPopup';

describe('ExitPopup', () => {
  it('시안의 선택지 3개를 보여준다', () => {
    render(<ExitPopup onClose={() => {}} onRestart={() => {}} />);
    expect(screen.getByTestId('exit-restart')).toHaveTextContent('Restart');
    expect(screen.getByTestId('exit-practice')).toHaveTextContent('Practice Typing');
    expect(screen.getByTestId('exit-home')).toHaveTextContent('Back to Home');
  });

  it('Practice Typing 은 /lessons, Back to Home 은 / 로 간다', () => {
    render(<ExitPopup onClose={() => {}} onRestart={() => {}} />);
    expect(screen.getByTestId('exit-practice')).toHaveAttribute('href', '/lessons');
    expect(screen.getByTestId('exit-home')).toHaveAttribute('href', '/');
  });

  it('Restart 는 콜백을 호출한다', () => {
    const onRestart = vi.fn();
    render(<ExitPopup onClose={() => {}} onRestart={onRestart} />);
    fireEvent.click(screen.getByTestId('exit-restart'));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('닫기는 게임으로 복귀시킨다', () => {
    const onClose = vi.fn();
    render(<ExitPopup onClose={onClose} onRestart={() => {}} />);
    fireEvent.click(screen.getByTestId('exit-popup-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
