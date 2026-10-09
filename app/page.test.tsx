import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

// 종료 공지 팝업의 숫자 — DB 를 부르지 않게 막는다
vi.mock('@/lib/finishes/stats', () => ({ getEventFinishCount: async () => 12345 }));

describe('타자연습 홈', () => {
  it('맨 위에서 게임으로 보낸다 (시안 880:7255)', async () => {
    render(await Home());
    expect(screen.getByTestId('typing-game')).toHaveAttribute('href', '/game');
  });

  it('시안의 버튼 4개를 순서대로 보여준다', async () => {
    render(await Home());
    const labels = ['Basics', 'Vocabulary', 'Sentences', 'Long Text'];
    const rendered = screen
      .getAllByTestId(/^category-/)
      .map((el) => el.textContent?.trim());
    expect(rendered).toEqual(labels);
  });

  it('각 버튼이 해당 카테고리로 연결된다', async () => {
    render(await Home());
    expect(screen.getByTestId('category-consonants-vowels')).toHaveAttribute(
      'href',
      '/lessons/consonants-vowels',
    );
    expect(screen.getByTestId('category-long-text')).toHaveAttribute('href', '/lessons/long-text');
  });

  it('제목은 화면에 보이지 않아도 접근성용으로 남긴다 (배경 이미지에 그려짐)', async () => {
    render(await Home());
    expect(screen.getByRole('heading', { name: /hangeul typing practice/i })).toBeInTheDocument();
  });
});