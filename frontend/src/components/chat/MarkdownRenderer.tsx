"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        code: ({ children }) => (
          <code className="bg-black/30 px-1 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-black/30 p-2 rounded text-sm font-mono overflow-x-auto my-2">
            {children}
          </pre>
        ),
        ul: ({ children }) => <ul className="my-1 ml-4">{children}</ul>,
        ol: ({ children }) => <ol className="my-1 ml-4">{children}</ol>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-zinc-500 pl-3 my-2 italic">{children}</blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
