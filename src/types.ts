export interface RepoHealth {
  staleBranches: BranchInfo[];
  oldPRs: PullRequestInfo[];
  unresponsiveIssues: IssueInfo[];
  securityAlerts: SecurityAlert[];
  communityMetrics?: CommunityHealthMetrics;
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

// Community Health Metrics Interfaces
export interface CommunityHealthMetrics {
  contributorActivity: ContributorActivitySummary;
  busFactor: BusFactorAnalysis;
  responseTimes: ResponseTimeMetrics;
  newContributorOnboarding: NewContributorMetrics;
  communicationPatterns: CommunicationMetrics;
}

export interface ContributorActivitySummary {
  totalContributors: number;
  activeContributors30Days: number;
  activeContributors90Days: number;
  activityDistribution: ActivityBucket[];
  topContributors: TopContributor[];
}

export interface ActivityBucket {
  range: string; // e.g., "1-5", "6-10", "11+"
  count: number; // number of contributors in this bucket
}

export interface TopContributor {
  username: string;
  commits30Days: number;
  commits90Days: number;
  prsCreated30Days: number;
  prsReviewed30Days: number;
}

export interface BusFactorAnalysis {
  busFactorScore: number; // Number of contributors who can cause project disruption if removed
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  criticalContributors: CriticalContributor[];
  contributionConcentration: number; // Percentage of contributions from top contributors
}

export interface CriticalContributor {
  username: string;
  percentageOfTotalCommits?: number;
  filesTouched?: string[];
  lastActiveDate?: string;
}

export interface ResponseTimeMetrics {
  issueResponseTimePercentiles: PercentileData[];
  prResponseTimePercentiles: PercentileData[];
  averageIssueResponseHours?: number;
  averagePRResponseHours?: number;
}

export interface PercentileData {
  percentile: number; // e.g., 50, 75, 90, 95
  hoursToResponse?: number | null; // null if no response received
}

export interface NewContributorMetrics {
  newContributors30Days: number;
  newContributors90Days: number;
  firstPrMergeRate30Days?: PercentageMetric; // First-time contributors whose first PR was merged
  firstPrMergeRate90Days?: PercentageMetric; 
}

export interface PercentageMetric {
  percentage: number; // e.g., value between 0 and 100
}

export interface CommunicationMetrics {
  totalIssueComments30Days?: number;
  totalIssueComments90Days?: number;
  avgCommentsPerIssue?: AverageMetricWithCount;
  discussionParticipationRate?: DiscussionParticipationMetric; // Percentage of issues with >=2 participants
}

export interface AverageMetricWithCount {
  average: number; // Mean or median value depending on context
  count?: number; // Number of items in calculation (e.g., total issues with comments)
}

export interface DiscussionParticipationMetric extends PercentageMetric {}