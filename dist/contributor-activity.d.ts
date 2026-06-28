import { Octokit } from 'octokit';
import { ContributorActivitySummary } from './types.js';
export declare class ContributorActivityTracker {
    private octokit;
    constructor(octokit: Octokit);
    getContributorActivity(owner: string, repo: string): Promise<ContributorActivitySummary>;
    private calculateActivityDistribution;
    private getTopContributors;
}
//# sourceMappingURL=contributor-activity.d.ts.map