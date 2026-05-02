import { Octokit } from 'octokit';
import { BusFactorAnalysis, CriticalContributor } from './types';

export class BusFactorAnalyzer {
  private octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  async analyzeBusFactor(
    owner: string,
    repo: string
  ): Promise<BusFactorAnalysis> {
    // Get all contributors
    const { data: contributors } = await this.octokit.rest.repos.listContributors({
      owner,
      repo,
      anon: false,
      per_page: 100
    });

    if (!contributors || contributors.length === 0) {
      return {
        busFactorScore: 0,
        riskLevel: 'critical',
        criticalContributors: [],
        contributionConcentration: 0
      };
    }

    // Calculate total contributions (commits + PRs)
    const totalCommits = contributors.reduce((sum, c) => sum + (c.contributions || 0), 0);
    
    // Sort by contribution count (descending)
    const sortedContributors = contributors.sort((a, b) => 
      (b.contributions || 0) - (a.contributions || 0)
    );

    // Calculate contribution concentration (top 20% of contributors)
    const topContributorCount = Math.max(1, Math.ceil(contributors.length * 0.2));
    const topContributors = sortedContributors.slice(0, topContributorCount);
    const topContributorCommits = topContributors.reduce((sum, c) => sum + (c.contributions || 0), 0);
    const concentrationPercentage = totalCommits > 0 ? (topContributorCommits / totalCommits) * 100 : 0;

    // Calculate bus factor: number of contributors that cover majority of code
    // Bus factor is the minimum number of contributors needed to cover ~50% of contributions
    let cumulativeCommits = 0;
    let busFactor = 0;
    
    for (const contributor of sortedContributors) {
      cumulativeCommits += contributor.contributions || 0;
      busFactor++;
      
      if (cumulativeCommits >= totalCommits * 0.5) {
        break;
      }
    }

    // Determine risk level based on bus factor and concentration
    const riskLevel = this.determineRiskLevel(busFactor, concentrationPercentage);

    // Identify critical contributors (top contributors that exceed threshold)
    const criticalThreshold = totalCommits * 0.05; // Contributors with >5% of total commits
    const criticalContributors: CriticalContributor[] = sortedContributors
      .filter(c => (c.contributions || 0) > criticalThreshold)
      .map(c => ({
        username: c.login || 'unknown',
        percentageOfTotalCommits: totalCommits > 0 ? ((c.contributions || 0) / totalCommits) * 100 : 0,
        lastActiveDate: undefined // Would need additional API calls to get this
      }));

    return {
      busFactorScore: busFactor,
      riskLevel,
      criticalContributors,
      contributionConcentration: concentrationPercentage
    };
  }

  private determineRiskLevel(busFactor: number, concentration: number): 'low' | 'medium' | 'high' | 'critical' {
    if (busFactor <= 1 || concentration >= 80) {
      return 'critical';
    } else if (busFactor <= 3 || concentration >= 60) {
      return 'high';
    } else if (busFactor <= 5 || concentration >= 40) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}