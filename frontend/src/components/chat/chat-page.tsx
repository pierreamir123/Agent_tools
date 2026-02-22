import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage } from "@/components/chat/chat-message";
import { ToolSteps } from "@/components/chat/tool-steps";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { streamChat, type ChatMessage as ChatMessageType, type ToolStep } from "@/lib/api";

export function ChatPage(): JSX.Element {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [toolSteps, setToolSteps] = useState<ToolStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  const clearConversation = (): void => {
    setMessages([]);
    setToolSteps([]);
    setError(null);
    setInput("");
  };

  const sendMessage = async (): Promise<void> => {
    if (!canSend) return;

    const userMessage: ChatMessageType = { role: "user", content: input.trim() };
    const assistantMessage: ChatMessageType = { role: "assistant", content: "" };

    const nextMessages = [...messages, userMessage];
    setMessages([...nextMessages, assistantMessage]);
    setToolSteps([]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      await streamChat(nextMessages, {
        onToken: (token) => {
          setMessages((prev) => {
            const clone = [...prev];
            const last = clone[clone.length - 1];
            clone[clone.length - 1] = { ...last, content: `${last.content}${token}` };
            return clone;
          });
        },
        onToolStep: (step) => {
          setToolSteps((prev) => {
            const existingIndex = prev.findIndex((s) => s.id === step.id);
            if (existingIndex === -1) return [...prev, step];
            const clone = [...prev];
            clone[existingIndex] = step;
            return clone;
          });
        },
        onDone: () => {
          setIsLoading(false);
        }
      });
    } catch (streamError) {
      setError(streamError instanceof Error ? streamError.message : "Unknown stream error");
      setIsLoading(false);
    }
  };

  return (
    <main className="container min-h-screen py-8 md:py-12">
      <div className="mx-auto flex h-[85vh] max-w-5xl flex-col overflow-hidden rounded-[2rem] glass-panel shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-6">
          <div>
            <h1 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent">
              Agent Console
            </h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Bedrock reasoning enabled
              </p>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 px-4 md:px-8 py-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="flex h-[40vh] flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-6 glow-pulse">
                  <div className="h-12 w-12 text-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8V4H8" />
                      <rect width="16" height="12" x="4" y="8" rx="2" />
                      <path d="M2 14h2" />
                      <path d="M20 14h2" />
                      <path d="M15 13v2" />
                      <path d="M9 13v2" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl font-semibold">How can I help you today?</h2>
                <p className="mt-2 text-muted-foreground">Start a conversation with your intelligent agent.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <ChatMessage key={`${message.role}-${index}`} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex animate-pulse items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                Thinking...
              </div>
            )}
            <ToolSteps steps={toolSteps} />
            {error ? (
              <div className="flex items-center rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive shadow-lg backdrop-blur-md">
                <AlertTriangle className="mr-3 h-5 w-5" />
                {error}
              </div>
            ) : null}
          </div>
        </ScrollArea>

        <ChatInput value={input} onChange={setInput} onSend={sendMessage} onClear={clearConversation} isLoading={isLoading} />
      </div>
    </main>
  );
}

