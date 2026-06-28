import { Octokit } from 'octokit';
import { 
  ContributorActivitySummary, 
  TopContributor, 
  ActivityBucket 
} from './types.js';
import { getDaysAgoDate } from './utils.js';

export class ContributorActivityTracker {
  private octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  async getContributorActivity(
    owner: string,
    repo: string
  ): Promise<ContributorActivitySummary> {
    const thirtyDaysAgo = getDaysAgoDate(30);
    const ninetyDaysAgo = getDaysAgoDate(90);

    // Get commits from the past 90 days
    const { data: commits } = await this.octokit.rest.repos.listCommits({
      owner,
      repo,
      since: ninetyDaysAgo.toISOString(),
      per_page: 100
    });

    // Get PRs from the past 90 days
    const { data: pullRequests } = await this.octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
      since: ninetyDaysAgo.toISOString(),
      per_page: 100
    });

    const contributorMap = new Map<string, any>();

    // Process commits
    commits.forEach(commit => {
      if (commit.author?.login) {
        const author = commit.author.login;
        if (!contributorMap.has(author)) {
          contributorMap.set(author, {
            username: author,
            commits30Days: 0,
            commits90Days: 0,
            prsCreated30Days: 0,
            prsReviewed30Days: 0
          });
        }
        contributorMap.get(author).commits90Days++;
        
        if (commit.commit.author?.date && new Date(commit.commit.author.date) >= thirtyDaysAgo) {
          contributorMap.get(author).commits30Days++;
        }
      }
    });

    // Process PRs (contributor created)
    pullRequests.forEach(pr => {
      if (pr.user?.login) {
        const author = pr.user.login;
        if (!contributorMap.has(author)) {
          contributorMap.set(author, {
            username: author,
            commits30Days: 0,
            commits90Days: 0,
            prsCreated30Days: 0,
            prsReviewed30Days: 0
          });
        }
        
        if (new Date(pr.created_at) >= thirtyDaysAgo) {
          contributorMap.get(author).prsCreated30Days++;
        }
      }
    });

    // Calculate activity distribution
    const allContributors = Array.from(contributorMap.values());
    const activityDistribution = this.calculateActivityDistribution(allContributors);
    
    // Get top contributors by total activity (commits + PRs)
    const topContributors = this.getTopContributors(allContributors, 10);

    return {
      totalContributors: allContributors.length,
      activeContributors30Days: allContributors.filter(c => 
        c.commits30Days > 0 || c.prsCreated30Days > 0 || c.prsReviewed30Days > 0
      ).length,
      activeContributors90Days: allContributors.length, // All are active since we only fetched recent commits
      activityDistribution,
      topContributors
    };
  }

  private calculateActivityDistribution(contributors: any[]): ActivityBucket[] {
    const distribution = new Map<string, number>();
    
    contributors.forEach(contributor => {
      const totalActivity = contributor.commits90Days + contributor.prsCreated30Days + contributor.prsReviewed30Days;
      let range: string;
      
      if (totalActivity === 0) {
        range = '0';
      } else if (totalActivity <= 5) {
        range = '1-5';
      } else if (totalActivity <= 15) {
        range = '6-15';
      } else if (totalActivity <= 30) {
        range = '16-30';
      } else {
        range = '31+';
      }
      
      distribution.set(range, (distribution.get(range) || 0) + 1);
    });

    return [
      { range: '0', count: distribution.get('0') || 0 },
      { range: '1-5', count: distribution.get('1-5') || 0 },
      { range: '6-15', count: distribution.get('6-15') || 0 },
      { range: '16-30', count: distribution.get('16-30') || 0 },
      { range: '31+', count: distribution.get('31+') || 0 }
    ];
  }

  private getTopContributors(contributors: any[], limit: number): TopContributor[] {
    return contributors
      .sort((a, b) => {
        const scoreA = a.commits90Days + a.prsCreated30Days + a.prsReviewed30Days;
        const scoreB = b.commits90Days + b.prsCreated30Days + b.prsReviewed30Days;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }
}