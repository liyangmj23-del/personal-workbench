import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ content, emptyLabel = "*empty*" }: { content: string; emptyLabel?: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || emptyLabel}</ReactMarkdown>
    </div>
  );
}
