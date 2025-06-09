import React from 'react';

export type Article = {
  title: string;
  body: string;
  dateTime: string;
  url: string;
  source: {
    title: string;
  };
  authors: {
    name: string;
  }[];
};

type ArticleCardProps = {
  article: Article;
};

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <div data-testid="article-card">
      <h2>{article.title}</h2>
      <p><strong>Author:</strong> {article.authors[0]?.name || 'Unknown'}</p>
      <p><strong>Published:</strong> {new Date(article.dateTime).toLocaleString()}</p>
      <p><strong>Source:</strong> {article.source.title}</p>
      <p>{article.body}</p>
      <a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
    </div>
  );
};
