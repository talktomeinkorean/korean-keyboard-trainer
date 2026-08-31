import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Keyboard } from './Keyboard';

describe('Keyboard', () => {
  it('기본 레이아웃: 자모 26 + 문장부호 2 + 스페이스 + Shift = 30키, 숫자열 없음', () => {
    const { container } = render(<Keyboard nextCode={null} />);
    expect(container.querySelectorAll('[data-kbd-key]')).toHaveLength(30);
    expect(screen.queryByTestId('kbd-key-Digit1')).toBeNull();
    expect(screen.getByTestId('kbd-key-Shift')).toBeInTheDocument();
  });

  it('확장 레이아웃: 숫자열 10 + 따옴표/물음표 키가 추가된다', () => {
    const { container } = render(<Keyboard nextCode={null} layout="extended" />);
    expect(container.querySelectorAll('[data-kbd-key]')).toHaveLength(42);
    expect(screen.getByTestId('kbd-key-Digit1')).toBeInTheDocument();
    expect(screen.getByTestId('kbd-key-Quote')).toBeInTheDocument();
    expect(screen.getByTestId('kbd-key-Slash')).toBeInTheDocument();
  });

  it('nextCode 키에 강조 표시를 한다', () => {
    render(<Keyboard nextCode="KeyR" />);
    expect(screen.getByTestId('kbd-key-KeyR').className).toContain('bg-[#8ceb97]');
  });

  it('nextShift 면 Shift 키도 강조한다', () => {
    render(<Keyboard nextCode="KeyQ" nextShift />);
    expect(screen.getByTestId('kbd-key-Shift').className).toContain('bg-[#8ceb97]');
  });

  it('키를 탭하면 (code, shift=false) 로 onKeyPress 를 호출한다', () => {
    const onKeyPress = vi.fn();
    render(<Keyboard nextCode={null} onKeyPress={onKeyPress} />);
    fireEvent.click(screen.getByTestId('kbd-key-KeyR'));
    expect(onKeyPress).toHaveBeenCalledWith('KeyR', false);
  });

  it('Shift 토글: 키캡이 shift 문자로 바뀌고, 입력 후 자동 해제된다', () => {
    const onKeyPress = vi.fn();
    render(<Keyboard nextCode={null} onKeyPress={onKeyPress} />);

    fireEvent.click(screen.getByTestId('kbd-key-Shift'));
    expect(screen.getByTestId('kbd-key-KeyQ')).toHaveTextContent('ㅃ');

    fireEvent.click(screen.getByTestId('kbd-key-KeyQ'));
    expect(onKeyPress).toHaveBeenCalledWith('KeyQ', true);
    // 자동 해제 — 키캡이 기본 문자로 복귀
    expect(screen.getByTestId('kbd-key-KeyQ')).toHaveTextContent('ㅂ');
  });

  it('스페이스바를 탭하면 Space code 로 호출한다', () => {
    const onKeyPress = vi.fn();
    render(<Keyboard nextCode={null} onKeyPress={onKeyPress} />);
    fireEvent.click(screen.getByTestId('kbd-key-Space'));
    expect(onKeyPress).toHaveBeenCalledWith('Space', false);
  });

  it('Key Guide 를 끄면 다음 키를 강조하지 않는다', () => {
    render(<Keyboard nextCode="KeyR" keyGuide={false} />);
    expect(screen.getByTestId('kbd-key-KeyR').className).not.toContain('bg-[#8ceb97]');
  });

  it('shift 키에 시안 아이콘을 쓴다 (유니코드 문자가 아님)', () => {
    render(<Keyboard nextCode={null} />);
    const arrow = screen.getByTestId('shift-arrow');
    expect(arrow).toHaveAttribute('src', '/race/icons/shift-arrow.svg');
    expect(screen.getByTestId('kbd-key-Shift')).not.toHaveTextContent('⇧');
  });
});