import { Badge } from "@/components/ui/badge";
import type { ToolStep } from "@/lib/api";
import { Activity, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToolSteps({ steps }: { steps: ToolStep[] }): JSX.Element | null {
  if (!steps.length) return null;
  return (
    <div className="animate-fade-in-up space-y-4 rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Activity className="h-3.5 w-3.5 animate-pulse" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary/80">Trace execution</p>
      </div>
      
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:bg-white/[0.05]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Terminal className="h-4 w-4 text-primary" />
                {step.toolName}
              </div>
              <Badge variant={step.status === "completed" ? "secondary" : "default"} className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                step.status === "started" && "animate-pulse bg-primary/20 text-primary"
              )}>
                {step.status}
              </Badge>
            </div>
            
            <div className="mt-3 space-y-2">
              <div className="rounded-lg bg-black/20 p-2 text-xs font-mono text-slate-400">
                <span className="text-primary/60">Input:</span> {step.input}
              </div>
              {step.output && (
                <div className="rounded-lg bg-primary/5 p-2 text-xs font-mono text-slate-300">
                  <span className="text-primary">Output:</span> {step.output}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


