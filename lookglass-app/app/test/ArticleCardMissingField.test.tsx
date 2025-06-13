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

describe('ArticleCard (error cases)', () => {
  it('fails to render when title is missing', () => {
    const { title, ...partialArticle } = mockArticle;
    // @ts-expect-error: we are deliberately removing title to test behavior
    render(<ArticleCard article={partialArticle} />);

    const titleElement = screen.queryByText(
      "Firefighting uniforms in storage exposed to carcinogens, union claims"
    );

    expect(titleElement).not.toBeInTheDocument();
  });
});
