import React from 'react';
import { render, screen } from '@testing-library/react';
import { ArticleCard, Article } from './ArticleCard';

const mockArticle: Article = {
  title: "Firefighting uniforms in storage exposed to carcinogens, union claims",
  body: "The union has lodged a case in the SA Employment Tribunal requesting...",
  dateTime: "2025-05-01T23:56:08Z",
  url: "https://www.abc.net.au/news/2025-05-02/firefighting-uniforms-in-storage-exposed-carcinogens-union-says/105239366",
  source: {
    title: "Australian Broadcasting Corporation"
  },
  authors: [
    { name: "Kathryn Bermingham" }
  ]
};

describe('ArticleCard', () => {
  it('renders article title, author, date, source, and body', () => {
    render(<ArticleCard article={mockArticle} />);

    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    expect(screen.getByText(/Kathryn Bermingham/)).toBeInTheDocument();
    expect(screen.getByText(/Australian Broadcasting Corporation/)).toBeInTheDocument();
    expect(screen.getByText(/The union has lodged/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /read more/i })).toHaveAttribute('href', mockArticle.url);
  });
});
