import { Badge } from "@/components/ui/badge";
import type { ToolStep } from "@/lib/api";

export function ToolSteps({ steps }: { steps: ToolStep[] }): JSX.Element | null {
  if (!steps.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">Tool Execution</p>
      {steps.map((step) => (
        <div key={step.id} className="rounded-md border bg-white p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{step.toolName}</span>
            <Badge>{step.status}</Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Input: {step.input}</p>
          {step.output ? <p className="mt-1 text-xs text-muted-foreground">Output: {step.output}</p> : null}
        </div>
      ))}
    </div>
  );
}
