import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';

const octokit = new Octokit({
 auth: process.env.GITHUB_TOKEN
});

const graphqlWithAuth = graphql.defaults({
 headers: {
 authorization: `token ${process.env.GITHUB_TOKEN}`
 }
});

export async function GitHub____list_branches____mcp({
 owner,
 repo,
 perPage = 100
}: {
 owner: string;
 repo: string;
 perPage?: number;
}) {
 const { data } = await octokit.repos.listBranches({
 owner,
 repo,
 per_page: perPage
 });
 return data;
}

export async function GitHub____list_pull_requests____mcp({
 owner,
 repo,
 state = 'open',
 perPage = 100
}: {
 owner: string;
 repo: string;
 state?: 'open' | 'closed' | 'all';
 perPage?: number;
}) {
 const { data } = await octokit.pulls.list({
 owner,
 repo,
 state,
 per_page: perPage
 });
 return data;
}

export async function GitHub____search_issues____mcp({
 query,
 perPage = 100
}: {
 query: string;
  perPage?: number;
}) {
 const { data } = await octokit.search.issuesAndPullRequests({
 q: query,
 per_page: perPage
 });
 return data;
}

export async function GitHub____get_commit____mcp({
 owner,
 repo,
 sha
}: {
 owner: string;
 repo: string;
 sha: string;
}) {
 const { data } = await octokit.repos.getCommit({
 owner,
 repo,
 ref: sha
 });
 return data;
}

export async function GitHub____get_security_alerts____mcp({
 owner,
 repo
}: {
 owner: string;
  repo: string;
}) {
  try {
    const { repository } = await graphqlWithAuth(`
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          vulnerabilityAlerts(first: 100) {
            nodes {
              id
              securityAdvisory {
                summary
                severity
              }
              createdAt
              vulnerableManifestPath
            }
          }
        }
      }
    `, { owner, repo });
    
    return repository.vulnerabilityAlerts.nodes.map((alert: any) => ({
      package: alert.vulnerableManifestPath,
      severity: alert.securityAdvisory.severity.toLowerCase(),
      createdAt: alert.createdAt
    }));
  } catch (error) {
    console.warn('Security alerts not available (requires GitHub Advanced Security)');
    return [];
  }
}