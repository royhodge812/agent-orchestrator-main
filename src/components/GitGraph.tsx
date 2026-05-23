/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { GitBranch, GitCommit, Copy, HelpCircle } from "lucide-react";
import { Commit } from "../types";

interface GitGraphProps {
  commits: Commit[];
  onCommitClick?: (commit: Commit) => void;
}

export default function GitGraph({ commits, onCommitClick }: GitGraphProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Branch coloring helper
  const getBranchBadgeColor = (branchName: string) => {
    if (branchName === "main") {
      return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
    }
    if (branchName.startsWith("feature/auth-")) {
      return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
    }
    if (branchName.startsWith("feature/db-")) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    return "bg-zinc-800 text-zinc-350 border-zinc-700";
  };

  const getConnectorColor = (branchName: string) => {
    if (branchName === "main") return "bg-indigo-505 bg-indigo-500";
    if (branchName.startsWith("feature/auth-")) return "bg-indigo-500";
    if (branchName.startsWith("feature/db-")) return "bg-emerald-500";
    return "bg-zinc-700";
  };

  return (
    <div id="git-graph-panel" className="bg-zinc-900/40 border border-zinc-800 rounded p-6 shadow-2xl h-full flex flex-col justify-between">
      <div id="git-graph-header">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-zinc-100 font-sans text-base leading-none">Repository Branch Tree</h3>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5" />
            Graph Trace
          </span>
        </div>

        <p className="text-xs text-zinc-400 mb-6 font-sans">
          Real-time branch state demonstrating automated merges and direct agent edits on active remote branches.
        </p>

        {/* Git Nodes List */}
        <div id="git-commit-list-container" className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
          {commits.map((commit, index) => {
            const isMain = commit.branch === "main";
            const bulletColor = isMain ? "border-indigo-500 bg-zinc-950" : "border-emerald-400 bg-zinc-950";
            
            return (
              <div
                key={commit.id}
                id={`git-commit-node-${commit.id}`}
                onClick={() => onCommitClick && onCommitClick(commit)}
                className="group flex gap-4 items-start relative cursor-pointer hover:bg-zinc-950/40 p-2.5 rounded border border-transparent hover:border-zinc-800 transition-all duration-200"
              >
                {/* Visual Branch Line Graphics */}
                <div className="flex flex-col items-center h-full pt-1.5 shrink-0">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 ${bulletColor} z-10 flex items-center justify-center`}
                  >
                    {commit.isMerge && (
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    )}
                  </div>
                  {index < commits.length - 1 && (
                    <div
                      className={`w-[2px] h-[70px] absolute top-8 bottom-0 left-[15px] ${getConnectorColor(commit.branch)} opacity-30 z-0`}
                    />
                  )}
                </div>

                {/* Commit Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span id={`commit-branch-tag-${commit.id}`} className={`px-2 py-0.5 rounded-sm text-[9px] font-mono border font-medium ${getBranchBadgeColor(commit.branch)}`}>
                      {commit.branch}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">{commit.timestamp}</span>
                  </div>

                  <p id={`commit-msg-${commit.id}`} className="text-xs text-zinc-250 text-zinc-300 font-sans font-medium mt-1.5 line-clamp-2 leading-relaxed">
                    {commit.message}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    {/* Author */}
                    <div className="flex items-center gap-1.5 font-mono">
                      <div className="w-5 h-5 rounded-sm bg-zinc-800 flex items-center justify-center font-bold text-[9px] text-indigo-400 border border-zinc-700">
                        {commit.authorAvatar}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-medium">{commit.author}</span>
                    </div>

                    {/* SHA block */}
                    <div className="flex items-center gap-1 bg-zinc-950 px-1.5 py-0.5 rounded-sm border border-zinc-800 font-mono text-[10px]">
                      <span id={`commit-sha-${commit.id}`} className="text-zinc-400 font-semibold">{commit.id}</span>
                      <button
                        title="Copy Commit ID"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(commit.id);
                        }}
                        className="text-zinc-650 text-zinc-650 text-zinc-600 hover:text-zinc-400 p-0.5 transition-colors"
                      >
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      <div id="git-graph-legend" className="border-t border-zinc-900 pt-3 mt-4">
        <label className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block mb-2">Graph Legend</label>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-sm" />
            main (Stable)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 bg-indigo-500 opacity-60 rounded-sm" />
            authorisation
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
            features/claims
          </div>
        </div>
      </div>
    </div>
  );
}
