import { Octokit } from 'octokit';
import { ResponseTimeMetrics } from './types.js';
export declare class ResponseTimeAnalyzer {
    private octokit;
    constructor(octokit: Octokit);
    analyzeResponseTimes(owner: string, repo: string): Promise<ResponseTimeMetrics>;
    private calculateIssueResponseTimes;
    private calculatePRResponseTimes;
    private calculatePercentiles;
    private calculateAverage;
}
//# sourceMappingURL=response-time-analyzer.d.ts.map