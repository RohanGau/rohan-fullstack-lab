'use client';

import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components: Components = {
  // Image component for CDN and external images
  // Using span wrapper to avoid <figure> inside <p> hydration error
  img: ({ src, alt, ...props }) => (
    <span className="block my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || ''}
        className="rounded-lg border shadow-sm w-full max-w-2xl mx-auto"
        loading="lazy"
        {...props}
      />
      {alt && <span className="block mt-2 text-center text-sm text-muted-foreground">{alt}</span>}
    </span>
  ),
  h1: ({ children, ...props }) => (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6" {...props}>
      {children}
    </p>
  ),
  a: ({ children, ...props }) => (
    <a className="font-medium text-primary underline underline-offset-4" {...props}>
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic" {...props}>
      {children}
    </blockquote>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="list-item" {...props}>
      {children}
    </li>
  ),

  /** KEY FIXES FOR CODE BLOCKS **/
  pre: ({ children, ...props }) => (
    <pre className="mt-6 overflow-x-auto rounded-lg border bg-slate-900 p-4" {...props}>
      {children}
    </pre>
  ),
  code: ({
    inline,
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
    if (inline) {
      return (
        <code
          className={`rounded bg-muted px-1 py-0.5 font-mono text-sm ${className ?? ''}`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={`font-mono text-sm text-slate-50 ${className ?? ''}`} {...props}>
        {children}
      </code>
    );
  },
  table: ({ children, ...props }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="[&>tr]:border-b" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className="[&>tr:last-child]:border-0" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="m-0 border-t p-0 even:bg-muted" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    >
      {children}
    </td>
  ),
};

interface MarkdownRendererProps {
  markdown: string;
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {markdown}
    </ReactMarkdown>
  );
}
