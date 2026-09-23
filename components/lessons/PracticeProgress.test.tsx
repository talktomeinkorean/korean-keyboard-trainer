import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PracticeProgress, runnerLeft } from './PracticeProgress';

// 위치 식은 함수로 따로 본다 — jsdom 은 clamp() 를 모르는 값으로 보고 통째로 버린다
describe('PracticeProgress 캐릭터 위치', () => {
  // 왼쪽 끝을 진행 지점에 맞추면 캐릭터가 막대보다 앞서 달리는 것처럼 보인다
  it('진행 지점을 몸 가운데로 짚는다', () => {
    expect(runnerLeft(0.3, 30)).toContain('calc(30% - 15px)');
  });

  it('양 끝에서는 트랙 밖으로 나가지 않는다', () => {
    expect(runnerLeft(0, 30)).toBe('clamp(0px, calc(0% - 15px), calc(100% - 30px))');
    expect(runnerLeft(1, 30)).toBe('clamp(0px, calc(100% - 15px), calc(100% - 30px))');
  });
});

describe('PracticeProgress', () => {

  it('진행도를 접근성 속성으로 알린다', () => {
    render(<PracticeProgress done={4} total={10} running={false} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '4');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
  });
});
