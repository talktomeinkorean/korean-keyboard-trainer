import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LessonsPage from './page';

describe('타자연습 홈', () => {
  it('시안의 버튼 4개를 순서대로 보여준다', () => {
    render(<LessonsPage />);
    const labels = ['Basics', 'Vocabulary', 'Sentences', 'Long Text'];
    const rendered = screen
      .getAllByTestId(/^category-/)
      .map((el) => el.textContent?.trim());
    expect(rendered).toEqual(labels);
  });

  it('각 버튼이 해당 카테고리로 연결된다', () => {
    render(<LessonsPage />);
    expect(screen.getByTestId('category-consonants-vowels')).toHaveAttribute(
      'href',
      '/lessons/consonants-vowels',
    );
    expect(screen.getByTestId('category-long-text')).toHaveAttribute('href', '/lessons/long-text');
  });

  it('제목은 화면에 보이지 않아도 접근성용으로 남긴다 (배경 이미지에 그려짐)', () => {
    render(<LessonsPage />);
    expect(screen.getByRole('heading', { name: /hangeul typing practice/i })).toBeInTheDocument();
  });

  it('상단 이벤트 배너를 홈으로 연결한다', () => {
    render(<LessonsPage />);
    const banner = screen.getByTestId('promotion-banner');
    expect(banner).toHaveAttribute('href', '/');
    expect(banner.querySelector('img')).toHaveAttribute('alt', expect.stringMatching(/hangeul day typing race/i));
  });
});