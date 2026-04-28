import { 
  GitHub____list_branches____mcp,
  GitHub____list_pull_requests____mcp,
  GitHub____search_issues____mcp,
  GitHub____get_commit____mcp
} from './mcp-github-wrapper.js';
import { collectSecurityAlerts } from './security-monitor.js';
import {
  RepoHealth,
  HealthConfig
} from './types.js';
import { deriveHealthFindings, BranchCommitInfo } from './health-calculations.js';

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

  const branchCommits: BranchCommitInfo[] = [];
  for (const branch of branches) {
    try {
      const commit = await GitHub____get_commit____mcp({
        owner,
        repo,
        sha: branch.commit.sha
      });

      const authorDate = commit.commit.author?.date ?? commit.commit.committer?.date;
      if (!authorDate) {
        console.warn(`Commit ${branch.commit.sha} for branch ${branch.name} has no author or committer date`);
        continue;
      }

      branchCommits.push({
        name: branch.name,
        lastCommit: authorDate
      });
    } catch (error) {
      console.error(`Failed to get commit for branch ${branch.name}:`, error);
    }
  }

  const findings = deriveHealthFindings({
    branchCommits,
    pullRequests: prs,
    issues: issues.items,
    config,
    now
  });

  return {
    ...findings,
    securityAlerts,
    timestamp: now
  };
}