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
export declare const DEFAULT_CONFIG: HealthConfig;
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
    range: string;
    count: number;
}
export interface TopContributor {
    username: string;
    commits30Days: number;
    commits90Days: number;
    prsCreated30Days: number;
    prsReviewed30Days: number;
}
export interface BusFactorAnalysis {
    busFactorScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    criticalContributors: CriticalContributor[];
    contributionConcentration: number;
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
    percentile: number;
    hoursToResponse?: number | null;
}
export interface NewContributorMetrics {
    newContributors30Days: number;
    newContributors90Days: number;
    firstPrMergeRate30Days?: PercentageMetric;
    firstPrMergeRate90Days?: PercentageMetric;
}
export interface PercentageMetric {
    percentage: number;
}
export interface CommunicationMetrics {
    totalIssueComments30Days?: number;
    totalIssueComments90Days?: number;
    avgCommentsPerIssue?: AverageMetricWithCount;
    discussionParticipationRate?: DiscussionParticipationMetric;
}
export interface AverageMetricWithCount {
    average: number;
    count?: number;
}
export interface DiscussionParticipationMetric extends PercentageMetric {
}
//# sourceMappingURL=types.d.ts.map