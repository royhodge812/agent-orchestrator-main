/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  GitBranch, Sparkles, Terminal, PlayCircle, Layers, 
  RefreshCw, ArrowRight, CheckCircle2, AlertTriangle, Cpu 
} from "lucide-react";
import { Agent, Commit, PullRequest, PipelineRun, PRConversation } from "./types";
import { 
  INITIAL_AGENTS, INITIAL_COMMITS, INITIAL_PRS, INITIAL_PIPELINES 
} from "./data";
import DashboardStats from "./components/DashboardStats";
import AgentCard from "./components/AgentCard";
import GitGraph from "./components/GitGraph";
import PipelineViewer from "./components/PipelineViewer";
import PRHub from "./components/PRHub";

export default function App() {
  // State registries
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [commits, setCommits] = useState<Commit[]>(INITIAL_COMMITS);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(INITIAL_PRS);
  const [pipelines, setPipelines] = useState<PipelineRun[]>(INITIAL_PIPELINES);
  const [activePipelineId, setActivePipelineId] = useState<string | null>("run-902");

  // Orchestration state
  const [userInput, setUserInput] = useState("");
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationStep, setOrchestrationStep] = useState<
    "IDLE" | "PLANNING" | "API_CALL" | "CODING" | "TESTING" | "DEPLOYING"
  >("IDLE");
  const [activeBranch, setActiveBranch] = useState("main");
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "warn"; text: string } | null>(null);
  const [apiMeta, setApiMeta] = useState<{ isSimulated: boolean; error?: string } | null>(null);

  // Suggested quick prompts
  const QUICK_PROMPTS = [
    "Configure secure session expiration tokens on Auth Service",
    "Add database connection pooling with pg-pool configuration",
    "Optimize query caching and resolve active memory leaks",
    "Integrate support for dynamic layout theme contexts"
  ];

  const triggerToast = (text: string, type: "success" | "warn" = "success") => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 6000);
  };

  // Run full dynamic agent pipeline sequence
  const handleOrchestrate = async (promptText: string) => {
    if (!promptText.trim() || isOrchestrating) return;

    setIsOrchestrating(true);
    setApiMeta(null);
    
    try {
      // ===== STAGE 1: SOPHIA PLANNING =====
      setOrchestrationStep("PLANNING");
      setAgents((prev) =>
        prev.map((a) =>
          a.id === "architect"
            ? {
                ...a,
                status: "PLANNING",
                currentTask: `Decomposing instruction: "${promptText}"`,
                dialogue: `Excellent requirement. Let me break down the files tree and dependencies matrix to plan "${promptText}"...`
              }
            : a
        )
      );
      
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // ===== STAGE 2: BACKEND EXTENDED ANALYSIS & GEMINI CALL =====
      setOrchestrationStep("API_CALL");
      setAgents((prev) =>
        prev.map((a) =>
          a.id === "architect"
            ? {
                ...a,
                currentTask: "Awaiting Gemini structural model resolution...",
                dialogue: "Sophia here. Querying Gemini to generate optimal architecture design patterns, diff outlines, and unit test schemas."
              }
            : a
        )
      );

      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText })
      });

      if (!res.ok) {
        throw new Error("Failed to communicate with agent endpoint microservice.");
      }

      const data = await res.json();
      const meta = data.meta || { isSimulated: true };
      setApiMeta(meta);

      // ===== STAGE 3: LEO IMPLEMENTING =====
      setOrchestrationStep("CODING");
      setActiveBranch(data.branchName);

      // Reset Sophia, light up Leo
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === "architect") {
            return {
              ...a,
              status: "IDLE",
              currentTask: "Plan parsed. Standing by.",
              dialogue: data.dialogue.architect,
              stats: { ...a.stats, tasksCompleted: a.stats.tasksCompleted + 1 }
            };
          }
          if (a.id === "coder") {
            return {
              ...a,
              status: "CODING",
              currentTask: `Writing diff block into ${data.codeFiles[0]?.filePath}...`,
              dialogue: data.dialogue.coder
            };
          }
          return a;
        })
      );

      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Injects branch commit to log
      const newCommitSha = Math.random().toString(16).substring(2, 9);
      const coderCommit: Commit = {
        id: newCommitSha,
        message: `feat: implementation additions for ${promptText}`,
        author: "Leo-Bot",
        authorAvatar: "L",
        timestamp: "Just now",
        branch: data.branchName
      };

      setCommits((prev) => [coderCommit, ...prev]);

      // ===== STAGE 4: GRACE RUNNING UNIT TESTING PIPELINE =====
      setOrchestrationStep("TESTING");
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === "coder") {
            return {
              ...a,
              status: "IDLE",
              currentTask: "Code committed to remote branch.",
              stats: {
                ...a.stats,
                tasksCompleted: a.stats.tasksCompleted + 1,
                codeLinesWritten: a.stats.codeLinesWritten + data.codeFiles[0].additions
              }
            };
          }
          if (a.id === "qa") {
            return {
              ...a,
              status: "TESTING",
              currentTask: `Verifying type-safety & execution bounds on branch ${data.branchName}...`,
              dialogue: data.dialogue.qa
            };
          }
          return a;
        })
      );

      // Spawn real-time interactive CI/CD Pipeline tracking
      const newPipelineId = `run-${Math.floor(100 + Math.random() * 900)}`;
      const spawnedPipeline: PipelineRun = {
        id: newPipelineId,
        commitSha: newCommitSha,
        ref: data.branchName,
        status: "RUNNING",
        startTime: "Just now",
        steps: [
          {
            id: "checkout",
            name: "Repo Checkout",
            status: "RUNNING",
            duration: 0.8,
            logs: [
              `[CI] Target repository: git@github.com:agents/orch-service.git`,
              `[CI] Fetching active branch: refs/heads/${data.branchName}`,
              `[SUCCESS] Sync resolved on commit revision ${newCommitSha}`
            ]
          },
          {
            id: "install",
            name: "Dependency Cache",
            status: "PENDING",
            duration: 1.5,
            logs: []
          },
          {
            id: "lint",
            name: "ESLint Static Lint",
            status: "PENDING",
            duration: 1.2,
            logs: []
          },
          {
            id: "test",
            name: "Mocha Unit Tests",
            status: "PENDING",
            duration: 3.0,
            logs: []
          },
          {
            id: "build",
            name: "Vite Client Assembly",
            status: "PENDING",
            duration: 2.5,
            logs: []
          }
        ]
      };

      setPipelines((prev) => [spawnedPipeline, ...prev]);
      setActivePipelineId(newPipelineId);

      // Stream logs sequentially through pipeline steps
      // 1. Checkout (complete)
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === newPipelineId
            ? {
                ...p,
                steps: p.steps.map((s) =>
                  s.id === "checkout" ? { ...s, status: "COMPLETED" } : s
                )
              }
            : p
        )
      );

      // 2. Install
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === newPipelineId
            ? {
                ...p,
                steps: p.steps.map((s) =>
                  s.id === "install"
                    ? {
                        ...s,
                        status: "RUNNING",
                        logs: [
                          "[INFO] Locating node_modules fallback caches...",
                          "[INFO] Resolving environment profiles (Express, @google/genai)",
                          "[SUCCESS] Installation synchronized cleanly"
                        ]
                      }
                    : s
                )
              }
            : p
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === newPipelineId
            ? {
                ...p,
                steps: p.steps.map((s) =>
                  s.id === "install" ? { ...s, status: "COMPLETED" } : s
                )
              }
            : p
        )
      );

      // 3. Lint
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === newPipelineId
            ? {
                ...p,
                steps: p.steps.map((s) =>
                  s.id === "lint"
                    ? {
                        ...s,
                        status: "RUNNING",
                        logs: [
                          "[INFO] Parsing modified type maps...",
                          `[INFO] Checking AST bounds for file: ${data.codeFiles[0].filePath}`,
                          "[SUCCESS] All 42 checking paths are clean"
                        ]
                      }
                    : s
                )
              }
            : p
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === newPipelineId
            ? {
                ...p,
                steps: p.steps.map((s) =>
                  s.id === "lint" ? { ...s, status: "COMPLETED" } : s
                )
              }
            : p
        )
      );

      // 4. Test (stream gathered specifications logs dynamically!)
      const testCasesLogs = data.testSpecs.flatMap((spec: any) => [
        `[TEST] Initiating assertion: "${spec.name}"`,
        ...spec.logs
      ]);

      setPipelines((prev) =>
        prev.map((p) =>
          p.id === newPipelineId
            ? {
                ...p,
                steps: p.steps.map((s) =>
                  s.id === "test"
                    ? {
                        ...s,
                        status: "RUNNING",
                        logs: [
                          `[INFO] Running framework specs matching unit criteria...`,
                          ...testCasesLogs,
                          `[SUCCESS] Test pipeline evaluation complete. Passed.`
                        ]
                      }
                    : s
                )
              }
            : p
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === newPipelineId
            ? {
                ...p,
                steps: p.steps.map((s) =>
                  s.id === "test" ? { ...s, status: "COMPLETED" } : s
                )
              }
            : p
        )
      );

      // ===== STAGE 5: AIDEN PACKAGING & DEPLOYING =====
      setOrchestrationStep("DEPLOYING");
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === "qa") {
            return {
              ...a,
              status: "IDLE",
              currentTask: "All unit specifications validated pass.",
              stats: { ...a.stats, tasksCompleted: a.stats.tasksCompleted + 1 }
            };
          }
          if (a.id === "devops") {
            return {
              ...a,
              status: "DEPLOYING",
              currentTask: `Building client bundle & registering PR for review...`,
              dialogue: data.dialogue.devops
            };
          }
          return a;
        })
      );

      // Complete Compile build, compile releases
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === newPipelineId
            ? {
                ...p,
                steps: p.steps.map((s) =>
                  s.id === "build"
                    ? {
                        ...s,
                        status: "RUNNING",
                        logs: [
                          "[INFO] Packaging production bundle assets...",
                          `[SUCCESS] Assembly complete. Port 3000 binding valid.`,
                          `[CD ENGINES] Ready for pull request approval.`
                        ]
                      }
                    : s
                )
              }
            : p
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Finalize pipeline complete status
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === newPipelineId
            ? {
                ...p,
                status: "COMPLETED",
                endTime: "Just now",
                steps: p.steps.map((s) =>
                  s.id === "build" ? { ...s, status: "COMPLETED" } : s
                )
              }
            : p
        )
      );

      // ===== STAGE 6: REGISTER OPEN PULL REQUEST =====
      const finalPrId = Math.floor(115 + Math.random() * 50);
      const generatedPR: PullRequest = {
        id: finalPrId,
        title: data.prTitle,
        description: data.prDescription,
        sourceBranch: data.branchName,
        targetBranch: "main",
        status: "OPEN",
        filesChanged: data.codeFiles.map((fileObj: any) => ({
          filePath: fileObj.filePath,
          diffContent: fileObj.diff,
          additions: fileObj.additions,
          deletions: fileObj.deletions
        })),
        conversations: [
          {
            author: "Sophia-Bot",
            avatar: "S",
            role: "architect",
            text: data.dialogue.architect,
            timestamp: "Just now"
          },
          {
            author: "Leo-Bot",
            avatar: "L",
            role: "coder",
            text: data.dialogue.coder,
            timestamp: "Just now"
          },
          {
            author: "Grace-Bot",
            avatar: "G",
            role: "qa",
            text: data.dialogue.qa,
            timestamp: "Just now"
          }
        ],
        checksPassed: true,
        testsRunCount: data.testSpecs.length,
        reviewApprovedCount: 3
      };

      setPullRequests((prev) => [generatedPR, ...prev]);

      // Complete agents status
      setAgents((prev) =>
        prev.map((a) =>
          a.id === "devops"
            ? {
                ...a,
                status: "IDLE",
                currentTask: "Workspace cluster running clean.",
                stats: { ...a.stats, tasksCompleted: a.stats.tasksCompleted + 1 }
              }
            : a
        )
      );

      setUserInput("");
      setOrchestrationStep("IDLE");
      setIsOrchestrating(false);
      triggerToast(`Successfully orchestrated! Pull request #${finalPrId} has been opened.`, "success");

    } catch (err: any) {
      console.error(err);
      setOrchestrationStep("IDLE");
      setIsOrchestrating(false);
      setAgents(INITIAL_AGENTS);
      triggerToast(err?.message || "Orchestration thread interrupted.", "warn");
    }
  };

  // Merge selected Pull Request
  const handleMergePR = async (prId: number) => {
    const prToMerge = pullRequests.find((pr) => pr.id === prId);
    if (!prToMerge || prToMerge.status !== "OPEN") return;

    // Transition state
    setPullRequests((prev) =>
      prev.map((pr) => (pr.id === prId ? { ...pr, status: "MERGED" } : pr))
    );

    // Dynamic commit SHA
    const mergeSha = Math.random().toString(16).substring(2, 9);
    const mergeCommit: Commit = {
      id: mergeSha,
      message: `Merge pull request #${prId} from ${prToMerge.sourceBranch} into main`,
      author: "Aiden-Bot",
      authorAvatar: "A",
      timestamp: "Just now",
      branch: "main",
      isMerge: true
    };

    setCommits((prev) => [mergeCommit, ...prev]);

    // Instantiate and trigger a merge deployment pipeline execution
    const mergePipelineRunId = `run-${Math.floor(500 + Math.random() * 400)}`;
    const mergePipeline: PipelineRun = {
      id: mergePipelineRunId,
      commitSha: mergeSha,
      ref: "main",
      status: "RUNNING",
      startTime: "Just now",
      steps: [
        {
          id: "checkout",
          name: "Repo Checkout",
          status: "COMPLETED",
          duration: 0.5,
          logs: [`[CI/CD] Detached HEAD synchronised on main merge core ${mergeSha}`]
        },
        {
          id: "install",
          name: "Dependency Cache",
          status: "COMPLETED",
          duration: 0.2,
          logs: ["Cached libraries matched."]
        },
        {
          id: "lint",
          name: "ESLint Static Lint",
          status: "COMPLETED",
          duration: 0.4,
          logs: ["Compilation clean."]
        },
        {
          id: "test",
          name: "Mocha Unit Tests",
          status: "COMPLETED",
          duration: 0.8,
          logs: ["Unit suites pass natively."]
        },
        {
          id: "build",
          name: "Release Deployment",
          status: "RUNNING",
          duration: 1.5,
          logs: [
            "[INFO] Trashing container assets state...",
            "[INFO] Deploying production bundle into live reverse proxy...",
            "[SUCCESS] Port 3000 node allocated and routed. App online!",
            "[HEALTH] Return code status 200 checks passing."
          ]
        }
      ]
    };

    setPipelines((prev) => [mergePipeline, ...prev]);
    setActivePipelineId(mergePipelineRunId);

    // Fast compile completion
    setTimeout(() => {
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === mergePipelineRunId
            ? {
                ...p,
                status: "COMPLETED",
                endTime: "Just now",
                steps: p.steps.map((s) =>
                  s.id === "build" ? { ...s, status: "COMPLETED" } : s
                )
              }
            : p
        )
      );
      triggerToast(`Compilation compiled! Branch '${prToMerge.sourceBranch}' successfully integrated into 'main' cluster.`, "success");
    }, 2000);
  };

  // Add custom comments into open session chat
  const handlePostComment = (prId: number, commentText: string) => {
    const userPrComment: PRConversation = {
      author: "Lead Administrator",
      avatar: "U",
      role: "user",
      text: commentText,
      timestamp: "Just now"
    };

    setPullRequests((prev) =>
      prev.map((pr) =>
        pr.id === prId
          ? {
              ...pr,
              conversations: [...pr.conversations, userPrComment]
            }
          : pr
      )
    );

    // Let AI agents respond automatically with fun commentary!
    setTimeout(() => {
      const responses = [
        "Received. I will perform requested regression diagnostics to ensure compatibility.",
        "Understood. Aiden is double-checking compile thresholds.",
        "Sophia here. Architectural impact appears minimal, looks highly acceptable."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const agentResponse: PRConversation = {
        author: "Grace-Bot",
        avatar: "G",
        role: "qa",
        text: randomResponse,
        timestamp: "Just now"
      };

      setPullRequests((prev) =>
        prev.map((pr) =>
          pr.id === prId
            ? {
                ...pr,
                conversations: [...pr.conversations, agentResponse]
              }
            : pr
        )
      );
    }, 1500);
  };

  return (
    <div id="developer-app-frame" className="bg-zinc-950 text-zinc-400 min-h-screen font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-200 border-4 border-zinc-900 flex flex-col justify-between">
      
      <div>
        {/* Visual top notification banner */}
        {alertMessage && (
          <div id="global-toast-banner" className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded border shadow-2xl animate-bounce ${
            alertMessage.type === "success" 
              ? "bg-zinc-900 border border-emerald-500/30 text-emerald-300" 
              : "bg-zinc-900 border border-amber-500/30 text-amber-300"
          }`}>
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-semibold">{alertMessage.text}</span>
          </div>
        )}

        {/* Primary header branding panel */}
        <header id="control-panel-header" className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 md:px-8 bg-zinc-950/50 sticky top-0 z-40 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center text-white font-bold font-mono">Ω</div>
            <div>
              <h1 id="brand-title" className="text-zinc-100 font-bold text-sm tracking-tight font-mono leading-none flex items-center">
                ORCHESTRA <span className="text-zinc-500 font-normal px-2">/</span> <span className="text-indigo-400">vortex-engine-core</span>
              </h1>
              <p id="brand-tagline" className="text-[10px] font-mono opacity-50 text-zinc-400 mt-1 leading-none uppercase tracking-wider">ID: 882-AF-9921 • ACTIVE REMOTE</p>
            </div>
          </div>

          <div id="system-stats-indicator" className="flex gap-4 md:gap-8 items-center">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold leading-none">Active Agents</p>
              <p className="text-zinc-100 font-mono text-sm mt-1 leading-none">
                {agents.filter(a => a.status !== "IDLE").length.toString().padStart(2, '0')}{" "}
                <span className="text-emerald-500 text-[10px]">●</span>
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold leading-none">Workflow Health</p>
              <p className="text-zinc-100 font-mono text-sm mt-1 leading-none">99.4%</p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 border border-zinc-800 rounded">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-xs text-zinc-200 font-mono">
                {apiMeta?.isSimulated ? "Simulator" : "System Nominal"}
              </span>
            </div>
          </div>
        </header>

        <main id="primary-layout" className="max-w-7xl mx-auto px-4 py-6 md:px-8 space-y-6">
          
          {/* State counts widgets row */}
          <DashboardStats 
            agents={agents} 
            prCount={pullRequests.filter(pr => pr.status === "OPEN").length} 
            commitCount={commits.length} 
          />

          {/* Command Orchestrator user interactive dispatcher inputs */}
          <div id="orchestrator-control-board" className="bg-zinc-900/40 border border-zinc-800 rounded p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-semibold text-zinc-100 font-sans text-base leading-none">Dispatcher Control Platform</h3>
                <p className="text-xs text-zinc-400 mt-1">Submit high-level repository goals. AI developer agents decompose into file updates, code additions, and CI test logic dynamically.</p>
              </div>
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleOrchestrate(userInput); }} 
              className="flex flex-col md:flex-row gap-3"
            >
              <input
                type="text"
                placeholder="E.g., Configure session validation with JWT claims, add pool constraints to pool pg module..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isOrchestrating}
                className="flex-1 bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded px-4 py-3 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 duration-200"
              />
              <button
                type="submit"
                disabled={isOrchestrating || !userInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 disabled:text-zinc-600 text-white font-bold text-xs px-6 py-3 rounded flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-widest hover:shadow-[0_0_12px_rgba(79,70,229,0.3)]"
              >
                {isOrchestrating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Orchestrating...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    Dispatch Workspace Agent
                  </>
                )}
              </button>
            </form>

            {/* Prompt Suggestion Quick Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
              <span className="text-zinc-500 font-semibold uppercase tracking-wider font-mono">Suggestions:</span>
              {QUICK_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setUserInput(promptText)}
                  disabled={isOrchestrating}
                  className="text-zinc-400 hover:text-indigo-400 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/30 px-2.5 py-1 rounded transition-colors text-left cursor-pointer font-mono"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Incremental progress checklist tracking */}
            {isOrchestrating && (
              <div id="progression-tracking" className="bg-zinc-950/60 p-4 rounded border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse mt-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                  <div>
                    <h4 className="text-xs font-bold font-mono text-zinc-200">Active Workflow Execution Trace</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1">Stage: <span className="text-indigo-400 uppercase font-semibold">{orchestrationStep}</span></p>
                  </div>
                </div>

                {/* Steps timeline dots */}
                <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                  <span className={orchestrationStep === "PLANNING" ? "text-amber-400 font-bold" : ""}>1. Spec Plan</span>
                  <ArrowRight className="w-3 h-3 text-zinc-700" />
                  <span className={orchestrationStep === "API_CALL" ? "text-indigo-400 font-bold" : ""}>2. AI Resolution</span>
                  <ArrowRight className="w-3 h-3 text-zinc-700" />
                  <span className={orchestrationStep === "CODING" ? "text-purple-400 font-bold" : ""}>3. Code Commit</span>
                  <ArrowRight className="w-3 h-3 text-slate-700" />
                  <span className={orchestrationStep === "TESTING" ? "text-indigo-400 font-bold" : ""}>4. Test Scan</span>
                  <ArrowRight className="w-3 h-3 text-slate-700" />
                  <span className={orchestrationStep === "DEPLOYING" ? "text-emerald-400 font-bold" : ""}>5. Complete CD</span>
                </div>
              </div>
            )}
          </div>

          {/* Live Active agent cards grids */}
          <AgentCard agents={agents} />

          {/* Dual Column workspace segment */}
          <div id="workspace-dashboard-segment" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-4 h-full">
              <GitGraph commits={commits} />
            </div>
            <div className="xl:col-span-8 h-full">
              <PipelineViewer pipelines={pipelines} activeRunId={activePipelineId} />
            </div>
          </div>

          {/* PR history and code review controller segment */}
          <PRHub 
            pullRequests={pullRequests} 
            onMergePR={handleMergePR} 
            onPostComment={handlePostComment} 
          />

        </main>
      </div>

      {/* Bottom Status Bar */}
      <footer id="control-panel-footer" className="h-8 border-t border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-6">
        <div className="flex gap-6">
          <span>COMMIT: <span className="text-zinc-300 font-semibold">{commits[0]?.id || "0x77f2a11b"}</span></span>
          <span>BRANCH: <span className="text-zinc-300 font-semibold">{activeBranch}</span></span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-emerald-500/70 uppercase">Secure Tunnel Active</span>
          <div className="w-4 h-4 bg-zinc-800 rounded-sm flex items-center justify-center text-zinc-400 select-none">?</div>
        </div>
      </footer>

    </div>
  );
}
