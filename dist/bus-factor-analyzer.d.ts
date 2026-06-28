import { Octokit } from 'octokit';
import { BusFactorAnalysis } from './types.js';
export declare class BusFactorAnalyzer {
    private octokit;
    constructor(octokit: Octokit);
    analyzeBusFactor(owner: string, repo: string): Promise<BusFactorAnalysis>;
    private determineRiskLevel;
}
//# sourceMappingURL=bus-factor-analyzer.d.ts.map