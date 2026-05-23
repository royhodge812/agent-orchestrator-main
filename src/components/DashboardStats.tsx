/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Cpu, Database, GitMerge, FileCheck, Layers, Gauge } from "lucide-react";
import { Agent } from "../types";

interface StatsProps {
  agents: Agent[];
  prCount: number;
  commitCount: number;
}

export default function DashboardStats({ agents, prCount, commitCount }: StatsProps) {
  const [systime, setSystime] = useState(new Date().toISOString());
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSystime(new Date().toISOString());
      setTicks((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate dynamic stats
  const activeAgentCount = agents.filter(a => a.status !== "IDLE").length;
  const totalCompletedTasks = agents.reduce((sum, a) => sum + a.stats.tasksCompleted, 0);
  const totalWrittenLines = agents.reduce((sum, a) => sum + a.stats.codeLinesWritten, 0);

  // Fluctuating hardware indicators
  const baseCpu = 24 + (activeAgentCount * 18);
  const cpuPercent = Math.min(98, Math.max(8, Math.round(baseCpu + Math.sin(ticks * 0.4) * 6)));
  const memoryUsageGb = (2.4 + (activeAgentCount * 0.6) + Math.cos(ticks * 0.1) * 0.15).toFixed(2);

  return (
    <div id="dashboard-stats-grid" className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {/* Metric 1 */}
      <div id="stat-card-workforce" className="bg-zinc-900/40 border border-zinc-800 rounded p-5 hover:border-indigo-500/40 transition-colors flex items-start justify-between">
        <div id="workforce-content">
          <p id="workforce-label" className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Workforce Status</p>
          <h3 id="workforce-val" className="text-xl font-bold font-mono text-zinc-100 mt-2 flex items-baseline gap-2">
            {activeAgentCount > 0 ? `${activeAgentCount} Active` : "All Idle"}
            <span id="workforce-sub" className="text-xs font-normal text-zinc-500">/ 04 ONLINE</span>
          </h3>
          <p id="workforce-subtext" className="text-[11px] text-zinc-400 mt-2.5 flex items-center gap-1.5 font-mono">
            <span className={`inline-block w-2 bg-emerald-500 rounded-full animate-pulse`} style={{ width: "8px", height: "8px" }} />
            Core nominal state active
          </p>
        </div>
        <div id="workforce-icon" className="p-2.5 bg-zinc-900 border border-zinc-800 text-indigo-400 rounded">
          <Gauge id="icon-gauge" className="w-4 h-4 animate-pulse" />
        </div>
      </div>

      {/* Metric 2 */}
      <div id="stat-card-prs" className="bg-zinc-900/40 border border-zinc-800 rounded p-5 hover:border-indigo-500/40 transition-colors flex items-start justify-between">
        <div id="prs-content">
          <p id="prs-label" className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Repository State</p>
          <h3 id="prs-val" className="text-xl font-bold font-mono text-zinc-100 mt-2 flex items-baseline gap-2">
            {prCount} Open PRs
            <span id="commits-sub" className="text-xs font-normal text-zinc-500">/ {commitCount} COMMITS</span>
          </h3>
          <p id="prs-subtext" className="text-[11px] text-zinc-400 mt-2.5 font-mono">
            MTTM metric: <span className="text-indigo-400 font-semibold font-mono">14.5m</span>
          </p>
        </div>
        <div id="prs-icon" className="p-2.5 bg-zinc-900 border border-zinc-800 text-indigo-400 rounded">
          <GitMerge id="icon-merge" className="w-4 h-4" />
        </div>
      </div>

      {/* Metric 3 */}
      <div id="stat-card-productivity" className="bg-zinc-900/40 border border-zinc-800 rounded p-5 hover:border-emerald-500/40 transition-colors flex items-start justify-between">
        <div id="productivity-content">
          <p id="productivity-label" className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Cumulative Yield</p>
          <h3 id="productivity-val" className="text-xl font-bold font-mono text-zinc-100 mt-2 flex items-baseline gap-2">
            {totalCompletedTasks} Tasks
            <span id="lines-sub" className="text-xs font-normal text-zinc-500">/ {totalWrittenLines.toLocaleString()} LOC</span>
          </h3>
          <p id="productivity-subtext" className="text-[11px] text-zinc-400 mt-2.5 font-mono">
            Test Coverage: <span className="text-emerald-450 font-semibold font-mono text-emerald-400">98.4%</span>
          </p>
        </div>
        <div id="productivity-icon" className="p-2.5 bg-zinc-900 border border-zinc-800 text-emerald-500 rounded">
          <FileCheck id="icon-check" className="w-4 h-4" />
        </div>
      </div>

      {/* Metric 4 */}
      <div id="stat-card-cluster" className="bg-zinc-900/40 border border-zinc-800 rounded p-5 hover:border-amber-500/40 transition-colors flex items-start justify-between">
        <div id="cluster-content" className="w-full">
          <p id="cluster-label" className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Core Telemetry</p>
          <h3 id="cluster-val" className="text-xs font-semibold font-mono text-zinc-300 mt-3 flex items-center justify-between font-mono">
            <span>Cluster CPU:</span>
            <span className="text-amber-500 font-bold">{cpuPercent}%</span>
          </h3>
          <div id="cluster-cpu-bar-bg" className="w-full bg-zinc-850 h-1 mt-1 rounded overflow-hidden">
            <div id="cluster-cpu-bar-fill" className="bg-amber-550 h-full bg-amber-550 bg-amber-550 bg-amber-500 transition-all duration-300" style={{ width: `${cpuPercent}%` }} />
          </div>
          <h3 id="cluster-mem-val" className="text-[10px] font-mono text-zinc-500 mt-2 flex items-center justify-between">
            <span>Memory Pool:</span>
            <span className="text-zinc-300 font-medium">{memoryUsageGb} GB / 8.00 GB</span>
          </h3>
        </div>
        <div id="cluster-icon" className="p-2.5 bg-zinc-900 border border-zinc-800 text-amber-550 text-amber-500 rounded ml-3">
          <Cpu id="icon-cpu" className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
