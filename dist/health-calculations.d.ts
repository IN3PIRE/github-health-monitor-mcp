import { BranchInfo, HealthConfig, IssueInfo, PullRequestInfo } from './types.js';
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
        user?: {
            login?: string;
        } | null;
    }>;
    issues: Array<{
        number: number;
        title: string;
        updated_at: string;
        assignee?: {
            login?: string;
        } | null;
    }>;
    config: HealthConfig;
    now: string;
}
export interface HealthFindings {
    staleBranches: BranchInfo[];
    oldPRs: PullRequestInfo[];
    unresponsiveIssues: IssueInfo[];
}
export declare function deriveHealthFindings({ branchCommits, pullRequests, issues, config, now }: HealthFindingInput): HealthFindings;
//# sourceMappingURL=health-calculations.d.ts.map