export interface RepoHealth {
  staleBranches: BranchInfo[];
  oldPRs: PullRequestInfo[];
  unresponsiveIssues: IssueInfo[];
  securityAlerts: SecurityAlert[];
  timestamp: string;
}

export interface BranchInfo {
  name: string;
  lastCommit: string;
  daysStale: number;
}

export interface PullRequestInfo {
  number: number;
  title: string;
  daysOpen: number;
  author: string;
}

export interface IssueInfo {
  number: number;
  title: string;
  daysSinceUpdate: number;
  assignee?: string;
}

export interface SecurityAlert {
  package: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  daysOpen: number;
}

export interface HealthConfig {
  staleBranchDays: number;
  oldPRDays: number;
  unresponsiveIssueDays: number;
}

export const DEFAULT_CONFIG: HealthConfig = {
  staleBranchDays: 30,
  oldPRDays: 14,
  unresponsiveIssueDays: 7
};