import { Octokit } from 'octokit';
import { ResponseTimeMetrics, PercentileData } from './types';

export class ResponseTimeAnalyzer {
  private octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  async analyzeResponseTimes(
    owner: string,
    repo: string
  ): Promise<ResponseTimeMetrics> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent issues
    const { data: issues } = await this.octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      since: thirtyDaysAgo.toISOString(),
      per_page: 100
    });

    // Get recent pull requests
    const { data: pullRequests } = await this.octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
      sort: 'created',
      direction: 'desc',
      per_page: 100
    });

    // Filter PRs to last 30 days
    const recentPRs = pullRequests.filter(pr => 
      new Date(pr.created_at) >= thirtyDaysAgo
    );

    // Analyze issue response times
    const issueResponseTimes = await this.calculateIssueResponseTimes(owner, repo, issues);
    
    // Analyze PR response times (first response/review)
    const prResponseTimes = await this.calculatePRResponseTimes(owner, repo, recentPRs);

    return {
      issueResponseTimePercentiles: this.calculatePercentiles(issueResponseTimes),
      prResponseTimePercentiles: this.calculatePercentiles(prResponseTimes),
      averageIssueResponseHours: this.calculateAverage(issueResponseTimes),
      averagePRResponseHours: this.calculateAverage(prResponseTimes)
    };
  }

  private async calculateIssueResponseTimes(
    owner: string,
    repo: string,
    issues: any[]
  ): Promise<(number | null)[]> {
    const responseTimes: (number | null)[] = [];

    for (const issue of issues) {
      if (issue.pull_request) continue; // Skip PRs, only issues
      
      const createdAt = new Date(issue.created_at);
      const comments = issue.comments || 0;
      
      if (comments === 0) {
        responseTimes.push(null); // No response yet
        continue;
      }

      // Get first comment/reaction timeline
      const { data: timeline } = await this.octokit.rest.issues.listEventsForTimeline({
        owner,
        repo,
        issue_number: issue.number,
        per_page: 100
      });

      // Find first non-author response
      let firstResponseTime: Date | null = null;
      
      for (const event of timeline) {
        // Comment by non-author
        if (event.event === 'commented' && event.actor?.login !== issue.user?.login) {
          firstResponseTime = new Date(event.created_at);
          break;
        }
        
        // Issue assignment or labeling by maintainer
        if ((event.event === 'assigned' || event.event === 'labeled') && 
            event.actor?.login !== issue.user?.login) {
          firstResponseTime = new Date(event.created_at);
          break;
        }
      }

      if (firstResponseTime) {
        const hoursToResponse = (firstResponseTime.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        responseTimes.push(hoursToResponse);
      } else {
        responseTimes.push(null); // No maintainer response found
      }
    }

    return responseTimes;
  }

  private async calculatePRResponseTimes(
    owner: string,
    repo: string,
    pullRequests: any[]
  ): Promise<(number | null)[]> {
    const responseTimes: (number | null)[] = [];

    for (const pr of pullRequests) {
      const createdAt = new Date(pr.created_at);
      
      // Get PR timeline events
      const { data: timeline } = await this.octokit.rest.issues.listEventsForTimeline({
        owner,
        repo,
        issue_number: pr.number,
        per_page: 100
      });

      // Find first review or maintainer action
      let firstResponseTime: Date | null = null;
      
      for (const event of timeline) {
        // Review submitted by someone other than PR author
        if (event.event === 'reviewed' && event.actor?.login !== pr.user?.login) {
          firstResponseTime = new Date(event.created_at);
          break;
        }
        
        // Comment by reviewer/maintainer
        if (event.event === 'commented' && event.actor?.login !== pr.user?.login) {
          firstResponseTime = new Date(event.created_at);
          break;
        }
        
        // Assignment or labeling by maintainer
        if ((event.event === 'assigned' || event.event === 'labeled') && 
            event.actor?.login !== pr.user?.login) {
          firstResponseTime = new Date(event.created_at);
          break;
        }
      }

      if (firstResponseTime) {
        const hoursToResponse = (firstResponseTime.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        responseTimes.push(hoursToResponse);
      } else {
        responseTimes.push(null); // No maintainer response yet
      }
    }

    return responseTimes;
  }

  private calculatePercentiles(responseTimes: (number | null)[]): PercentileData[] {
    const validTimes = responseTimes.filter((time): time is number => time !== null);
    
    if (validTimes.length === 0) {
      return [50, 75, 90, 95].map(p => ({ percentile: p, hoursToResponse: null }));
    }

    validTimes.sort((a, b) => a - b);
    
    const percentiles = [50, 75, 90, 95];
    return percentiles.map(percentile => {
      const index = Math.ceil((percentile / 100) * validTimes.length) - 1;
      return {
        percentile,
        hoursToResponse: validTimes[Math.max(0, index)]
      };
    });
  }

  private calculateAverage(responseTimes: (number | null)[]): number | undefined {
    const validTimes = responseTimes.filter((time): time is number => time !== null);
    
    if (validTimes.length === 0) {
      return undefined;
    }

    return validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
  }																																							}