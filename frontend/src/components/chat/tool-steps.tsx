import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ToolStep } from "@/lib/api";
import { Terminal, Activity } from "lucide-react";
import { MessageParser } from "./message-parser";

export function ToolSteps({ steps }: { steps: ToolStep[] }): JSX.Element {

  if (steps.length === 0) return <></>;

  return (
    <div className="my-6 space-y-4">
      <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-widest text-slate-500">
        <Activity className="h-3.5 w-3.5" />
        Execution Trace
      </div>
      
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-sm transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.04]">
            <div className="flex items-center justify-between bg-white/5 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-inner">
                  <Terminal className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-slate-200">{step.toolName}</span>
              </div>
              <Badge 
                variant={step.status === "completed" ? "secondary" : "default"}
                className={cn(
                  "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                  step.status === "started" && "animate-pulse"
                )}
              >
                {step.status}
              </Badge>
            </div>
            
            <div className="space-y-3 p-4">
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Input</div>
                <MessageParser content={step.input} className="!prose-xs" />
              </div>
              {step.output && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Output</div>
                  <MessageParser content={step.output} className="!prose-xs" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
