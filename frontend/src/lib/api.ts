export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ToolStep {
  id: string;
  toolName: string;
  input: string;
  output?: string;
  status: "started" | "completed";
}

export interface StreamHandlers {
  onToken: (token: string) => void;
  onToolStep: (step: ToolStep) => void;
  onDone: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function streamChat(messages: ChatMessage[], handlers: StreamHandlers): Promise<void> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });

  if (!response.ok || !response.body) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const eventChunk of events) {
      const dataLine = eventChunk
        .split("\n")
        .find((line) => line.startsWith("data:"));

      if (!dataLine) continue;
      const payload = JSON.parse(dataLine.replace("data:", "").trim()) as
        | { type: "token"; token: string }
        | { type: "tool"; step: ToolStep }
        | { type: "done" }
        | { type: "error"; error: string };

      if (payload.type === "token") handlers.onToken(payload.token);
      if (payload.type === "tool") handlers.onToolStep(payload.step);
      if (payload.type === "done") handlers.onDone();
      if (payload.type === "error") throw new Error(payload.error);
    }
  }
}
