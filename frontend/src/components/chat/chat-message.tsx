import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/api";

export function ChatMessage({ message }: { message: ChatMessageType }): JSX.Element {
  const isAssistant = message.role === "assistant";
  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
      <div className={cn("max-w-3xl rounded-lg p-3", isAssistant ? "bg-white border" : "bg-primary text-primary-foreground")}>
        {isAssistant ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap m-0">{message.content}</p>
        )}
      </div>
    </div>
  );
}
