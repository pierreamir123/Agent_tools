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
  return (
    <div className="space-y-2 border-t bg-white p-4">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ask your agent to reason, call tools, and stream results..."
        className="min-h-[120px]"
      />
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onClear} disabled={isLoading}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
        <Button onClick={onSend} disabled={isLoading || !value.trim()}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendHorizontal className="mr-2 h-4 w-4" />}
          Send
        </Button>
      </div>
    </div>
  );
}
