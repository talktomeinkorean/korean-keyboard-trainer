import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameTopBar } from './GameTopBar';

describe('GameTopBar', () => {
  it('경과 시간을 mm:ss.cc 로 표시한다', () => {
    render(<GameTopBar elapsedMs={33120} muted={false} onToggleMuted={() => {}} onExit={() => {}} />);
    expect(screen.getByTestId('race-timer')).toHaveTextContent('00:33.12');
  });

  it('소리 켜짐이면 스피커+음파 아이콘을 쓴다', () => {
    render(<GameTopBar elapsedMs={0} muted={false} onToggleMuted={() => {}} onExit={() => {}} />);
    expect(screen.getByTestId('sound-icon-on')).toBeInTheDocument();
    expect(screen.queryByTestId('sound-icon-off')).toBeNull();
  });

  it('음소거면 전용 아이콘으로 바뀐다', () => {
    render(<GameTopBar elapsedMs={0} muted onToggleMuted={() => {}} onExit={() => {}} />);
    expect(screen.getByTestId('sound-icon-off')).toBeInTheDocument();
    expect(screen.queryByTestId('sound-icon-on')).toBeNull();
  });

  it('사운드 버튼을 누르면 토글을 호출하고 상태를 알린다', () => {
    const onToggle = vi.fn();
    render(<GameTopBar elapsedMs={0} muted onToggleMuted={onToggle} onExit={() => {}} />);
    const btn = screen.getByTestId('sound-toggle');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('나가기 버튼은 이동 대신 콜백을 호출한다 (확인 팝업용)', () => {
    const onExit = vi.fn();
    render(<GameTopBar elapsedMs={0} muted={false} onToggleMuted={() => {}} onExit={onExit} />);
    const btn = screen.getByTestId('exit-button');
    expect(btn.tagName).toBe('BUTTON');
    fireEvent.click(btn);
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});