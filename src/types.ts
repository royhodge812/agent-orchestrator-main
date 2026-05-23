/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Agent {
  id: 'architect' | 'coder' | 'qa' | 'devops';
  name: string;
  role: string;
  avatar: string;
  status: 'IDLE' | 'PLANNING' | 'CODING' | 'TESTING' | 'DEPLOYING';
  currentTask: string;
  dialogue: string;
  stats: {
    tasksCompleted: number;
    cpuUsage: number;
    memoryUsage: number;
    codeLinesWritten: number;
  };
}

export interface Commit {
  id: string; // 7-char hash
  message: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  branch: string;
  isMerge?: boolean;
}

export interface DiffFile {
  filePath: string;
  additions: number;
  deletions: number;
  diffContent: string; // Standard diff markup with + or - indicators
}

export interface PRConversation {
  author: string;
  avatar: string;
  role: 'architect' | 'coder' | 'qa' | 'devops' | 'user';
  text: string;
  timestamp: string;
}

export interface PullRequest {
  id: number;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'OPEN' | 'MERGED' | 'CLOSED' | 'CONFLICTS';
  filesChanged: DiffFile[];
  conversations: PRConversation[];
  checksPassed: boolean;
  testsRunCount: number;
  reviewApprovedCount: number;
}

export interface PipelineStep {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  duration: number; // in seconds
  logs: string[];
}

export interface PipelineRun {
  id: string;
  commitSha: string;
  ref: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  steps: PipelineStep[];
  startTime: string;
  endTime?: string;
}

export interface OrchestrationResponse {
  branchName: string;
  taskSteps: string[];
  codeFiles: {
    filePath: string;
    diff: string;
    additions: number;
    deletions: number;
  }[];
  dialogue: {
    architect: string;
    coder: string;
    qa: string;
    devops: string;
  };
  prTitle: string;
  prDescription: string;
  testSpecs: {
    name: string;
    status: 'PASSED' | 'FAILED';
    duration: number;
    logs: string[];
  }[];
}
