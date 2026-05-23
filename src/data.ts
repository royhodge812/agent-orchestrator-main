/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Agent, Commit, PullRequest, PipelineRun } from "./types";

export const INITIAL_AGENTS: Agent[] = [
  {
    id: "architect",
    name: "Sophia-Bot",
    role: "System Architect",
    avatar: "S",
    status: "IDLE",
    currentTask: "Waiting for user input directive...",
    dialogue: "Sophia online. Provide me with a system requirement to decompose into tactical changes.",
    stats: {
      tasksCompleted: 42,
      cpuUsage: 12,
      memoryUsage: 256,
      codeLinesWritten: 2400
    }
  },
  {
    id: "coder",
    name: "Leo-Bot",
    role: "Senior Coder",
    avatar: "L",
    status: "IDLE",
    currentTask: "Idle. Monitoring repo branches...",
    dialogue: "Ready. Assign a branch and Sophia's task plan, and I'll lay down the commits.",
    stats: {
      tasksCompleted: 89,
      cpuUsage: 8,
      memoryUsage: 512,
      codeLinesWritten: 12850
    }
  },
  {
    id: "qa",
    name: "Grace-Bot",
    role: "QA Lead",
    avatar: "G",
    status: "IDLE",
    currentTask: "Waiting for commits to evaluate...",
    dialogue: "Harness is active. I will analyze type safety and execute unit integration tests.",
    stats: {
      tasksCompleted: 112,
      cpuUsage: 5,
      memoryUsage: 180,
      codeLinesWritten: 450
    }
  },
  {
    id: "devops",
    name: "Aiden-Bot",
    role: "DevOps Engineer",
    avatar: "A",
    status: "IDLE",
    currentTask: "Monitoring continuous deployment nodes...",
    dialogue: "Pipelines are normal. Port 3000 mapping configured. Standby for build triggers.",
    stats: {
      tasksCompleted: 154,
      cpuUsage: 15,
      memoryUsage: 1024,
      codeLinesWritten: 890
    }
  }
];

export const INITIAL_COMMITS: Commit[] = [
  {
    id: "3df98f2",
    message: "Merge pull request #112 from feature/auth-refactor",
    author: "Sophia-Bot",
    authorAvatar: "S",
    timestamp: "10 mins ago",
    branch: "main",
    isMerge: true
  },
  {
    id: "fc23e01",
    message: "feat: implement JWT token expiration monitoring",
    author: "Leo-Bot",
    authorAvatar: "L",
    timestamp: "24 mins ago",
    branch: "feature/auth-refactor"
  },
  {
    id: "9b12fe4",
    message: "test: write unit checks for auth token decoder lifecycle",
    author: "Grace-Bot",
    authorAvatar: "G",
    timestamp: "35 mins ago",
    branch: "feature/auth-refactor"
  },
  {
    id: "a1cd702",
    message: "docs: add repository system architecture diagram & notes",
    author: "Sophia-Bot",
    authorAvatar: "S",
    timestamp: "1 hour ago",
    branch: "main"
  },
  {
    id: "6e210ac",
    message: "fix: resolve memory leak inside telemetry subscription handler",
    author: "Leo-Bot",
    authorAvatar: "L",
    timestamp: "3 hours ago",
    branch: "main"
  }
];

export const INITIAL_PRS: PullRequest[] = [
  {
    id: 114,
    title: "feat: add global connection pool to micro database manager",
    description: "Proposed additions to the core db module to handle high concurrent client requests.\n\n### Changes\n- Created shared pg pool allocation utility\n- Extended cache lookup boundary to bypass redundant server checks\n\n- Resolves dependency issue in issue #902.",
    sourceBranch: "feature/db-pooling",
    targetBranch: "main",
    status: "OPEN",
    filesChanged: [
      {
        filePath: "src/database/pool.ts",
        additions: 18,
        deletions: 4,
        diffContent: `diff --git a/src/database/pool.ts b/src/database/pool.ts
index b8912ef..de14a09 100644
--- a/src/database/pool.ts
+++ b/src/database/pool.ts
@@ -5,12 +5,26 @@
 import { Pool } from "pg";
-const poolInstance = null;
+let poolInstance: Pool | null = null;
 
 export function getDatabasePool() {
-  return new Pool();
+  if (!poolInstance) {
+    poolInstance = new Pool({
+      max: 20,
+      idleTimeoutMillis: 30000,
+      connectionTimeoutMillis: 2000,
+    });
+    console.log("[DB Agent] Allocated shared micro database pool instance.");
+  }
+  return poolInstance;
 }`
      }
    ],
    conversations: [
      {
        author: "Sophia-Bot",
        avatar: "S",
        role: "architect",
        text: "I reviewed Sophia's decomposition. We chose pool settings to align with our low-latency performance targets.",
        timestamp: "2 hours ago"
      },
      {
        author: "Leo-Bot",
        avatar: "L",
        role: "coder",
        text: "Changes implemented successfully. Handing over to Grace for type checks and local unit simulation.",
        timestamp: "1 hour ago"
      },
      {
        author: "Grace-Bot",
        avatar: "G",
        role: "qa",
        text: "Verified initialization and boundary assertions. Run results look pristine! Ready for merge approval.",
        timestamp: "30 mins ago"
      }
    ],
    checksPassed: true,
    testsRunCount: 4,
    reviewApprovedCount: 2
  },
  {
    id: 112,
    title: "feat: integrate secure OAuth authorization callbacks",
    description: "Refactored JWT claims mechanism to support dynamic user access definitions.\n\nApproved and compiled into production main.",
    sourceBranch: "feature/auth-refactor",
    targetBranch: "main",
    status: "MERGED",
    filesChanged: [
      {
        filePath: "src/services/auth.ts",
        additions: 32,
        deletions: 8,
        diffContent: `diff --git a/src/services/auth.ts b/src/services/auth.ts
index e91cda2..772b123 100644
--- a/src/services/auth.ts
+++ b/src/services/auth.ts
@@ -10,8 +10,32 @@ export function signClaims(user: any) {
-  return jwt.sign({ sub: user.id }, "secret");
+  return jwt.sign({
+    sub: user.id,
+    roles: user.roles || ["guest"],
+    issuer: "agent-orches-dash",
+    iat: Math.floor(Date.now() / 1000)
+  }, process.env.JWT_SECRET || "default_fallback_secret", {
+    expiresIn: "15m"
+  });
-}`
      }
    ],
    conversations: [
      {
        author: "Leo-Bot",
        avatar: "L",
        role: "coder",
        text: "I introduced standard process env values for authorization claims.",
        timestamp: "4 hours ago"
      },
      {
        author: "Aiden-Bot",
        avatar: "A",
        role: "devops",
        text: "Continuous pipeline validation completed. Successfully merged into main and pushed deployment logs.",
        timestamp: "10 mins ago"
      }
    ],
    checksPassed: true,
    testsRunCount: 16,
    reviewApprovedCount: 3
  }
];

export const INITIAL_PIPELINES: PipelineRun[] = [
  {
    id: "run-902",
    commitSha: "3df98f2",
    ref: "main",
    status: "COMPLETED",
    startTime: "10 mins ago",
    endTime: "9 mins ago",
    steps: [
      {
        id: "checkout",
        name: "Repo Checkout",
        status: "COMPLETED",
        duration: 1.2,
        logs: [
          "Cloning target repository: git@github.com:agents/orch-service.git",
          "Resolving workspace revision: 3df98f2",
          "Head branch detached. Workspace synchronization OK."
        ]
      },
      {
        id: "install",
        name: "Dependency Cache",
        status: "COMPLETED",
        duration: 8.5,
        logs: [
          "Verifying dependency signatures in package-lock.json",
          "Locating node_modules fallback caches in US-East-1 registry",
          "Resolved 132 packages in 4.5s. Packages are up to date."
        ]
      },
      {
        id: "lint",
        name: "ESLint Static Lint",
        status: "COMPLETED",
        duration: 3.1,
        logs: [
          "Initializing TypeScript analysis tree...",
          "Inspecting 42 matching module boundaries.",
          "Compilation complete. 0 structural errors, 0 rules triggers."
        ]
      },
      {
        id: "test",
        name: "Mocha Unit Tests",
        status: "COMPLETED",
        duration: 12.4,
        logs: [
          "Searching for *.test.ts specifications in Workspace...",
          "Running 16 matching assertions.",
          "✔ Auth Token Claims verify sequence - Success (142ms)",
          "✔ Router JWT payload fallback resolution - Success (240ms)",
          "All 16 test cases completed successfully."
        ]
      },
      {
        id: "build",
        name: "Production Bundle Compilation",
        status: "COMPLETED",
        duration: 15.2,
        logs: [
          "Compiling full Vite client module bundle...",
          "Output generated inside ./dist/ static directories.",
          "Bundle report: index.html (240kB), assets/main.js (140kB). Compilation complete."
        ]
      }
    ]
  },
  {
    id: "run-901",
    commitSha: "fc23e01",
    ref: "feature/auth-refactor",
    status: "COMPLETED",
    startTime: "24 mins ago",
    endTime: "22 mins ago",
    steps: [
      {
        id: "checkout",
        name: "Repo Checkout",
        status: "COMPLETED",
        duration: 1.0,
        logs: ["Cloning revision fc23e01 on feature/auth-refactor"]
      },
      {
        id: "install",
        name: "Dependency Cache",
        status: "COMPLETED",
        duration: 7.2,
        logs: ["Cached dependency load complete"]
      },
      {
        id: "lint",
        name: "ESLint Static Lint",
        status: "COMPLETED",
        duration: 2.8,
        logs: ["Static analysis complete. Code clean."]
      },
      {
        id: "test",
        name: "Mocha Unit Tests",
        status: "COMPLETED",
        duration: 6.5,
        logs: ["Running auth sequence unit tests. Passed."]
      }
    ]
  }
];
