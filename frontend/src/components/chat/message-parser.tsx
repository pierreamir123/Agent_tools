import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, FileJson, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MessageParserProps {
  content: string;
  className?: string;
}

export function MessageParser({ content, className }: MessageParserProps): JSX.Element {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Attempt to detect if the whole content is JSON
  const isJSON = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      return typeof parsed === "object" && parsed !== null;
    } catch {
      return false;
    }
  };

  const formattedJSON = (str: string) => {
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  };

  if (isJSON(content)) {
    return (
      <div className={cn("group relative animate-fade-in-up", className)}>
        <div className="flex items-center justify-between rounded-t-xl border border-white/10 bg-white/5 px-4 py-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/80">
            <FileJson className="h-3.5 w-3.5" />
            JSON Data
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 w-7 p-0 text-slate-400 hover:text-white"
          >
            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-b-xl border-x border-b border-white/10 bg-black/40 p-4 text-xs font-mono text-slate-300">
          <code>{formattedJSON(content)}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className={cn("prose prose-sm prose-invert max-w-none group relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute right-0 top-0 z-10 opacity-0 transition-opacity group-hover:opacity-100 h-8 w-8 p-0 text-slate-400 hover:text-white"
      >
        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <div className="my-4 rounded-xl border border-white/10 bg-slate-900/50 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {match ? match[1] : "code"}
                  </span>
                </div>
                <div className="overflow-x-auto p-4">
                  <code className={cn("text-slate-200", className)} {...props}>
                    {children}
                  </code>
                </div>
              </div>
            ) : (
              <code className={cn("rounded bg-white/10 px-1 py-0.5 font-medium text-primary", className)} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
