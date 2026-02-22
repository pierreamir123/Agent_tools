import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/api";
import { Bot, User } from "lucide-react";
import { MessageParser } from "./message-parser";

export function ChatMessage({ message }: { message: ChatMessageType }): JSX.Element {
  const isAssistant = message.role === "assistant";
  return (
    <div className={cn("flex w-full animate-fade-in-up items-start gap-4", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primary shadow-sm backdrop-blur-md">
          <Bot className="h-5 w-5" />
        </div>
      )}
      
      <div className={cn(
        "group relative max-w-[80%] rounded-2xl px-4 py-3 shadow-xl transition-all duration-300",
        isAssistant 
          ? "border border-white/10 bg-white/[0.03] text-slate-200 backdrop-blur-md" 
          : "bg-gradient-to-br from-primary to-indigo-600 text-white"
      )}>
        {isAssistant ? (
          <MessageParser content={message.content} />
        ) : (
          <p className="whitespace-pre-wrap m-0 text-sm md:text-base leading-relaxed">{message.content}</p>
        )}
      </div>

      {!isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 text-white shadow-sm">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}


