/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
let isKeyConfigured = false;

function getGeminiClient(): { client: GoogleGenAI | null; configured: boolean } {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return { client: null, configured: false };
  }
  
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      isKeyConfigured = true;
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
      return { client: null, configured: false };
    }
  }
  return { client: aiClient, configured: isKeyConfigured };
}

// Generate high-fidelity backup simulation data aligned with user prompt
function getFallbackData(prompt: string) {
  const sanitized = (prompt || "Refactor authentication").trim();
  const branchName = `feature/${sanitized.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "custom-update"}`;
  
  // Format dynamic code examples to match user intent
  let filename = "src/modules/logic.ts";
  let componentName = "FeatureComponent";
  if (sanitized.toLowerCase().includes("auth") || sanitized.toLowerCase().includes("login")) {
    filename = "src/services/auth.ts";
    componentName = "AuthService";
  } else if (sanitized.toLowerCase().includes("dark") || sanitized.toLowerCase().includes("theme") || sanitized.toLowerCase().includes("style")) {
    filename = "src/context/ThemeContext.tsx";
    componentName = "ThemeContext";
  } else if (sanitized.toLowerCase().includes("cache") || sanitized.toLowerCase().includes("perf") || sanitized.toLowerCase().includes("performance")) {
    filename = "src/utils/cache.ts";
    componentName = "QueryCache";
  }

  const generatedDiff = `diff --git a/${filename} b/${filename}
index cb124a3..f2d4e92 100644
--- a/${filename}
+++ b/${filename}
@@ -10,14 +10,25 @@
 // Orchestrated rewrite for ${sanitized}
-export const INITIAL_STATUS = "deprecated";
+export const INITIAL_STATUS = "active_production";
+
+export class ${componentName} {
+  private version = "2.1.0-agent-patch";
+  private cacheStore = new Map<string, any>();
+
+  constructor() {
+    console.log("[CI Agent] Initializing ${componentName}...");
+  }
+
+  public async performOrchestratedAction(payload: any): Promise<boolean> {
+    try {
+      // Automated optimization safeguard
+      if (!payload) return false;
+      this.cacheStore.set(Date.now().toString(), payload);
+      return true;
+    } catch (error) {
+      console.error("[QA Alert] Action failed:", error);
+      return false;
+    }
+  }
+}`;

  return {
    branchName,
    taskSteps: [
      `Analyze existing codebase for "${sanitized}" requirements`,
      `Generate updated modular implementation in ${filename}`,
      `Verify type safety, run automated unit test specs`,
      `Initiate continuous integration pipeline and prepare code review PR`
    ],
    codeFiles: [
      {
        filePath: filename,
        diff: generatedDiff,
        additions: 21,
        deletions: 1
      }
    ],
    dialogue: {
      architect: `Sophia here. To support the feature request "${sanitized}", I've drafted a modular architecture extending our structure under ${filename}. We isolated the side-effects to maximize unit predictability.`,
      coder: `Leo-Bot checking in. I created the '${branchName}' branch and fully wired up the class definition to support the optimizations. Code includes self-contained try-catch bounds and active performance caching layers.`,
      qa: `Grace-Bot here. Unit tests have been generated and executed locally. We verified that boundary parameters, edge inputs, and async catch structures resolve natively. Built tests pass gracefully green!`,
      devops: `Aiden-Bot reported. The automated CI/CD engine compiled the proposed files successfully (Vite Bundle OK, ESM Resolution OK). Open PR is configured and ready for user clearance.`
    },
    prTitle: `feat: orchestrated implementation for ${sanitized}`,
    prDescription: `This is an automated pull request opened by the AI agent cooperative to implement **${sanitized}**.\n\n### Proposed Changes\n- Created structural model under \`${filename}\`\n- Implemented type-safe caching layers\n- Configured self-correcting error states\n\n### Checklists\n- [x] Compilation checks passed\n- [x] Static lint analysis successful\n- [x] Automated unit checks passing (100% boundary coverage)\n- [x] Branch clean with origin/main`,
    testSpecs: [
      {
        name: `verify ${componentName} class instantiation`,
        status: "PASSED",
        duration: 142,
        logs: [
          `[TEST] Mounting environment harness...`,
          `[TEST] Instantiating secret class of ${componentName}...`,
          `[INFO] Class initialized with identifier v2.1.0-agent-patch`,
          `[SUCCESS] Test case passed`
        ]
      },
      {
        name: `verify boundary inputs for performOrchestratedAction`,
        status: "PASSED",
        duration: 218,
        logs: [
          `[TEST] Dispatching boundary operations with null payload...`,
          `[ASSERT] Expected return: false`,
          `[TEST] Dispatching operation with constructive task payload...`,
          `[SUCCESS] Test case passed`
        ]
      }
    ]
  };
}

// REST Endpoint: Orchestrate agent team on a user request
app.post("/api/orchestrate", async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    res.status(400).json({ error: "Missing required prompt parameter" });
    return;
  }

  const { client, configured } = getGeminiClient();

  if (!configured || !client) {
    console.log("[Server] Gemini key unavailable or default. Using high-fidelity fallback simulation.");
    const fallback = getFallbackData(prompt);
    res.json({
      ...fallback,
      meta: {
        isSimulated: true,
        message: "Gemini key not configured. Using local visual simulation simulation."
      }
    });
    return;
  }

  try {
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        branchName: {
          type: Type.STRING,
          description: "Branch name generated for this task, e.g., feature/auth-refactor"
        },
        taskSteps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of tactical steps identified by Sophia the Architect Agent"
        },
        codeFiles: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              filePath: { type: Type.STRING },
              diff: { type: Type.STRING, description: "A realistic Git unified diff content illustrating the code changes" },
              additions: { type: Type.INTEGER },
              deletions: { type: Type.INTEGER }
            },
            required: ["filePath", "diff", "additions", "deletions"]
          }
        },
        dialogue: {
          type: Type.OBJECT,
          properties: {
            architect: { type: Type.STRING, description: "Detailed summary dialogue by Sophia" },
            coder: { type: Type.STRING, description: "Detailed implementation dialogue by Leo" },
            qa: { type: Type.STRING, description: "Detailed test reviews dialogue by Grace" },
            devops: { type: Type.STRING, description: "Pipeline deployment and static check dialogue by Aiden" }
          },
          required: ["architect", "coder", "qa", "devops"]
        },
        prTitle: { type: Type.STRING, description: "Informative title for the pull request" },
        prDescription: { type: Type.STRING, description: "PR body markdown description outlining additions, deletions, design reasoning, and testing results" },
        testSpecs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Specific assertion description" },
              status: { type: Type.STRING, description: "PASSED or FAILED" },
              duration: { type: Type.INTEGER, description: "Simulated run time in miliseconds" },
              logs: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Terminal level log traces for this specific test case"
              }
            },
            required: ["name", "status", "duration", "logs"]
          }
        }
      },
      required: [
        "branchName",
        "taskSteps",
        "codeFiles",
        "dialogue",
        "prTitle",
        "prDescription",
        "testSpecs"
      ]
    };

    const apiPrompt = `
      You are the backend orchestrator directing Sophia (Architect), Leo (Coder), Grace (QA), and Aiden (DevOps) to execute details for a git repo task.
      User Feature Command: "${prompt}"

      Identify the exact visual/functional files that need modifying or creation relative to this project type (it's a React + Express TypeScript applet).
      Return details in the requested strict JSON format.
      Keep dialogues highly relevant, professional, technical, and full of mutual coordination.
      Ensure terminal logs are detailed log strings simulating realistic standard runs. Include standard test asserts and debug streams.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: apiPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a professional full-stack git orchestration microservice. You return strictly compliant and error-free structural JSON according to instructions.",
        temperature: 0.7,
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({
      ...parsedData,
      meta: {
        isSimulated: false
      }
    });

  } catch (error: any) {
    console.error("[Server] Gemini Orchestration execution failed:", error);
    // Safe retry to fallback
    const fallback = getFallbackData(prompt);
    res.json({
      ...fallback,
      meta: {
        isSimulated: true,
        error: error?.message || "Internal generation anomaly"
      }
    });
  }
});


// Dev server entry wrapping Vite, or Static Express serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Production DevServer] Service loaded on http://0.0.0.0:${PORT}`);
  });
}

startServer();
