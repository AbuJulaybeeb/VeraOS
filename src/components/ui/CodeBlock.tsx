import React, { useState } from "react";
import { cn } from "../../lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  filename,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-xl bg-surface-container-lowest border border-white/10 overflow-hidden shadow-2xl font-code-sm text-code-sm",
        className
      )}
    >
      {(filename || language) && (
        <div className="bg-surface-container-high/90 border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="font-code-sm font-medium">{filename || language}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-code-sm px-2 py-0.5 rounded hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied ? "check" : "content_copy"}
            </span>
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      )}
      <div className="p-4 overflow-x-auto text-on-surface-variant leading-relaxed">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
