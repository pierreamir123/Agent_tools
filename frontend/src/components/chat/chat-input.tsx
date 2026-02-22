import { Loader2, SendHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSend, onClear, isLoading }: ChatInputProps): JSX.Element {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="relative mx-auto max-w-4xl">
        <div className="group relative flex flex-col gap-2 rounded-2xl bg-white/[0.03] p-2 border border-white/10 transition-all duration-300 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 shadow-inner">
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? Ask your agent..."
            className="min-h-[80px] w-full resize-none border-0 bg-transparent p-3 text-slate-100 placeholder:text-slate-500 focus-visible:ring-0"
          />
          
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={onClear} 
                disabled={isLoading}
                className="h-9 rounded-xl border border-white/5 bg-white/5 text-xs text-muted-foreground hover:bg-white/10"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Clear Chat
              </Button>
            </div>

            <Button 
              size="sm"
              onClick={onSend} 
              disabled={isLoading || !value.trim()}
              className="h-9 px-5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Thinking..." : "Send"}
            </Button>
          </div>
        </div>
        
        <p className="mt-3 text-center text-[10px] font-medium text-slate-500 uppercase tracking-widest">
          Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-sans text-slate-300">Enter</kbd> to send
        </p>
      </div>
    </div>
  );
}

