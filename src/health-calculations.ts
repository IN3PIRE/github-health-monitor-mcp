import { BranchInfo, HealthConfig, IssueInfo, PullRequestInfo } from './types.js';
import { daysBetween } from './utils.js';

export interface BranchCommitInfo {
  name: string;
  lastCommit: string;
}

export interface HealthFindingInput {
  branchCommits: BranchCommitInfo[];
  pullRequests: Array<{
    number: number;
    title: string;
    created_at: string;
    user?: { login?: string } | null;
  }>;
  issues: Array<{
    number: number;
    title: string;
    updated_at: string;
    assignee?: { login?: string } | null;
  }>;
  config: HealthConfig;
  now: string;
}

export interface HealthFindings {
  staleBranches: BranchInfo[];
  oldPRs: PullRequestInfo[];
  unresponsiveIssues: IssueInfo[];
}

export function deriveHealthFindings({
  branchCommits,
  pullRequests,
  issues,
  config,
  now
}: HealthFindingInput): HealthFindings {
  const staleBranches = branchCommits
    .map((branch) => ({
      name: branch.name,
      lastCommit: branch.lastCommit,
      daysStale: daysBetween(branch.lastCommit, now)
    }))
    .filter((branch) => branch.daysStale > config.staleBranchDays);

  const oldPRs = pullRequests
    .map((pr) => ({
      number: pr.number,
      title: pr.title,
      daysOpen: daysBetween(pr.created_at, now),
      author: pr.user?.login ?? 'unknown'
    }))
    .filter((pr) => pr.daysOpen > config.oldPRDays);

  const unresponsiveIssues = issues
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      daysSinceUpdate: daysBetween(issue.updated_at, now),
      assignee: issue.assignee?.login
    }))
    .filter((issue) => issue.daysSinceUpdate > config.unresponsiveIssueDays);

  return {
    staleBranches,
    oldPRs,
    unresponsiveIssues
  };
}
