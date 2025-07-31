import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ node, ...props }) => (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a className="font-medium text-primary underline underline-offset-4" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="list-item" {...props} />
  ),
  code: ({ node, inline, className, ...props }) => {
    if (inline) {
      return (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props} />
      );
    }
    return (
      <pre className="mt-6 overflow-x-auto rounded-lg border bg-slate-900 p-4">
        <code className="text-sm text-slate-50" {...props} />
      </pre>
    );
  },
  table: ({ node, ...props }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="[&>tr]:border-b" {...props} />,
  tbody: ({ node, ...props }) => <tbody className="[&>tr:last-child]:border-0" {...props} />,
  tr: ({ node, ...props }) => <tr className="m-0 border-t p-0 even:bg-muted" {...props} />,
  th: ({ node, ...props }) => (
    <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
  ),
};

interface MarkdownRendererProps {
  markdown: string;
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {markdown}
    </ReactMarkdown>
  );
}
