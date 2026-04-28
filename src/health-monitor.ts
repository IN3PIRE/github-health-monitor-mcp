import { 
  GitHub____list_branches____mcp,
  GitHub____list_pull_requests____mcp,
  GitHub____search_issues____mcp,
  GitHub____get_commit____mcp
} from './mcp-github-wrapper.js';
import { collectSecurityAlerts } from './security-monitor.js';
import { 
  RepoHealth, 
  BranchInfo, 
  PullRequestInfo, 
  IssueInfo, 
  HealthConfig
} from './types.js';
import { daysBetween } from './utils.js';

export async function collectHealthData(
  owner: string, 
  repo: string,
  config: HealthConfig
): Promise<RepoHealth> {
  const now = new Date().toISOString();
  
  const [branches, prs, issues, securityAlerts] = await Promise.all([
    GitHub____list_branches____mcp({ owner, repo, perPage: 100 }),
    GitHub____list_pull_requests____mcp({ owner, repo, state: 'open', perPage: 100 }),
    GitHub____search_issues____mcp({
      query: `repo:${owner}/${repo} is:issue is:open`,
      perPage: 100
    }),
    collectSecurityAlerts(owner, repo, config)
  ]);

  const staleBranches: BranchInfo[] = [];
  for (const branch of branches) {
    try {
      const commit = await GitHub____get_commit____mcp({ 
        owner, 
        repo, 
        sha: branch.commit.sha 
      });
      
      const daysStale = daysBetween(commit.commit.author.date, now);
      if (daysStale > config.staleBranchDays) {
        staleBranches.push({
          name: branch.name,
          lastCommit: commit.commit.author.date,
          daysStale
        });
      }
    } catch (error) {
      console.error(`Failed to get commit for branch ${branch.name}:`, error);
    }
  }

  const oldPRs: PullRequestInfo[] = prs
    .filter(pr => daysBetween(pr.created_at, now) > config.oldPRDays)
    .map(pr => ({
      number: pr.number,
      title: pr.title,
      daysOpen: daysBetween(pr.created_at, now),
      author: pr.user.login
    }));

  const unresponsiveIssues: IssueInfo[] = issues.items
    .filter(issue => daysBetween(issue.updated_at, now) > config.unresponsiveIssueDays)
    .map(issue => ({
      number: issue.number,
      title: issue.title,
      daysSinceUpdate: daysBetween(issue.updated_at, now),
      assignee: issue.assignee?.login
    }));

  return {
    staleBranches,
    oldPRs,
    unresponsiveIssues,
    securityAlerts,
    timestamp: now
  };
}