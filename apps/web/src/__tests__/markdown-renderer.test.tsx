import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';

describe('MarkdownRenderer (server-rendered)', () => {
  it('renders headings, external links safely, and blocks javascript: links', async () => {
    const jsx = await MarkdownRenderer({
      markdown:
        '## Architecture\n\nVisit [Docs](https://nextjs.org) or [Bad](javascript:alert(1)).',
    });
    render(jsx);

    expect(screen.getByRole('heading', { level: 2, name: 'Architecture' })).toBeInTheDocument();

    const safeLink = screen.getByRole('link', { name: 'Docs' });
    expect(safeLink).toHaveAttribute('href', 'https://nextjs.org');
    expect(safeLink).toHaveAttribute('rel', 'noopener noreferrer');

    const badLink = screen.queryByRole('link', { name: 'Bad' });
    expect(badLink).toBeNull();
  });

  it('renders fenced code blocks with language label and copy button', async () => {
    const jsx = await MarkdownRenderer({
      markdown: '```ts\nconst answer: number = 42;\n```',
    });
    render(jsx);

    expect(screen.getByText('ts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
    expect(screen.getByText('answer')).toBeInTheDocument();
  });
});
