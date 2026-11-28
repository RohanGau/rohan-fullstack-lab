import React from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import type { Element, Root, RootContent } from 'hast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import { toJsxRuntime, type Components } from 'hast-util-to-jsx-runtime';
import { highlightCodeTokens } from '@/lib/server/shikiHighlighter';
import { CodeCopyButton } from './CodeCopyButton';

const SAFE_PROTOCOL = /^(https?|ircs?|mailto|xmpp):/i;

function sanitizeUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const colonIdx = trimmed.indexOf(':');
  const slashIdx = trimmed.indexOf('/');
  const questionIdx = trimmed.indexOf('?');
  const hashIdx = trimmed.indexOf('#');

  if (
    colonIdx === -1 ||
    (slashIdx !== -1 && colonIdx > slashIdx) ||
    (questionIdx !== -1 && colonIdx > questionIdx) ||
    (hashIdx !== -1 && colonIdx > hashIdx)
  ) {
    return trimmed;
  }

  return SAFE_PROTOCOL.test(trimmed) ? trimmed : '';
}

function extractHastText(node: Root | RootContent): string {
  if (node.type === 'text') return node.value;
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map(extractHastText).join('');
  }
  return '';
}

function collectPreNodes(node: Root | Element, out: Element[] = []): Element[] {
  for (const child of node.children) {
    if (child.type === 'element') {
      if (child.tagName === 'pre') {
        out.push(child);
      } else {
        collectPreNodes(child, out);
      }
    }
  }
  return out;
}

type HighlightedData = {
  code: string;
  language?: string;
  highlighted: Awaited<ReturnType<typeof highlightCodeTokens>>;
};

function CodeBlock({ code, language, highlighted }: HighlightedData) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border bg-[#24292e] text-slate-50">
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-300">
        <span className="font-mono uppercase tracking-wide">{language || 'code'}</span>
        <CodeCopyButton code={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-sm font-mono leading-relaxed">
        <code>
          {highlighted
            ? highlighted.tokens.map((line, lineIdx) => (
                <React.Fragment key={lineIdx}>
                  {line.map((token, tokenIdx) => (
                    <span key={tokenIdx} style={token.color ? { color: token.color } : undefined}>
                      {token.content}
                    </span>
                  ))}
                  {lineIdx < highlighted.tokens.length - 1 ? '\n' : null}
                </React.Fragment>
              ))
            : code}
        </code>
      </pre>
    </div>
  );
}

const baseComponents: Partial<Components> = {
  // Using span wrapper to avoid <figure> inside <p> hydration error
  img: ({ src, alt, ...props }) => {
    const safeSrc = sanitizeUrl(src);
    if (!safeSrc) return null;
    return (
      <span className="block my-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={safeSrc}
          alt={alt || ''}
          className="rounded-lg border shadow-sm w-full max-w-2xl mx-auto"
          loading="lazy"
          decoding="async"
          {...props}
        />
        {alt && <span className="block mt-2 text-center text-sm text-muted-foreground">{alt}</span>}
      </span>
    );
  },
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
  a: ({ href, children, ...props }) => {
    const safeHref = sanitizeUrl(href);
    const isExternal = /^https?:\/\//i.test(safeHref);
    return (
      <a
        href={safeHref || undefined}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="font-medium text-primary underline underline-offset-4"
        {...props}
      >
        {children}
      </a>
    );
  },
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
  code: ({ className, children, ...props }) => (
    <code
      className={`rounded bg-muted px-1.5 py-0.5 font-mono text-sm ${className ?? ''}`}
      {...props}
    >
      {children}
    </code>
  ),
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

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);

interface MarkdownRendererProps {
  markdown: string;
}

export async function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const mdast = processor.parse(markdown || '');
  const hast = (await processor.run(mdast)) as Root;

  const preNodes = collectPreNodes(hast);
  const blockMap = new Map<string, HighlightedData>();

  await Promise.all(
    preNodes.map(async (preNode, idx) => {
      const codeChild = preNode.children.find(
        (c): c is Element => c.type === 'element' && c.tagName === 'code'
      );
      const classList = codeChild?.properties?.className;
      const classes = Array.isArray(classList)
        ? classList.map(String).join(' ')
        : typeof classList === 'string'
          ? classList
          : '';
      const langMatch = /language-([\w-]+)/.exec(classes);
      const language = langMatch?.[1];
      const rawCode = extractHastText(codeChild ?? preNode).replace(/\n$/, '');
      const highlighted = await highlightCodeTokens(rawCode, language);
      const id = `code-block-${idx}`;
      preNode.properties = { ...preNode.properties, 'data-code-id': id };
      blockMap.set(id, { code: rawCode, language, highlighted });
    })
  );

  const components: Partial<Components> = {
    ...baseComponents,
    pre: (props) => {
      const id = (props as Record<string, unknown>)['data-code-id'];
      if (typeof id === 'string') {
        const entry = blockMap.get(id);
        if (entry) {
          return <CodeBlock {...entry} />;
        }
      }
      return <pre {...props} />;
    },
  };

  return toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
    components,
  });
}
