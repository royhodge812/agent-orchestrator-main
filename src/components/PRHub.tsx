/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  GitPullRequest, GitMerge, CheckSquare, MessageSquare, 
  FileText, ArrowRight, CornerDownRight, ThumbsUp, Send 
} from "lucide-react";
import { PullRequest } from "../types";

interface PRHubProps {
  pullRequests: PullRequest[];
  onMergePR: (prId: number) => void;
  onPostComment: (prId: number, comment: string) => void;
}

export default function PRHub({ pullRequests, onMergePR, onPostComment }: PRHubProps) {
  const [selectedPRId, setSelectedPRId] = useState<number>(pullRequests[0]?.id || 114);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "MERGED">("ALL");
  const [userComment, setUserComment] = useState("");

  const activePR = pullRequests.find((pr) => pr.id === selectedPRId) || pullRequests[0];

  const filteredPRs = pullRequests.filter((pr) => {
    if (filter === "OPEN") return pr.status === "OPEN";
    if (filter === "MERGED") return pr.status === "MERGED";
    return true;
  });

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    onPostComment(activePR.id, userComment);
    setUserComment("");
  };

  const getPRStatusStyle = (status: PullRequest["status"]) => {
    if (status === "OPEN") {
      return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
    }
    if (status === "MERGED") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    return "bg-zinc-800 text-zinc-400 border-zinc-700";
  };

  // Parses diff lines to colorize added vs deleted logic block
  const renderInteractiveDiff = (diffContent: string) => {
    const lines = diffContent.split("\n");
    return (
      <div className="font-mono text-xs overflow-x-auto whitespace-pre rounded border border-zinc-900 bg-zinc-950 p-4 space-y-0.5 shadow-inner">
        {lines.map((line, idx) => {
          let bgColor = "text-zinc-500";
          if (line.startsWith("+") && !line.startsWith("+++")) {
            bgColor = "bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 px-1";
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            bgColor = "bg-rose-950/40 text-rose-300 border-l-2 border-rose-500 px-1";
          } else if (line.startsWith("@@")) {
            bgColor = "text-indigo-400 font-semibold bg-indigo-950/10";
          } else if (line.startsWith("diff") || line.startsWith("index") || line.startsWith("---") || line.startsWith("+++")) {
            bgColor = "text-zinc-650 text-zinc-600 font-medium";
          }
          return (
            <div key={idx} className={`py-0.5 leading-relaxed tracking-normal ${bgColor}`}>
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div id="pr-hub-panel" className="bg-zinc-900/40 border border-zinc-800 rounded p-6 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      
      {/* Left Column: PR List */}
      <div id="pr-hub-list" className="lg:col-span-4 border-r border-zinc-800/40 pr-0 lg:pr-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitPullRequest className="text-indigo-400 w-5 h-5" />
            <h3 className="font-semibold text-zinc-100 font-sans text-base leading-none">Pull Requests History</h3>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex gap-1.5 mb-4 bg-zinc-950 border border-zinc-850 p-1 rounded font-mono">
          {(["ALL", "OPEN", "MERGED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 text-center py-1 rounded text-[10px] tracking-widest font-bold cursor-pointer transition-all ${
                filter === tab ? "bg-zinc-900 text-indigo-400 border border-zinc-800 shadow" : "text-zinc-550 hover:text-zinc-350 hover:text-zinc-300 text-zinc-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* PR items */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] lg:max-h-[580px] pr-1">
          {filteredPRs.map((pr) => {
            const isSelected = pr.id === selectedPRId;
            return (
              <button
                key={pr.id}
                onClick={() => setSelectedPRId(pr.id)}
                className={`w-full text-left p-3.5 rounded border cursor-pointer transition-all ${
                  isSelected 
                    ? "bg-zinc-950 border-indigo-500/50 shadow-inner" 
                    : "bg-zinc-950/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono font-semibold">#PR-{pr.id}</span>
                  <span className={`px-1.5 py-0.2 rounded-sm text-[9px] font-mono border font-semibold ${getPRStatusStyle(pr.status)}`}>
                    {pr.status}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-zinc-100 mt-2 truncate leading-snug">
                  {pr.title}
                </h4>

                <div className="flex items-center gap-2 mt-3 text-[10px] text-zinc-400 font-mono">
                  <span className="truncate max-w-[80px]">{pr.sourceBranch}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-zinc-600" />
                  <span>{pr.targetBranch}</span>
                </div>

                <div className="flex items-center gap-3 mt-3 border-t border-zinc-950 pt-2 text-[10px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-zinc-600" />
                    {pr.conversations.length} Dialogues
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-zinc-600" />
                    {pr.filesChanged.length} File
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Pull Request Review Canvas */}
      {activePR ? (
        <div id="pr-canvas-viewer" className="lg:col-span-8 flex flex-col justify-between h-full space-y-6">
          
          {/* PR Details metadata header */}
          <div id="pr-canvas-header" className="border-b border-zinc-950 pb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs text-zinc-500 font-mono font-semibold">#PR-{activePR.id} • opened branch '{activePR.sourceBranch}' into '{activePR.targetBranch}'</span>
                <h2 className="text-base font-bold font-sans text-zinc-150 text-zinc-100 mt-1 capitalize leading-snug">{activePR.title}</h2>
              </div>
              
              {activePR.status === "OPEN" && (
                <button
                  id="merge-action-button"
                  onClick={() => onMergePR(activePR.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold text-[10px] tracking-widest uppercase flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/20 transition-all font-sans"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  Approve & Merge Review
                </button>
              )}
            </div>

            {/* Markdown description segment */}
            <div className="bg-zinc-950/40 border border-zinc-900 rounded p-3.5 mt-4">
              <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold block mb-1 font-mono">Developer PR Intent</label>
              <div className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {activePR.description}
              </div>
            </div>

            {/* Verification stats rows */}
            <div className="flex flex-wrap gap-4 mt-4 text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 border border-zinc-800 rounded">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                Continuous checks: <span className="text-indigo-400 font-bold">Passed ({activePR.testsRunCount} specs)</span>
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 border border-zinc-800 rounded">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                Agent approvals: <span className="text-emerald-400 font-bold">{activePR.reviewApprovedCount} approvals</span>
              </span>
            </div>
          </div>

          {/* Differential File code visualization */}
          <div id="pr-canvas-diffs">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3 flex items-center gap-1.5 font-mono">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Impacted Code changes
            </h3>

            {activePR.filesChanged.map((fileObj, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between gap-4 bg-zinc-950 p-2 border border-zinc-900 rounded">
                  <span className="text-xs font-mono font-semibold text-zinc-350 text-zinc-300 flex items-center gap-2">
                    <CornerDownRight className="w-3 h-3 text-zinc-650 text-zinc-600" />
                    {fileObj.filePath}
                  </span>
                  <div className="flex gap-2 text-[10px] font-mono">
                    <span className="text-emerald-400">+{fileObj.additions} lines</span>
                    <span className="text-rose-400">-{fileObj.deletions} lines</span>
                  </div>
                </div>
                {renderInteractiveDiff(fileObj.diffContent)}
              </div>
            ))}
          </div>

          {/* Dialogues & Reviews Discussion Board */}
          <div id="pr-canvas-discuss" className="border-t border-zinc-950 pt-5">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-4 flex items-center gap-1.5 font-mono">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Agent Review Dialogue
            </h3>

            {/* Conversation Feed */}
            <div className="space-y-4 max-h-[190px] overflow-y-auto mb-4 pr-1">
              {activePR.conversations.map((chatObj, chatIdx) => {
                const isUser = chatObj.role === "user";
                return (
                  <div key={chatIdx} className={`flex gap-3 items-start ${isUser ? "flex-row-reverse" : ""}`}>
                    <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center font-extrabold text-[10px] text-indigo-405 text-indigo-400 shrink-0 border border-zinc-705 border-zinc-700">
                      {chatObj.avatar}
                    </div>
                    
                    <div className={`flex-1 min-w-0 max-w-[85%] rounded p-3 border ${
                      isUser 
                        ? "bg-zinc-900/60 border-indigo-500/20 text-zinc-200 font-sans" 
                        : "bg-zinc-950 border-zinc-800 text-zinc-350"
                    }`}>
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold font-mono text-zinc-400 capitalize">{chatObj.author} ({chatObj.role})</span>
                        <span className="text-[9px] font-mono text-zinc-500">{chatObj.timestamp}</span>
                      </div>
                      <p className="text-xs leading-relaxed font-sans">{chatObj.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Post input form */}
            {activePR.status === "OPEN" && (
              <form onSubmit={handlePost} id="pr-chat-form" className="flex gap-2">
                <input
                  type="text"
                  placeholder="Review diffs, ask agent coder for updates or type comments..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 rounded px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600 font-sans"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

          </div>

        </div>
      ) : (
        <div id="pr-canvas-empty" className="lg:col-span-8 flex flex-col items-center justify-center py-12 text-zinc-550 text-zinc-500">
          Select or trigger an active Pull Request on the left column to verify its code blocks.
        </div>
      )}

    </div>
  );
}
