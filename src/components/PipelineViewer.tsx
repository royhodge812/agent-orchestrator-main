/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { PlayCircle, ShieldCheck, Timer, FileTerminal, Ban, Loader2, CheckCircle2 } from "lucide-react";
import { PipelineRun, PipelineStep } from "../types";

interface PipelineProps {
  pipelines: PipelineRun[];
  activeRunId: string | null;
}

export default function PipelineViewer({ pipelines, activeRunId }: PipelineProps) {
  // Find currently evaluated pipeline
  const activeRun = pipelines.find((p) => p.id === activeRunId) || pipelines[0];
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  // Default to first stage or active running stage
  const currentStepId = selectedStepId || activeRun?.steps[0]?.id || "checkout";
  const activeStep = activeRun?.steps.find((s) => s.id === currentStepId) || activeRun?.steps[0];

  useEffect(() => {
    // Scroll terminal container to bottom automatically when active logs update
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeStep?.logs]);

  if (!activeRun) {
    return (
      <div id="pipeline-viewer-empty" className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full">
        <Ban className="w-8 h-8 text-slate-600 mb-2" />
        <p className="text-slate-400 font-mono text-xs">No active pipeline instances loaded in workspace.</p>
      </div>
    );
  }

  // Formatting helpers for styles
  const getStepStatusStyle = (status: PipelineStep["status"]) => {
    switch (status) {
      case "COMPLETED":
        return {
          border: "border-emerald-500 bg-zinc-950",
          text: "text-emerald-450 text-emerald-400",
          desc: "text-emerald-300/80",
          dot: "bg-emerald-500",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        };
      case "RUNNING":
        return {
          border: "border-indigo-500 bg-zinc-950",
          text: "text-indigo-400",
          desc: "text-indigo-305/80",
          dot: "bg-indigo-500 animate-ping",
          icon: <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
        };
      case "FAILED":
        return {
          border: "border-rose-500 bg-zinc-950",
          text: "text-rose-400",
          desc: "text-rose-300/80",
          dot: "bg-rose-500",
          icon: <Ban className="w-4 h-4 text-rose-400" />
        };
      case "PENDING":
      default:
        return {
          border: "border-zinc-805 border-zinc-800 bg-zinc-950",
          text: "text-zinc-500",
          desc: "text-zinc-600",
          dot: "bg-zinc-800",
          icon: <div className="w-3.5 h-3.5 bg-zinc-800 rounded-full" />
        };
    }
  };

  const getRunStatusStyle = (status: PipelineRun["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      case "RUNNING":
        return "bg-indigo-500/10 text-indigo-350 text-indigo-300 border border-indigo-500/30";
      case "FAILED":
        return "bg-rose-500/10 text-rose-455 text-rose-400 border border-rose-500/30";
      case "PENDING":
      default:
        return "bg-zinc-800/50 text-zinc-500 border border-zinc-800";
    }
  };

  return (
    <div id="pipeline-viewer-panel" className="bg-zinc-900/40 border border-zinc-800 rounded p-6 shadow-2xl h-full flex flex-col justify-between">
      {/* Top Details */}
      <div id="pipeline-header">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-semibold text-zinc-100 font-sans text-base leading-none">CI/CD Automated Workflow Pipeline</h3>
              <p className="text-[10px] text-zinc-400 font-mono mt-1">Ref: {activeRun.ref} • Commit ID {activeRun.commitSha}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span id="pipeline-status-badge" className={`px-2.5 py-0.5 rounded-sm lg:rounded text-[10px] font-mono border font-semibold tracking-wider ${getRunStatusStyle(activeRun.status)}`}>
              {activeRun.status}
            </span>
            <div id="pipeline-mttm" className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 border border-zinc-800 rounded">
              <Timer className="w-3.5 h-3.5 text-zinc-500" />
              Runtime: {activeRun.steps.reduce((sum, s) => sum + s.duration, 0).toFixed(1)}s
            </div>
          </div>
        </div>

        {/* Tactical pipelines steps workflow */}
        <div id="pipeline-steps-horizontal" className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {activeRun.steps.map((step) => {
            const stepStyle = getStepStatusStyle(step.status);
            const isSelected = step.id === currentStepId;
            
            return (
              <button
                key={step.id}
                id={`pipeline-step-btn-${step.id}`}
                onClick={() => setSelectedStepId(step.id)}
                className={`py-3 px-2 rounded border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between h-[85px] relative ${
                  isSelected ? "bg-zinc-950 border-indigo-500/50 shadow-inner" : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950/20"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 w-full">
                  <span className={`w-2.5 h-2.5 rounded-sm ${stepStyle.dot}`} style={{ width: "8px", height: "8px" }} />
                  <span className="text-[10px] font-mono text-zinc-500">{step.duration.toFixed(1)}s</span>
                </div>

                <div className="mt-1">
                  <p className="text-[11px] font-semibold text-zinc-200 truncate leading-none">
                    {step.name}
                  </p>
                  <p className={`text-[9px] font-mono mt-1 ${stepStyle.text} uppercase font-bold tracking-wider`}>
                    {step.status}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Embedded Terminal Output Emulator */}
      <div id="pipeline-terminal-console" className="flex-1 min-h-[220px] bg-zinc-950 border border-zinc-900 rounded p-4 flex flex-col justify-between font-mono relative overflow-hidden shadow-inner">
        <div id="terminal-topbar" className="flex items-center justify-between border-b border-zinc-905 border-zinc-900 pb-2 mb-3">
          <span className="text-[11px] text-zinc-400 font-bold tracking-wide flex items-center gap-1.5 uppercase">
            <FileTerminal className="w-3.5 h-3.5 text-zinc-500" />
            STDOUT: {activeStep?.name || "Pipeline Process Logs"}
          </span>
          <div className="flex items-center gap-1">
            <span className="w-2 rounded-sm h-2 bg-zinc-800" />
            <span className="w-2 rounded-sm h-2 bg-zinc-800" />
            <span className="w-2 rounded-sm h-2 bg-zinc-800" />
          </div>
        </div>

        {/* Scrollable logs body */}
        <div id="terminal-interactive-screen" className="flex-1 overflow-y-auto max-h-[170px] space-y-1.5 pr-2 select-text selection:bg-indigo-500/20">
          {activeStep?.logs && activeStep.logs.length > 0 ? (
            activeStep.logs.map((log, idx) => {
              let tagColor = "text-zinc-400";
              if (log.includes("[SUCCESS]")) tagColor = "text-emerald-450 text-emerald-400 font-bold";
              else if (log.includes("[INFO]")) tagColor = "text-indigo-400";
              else if (log.includes("[WARN]")) tagColor = "text-amber-500 font-semibold";
              else if (log.includes("[ERROR]") || log.includes("[FAILED]")) tagColor = "text-rose-400 font-bold animate-pulse";
              else if (log.startsWith("✔")) tagColor = "text-emerald-400 font-semibold";

              return (
                <div key={idx} className="text-xs leading-relaxed flex items-start gap-2">
                  <span className="text-zinc-600 select-none">{idx + 1}.</span>
                  <p className={tagColor}>{log}</p>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
              No runtime records recorded for this compile window.
            </div>
          )}
          <div ref={consoleEndRef} />
        </div>

        {/* Sandbox Status Bar overlay */}
        <div id="terminal-bottom-overlay" className="border-t border-zinc-900 pt-2.5 mt-3 flex items-center justify-between text-[11px] text-zinc-650 text-zinc-500">
          <span className="flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Vortex-Engine Sandbox
          </span>
          <span id="compiler-port-ver">Vortex Compiler Ready</span>
        </div>
      </div>
    </div>
  );
}
