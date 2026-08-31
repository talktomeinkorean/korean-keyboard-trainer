import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyGuideToggle } from './KeyGuideToggle';

describe('KeyGuideToggle', () => {
  it('켜짐: 연두 트랙 + 손잡이 오른쪽 + ON', () => {
    render(<KeyGuideToggle on onToggle={() => {}} />);
    const sw = screen.getByTestId('key-guide-toggle');
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(sw.className).toContain('bg-[#8ceb97]');
    expect(screen.getByTestId('key-guide-knob').className).toContain('left-[24px]');
    expect(sw).toHaveTextContent('ON');
  });

  it('꺼짐: 시안 색(#b8c5cc) 트랙 + 손잡이 왼쪽 + OFF', () => {
    render(<KeyGuideToggle on={false} onToggle={() => {}} />);
    const sw = screen.getByTestId('key-guide-toggle');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw.className).toContain('bg-[#b8c5cc]');
    expect(sw.className).not.toContain('bg-[#8ceb97]');
    expect(screen.getByTestId('key-guide-knob').className).toContain('left-0');
    expect(sw).toHaveTextContent('OFF');
  });

  it('누르면 토글을 호출한다', () => {
    const onToggle = vi.fn();
    render(<KeyGuideToggle on onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId('key-guide-toggle'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
