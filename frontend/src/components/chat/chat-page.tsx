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

    const nextMessages = [...messages, userMessage, assistantMessage];
    setMessages(nextMessages);
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
    <main className="container py-6">
      <Card className="mx-auto flex h-[85vh] max-w-5xl flex-col overflow-hidden">
        <header className="border-b bg-white p-4">
          <h1 className="text-lg font-semibold">assistant-ui inspired Agent Console</h1>
          <p className="text-sm text-muted-foreground">Streaming LangChain + Bedrock responses with live tool steps</p>
        </header>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={`${message.role}-${index}`} message={message} />
            ))}
            {isLoading ? <p className="text-xs text-muted-foreground">Assistant is reasoning...</p> : null}
            <ToolSteps steps={toolSteps} />
            {error ? (
              <div className="flex items-center rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="mr-2 h-4 w-4" />
                {error}
              </div>
            ) : null}
          </div>
        </ScrollArea>

        <ChatInput value={input} onChange={setInput} onSend={sendMessage} onClear={clearConversation} isLoading={isLoading} />
      </Card>
    </main>
  );
}
