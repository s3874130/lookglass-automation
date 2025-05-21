'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface Article {
  title: string;
  date: string;
  body: string;
  url: string;
  source: {
    title: string;
    uri: string;
  };
}
export default function FilterPage() {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [source, setSource] = useState('');
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch('/final_combined_output.json');
      const data = await res.json();
      const articles: Article[] = data.articles;

      const filtered = articles.filter((article) => {
        const articleDate = new Date(article.date);
        const matchesKeyword =
          !keyword ||
          article.title.toLowerCase().includes(keyword.toLowerCase()) ||
          article.body.toLowerCase().includes(keyword.toLowerCase());

        const matchesSource =
          !source || article.source.uri.toLowerCase().includes(source.toLowerCase());

        const matchesDate =
          (!startDate || articleDate >= startDate) &&
          (!endDate || articleDate <= endDate);

        return matchesKeyword && matchesSource && matchesDate;
      });

      setResults(filtered);
    } catch (err) {
      console.error('Failed to load articles:', err);
      setError('Failed to load articles.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h1 className="text-3xl font-bold text-center">Search Articles</h1>

          <div className="w-full">
            <Input
              placeholder="Keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full text-lg p-6 h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {startDate ? startDate.toDateString() : 'Select start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    {endDate ? endDate.toDateString() : 'Select end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="w-full">
            <label className="text-sm font-medium block mb-2">Source</label>
            <Select onValueChange={setSource} value={source}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="news">News Articles</SelectItem>
                <SelectItem value="blogs">Blogs</SelectItem>
                <SelectItem value="academic">Academic Papers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-48 mt-6" onClick={handleSubmit}>
            Filter
          </Button>

          <div className="w-full mt-8">
            <h2 className="text-xl font-semibold">Results</h2>
            {error && <p className="text-red-500">{error}</p>}
            {results.length === 0 ? (
              <p>No articles found.</p>
            ) : (
              results.map((article, index) => (
                <div key={index} className="border-b py-4">
                  <h3 className="text-lg font-bold">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      {article.title}
                    </a>
                  </h3>
                  <p><strong>Date:</strong> {article.date}</p>
                  <p><strong>Source:</strong> {article.source.title}</p>
                  <p>{article.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
