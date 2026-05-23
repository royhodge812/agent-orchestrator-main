/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Terminal, HardDrive, Cpu, CheckCircle } from "lucide-react";
import { Agent } from "../types";

interface AgentProps {
  agents: Agent[];
}

export default function AgentCard({ agents }: AgentProps) {
  // Map roles to distinctive color palettes
  const getAgentTheme = (id: string) => {
    switch (id) {
      case "architect":
        return {
          bg: "bg-zinc-900/10",
          border: "border-zinc-800 hover:border-indigo-500/50",
          badgeBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
          avatarBg: "bg-indigo-505/10 bg-indigo-550/10 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30",
          accentColor: "text-indigo-400 font-mono"
        };
      case "coder":
        return {
          bg: "bg-zinc-900/10",
          border: "border-zinc-800 hover:border-indigo-500/50",
          badgeBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
          avatarBg: "bg-indigo-500/15 text-indigo-200 border border-indigo-500/30",
          accentColor: "text-indigo-400 font-mono"
        };
      case "qa":
        return {
          bg: "bg-zinc-900/10",
          border: "border-zinc-800 hover:border-emerald-500/50",
          badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
          avatarBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
          accentColor: "text-emerald-400 font-mono"
        };
      case "devops":
        return {
          bg: "bg-zinc-900/10",
          border: "border-zinc-800 hover:border-indigo-500/40",
          badgeBg: "bg-zinc-800 text-zinc-300 border border-zinc-700",
          avatarBg: "bg-zinc-800 text-zinc-400 border border-zinc-705 border-zinc-700",
          accentColor: "text-zinc-300 font-mono"
        };
      default:
        return {
          bg: "bg-zinc-900/10",
          border: "border-zinc-800",
          badgeBg: "bg-zinc-800 text-zinc-300 border border-zinc-700",
          avatarBg: "bg-zinc-800 text-zinc-400",
          accentColor: "text-zinc-400"
        };
    }
  };

  const getStatusBadge = (status: Agent["status"]) => {
    switch (status) {
      case "IDLE":
        return <span className="px-1.5 py-0.5 rounded-sm text-[9px] uppercase font-mono tracking-wider font-semibold border bg-zinc-950 text-zinc-500 border-zinc-905 border-zinc-800">Idle</span>;
      case "PLANNING":
        return <span className="px-1.5 py-0.5 rounded-sm text-[9px] uppercase font-mono tracking-wider font-semibold border bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse">Planning</span>;
      case "CODING":
        return <span className="px-1.5 py-0.5 rounded-sm text-[9px] uppercase font-mono tracking-wider font-semibold border bg-indigo-500/10 text-indigo-350 text-indigo-405 text-indigo-300 border-indigo-500/20 animate-pulse">Coding</span>;
      case "TESTING":
        return <span className="px-1.5 py-0.5 rounded-sm text-[9px] uppercase font-mono tracking-wider font-semibold border bg-indigo-500/10 text-indigo-300 border-indigo-500/20 animate-pulse">Testing</span>;
      case "DEPLOYING":
        return <span className="px-1.5 py-0.5 rounded-sm text-[9px] uppercase font-mono tracking-wider font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse">Deploying</span>;
    }
  };

  return (
    <div id="agent-workspace-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {agents.map((agent) => {
        const theme = getAgentTheme(agent.id);
        const isActive = agent.status !== "IDLE";
        
        return (
          <div
            key={agent.id}
            id={`agent-card-${agent.id}`}
            className={`bg-zinc-900/20 border ${theme.border} rounded p-5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden`}
          >
            {/* Background glowing indicator if active */}
            {isActive && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            )}

            <div id={`agent-header-${agent.id}`}>
              {/* Profile Bar */}
              <div id={`agent-profile-${agent.id}`} className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div id={`avatar-container-${agent.id}`} className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold font-mono text-xs ${theme.avatarBg}`}>
                    {agent.avatar}
                  </div>
                  <div>
                    <h4 id={`name-${agent.id}`} className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 leading-none uppercase font-mono tracking-tight">
                      {agent.name}
                      {isActive && <Sparkles className="w-3 h-3 text-indigo-455 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />}
                    </h4>
                    <p id={`role-${agent.id}`} className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">{agent.role}</p>
                  </div>
                </div>
                <div id={`badge-state-${agent.id}`}>
                  {getStatusBadge(agent.status)}
                </div>
              </div>

              {/* Cognitive dialogues log box */}
              <div id={`agent-dialogue-container-${agent.id}`} className="bg-zinc-950 border border-zinc-800/80 rounded p-3 min-h-[90px] mb-4 flex flex-col justify-between relative shadow-inner">
                <div className="absolute top-2 right-2 text-zinc-800">
                  <Terminal className="w-3 h-3" />
                </div>
                <p id={`dialogue-text-${agent.id}`} className="text-xs text-zinc-350 text-zinc-400 font-mono italic leading-relaxed">
                  "{agent.dialogue}"
                </p>
                <div id={`current-task-bar-${agent.id}`} className="mt-3 border-t border-zinc-900/85 pt-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold block">Current Task</label>
                  <p id={`task-value-${agent.id}`} className={`text-[10px] mt-0.5 truncate font-medium font-mono ${isActive ? theme.accentColor : "text-zinc-500"}`}>
                    {agent.currentTask}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Node Stats */}
            <div id={`agent-stats-${agent.id}`} className="border-t border-zinc-900 pt-3 mt-1 font-mono">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase tracking-wider font-semibold">Allocated Memory</span>
                  <span id={`stats-mem-${agent.id}`} className="text-[10px] font-mono font-medium text-zinc-400 flex items-center gap-1 mt-0.5">
                    <HardDrive className="w-3 h-3 text-zinc-650 text-zinc-600" />
                    {agent.stats.memoryUsage} MB
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase tracking-wider font-semibold">Instance CPU</span>
                  <span id={`stats-cpu-${agent.id}`} className="text-[10px] font-mono font-medium text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Cpu className="w-3 h-3 text-zinc-650 text-zinc-600" />
                    {agent.stats.cpuUsage}%
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-zinc-500 block uppercase tracking-wider font-semibold">Yield Records</span>
                  <span id={`stats-yield-${agent.id}`} className="text-[10px] font-mono font-medium text-zinc-400 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    <span>{agent.stats.tasksCompleted} tasks / {agent.stats.codeLinesWritten} LOC</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
